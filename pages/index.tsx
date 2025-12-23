import Head from 'next/head';
import LoginForm from '../components/LoginForm';

export default function Home() {
    return (
        <div className="full-screen flex-center" style={{ overflow: 'hidden' }}>
            <Head>
                <title>AI Watchdog | Secure Entry</title>
                <meta name="description" content="AI-Powered Security Gatekeeper" />
            </Head>

            {/* Decorative background elements */}
            <div className="full-screen" style={{
                backgroundImage: "url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2,
                zIndex: 0,
                pointerEvents: 'none',
                mixBlendMode: 'screen'
            }} />

            <main style={{ zIndex: 10, position: 'relative' }}>
                <LoginForm />
            </main>
        </div>
    );
}
