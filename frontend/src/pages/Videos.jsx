import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, PlayCircle, X, Calendar, Clock } from 'lucide-react';
import TiltCard from '../components/TiltCard';

/* ── YouTube helpers ─────────────────────────────────────────────── */
const getVideoId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
  return m ? m[1] : null;
};

const getEmbedUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
};

const getThumbnail = (url) => {
  const id = getVideoId(url);
  return id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800';
};

/* ── Category filters ────────────────────────────────────────────── */
const FILTERS = ['Баары', 'Интервью', 'Чыгармачылык', 'Окуу'];

/* ── Demo video items ────────────────────────────────────────────── */
const DEMO_VIDEOS = [
  { id: 1, title: 'Enactus долбоорунун презентациясы', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', date: '2023-05-25', status: 'Активдүү', category: 'Окуу' },
  { id: 2, title: 'Билим берүү маанисиндеги видеоролик', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', date: '2024-01-10', status: 'Активдүү', category: 'Интервью' },
  { id: 3, title: 'Жаштар лидерлиги жөнүндө', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', date: '2024-02-20', status: 'Активдүү', category: 'Чыгармачылык' },
];

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Баары');
  const [playing, setPlaying] = useState(null); // video object

  useEffect(() => {
    fetch('/api/videos')
      .then(r => r.json())
      .then(d => {
        const active = d.filter(v => v.status !== 'Бүттү');
        setVideos(active.length > 0 ? active : DEMO_VIDEOS);
      })
      .catch(() => setVideos(DEMO_VIDEOS));
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setPlaying(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = activeFilter === 'Баары'
    ? videos
    : videos.filter(v => v.category === activeFilter);

  return (
    <div style={{ paddingBottom: '6rem' }}>

      {/* ── Page Hero ── */}
      <div className="container page-hero">
        <span className="badge-label">
          <Video size={13} /> МЕДИА
        </span>
        <h1 className="text-gradient-blue">Видеолор</h1>
        <p>Кинематографиялык билим берүүчү видеолор, долбоорлордун презентациялары жана интервьюлар.</p>
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

      {/* ── Video Grid ── */}
      <div className="container">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="glass-panel"
              style={{ padding: '4rem', textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <PlayCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.25, color: 'var(--primary)', display: 'block' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Азырынча видеолор кошула элек.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((item, idx) => {
                const thumb = getThumbnail(item.url);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <TiltCard
                      maxTilt={8}
                      onClick={() => setPlaying(item)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: 'rgba(17, 24, 39, 0.55)',
                        border: '1px solid var(--bg-glass-border)',
                        height: '100%'
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--bg-glass-border)'}
                    >
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', background: '#111' }}>
                        <img
                          src={thumb}
                          alt={item.title}
                          style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.4s ease'
                          }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />

                        {/* Play Overlay */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(7,11,26,0.45)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'rgba(99,102,241,0.85)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                            transition: 'transform 0.2s'
                          }}>
                            <PlayCircle size={28} color="#fff" fill="#fff" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {item.duration && (
                          <span style={{
                            position: 'absolute', bottom: '0.6rem', right: '0.6rem',
                            background: 'rgba(0,0,0,0.8)', color: '#fff',
                            padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}>
                            <Clock size={11} /> {item.duration}
                          </span>
                        )}
                      </div>

                      {/* Card Info */}
                      <div style={{ padding: '1.25rem', marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>{item.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={12} /> {item.date}
                          </span>
                          {item.category && (
                            <span style={{
                              fontSize: '0.72rem', padding: '0.2rem 0.6rem',
                              background: 'rgba(99,102,241,0.12)', color: 'var(--primary)',
                              borderRadius: '100px', fontWeight: 600
                            }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {playing && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaying(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '900px',
                borderRadius: '22px', overflow: 'hidden',
                background: 'rgba(13,17,40,0.98)',
                border: '1px solid var(--bg-glass-border)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
            >
              {/* Close */}
              <button
                className="modal-close-btn"
                onClick={() => setPlaying(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
              >
                <X size={16} />
              </button>

              {/* Video */}
              {getEmbedUrl(playing.url) ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={getEmbedUrl(playing.url)}
                    title={playing.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <PlayCircle size={52} style={{ color: 'var(--primary)', opacity: 0.5, margin: '0 auto 1rem', display: 'block' }} />
                  <a href={playing.url} target="_blank" rel="noreferrer" className="btn btn-primary">
                    Видеону ачуу →
                  </a>
                </div>
              )}

              {/* Title Bar */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--bg-glass-border)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{playing.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{playing.date}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Videos;
