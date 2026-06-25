"use client"

import { useEffect, useState, useRef, useCallback } from 'react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/connect'

export function useWebSocket() {
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
        // Optional: window.location.href = '/login'
      } else {
        // Reconnect after 3 seconds for other errors
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = (error) => {
      // In React Strict Mode, the connection might be aborted during mount/unmount cycle
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket connection attempt aborted or failed (likely due to Strict Mode or server restart).')
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
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  return { isConnected, lastMessage, sendMessage }
}
