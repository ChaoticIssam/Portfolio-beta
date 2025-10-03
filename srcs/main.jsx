import { Portfolio } from './portfolio';
import{ BIOSLoading } from './loader';
import React from 'react';
import ReactDOM from 'react-dom/client'
import { Login } from './loginPage';
import PortfolioDisplay from './comps/display';

// biosLoading.start();

// const login = new Login();
//wait until the user logs in
// login.login();
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
        }
        
        const biosLoading = new BIOSLoading();
        await biosLoading.start();

        // Rest of your initialization code remains unchanged
        ReactDOM.createRoot(document.getElementById('root')).render(
            <React.StrictMode>
                <PortfolioDisplay />
            </React.StrictMode>
        );
        
        const portfolio = new Portfolio();
        // Pass complete device info
        portfolio.deviceInfo = window.deviceInfo || {};
        // Pass responsive info to portfolio instance
        portfolio.isMobile = document.body.classList.contains('mobile-device');
        portfolio.isLowEndDevice = document.body.classList.contains('low-end-device');
        
		await portfolio.init();
        
        // Add a slight delay after the BIOS screen
        setTimeout(() => {
            portfolio.setupEntranceAnimation();
            portfolio.animate();
        }, 500);
    } catch(error){
        console.error('Initialization failed:', error);
    }
}

init();
