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
                {['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => (
                    section.toLowerCase() !== currentSection && (
                        <button
                            key={section}
                            data-nav="true"
                            data-section={section.toLowerCase()}
                            onClick={() => onNavigate(section.toLowerCase())}
                            className="text-white hover:text-blue-400 transition-colors text-sm sm:text-base"
                            style={{ padding: "0.5rem", minWidth: "60px" }}
                        >
                            {section}
                        </button>
                    )
                ))}
            </div>
        </div>
    )
}
export default SectionNav