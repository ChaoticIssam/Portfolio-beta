import React from 'react'

const SectionNav = ({currentSection, onNavigate }) => {
    return (
        <div className="absolute top-4 left-0 w-full flex justify-between items-center px-8">
            <button
                data-nav="true"
                data-action="back"
                data-section="home"
                onClick={() => onNavigate('home')}
                className="flex items-center text-white hover:text-blue-400 transition-colors"
                style={{ minWidth: "80px" }} // Add minimum width for consistency
            >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Home</span> {/* Hide text on very small screens */}
            </button>
            <div className="flex gap-2 sm:gap-6"> {/* Reduce gap on mobile */}
				{['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => {
				const sectionLower = section.toLowerCase();
				const isActive = currentSection === sectionLower;
				
				return (
					<button 
					key={section}
					data-section={sectionLower}
					data-nav="true"
					onClick={() => onNavigate(sectionLower)}
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
            </div>
        </div>
    )
}
export default SectionNav