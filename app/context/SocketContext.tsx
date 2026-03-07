'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import config from '../config'

interface SocketContextValue {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({
    socket: null,
    isConnected: false,
})

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!config.enableSocket) {
            console.log('[Socket] Socket is disabled via configuration');
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        let userId: string;
        try {
            userId = JSON.parse(userStr).id;
        } catch (e) {
            return;
        }

        const socketUrl = config.apiUrl.replace('/api', '');
        const newSocket = io(socketUrl, {
            query: { userId },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to backend');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[Socket] Disconnected from backend');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)
