import '../portfolio.css';
import { Portfolio } from './portfolio';
import { BIOSLoading } from './loader';
import React from 'react';
import ReactDOM from 'react-dom/client'
import { Login } from './loginPage';
import PortfolioDisplay from './comps/display';
import { soundManager } from './audioManager';

async function init() {
    try {
        if (typeof console !== 'undefined') {
            const originalWarn = console.warn;
            console.warn = (...args) => {
                if (args[0]?.includes('DatePrototype.toTemporalInstant')) {
                    return;
                }
                originalWarn.apply(console, args);
            };
        }

        // Add responsive setup
        if (typeof window !== 'undefined') {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isLowEndDevice = navigator.hardwareConcurrency <= 4;
            
            // Add device info to window for access throughout the app
            window.deviceInfo = {
                isMobile: isMobileDevice,
                isTouch: isTouchDevice,
                isLowEnd: isLowEndDevice,
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1
            };
            
            // Add classes to body for CSS targeting
            document.body.classList.toggle('mobile-device', isMobileDevice);
            document.body.classList.toggle('touch-device', isTouchDevice);
            document.body.classList.toggle('low-end-device', isLowEndDevice);

            // Unlock Web Audio API on first user interaction
            const unlockAudio = () => {
                soundManager.resumeContext();
                soundManager.startAmbient();
                window.removeEventListener('pointerdown', unlockAudio);
                window.removeEventListener('keydown', unlockAudio);
            };
            window.addEventListener('pointerdown', unlockAudio);
            window.addEventListener('keydown', unlockAudio);
        }
        
        // Mount React UI immediately
        ReactDOM.createRoot(document.getElementById('root')).render(
            <React.StrictMode>
                <PortfolioDisplay />
            </React.StrictMode>
        );
        
        // Initialize 3D Portfolio scene in parallel
        const portfolio = new Portfolio();
        portfolio.deviceInfo = window.deviceInfo || {};
        portfolio.isMobile = document.body.classList.contains('mobile-device');
        portfolio.isLowEndDevice = document.body.classList.contains('low-end-device');
        window.portfolioInstance = portfolio;
        portfolio.init();

        // Run BIOS loading sequence non-blocking
        const biosLoading = new BIOSLoading();
        biosLoading.start().then(() => {
            soundManager.resumeContext();
            soundManager.startAmbient();
            setTimeout(() => {
                soundManager.speakWelcome();
            }, 600);
        });
        
        // Safety fallback: hide BIOS overlay after 10 seconds max
        setTimeout(() => {
            const biosScreen = document.getElementById('biosScreen');
            if (biosScreen && biosScreen.style.display !== 'none') {
                biosScreen.style.display = 'none';
                soundManager.resumeContext();
                soundManager.startAmbient();
            }
        }, 10000);
    } catch(error){
        console.error('Initialization failed:', error);
    }
}

init();
