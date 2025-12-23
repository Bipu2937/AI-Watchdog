import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSecurityOverlay } from '../context/SecurityOverlayContext';

export default function Dashboard() {
    const { status } = useSecurityOverlay();
    const router = useRouter();

    useEffect(() => {
        // In strict mode, we might redirect if not success
        // if (status !== 'success') router.push('/');
    }, [status, router]);

    return (
        <div style={{ minHeight: '100vh', padding: '2.5rem', fontFamily: 'monospace', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid #064e3b', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="glitch-text" data-text="MAINFRAME" style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: 0 }}>MAINFRAME</h1>
                <div style={{ fontSize: '0.875rem' }}>
                    STATUS: <span style={{ color: '#4ade80' }}>ONLINE</span>
                </div>
            </header>

            {/* Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#86efac' }}>SYSTEM STATS</h3>
                    <ul style={{ padding: 0, listStyle: 'none', fontSize: '0.875rem', lineHeight: '1.5' }}>
                        <li>CPU LOAD: {Math.floor(Math.random() * 100)}%</li>
                        <li>MEMORY: {Math.floor(Math.random() * 64)}GB / 128GB</li>
                        <li>UPTIME: 4421:22:10</li>
                    </ul>
                </div>

                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#86efac' }}>ACTIVE NODES</h3>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}>NODE_{i + 1}: 192.168.1.{100 + i} [SECURE]</div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#86efac' }}>THREAT LEVEL</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#16a34a' }}>LOW</div>
                </div>
            </div>

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #064e3b', paddingTop: '1rem', textAlign: 'center', opacity: 0.5, fontSize: '0.75rem' }}>
                AI WATCHDOG PROTECTION ACTIVE. SESSION MONITORED.
            </div>
        </div>
    );
}
