import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeMessage {
  type: 'attendance_update' | 'leave_update' | 'notification' | 'system';
  data: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  enabled?: boolean;
  onMessage?: (message: RealtimeMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    enabled = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      // In development, use localhost, in production use your WebSocket server
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:5000/ws' 
        : 'wss://your-production-domain.com/ws';
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'attendance_update':
              // Invalidate attendance queries
              queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
              queryClient.invalidateQueries({ queryKey: ['/api/attendance', 'stats'] });
              break;
            
            case 'leave_update':
              // Invalidate leave queries
              queryClient.invalidateQueries({ queryKey: ['/api/leave'] });
              break;
            
            case 'notification':
              // Invalidate notification queries
              queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
              break;
            
            case 'system':
              // Handle system messages
              console.log('System message:', message.data);
              break;
          }
          
          onMessage?.(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        onDisconnect?.();
        
        // Auto-reconnect with exponential backoff
        if (event.code !== 1000) { // Not a normal closure
          const delay = Math.min(1000 * Math.pow(2, 3), 30000); // Max 30 seconds
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
        onError?.(event);
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to connect');
    }
  }, [enabled, onConnect, onDisconnect, onError, onMessage, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect
  };
}

// Hook for attendance-specific real-time updates
export function useAttendanceRealtime() {
  const [attendanceUpdates, setAttendanceUpdates] = useState<any[]>([]);
  
  const { isConnected, lastMessage } = useRealtime({
    onMessage: (message) => {
      if (message.type === 'attendance_update') {
        setAttendanceUpdates(prev => [...prev.slice(-9), message.data]); // Keep last 10 updates
      }
    }
  });

  return {
    isConnected,
    lastMessage,
    attendanceUpdates
  };
}

// Hook for notification real-time updates
export function useNotificationRealtime() {
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { isConnected, lastMessage } = useRealtime({
    onMessage: (message) => {
      if (message.type === 'notification') {
        setNotifications(prev => [message.data, ...prev.slice(0, 9)]); // Keep last 10 notifications
      }
    }
  });

  return {
    isConnected,
    lastMessage,
    notifications
  };
} 