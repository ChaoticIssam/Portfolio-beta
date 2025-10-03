import React, { useState, useEffect } from 'react';
import SectionNav from './sectionNav';
import { Portfolio } from '../portfolio';

const PortfolioDisplay = () => {
    const [currentSection, setCurrentSection] = useState('home');
    const [isAnimating, setIsAnimating] = useState(false);
	const [scale, setScale] = useState(1);

	useEffect(() => {
        const handleResize = () => {
            const baseWidth = 1024;
            const baseHeight = 768;
            const newScale = Math.min(
                window.innerWidth / baseWidth * 0.9,
                window.innerHeight / baseHeight * 0.9
            );
            setScale(newScale > 0.3 ? newScale : 0.3); // Minimum scale
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
			
    const handleNavigate = (section) => {
        console.log('React navigation called for section:', section);
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentSection(section);
            if (window.portfolioInstance) {
                window.portfolioInstance.updateCurrentSection(section);
            }
            setIsAnimating(false);
        }, 300);
    };
    useEffect(() => {
        console.log('Setting up navigation handler');
        window.handlePortfolioNavigation = handleNavigate;
        
        return () => {
            console.log('Cleaning up navigation handler');
            delete window.handlePortfolioNavigation;
        };
    }, []); 

    const sections = {
        home: (
            <div className="h-full flex flex-col p-8 bg-neutral-900/90 text-white">
				<div
					className="absolute inset-0 z-0"
					style={{
						backgroundImage: 'url("/styles/backgroundStyle.png")',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						filter: 'contrast(200%) brightness(150%)', // Enhance contrast and brightness
						mixBlendMode: 'normal'
					}}
					></div>
                <nav className="flex gap-16 justify-center mb-12 relative z-10">
					{['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => {
					const sectionLower = section.toLowerCase();
					const isActive = currentSection === sectionLower;
					
					return (
						<button 
						key={section}
						data-section={sectionLower}
						data-nav="true"
						onClick={() => handleNavigate(sectionLower)}
						className={`text-lg transition-colors relative group px-4 py-2 ${
							isActive ? 'text-blue-400' : 'text-white hover:text-blue-400'
						}`}
						style={{
							textShadow: '0 0 10px rgba(0,0,0,0.8)',
							fontWeight: 'bold'
						}}
						>
						{section}
						<span 
							className={`absolute -bottom-2 left-0 w-full h-0.5 bg-blue-400 transition-transform duration-300 ${
							isActive ? 'transform scale-x-100' : 'transform scale-x-0 group-hover:scale-x-100'
							}`}
						></span>
						</button>
					);
					})}
                </nav>
            </div>
        ),
        about: (
            <div className={`h-full p-8 bg-neutral-900/90 text-white overflow-y-auto transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
				<SectionNav currentSection="about" onNavigate={handleNavigate} />
                <h2 className="text-4xl font-bold mb-8">About Me</h2>
                {/* Add your about content */}
            </div>
        ),
        projects: (
            <div className={`h-full p-8 bg-neutral-900/90 text-white overflow-y-auto transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
				<SectionNav currentSection="projects" onNavigate={handleNavigate} />
				<h2 className="text-4xl font-bold mb-8">Projects</h2>
                <div className="grid grid-cols-2 gap-8">
                    {/* Add your projects */}
                </div>
            </div>
        ),
        contact: (
            <div className={`h-full p-8 bg-neutral-900/90 text-white transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
				<SectionNav currentSection="contact" onNavigate={handleNavigate} />
                <h2 className="text-4xl font-bold mb-8">Contact</h2>
                {/* Add your contact info */}
            </div>
        )
    };


	return (
		<div 
			id="portfolioContent" 
			className="fixed w-[1024px] h-[768px]"
			style={{ 
				visibility: 'visible',
				position: 'absolute',
				left: '-9999px',
				// Only apply transform in the actual UI, html2canvas will handle it differently
				transform: currentSection !== 'home' ? 'scaleY(-1)' : 'none',
				transformOrigin: 'center center',
				fontSize: `${16 * Math.max(scale, 0.5)}px`,
				lineHeight: '1.6',
				overflowX: 'hidden'
			}}
		>
			{sections[currentSection]}
		</div>
	)
};

export default PortfolioDisplay;