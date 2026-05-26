import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn, Search } from 'lucide-react';
import TiltCard from '../components/TiltCard';

/* ── Category mapping (by item.status field) ─────────────────────── */
const FILTER_MAP = {
  'Баары': null,
  'Иш-чаралар': 'events',
  'Долбоорлор': 'projects',
  'Сертификаттар': 'certificates',
};

const FILTERS = Object.keys(FILTER_MAP);

/* ── Fallback demo items when API is empty ───────────────────────── */
const DEMO_ITEMS = [
  { id: 1, title: 'Enactus Улуттук Конкурсу 2023', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', date: '2023-06-12', status: 'Активдүү' },
  { id: 2, title: 'Илимий Конференция', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800', date: '2024-02-18', status: 'Активдүү' },
  { id: 3, title: 'Студенттик Мобилдүүлүк', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', date: '2023-10-05', status: 'Активдүү' },
  { id: 4, title: 'Жаштар Форуму', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800', date: '2024-01-20', status: 'Активдүү' },
  { id: 5, title: 'Лидерлик Тренинг', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800', date: '2023-09-14', status: 'Активдүү' },
  { id: 6, title: 'Маданий Иш-чара', url: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?auto=format&fit=crop&q=80&w=800', date: '2024-03-10', status: 'Активдүү' },
];

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Баары');
  const [lightbox, setLightbox] = useState(null); // index of open image

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => {
        const active = d.filter(g => g.status !== 'Бүттү');
        setGallery(active.length > 0 ? active : DEMO_ITEMS);
      })
      .catch(() => setGallery(DEMO_ITEMS));
  }, []);

  /* Filtered items */
  const filtered = activeFilter === 'Баары'
    ? gallery
    : gallery.filter(g => g.status === FILTER_MAP[activeFilter]);

  /* Lightbox navigation */
  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const prevImage = useCallback(() => {
    setLightbox(i => (i - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const nextImage = useCallback(() => {
    setLightbox(i => (i + 1) % filtered.length);
  }, [filtered.length]);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prevImage, nextImage]);

  return (
    <div style={{ paddingBottom: '6rem' }}>

      {/* ── Page Hero ── */}
      <div className="container page-hero">
        <span className="badge-label">
          <ImageIcon size={13} /> КӨРГӨЗМӨ
        </span>
        <h1 className="text-gradient">Галерея</h1>
        <p>Жашоонун айкын учурлары — иш-чаралар, конкурстар жана долбоорлор.</p>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="container">
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="container">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="glass-panel"
              style={{ padding: '4rem', textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Search size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Бул бөлүмдө азырынча сүрөттөр кошула элек.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter}
              style={{
                columns: '3 320px',
                columnGap: '1.25rem',
                gap: '1.25rem'
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '1.25rem',
                    display: 'block'
                  }}
                >
                  <TiltCard
                    maxTilt={6}
                    scale={1.01}
                    onClick={() => openLightbox(idx)}
                    style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid var(--bg-glass-border)',
                      display: 'block',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={item.url || 'https://via.placeholder.com/600x400?text=Сүрөт+жок'}
                      alt={item.title}
                      style={{
                        width: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />

                    {/* Hover Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(7,11,26,0.85) 0%, transparent 50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.25rem',
                    }}
                      onMouseOver={e => e.currentTarget.style.opacity = '1'}
                      onMouseOut={e => e.currentTarget.style.opacity = '0'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ color: '#fff', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</p>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{item.date}</p>
                        </div>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(99,102,241,0.8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff'
                        }}>
                          <ZoomIn size={16} />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            style={{ cursor: 'zoom-out' }}
          >
            {/* Close */}
            <button
              className="modal-close-btn"
              onClick={closeLightbox}
              style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 10001 }}
            >
              <X size={18} />
            </button>

            {/* Prev */}
            {filtered.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); prevImage(); }}
                style={{
                  position: 'fixed', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10001, width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--bg-glass-border)',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.4)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '90vw', maxHeight: '85vh',
                borderRadius: '20px', overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                border: '1px solid var(--bg-glass-border)'
              }}
            >
              <img
                src={filtered[lightbox].url}
                alt={filtered[lightbox].title}
                style={{ display: 'block', maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
              />
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(7,11,26,0.9)',
                backdropFilter: 'blur(10px)',
              }}>
                <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-primary)' }}>
                  {filtered[lightbox].title}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  {filtered[lightbox].date} · {lightbox + 1} / {filtered.length}
                </p>
              </div>
            </motion.div>

            {/* Next */}
            {filtered.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); nextImage(); }}
                style={{
                  position: 'fixed', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10001, width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--bg-glass-border)',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.4)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <ChevronRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
