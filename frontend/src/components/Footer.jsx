import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              AYPERI<span className="text-gradient">.</span>
            </Link>
            <p className="footer-desc">
              Технологияны, маданиятты жана билим берүүнү бириктирген премиум санариптик экосистема.
              Келечекти биз менен куруңуз.
            </p>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="footer-title">Экосистема</h4>
            <ul className="footer-links">
              <li><Link to="/projects">Долбоорлор</Link></li>
              <li><Link to="/resume">Билим берүү системалары</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="footer-title">Коллекциялар</h4>
            <ul className="footer-links">
              <li><Link to="/gallery">Галерея</Link></li>
              <li><Link to="/videos">Видеолор</Link></li>
              <li><Link to="/resume">Архив</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-title">Байланыш</h4>
            <ul className="footer-links">
              <li><Link to="/">Биз жөнүндө</Link></li>
              <li><a href="mailto:info@ayperi.kg">Байланышуу</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AYPERI Экосистемасы. Бардык укуктар корголгон.</p>
          <p>Билим берүүнүн келечеги үчүн долбоорлонгон</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
