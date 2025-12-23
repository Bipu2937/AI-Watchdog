import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSecurityOverlay } from '../context/SecurityOverlayContext';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const { startScan } = useSecurityOverlay();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        const success = await startScan(username);
        if (success) {
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000); // Give time for success animation
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">
                SECURE LOGIN
            </h1>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                    <label className="uppercase" style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#15803d', marginBottom: '0.25rem' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                        placeholder="IDENTIFY YOURSELF"
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                >
                    INITIATE SEQUENCE
                </button>
            </form>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#166534', textAlign: 'center' }}>
                RESTRICTED ACCESS. UNAUTHORIZED USERS WILL BE FLAGGED.
            </div>
        </div>
    );
}
