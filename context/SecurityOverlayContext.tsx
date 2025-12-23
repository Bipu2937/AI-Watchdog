import React, { createContext, useContext, useState, ReactNode } from 'react';
import { validateWithAI } from '../lib/ai-validator';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'failure';

interface SecurityOverlayContextType {
    status: ScanStatus;
    logs: string[];
    startScan: (username: string) => Promise<boolean>;
    resetScan: () => void;
    addLog: (message: string) => void;
}

const SecurityOverlayContext = createContext<SecurityOverlayContextType | undefined>(undefined);

export const SecurityOverlayProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    const resetScan = () => {
        setStatus('idle');
        setLogs([]);
    };

    const startScan = async (username: string): Promise<boolean> => {
        setStatus('scanning');
        setLogs([]);
        addLog(`[INIT] Starting heuristic scan for user: ${username}`);

        // Aesthetic logs
        setTimeout(() => addLog(`[MEM] Scanning memory address 0x${Math.floor(Math.random() * 16777215).toString(16)}...`), 500);
        setTimeout(() => addLog(`[NET] Verifying integrity of port ${Math.floor(Math.random() * 65535)}...`), 1000);
        setTimeout(() => addLog(`[AI] Contacting Neural Neural Network...`), 1500);

        try {
            const isValid = await validateWithAI(username);

            if (isValid) {
                addLog(`[SUCCESS] Pattern match confirmed. Identity verified.`);
                setStatus('success');
                return true;
            } else {
                addLog(`[ALERT] Anomalous behavior detected. Locking down session.`);
                setStatus('failure');
                return false;
            }
        } catch (error) {
            addLog(`[ERROR] Validation subsystem failed: ${error}`);
            setStatus('failure');
            return false;
        }
    };

    return (
        <SecurityOverlayContext.Provider value={{ status, logs, startScan, resetScan, addLog }}>
            {children}
        </SecurityOverlayContext.Provider>
    );
};

export const useSecurityOverlay = () => {
    const context = useContext(SecurityOverlayContext);
    if (context === undefined) {
        throw new Error('useSecurityOverlay must be used within a SecurityOverlayProvider');
    }
    return context;
};
