/**
 * Portfolio Data Constants: Projects, Skills, and Experience
 */

export const projectsList = [
    {
        id: '3d-portfolio',
        title: '3D WebGL · Interactive Portfolio',
        category: '3D & Web App',
        description: 'Interactive 3D workspace environment featuring real-time CRT screen rendering, retro BIOS boot sequence, and dynamic raycasting navigation.',
        tech: ['Three.js', 'React 19', 'Tailwind CSS', 'Vite', 'Docker', 'Nginx'],
        link: 'https://github.com/ChaoticIssam/portfolio-beta',
        tagType: 'project',
        actionText: 'View Repository'
    },
    {
        id: 'vita',
        title: 'Vita · Activity & Insights Platform',
        category: 'Full Stack & Desktop',
        description: 'Desktop-first digital activity tracking and productivity insights platform. FastAPI backend (SQLAlchemy, JWT) synced to an Electron background collector and Next.js web dashboard.',
        tech: ['FastAPI', 'Next.js', 'Electron', 'PostgreSQL', 'Docker', 'JWT'],
        link: 'https://lnkd.in/p/ekTSj39N',
        tagType: 'project',
        actionText: 'View Project'
    },
    {
        id: 'aittc-um6p',
        title: 'AITTC, UM6P · Farm Digitization',
        category: 'AITTC, UM6P • Benguerir',
        description: 'Building a web platform to digitize farm operations and experimental data. Delivered 3 role-based workflows with containerized Docker Compose, Nginx, Django REST, and PostgreSQL.',
        tech: ['Django REST', 'React', 'Docker Compose', 'Nginx', 'PostgreSQL'],
        link: 'https://lnkd.in/p/ea2vsuJC',
        tagType: 'pro',
        actionText: 'View Internship'
    },
    {
        id: 'key-system',
        title: 'Key System · Hardware Business',
        category: 'Key System • Casablanca',
        description: 'Designed and developed a corporate web platform for a hardware business to improve visibility and structure product/service content for seamless customer navigation.',
        tech: ['React', 'TypeScript', 'Tailwind CSS', 'Responsive UI', 'Nginx'],
        link: null,
        confidential: true,
        tagType: 'pro',
        actionText: 'Confidential · Copyrights'
    }
];

export const skillCategories = [
    {
        name: 'Languages',
        skills: ['C', 'C++', 'Python', 'JavaScript', 'TypeScript', 'SQL']
    },
    {
        name: 'Frontend & 3D',
        skills: ['React', 'Next.js', 'Electron', 'Three.js', 'Tailwind CSS', 'HTML / CSS', 'Vite']
    },
    {
        name: 'Backend & APIs',
        skills: ['FastAPI', 'Django', 'DRF', 'Node.js', 'WebSockets', 'Django Channels']
    },
    {
        name: 'Databases & DevOps',
        skills: ['PostgreSQL', 'Redis', 'Docker', 'Docker Compose', 'Nginx', 'Linux', 'Git / GitHub']
    }
];
