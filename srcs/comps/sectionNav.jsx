import React from 'react';

const SectionNav = ({ currentSection, onNavigate }) => {
    return (
        <div className="absolute top-6 left-0 w-full flex justify-between items-center px-16 z-30 pointer-events-auto">
            <button
                data-nav="true"
                data-action="back"
                data-section="home"
                onClick={() => onNavigate('home')}
                className="text-cyan-400 hover:text-cyan-300 font-mono font-bold text-xs tracking-[0.2em] transition-colors"
            >
                &larr; BACK TO HOME
            </button>

            <nav className="flex items-center gap-8">
                {['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => {
                    const secLower = section.toLowerCase();
                    const isActive = currentSection === secLower;
                    return (
                        <button
                            key={section}
                            data-nav="true"
                            data-section={secLower}
                            onClick={() => onNavigate(secLower)}
                            className={`text-xs font-mono font-bold tracking-[0.2em] transition-all pb-1 ${
                                isActive
                                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {section}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default SectionNav;