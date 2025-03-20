
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Menu, X } from 'lucide-react';
import ThemeToggle from '../theme/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu on resize if mobile menu is open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const navItems = [
    { path: '/', label: 'Feed', icon: <BarChart3 size={18} /> },
    { path: '/top-users', label: 'Top Users', icon: <Users size={18} /> },
    { path: '/trending', label: 'Trending Posts', icon: <TrendingUp size={18} /> },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b transition-colors">
      <div className="bg-background/80 dark:bg-background/80">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <NavLink 
            to="/" 
            className="text-lg font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="bg-primary text-primary-foreground w-9 h-9 rounded-full flex items-center justify-center shadow-sm">
              <BarChart3 size={18} />
            </span>
            <span className="hidden sm:inline font-semibold">Social Insights</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'hover:bg-muted'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <button 
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b shadow-lg animate-fade-in max-h-[calc(100vh-4rem)] overflow-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
