import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, PlayCircle } from 'lucide-react';

const Videos = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const savedVideos = JSON.parse(localStorage.getItem('ayperi_videos')) || [];
    setVideos(savedVideos.filter(v => v.status !== 'Бүттү'));
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '60vh', paddingBottom: '4rem' }}>
      <div className="section-header">
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '100px', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <Video size={16} className="text-accent" />
          Медиа
        </span>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', backgroundImage: 'linear-gradient(135deg, var(--accent), #4facfe)' }}>Видеолор</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Кинематографиялык билим берүүчү видеолор, долбоорлордун презентациялары.</p>
      </div>

      {videos.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Азырынча видеолор кошула элек.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {videos.map((item, idx) => {
            const embedUrl = getEmbedUrl(item.url);
            
            return (
              <motion.div 
                key={item.id}
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ overflow: 'hidden', padding: '1rem', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                  {embedUrl ? (
                    <iframe 
                      src={embedUrl} 
                      title={item.title} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                      <PlayCircle size={48} className="text-accent" style={{ opacity: 0.5 }} />
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm">Видеону ачуу</a>
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.date}</p>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Videos;
