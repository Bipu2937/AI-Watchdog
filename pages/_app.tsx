import type { AppProps } from 'next/app';
import { SecurityOverlayProvider } from '../context/SecurityOverlayContext';
import SecurityScanOverlay from '../components/SecurityScanOverlay';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SecurityOverlayProvider>
            <div className="scanlines" />
            <SecurityScanOverlay />
            <Component {...pageProps} />
        </SecurityOverlayProvider>
    );
}

export default MyApp;
