import React, { useState, useEffect } from 'react';

const NavbarStrongBlur = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);

      // Section detection (sama seperti sebelumnya)
      const sections = ['home', 'about', 'portfolio', 'contact'];
      let currentSection = 'home';

      const sectionsData = sections.map(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          return {
            id: sectionId,
            top: top,
            bottom: top + height,
            element: element
          };
        }
        return null;
      }).filter(Boolean);

      const scrollPosition = window.scrollY + 200;

      for (let i = sectionsData.length - 1; i >= 0; i--) {
        const section = sectionsData[i];
        if (scrollPosition >= section.top) {
          currentSection = section.id;
          break;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(() => handleScroll(), 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 md:px-16 transition-all duration-500 ${
      isScrolled 
        ? 'bg-gradient-to-r from-black/85 via-gray-900/85 to-black/85 backdrop-blur-xl border-b border-gray-700/30 shadow-2xl shadow-black/40' 
        : 'bg-transparent'
    }`}>
      <div className="text-2xl font-bold text-white">
        bibitdev
      </div>
      
      <div className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <div key={item.id} className="relative">
            <a 
              href={`#${item.id}`}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeSection === item.id
                  ? 'text-white'
                  : 'text-gray-200 hover:text-white'
              } hover:bg-white/10`}
            >
              {item.label}
            </a>
            
            {activeSection === item.id && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full transition-all duration-300"></div>
            )}
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <button className="p-2 text-gray-200 hover:bg-white/10 hover:text-white rounded-lg transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default NavbarStrongBlur;