import { Portfolio } from './portfolio';
import{ BIOSLoading } from './loader';
import { Login } from './loginPage';

const biosLoading = new BIOSLoading();
biosLoading.start();

// const login = new Login();
//wait until the user logs in
// login.login();
const portfolio = new Portfolio();
portfolio.init();
portfolio.animate();
portfolio.updateTexture();
