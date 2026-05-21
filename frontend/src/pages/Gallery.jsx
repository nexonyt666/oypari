import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const savedGallery = JSON.parse(localStorage.getItem('ayperi_gallery')) || [];
    setGallery(savedGallery.filter(g => g.status !== 'Бүттү'));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '60vh', paddingBottom: '4rem' }}>
      <div className="section-header">
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '100px', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ImageIcon size={16} className="text-secondary" />
          Көргөзмө
        </span>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', backgroundImage: 'linear-gradient(135deg, var(--secondary), #f093fb)' }}>Галерея</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Көз ирмемдердин, этаптардын жана визуалдык мурастардын архиви.</p>
      </div>

      {gallery.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Азырынча сүрөттөр кошула элек.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {gallery.map((item, idx) => (
            <motion.div 
              key={item.id}
              className="glass-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{ overflow: 'hidden', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img 
                  src={item.url || 'https://via.placeholder.com/600x400?text=Сүрөт+жок'} 
                  alt={item.title} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
