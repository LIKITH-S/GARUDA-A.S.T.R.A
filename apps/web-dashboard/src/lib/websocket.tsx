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

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('astra_token')
    if (!token) return

    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${WS_URL}?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (e) {
        console.error('Failed to parse WS message:', e)
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected with code: ${event.code}`)
      setIsConnected(false)
      wsRef.current = null

      if (event.code === 1008) {
        console.error("Unauthorized WebSocket connection. Clearing token.")
        localStorage.removeItem('astra_token')
      } else {
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = (error) => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket connection attempt aborted or failed.')
      } else {
        console.error('WebSocket error:', error)
      }
      ws.close()
    }

    wsRef.current = ws
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [connect])

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
