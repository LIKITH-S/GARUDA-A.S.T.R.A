"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/connect'

interface WebSocketContextValue {
  isConnected: boolean
  lastMessage: any
  sendMessage: (msg: any) => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  lastMessage: null,
  sendMessage: () => {}
})

interface WebSocketProviderProps {
  children: React.ReactNode
  token: string | null
  onAuthExpired: () => void
}

export function WebSocketProvider({ children, token, onAuthExpired }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptRef = useRef(0)
  // Stable ref for onAuthExpired so it doesn't trigger reconnection cycles
  const onAuthExpiredRef = useRef(onAuthExpired)
  onAuthExpiredRef.current = onAuthExpired

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close()
      }
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Main effect: connect when token is available, disconnect when it's removed
  useEffect(() => {
    if (!token) {
      cleanup()
      reconnectAttemptRef.current = 0
      return
    }

    // Don't reconnect if already connected with a valid socket
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const connect = () => {
      // Guard: if token was cleared during a reconnect delay, bail out
      if (!token) return

      cleanup()

      const ws = new WebSocket(`${WS_URL}?token=${token}`)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttemptRef.current = 0

        // Start heartbeat ping every 25 seconds
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Ignore pong responses from heartbeat
          if (data.type === 'pong') return
          console.log('[WebSocket] Received message:', data)
          setLastMessage(data)
        } catch (e) {
          console.error('Failed to parse WS message:', e)
        }
      }

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}`)
        setIsConnected(false)
        wsRef.current = null
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current)
          heartbeatRef.current = null
        }

        if (event.code === 1008) {
          // Token expired or invalid — trigger proper auth logout
          console.error('WebSocket: Token expired or invalid. Logging out.')
          onAuthExpiredRef.current()
          return
        }

        // Auto-reconnect with exponential backoff (max ~30s)
        const attempt = reconnectAttemptRef.current
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
        reconnectAttemptRef.current = attempt + 1
        console.log(`WebSocket reconnecting in ${delay}ms (attempt ${attempt + 1})`)
        reconnectTimeoutRef.current = setTimeout(connect, delay)
      }

      ws.onerror = (error) => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection attempt failed.')
        } else {
          console.error('WebSocket error:', error)
        }
        ws.close()
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      cleanup()
    }
  }, [token, cleanup])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}
