import { Portfolio } from './portfolio';
import{ BIOSLoading } from './loader';
import { Login } from './loginPage';

// biosLoading.start();

// const login = new Login();
//wait until the user logs in
// login.login();
async function init() {
	const biosLoading = new BIOSLoading();
    await biosLoading.start();
    
    const portfolio = new Portfolio();
    portfolio.init();
    
    // Add a slight delay after the BIOS screen
    setTimeout(() => {
        portfolio.setupEntranceAnimation();
        portfolio.animate();
        portfolio.updateTexture();
    }, 500);
}

init();
