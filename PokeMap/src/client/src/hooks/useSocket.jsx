import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

let socket = null;
// Lưu trữ các callbacks để sync state giữa các component
let stateListeners = [];

// Helper function để notify tất cả listeners
const notifyListeners = (connected, status) => {
    stateListeners.forEach(listener => listener(connected, status));
};

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(() => {
        return socket?.connected ?? false;
    });
    const [connectionStatus, setConnectionStatus] = useState(() => {
        if (!socket) return 'connecting';
        return socket.connected ? 'connected' : 'disconnected';
    });

    // Callback để update state khi nhận notification từ listeners khác
    const updateState = useCallback((connected, status) => {
        setIsConnected(connected);
        setConnectionStatus(status);
    }, []);

    useEffect(() => {
        // Đăng ký listener để nhận updates từ các component khác
        stateListeners.push(updateState);

        // Khởi tạo socket nếu chưa có
        if (!socket) {
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
            console.log('🔧 Initializing socket connection to', socketUrl);
            
            socket = io(socketUrl, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling'],
                withCredentials: true
            });

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
                notifyListeners(true, 'connected');
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                notifyListeners(false, 'disconnected');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                notifyListeners(false, 'error');
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        } else if (socket.connected) {
            // Socket đã tồn tại và đang connected, sync state ngay
            setIsConnected(true);
            setConnectionStatus('connected');
        }

        return () => {
            // Xóa listener khi component unmount
            stateListeners = stateListeners.filter(listener => listener !== updateState);
        };
    }, [updateState]);

    return { socket, isConnected, connectionStatus };
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
