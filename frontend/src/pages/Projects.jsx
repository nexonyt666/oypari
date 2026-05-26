import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2, ArrowRight, X, ExternalLink, Calendar,
  Layers, Users, Globe, Monitor, BookOpen, Star
} from 'lucide-react';
import TiltCard from '../components/TiltCard';

/* ── Category definitions ────────────────────────────────────────── */
const FILTERS = ['Баары', 'Билим берүү', 'Коомдук', 'Маданият', 'IT'];

const CATEGORY_COLORS = {
  'Билим берүү': { bg: 'rgba(99,102,241,0.1)', text: 'var(--primary)', border: 'rgba(99,102,241,0.2)' },
  'Коомдук':     { bg: 'rgba(236,72,153,0.1)', text: 'var(--secondary)', border: 'rgba(236,72,153,0.2)' },
  'Маданият':    { bg: 'rgba(168,85,247,0.1)', text: 'var(--accent-purple)', border: 'rgba(168,85,247,0.2)' },
  'IT':          { bg: 'rgba(20,184,166,0.1)', text: '#14B8A6', border: 'rgba(20,184,166,0.2)' },
};

const CATEGORY_ICONS = {
  'Билим берүү': <BookOpen size={18} />,
  'Коомдук':     <Users size={18} />,
  'Маданият':    <Globe size={18} />,
  'IT':          <Monitor size={18} />,
};

/* ── Demo projects (if API empty) ────────────────────────────────── */
const DEMO_PROJECTS = [
  {
    id: 1,
    title: 'Билим берүү Платформасы',
    description: 'Жаштар арасында билим деңгээлин жогорулатуу жана инновациялык технологияларды колдонууну жайылтуу багытында эл аралык демилге.',
    status: 'Активдүү',
    url: 'https://ayperi.kg',
    date: '2024-03-15',
    category: 'Билим берүү',
    tags: ['Билим', 'Технология', 'Жаштар'],
    featured: true
  },
  {
    id: 2,
    title: 'Санариптик Мурас Платформасы',
    description: 'Кыргыз маданий мурастарын санариптештирүү жана заманбап форматта жаштарга жеткирүү боюнча интерактивдүү долбоор.',
    status: 'Активдүү',
    url: '',
    date: '2023-11-20',
    category: 'Маданият',
    tags: ['Маданият', 'Цифровизация', 'Кыргызстан'],
    featured: false
  },
  {
    id: 3,
    title: 'Enactus Социалдык Долбоор',
    description: 'Enactus командасынын алкагында социалдык ишкердик долбоорду иштеп чыгуу жана жашоого ашыруу.',
    status: 'Активдүү',
    url: '',
    date: '2023-09-10',
    category: 'Коомдук',
    tags: ['Enactus', 'Коомдук', 'Ишкердик'],
    featured: false
  },
  {
    id: 4,
    title: 'Жаштар Мобилдик Колдонмосу',
    description: 'Жаш лидерлерге арналган мобилдик платформа — окуу контенти, тестирование жана менторлук.',
    status: 'Даярдоодо',
    url: '',
    date: '2024-01-05',
    category: 'IT',
    tags: ['IT', 'Мобилдик', 'UX'],
    featured: false
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Баары');

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => {
        const items = d.length > 0 ? d : DEMO_PROJECTS;
        const parsed = items.map(p => {
          let tagsArr = [];
          if (p.tags) {
            if (Array.isArray(p.tags)) {
              tagsArr = p.tags;
            } else if (typeof p.tags === 'string') {
              tagsArr = p.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
          }
          return { ...p, tags: tagsArr };
        });
        setProjects(parsed);
      })
      .catch(() => setProjects(DEMO_PROJECTS));
  }, []);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const filtered = activeFilter === 'Баары'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  const featured = projects.find(p => p.featured);
  const regularFiltered = activeFilter === 'Баары'
    ? projects.filter(p => !p.featured)
    : filtered.filter(p => !p.featured);

  /* Stats */
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Активдүү').length;
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))].length;

  const getCatStyle = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS['Билим берүү'];

  return (
    <div style={{ paddingBottom: '6rem' }}>

      {/* ── Page Hero ── */}
      <div className="container page-hero" style={{ paddingBottom: '2rem' }}>
        <span className="badge-label">
          <FolderGit2 size={13} /> ДЕМИЛГЕЛЕР
        </span>
        <h1 className="text-gradient">Долбоорлор</h1>
        <p>Билим берүү, маданий мурас жана коомдук өнүгүү багытындагы долбоорлор.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          padding: '1.5rem 2rem', borderRadius: '16px',
          background: 'rgba(17,24,39,0.5)', border: '1px solid var(--bg-glass-border)'
        }}>
          {[
            { label: 'Жалпы Долбоорлор', val: totalProjects, icon: <FolderGit2 size={18} /> },
            { label: 'Активдүү', val: activeProjects, icon: <Star size={18} /> },
            { label: 'Категориялар', val: categories, icon: <Layers size={18} /> },
            { label: 'Жыл Иш', val: '3+', icon: <Calendar size={18} /> },
          ].map((s, i) => (
            <div key={i} style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)', opacity: 0.7 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{s.val}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Project ── */}
      {featured && activeFilter === 'Баары' && (
        <div className="container" style={{ marginBottom: '2.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TiltCard
              maxTilt={4}
              className="grid grid-cols-2"
              style={{
                gap: '2.5rem',
                padding: '2.5rem', borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  ⭐ Негизги Долбоор
                </span>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>{featured.title}</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {featured.description}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {(featured.tags || []).map((t, i) => (
                    <span key={i} style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => setSelected(featured)}>
                    Кеңири <ArrowRight size={15} />
                  </button>
                  {featured.url && (
                    <a href={featured.url} target="_blank" rel="noreferrer" className="btn btn-glass">
                      <ExternalLink size={15} /> Ачуу
                    </a>
                  )}
                </div>
              </div>
              <div style={{
                height: '280px', borderRadius: '18px', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {CATEGORY_ICONS[featured.category] ? (
                  <div style={{ transform: 'scale(4)', color: 'rgba(99,102,241,0.3)', display: 'flex' }}>
                    {CATEGORY_ICONS[featured.category]}
                  </div>
                ) : <FolderGit2 size={80} style={{ color: 'rgba(99,102,241,0.3)' }} />}
              </div>
            </TiltCard>
          </motion.div>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="container">
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f} className={`filter-tab ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects Grid ── */}
      <div className="container">
        <AnimatePresence mode="wait">
          {regularFiltered.length === 0 ? (
            <motion.div
              key="empty"
              className="glass-panel"
              style={{ padding: '4rem', textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <FolderGit2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--primary)', display: 'block' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Бул категорияда азырынча долбоорлор кошула элек.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter}
              className="grid grid-cols-2"
              style={{ gap: '1.5rem' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {regularFiltered.map((project, idx) => {
                const catStyle = getCatStyle(project.category);
                return (
                  <motion.div
                    key={project.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: idx * 0.08 }}
                  >
                    <TiltCard
                      maxTilt={8}
                      onClick={() => setSelected(project)}
                      style={{
                        padding: '2rem', borderRadius: '20px',
                        background: 'rgba(17,24,39,0.55)',
                        border: '1px solid var(--bg-glass-border)',
                        display: 'flex', flexDirection: 'column',
                        height: '100%',
                        position: 'relative', overflow: 'hidden'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                        e.currentTarget.style.boxShadow = '0 20px 50px rgba(99,102,241,0.12)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = 'var(--bg-glass-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Gradient glow on hover (always shown subtly) */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                        background: 'var(--gradient)', opacity: 0, transition: 'opacity 0.3s'
                      }} />

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '12px',
                          background: catStyle.bg, color: catStyle.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {CATEGORY_ICONS[project.category] || <FolderGit2 size={18} />}
                        </div>
                        {project.category && (
                          <span style={{
                            fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                            background: catStyle.bg, color: catStyle.text,
                            border: `1px solid ${catStyle.border}`,
                            borderRadius: '100px', fontWeight: 600
                          }}>
                            {project.category}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{project.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, flex: 1, marginBottom: '1.25rem' }}>
                        {(project.description || '').substring(0, 120)}{project.description?.length > 120 ? '...' : ''}
                      </p>

                      {/* Tags */}
                      {project.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          {project.tags.slice(0, 3).map((t, i) => (
                            <span key={i} style={{ padding: '0.2rem 0.65rem', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '0.75rem', border: '1px solid var(--bg-glass-border)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--bg-glass-border)', marginTop: 'auto' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} /> {project.date}
                        </span>
                        <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          Кеңири <ArrowRight size={14} />
                        </span>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PROJECT MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '680px', borderRadius: '24px',
                background: 'rgba(13,17,40,0.98)',
                border: '1px solid var(--bg-glass-border)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                padding: '2.5rem', position: 'relative',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <button className="modal-close-btn" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>

              {/* Category + Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '14px',
                  background: getCatStyle(selected.category).bg,
                  color: getCatStyle(selected.category).text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {CATEGORY_ICONS[selected.category] || <FolderGit2 size={26} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>{selected.title}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> {selected.date}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                      background: selected.status === 'Активдүү' ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.1)',
                      color: selected.status === 'Активдүү' ? '#14B8A6' : '#EF4444',
                      borderRadius: '100px', fontWeight: 600
                    }}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '1.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '14px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Долбоор тууралуу</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                  {selected.description || 'Кененирээк маалымат кошулган эмес.'}
                </p>
              </div>

              {/* Tags */}
              {selected.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {selected.tags.map((t, i) => (
                    <span key={i} style={{ padding: '0.3rem 0.9rem', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {selected.url && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a href={selected.url} target="_blank" rel="noreferrer" className="btn btn-primary">
                    Шилтемеге өтүү <ExternalLink size={15} />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
