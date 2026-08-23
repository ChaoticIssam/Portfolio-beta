import '../portfolio.css';
import { Portfolio } from './portfolio';
import { BIOSLoading } from './loader';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import PortfolioDisplay from './comps/display';
import MobileLanding from './comps/mobileLanding';
import { soundManager } from './audioManager';

// Detect mobile once, outside React (avoids stale closures)
const IS_MOBILE = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
);

// ─── 3D Desktop boot sequence ─────────────────────────────────────────────────
// Called exactly once. Separated from React lifecycle to avoid double-init.
function boot3DExperience() {
    const biosScreen = document.getElementById('biosScreen');
    if (biosScreen) biosScreen.style.display = 'flex';

    // Unlock Web Audio API on first user gesture
    const unlockAudio = () => {
        soundManager.resumeContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Init 3D scene
    const portfolio = new Portfolio();
    portfolio.isMobile = false;
    window.portfolioInstance = portfolio;
    portfolio.init();

    // BIOS boot then cinematic entrance
    const biosLoading = new BIOSLoading();
    biosLoading.start().then(() => {
        soundManager.resumeContext();
        soundManager.playIntroSound();
        soundManager.startAmbient();

        if (portfolio && portfolio.startCinematicEntrance) {
            portfolio.startCinematicEntrance();
        }

        setTimeout(() => {
            soundManager.speakWelcome();
        }, 2800);
    });

    // Safety fallback: force-hide BIOS after 40s if stuck
    setTimeout(() => {
        const bs = document.getElementById('biosScreen');
        if (bs && bs.style.display !== 'none') {
            bs.style.display = 'none';
            soundManager.resumeContext();
            soundManager.playIntroSound();
            soundManager.startAmbient();
            if (portfolio && portfolio.startCinematicEntrance) {
                portfolio.startCinematicEntrance();
            }
        }
    }, 40000);
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
    const [force3D, setForce3D] = useState(false);
    const bootedRef = useRef(false); // Guard: ensure boot runs exactly once

    const showMobile = IS_MOBILE && !force3D;

    useEffect(() => {
        if (showMobile) {
            // Mobile view: hide BIOS, enable scroll
            document.body.classList.add('mobile-mode');
            const biosScreen = document.getElementById('biosScreen');
            if (biosScreen) biosScreen.style.display = 'none';
            return;
        }

        // Desktop (or force3D): remove mobile class, boot 3D exactly once
        document.body.classList.remove('mobile-mode');
        if (!bootedRef.current) {
            bootedRef.current = true;
            boot3DExperience();
        }
    }, [showMobile]);

    return (
        <>
            {showMobile ? (
                <MobileLanding onLaunch3D={() => setForce3D(true)} />
            ) : (
                <PortfolioDisplay />
            )}
            <Analytics />
        </>
    );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
