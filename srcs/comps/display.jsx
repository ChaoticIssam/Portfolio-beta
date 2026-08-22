import React, { useState, useEffect } from 'react';
import SectionNav from './sectionNav';
import { soundManager } from '../audioManager';

import { projectsList, skillCategories } from './portfolioData';

const PortfolioDisplay = () => {
    const [currentSection, setCurrentSection] = useState('home');
    const [scale, setScale] = useState(1);
    const [copiedEmail, setCopiedEmail] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const baseWidth = 1024;
            const baseHeight = 768;
            const newScale = Math.min(
                window.innerWidth / baseWidth * 0.9,
                window.innerHeight / baseHeight * 0.9
            );
            setScale(newScale > 0.3 ? newScale : 0.3);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigate = (section) => {
        soundManager.playSectionSwitch();
        setCurrentSection(section);
        if (window.portfolioInstance) {
            window.portfolioInstance.updateCurrentSection(section);
        }
    };

    useEffect(() => {
        window.handlePortfolioNavigation = handleNavigate;
        return () => {
            delete window.handlePortfolioNavigation;
        };
    }, []);

    const copyEmailToClipboard = () => {
        soundManager.playSuccess();
        navigator.clipboard.writeText('issamzitouni257@gmail.com');
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    const sections = {
        home: (
            <div className="h-full flex flex-col justify-between p-12 bg-neutral-950 text-white relative">
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'url("/styles/backgroundStyle.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>

                <div className="flex justify-center pt-2 relative z-10">
                    <nav className="flex items-center gap-10">
                        {['ABOUT', 'PROJECTS', 'CONTACT'].map((section) => {
                            const sectionLower = section.toLowerCase();
                            const isActive = currentSection === sectionLower;

                            return (
                                <button
                                    key={section}
                                    data-section={sectionLower}
                                    data-nav="true"
                                    onClick={() => handleNavigate(sectionLower)}
                                    className={`text-xs font-mono font-bold tracking-[0.25em] transition-all pb-1 ${isActive
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

                <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-6 max-w-2xl mx-auto">
                    <p className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase mb-4">
                        FULL STACK DEVELOPER · FASTAPI · DJANGO · REACT
                    </p>
                    <h1 className="text-6xl font-black tracking-tight text-white mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                        ISSAM ZITOUNI
                    </h1>
                    <p className="text-base font-sans text-neutral-300 tracking-wide mb-10">
                        Welcome to my Interactive 3D Portfolio
                    </p>
                    <div className="flex gap-12 items-center justify-center pt-2">
                        <button
                            data-nav="true"
                            data-section="projects"
                            onClick={() => handleNavigate('projects')}
                            className="text-cyan-400 hover:text-cyan-300 font-mono font-bold text-sm tracking-[0.2em] uppercase transition-colors"
                        >
                            Explore Projects &rarr;
                        </button>
                        <button
                            data-nav="true"
                            data-section="about"
                            onClick={() => handleNavigate('about')}
                            className="text-neutral-400 hover:text-white font-mono font-bold text-sm tracking-[0.2em] uppercase transition-colors"
                        >
                            About Me &rarr;
                        </button>
                    </div>
                </div>
                <div className="h-6"></div>
            </div>
        ),
        about: (
            <div className="h-full bg-neutral-950 text-white overflow-hidden relative flex flex-col justify-between p-12">
                <SectionNav currentSection="about" onNavigate={handleNavigate} />

                <div className="pt-12 px-8 pb-2 max-w-4xl mx-auto space-y-6 flex-1 flex flex-col justify-center">
                    <div className="border-b border-neutral-800/80 pb-3 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-wide">About Me</h2>
                            <p className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase mt-1">
                                Full Stack Developer & Software Engineer
                            </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-400 tracking-[0.15em] uppercase">
                            1337 · 42 NETWORK
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-3.5 text-neutral-300 text-xs font-sans leading-relaxed">
                            <p>
                                Full Stack Developer with practical experience building web and desktop platforms using React, TypeScript, FastAPI, Django, and PostgreSQL.
                            </p>
                            <p>
                                Trained at 1337 School (42 Network) in Benguerir (2022 – Present), focused on converting operational workflows into clear software solutions with strong collaboration, clean API design, and containerized deployment using Docker and Nginx.
                            </p>
                            <p>
                                Background includes systems engineering (Unix, C, C++), interactive 3D WebGL graphics, and building robust microservices architectures.
                            </p>
                        </div>

                        <div className="col-span-1 space-y-3 border-l border-neutral-800/80 pl-6 flex flex-col justify-center">
                            <div>
                                <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase mb-3">Quick Profile</h3>
                                <ul className="space-y-2.5 text-xs font-sans text-neutral-300">
                                    <li className="flex justify-between">
                                        <span className="text-neutral-500">Location:</span>
                                        <span className="font-semibold text-white">Benguerir, MA</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-neutral-500">Education:</span>
                                        <span className="font-semibold text-white">1337 (42 Net)</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-neutral-500">Core Stack:</span>
                                        <span className="font-semibold text-white">React, FastAPI, Django</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-neutral-500">GitHub:</span>
                                        <span className="font-semibold text-cyan-400">@ChaoticIssam</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80">
                        <h3 className="text-xs font-mono font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">Technical Stack & Skills</h3>
                        <div className="grid grid-cols-4 gap-6">
                            {skillCategories.map((cat) => (
                                <div key={cat.name} className="space-y-1.5">
                                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{cat.name}</h4>
                                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                                        {cat.skills.join('  ·  ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
        projects: (
            <div className="h-full bg-neutral-950 text-white overflow-hidden relative flex flex-col justify-between p-12">
                <SectionNav currentSection="projects" onNavigate={handleNavigate} />

                <div className="pt-12 px-8 pb-2 max-w-4xl mx-auto space-y-6 flex-1 flex flex-col justify-center">
                    <div className="border-b border-neutral-800/80 pb-3 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-wide">Work & Projects</h2>
                            <p className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase mt-1">
                                Featured Projects & Professional Experiences
                            </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-400 tracking-[0.15em] uppercase">
                            4 HIGHLIGHTS
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                        {projectsList.map((project) => (
                            <div
                                key={project.id}
                                className="space-y-2 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                                            {project.category}
                                        </span>
                                        {project.tagType === 'pro' && (
                                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                                PRO EXPERIENCE
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                                    <div className="text-[11px] font-mono text-neutral-400">
                                        {project.tech.join('  ·  ')}
                                    </div>
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-sans font-bold text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 ml-3"
                                    >
                                        {project.actionText} &rarr;
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        contact: (
            <div className="h-full bg-neutral-950 text-white overflow-hidden relative flex flex-col justify-between p-12">
                <SectionNav currentSection="contact" onNavigate={handleNavigate} />

                <div className="pt-12 px-8 pb-2 max-w-4xl mx-auto space-y-6 flex-1 flex flex-col justify-center">
                    <div className="border-b border-neutral-800/80 pb-3 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-wide">Contact</h2>
                            <p className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase mt-1">
                                Let&apos;s Connect & Build Together
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-[0.2em]">Get in Touch</h3>
                                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                                    Full Stack Developer based in Benguerir / Casablanca, Morocco. Open to full-time software engineering roles, contract opportunities, and innovative platform development.
                                </p>
                            </div>

                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">DIRECT EMAIL</span>
                                <p className="text-sm font-mono font-bold text-white">issamzitouni257@gmail.com</p>
                                <div className="flex gap-4 pt-1">
                                    <button
                                        onClick={copyEmailToClipboard}
                                        className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        {copiedEmail ? '✓ Copied to clipboard' : '→ Copy Email Address'}
                                    </button>
                                    <a
                                        href="mailto:issamzitouni257@gmail.com"
                                        className="text-xs font-mono font-bold text-neutral-400 hover:text-white transition-colors"
                                    >
                                        → Send via Mail Client
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-900">
                                <div>
                                    <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">PHONE / WHATSAPP</span>
                                    <span className="font-mono text-xs text-white font-bold">+212 7 07927704</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">LOCATION</span>
                                    <span className="text-xs text-white font-semibold">Benguerir & Casablanca, MA</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 border-l border-neutral-800/80 pl-8">
                            <div className="space-y-2">
                                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-[0.2em]">Professional Presence</h3>
                                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                                    Connect on professional networks or explore source code repositories.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">LINKEDIN</span>
                                <a
                                    href="https://linkedin.com/in/issam-zitouni/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors block"
                                >
                                    linkedin.com/in/issam-zitouni &rarr;
                                </a>
                                <p className="text-xs text-neutral-400">
                                    Career experience, recommendations, and direct messaging.
                                </p>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-neutral-900">
                                <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">GITHUB</span>
                                <a
                                    href="https://github.com/ChaoticIssam"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors block"
                                >
                                    github.com/ChaoticIssam &rarr;
                                </a>
                                <p className="text-xs text-neutral-400">
                                    Open source repositories, 3D WebGL experiments, and platform architectures.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div
            id="portfolioContent"
            className="fixed w-[1024px] h-[768px] overflow-hidden bg-neutral-950 font-sans text-sm select-none"
            style={{
                position: 'fixed',
                left: '-9999px',
                width: '1024px',
                height: '768px',
                visibility: 'visible',
            }}
        >
            <div key={currentSection} className="w-full h-full relative crt-section-anim overflow-hidden">
                <div className="scanline-sweep" />
                {sections[currentSection]}
            </div>
        </div>
    );
};

export default PortfolioDisplay;