import React, { useState, useEffect } from 'react';
import SectionNav from './sectionNav';
import { Portfolio } from '../portfolio';

const PortfolioDisplay = () => {
    const [currentSection, setCurrentSection] = useState('home');
    const [isAnimating, setIsAnimating] = useState(false); // Missing state

    // Missing handler function
    // window.handlePortfolioNavigation = (section) => {
		//     setIsAnimating(true);
		//     setTimeout(() => {
			//         setCurrentSection(section);
			//         setIsAnimating(false);
			//     }, 300);
			// };
			
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
                <nav className="flex gap-16 justify-center mb-12">
                    {['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => (
                        <button 
                            key={section}
                            data-section={section.toLowerCase()}
							data-nav="true"
							onClick={() => handleNavigate(section.toLowerCase())}
                            className="text-lg text-white hover:text-blue-400 transition-colors relative group px-4 py-2"
                        >
                            {section}
                            <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                        </button>
                    ))}
                </nav>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-6xl font-bold">Welcome</h1>
                </div>
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
				transform: currentSection !== 'home' ? 'scaleY(-1)' : 'none',
				transformOrigin: 'center center' // Add this for more predictable transforms
			}}
		>
			{sections[currentSection]}
		</div>
	)
};

export default PortfolioDisplay;