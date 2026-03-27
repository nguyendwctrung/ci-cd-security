import { useSocket } from '../hooks/useSocket';

export default function SocketDebug() {
    const { socket, isConnected, connectionStatus } = useSocket();

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: isConnected ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
            <div><strong>🔌 Socket Status</strong></div>
            <div>Status: {connectionStatus}</div>
            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
            <div>Socket ID: {socket?.id || 'No ID'}</div>
            <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
                Server: localhost:10000
            </div>
        </div>
    );
}
