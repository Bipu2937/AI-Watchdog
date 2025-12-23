import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecurityOverlay } from '../context/SecurityOverlayContext';

export default function SecurityScanOverlay() {
    const { status, logs } = useSecurityOverlay();
    const [hexDump, setHexDump] = useState<string[]>([]);

    // Generate random hex data for effect
    useEffect(() => {
        if (status === 'scanning') {
            const interval = setInterval(() => {
                const line = Array.from({ length: 8 }, () =>
                    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                ).join(' ');
                setHexDump(prev => [...prev.slice(-15), `0x${Math.floor(Math.random() * 65535).toString(16).padStart(4, '0')}: ${line}`]);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setHexDump([]);
        }
    }, [status]);

    if (status === 'idle') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="full-screen overlay-container"
                style={{
                    color: status === 'failure' ? 'var(--neon-red)' : 'var(--neon-green)',
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--neon-green)' }} />
                <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'var(--neon-green)' }} />

                {/* Hex Dump Background */}
                <div className="absolute" style={{ top: '2.5rem', left: '2.5rem', opacity: 0.3, fontSize: '0.75rem', pointerEvents: 'none' }}>
                    {hexDump.map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>

                {/* Central HUD */}
                <div className="hud-panel">
                    <div className="hud-header">
                        <h2 className="glitch-text" data-text="AI WATCHDOG" style={{ margin: 0, fontSize: '1.5rem' }}>
                            AI WATCHDOG v2.5
                        </h2>
                        <span className="animate-pulse">
                            {status === 'scanning' ? 'SCANNING...' : status === 'success' ? 'ACCESS GRANTED' : 'THREAT DETECTED'}
                        </span>
                    </div>

                    <div className="scroll-logs">
                        {logs.map((log, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span style={{ fontSize: '0.75rem', color: '#006400' }}>[{new Date().toLocaleTimeString()}]</span>
                                <span>{log}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    {status === 'scanning' && (
                        <div className="progress-bar-container">
                            <motion.div
                                className="progress-bar-fill"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2, ease: "linear" }}
                            />
                        </div>
                    )}

                    {/* Status Message */}
                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center', fontSize: '1.875rem', fontWeight: 'bold', color: '#4ade80', marginTop: '1rem', border: '2px solid #4ade80', padding: '0.5rem' }}
                        >
                            IDENTITY VERIFIED
                        </motion.div>
                    )}

                    {status === 'failure' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center', fontSize: '1.875rem', fontWeight: 'bold', color: '#dc2626', marginTop: '1rem', border: '2px solid #dc2626', padding: '0.5rem' }}
                            className="animate-pulse"
                        >
                            ACCESS DENIED
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
