import React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import PortfolioSection from './PortfolioSection';
import Contact from './Contact';

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 text-white">
      <Navbar />
      <Home />
      <About />
      <PortfolioSection />
      <Contact />
    </div>
  );
};

export default Portfolio;