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
		const biosLoading = new BIOSLoading();
		await biosLoading.start();

		ReactDOM.createRoot(document.getElementById('root')).render(
			<React.StrictMode>
				<PortfolioDisplay />
			</React.StrictMode>
		);
		
		const portfolio = new Portfolio();
		await portfolio.init();
		
		// Add a slight delay after the BIOS screen
		setTimeout(() => {
			portfolio.setupEntranceAnimation();
			portfolio.animate();
			portfolio.updateTexture();
		}, 500);
	} catch(error){
		console.error('Initialization failed:', error);
	}
}

init();
