import '../portfolio.css';
import { Portfolio } from './portfolio';
import { BIOSLoading } from './loader';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import PortfolioDisplay from './comps/display';
import MobileLanding from './comps/mobileLanding';
import { soundManager } from './audioManager';

// Main App component coordinating Mobile vs Desktop 3D view
function App() {
    const isMobileInitial = typeof window !== 'undefined' && (
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    const [isMobile, setIsMobile] = useState(isMobileInitial);
    const [force3D, setForce3D] = useState(false);

    useEffect(() => {
        const biosScreen = document.getElementById('biosScreen');

        if (isMobile && !force3D) {
            document.body.classList.add('mobile-mode');
            if (biosScreen) biosScreen.style.display = 'none';
        } else {
            document.body.classList.remove('mobile-mode');
            start3DExperience();
        }
    }, [isMobile, force3D]);

    const start3DExperience = () => {
        const biosScreen = document.getElementById('biosScreen');
        if (biosScreen) biosScreen.style.display = 'flex';

        // Unlock audio context
        const unlockAudio = () => {
            soundManager.resumeContext();
            soundManager.startAmbient();
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

        // Initialize 3D Scene
        const portfolio = new Portfolio();
        portfolio.deviceInfo = window.deviceInfo || {};
        portfolio.isMobile = isMobile;
        window.portfolioInstance = portfolio;
        portfolio.init();

        // Run BIOS boot sequence
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
            }, 2000);
        });

        // Safety fallback
        setTimeout(() => {
            if (biosScreen && biosScreen.style.display !== 'none') {
                biosScreen.style.display = 'none';
                soundManager.resumeContext();
                soundManager.playIntroSound();
                soundManager.startAmbient();
                if (portfolio && portfolio.startCinematicEntrance) {
                    portfolio.startCinematicEntrance();
                }
            }
        }, 40000);
    };

    if (isMobile && !force3D) {
        return <MobileLanding onLaunch3D={() => setForce3D(true)} />;
    }

    return <PortfolioDisplay />;
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
