import { Portfolio } from './portfolio';
import{ BIOSLoading } from './loader';

const portfolio = new Portfolio();
portfolio.init();
portfolio.animate();
portfolio.updateTexture();

// const biosLoading = new BIOSLoading();
// biosLoading.start();