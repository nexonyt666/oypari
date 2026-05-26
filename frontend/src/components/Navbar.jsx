import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [resumeDropdown, setResumeDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Close mobile nav on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { name: 'Башкы бет', path: '/' },
    { name: 'Галерея', path: '/gallery' },
    { name: 'Видео', path: '/videos' },
    { name: 'Долбоорлор', path: '/projects' }
  ];

  const resumeCategories = [
    "Олимпиада конкурс жеңүүчүсү",
    "Басылмага жарыялоо",
    "Долбоор",
    "Конференциялар",
    "Маданий иш-чаралар",
    "Спорт",
    "Практика учурунда",
    "Enactus",
    "Мобилдүүлук",
    "Билерман ордо",
    "Ыктыярчы",
    "Кошумча маалымат",
    "Ыраазычылык баракчасы"
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Logo */}
        <div className="logo-wrapper" style={{ display: 'inline-flex', alignItems: 'baseline' }}>
          <Link to="/" className="logo">AYPERI</Link>
          <Link
            to="/admin"
            className="logo-dot"
            style={{ fontFamily: 'var(--font-primary)', fontSize: '1.6rem', fontWeight: '800', marginLeft: '1px' }}
          >.</Link>
        </div>

        {/* Desktop Nav */}
        <ul className="nav-links desktop-nav">
          {navLinks.slice(0, 3).map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Resume Dropdown */}
          <li
            className="dropdown"
            onMouseEnter={() => setResumeDropdown(true)}
            onMouseLeave={() => setResumeDropdown(false)}
          >
            <span className={`nav-link ${location.pathname === '/resume' ? 'active' : ''}`}>
              Резюме <ChevronDown size={14} />
            </span>
            <AnimatePresence>
              {resumeDropdown && (
                <motion.ul
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  {resumeCategories.map((cat, idx) => (
                    <li key={idx}>
                      <Link to={`/resume?cat=${idx}`}>{idx + 1}. {cat}</Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {navLinks.slice(3).map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="mobile-toggle"
            onClick={() => setIsOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="mobile-nav-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/resume" className={`nav-link ${location.pathname === '/resume' ? 'active' : ''}`}>
                  Резюме
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
