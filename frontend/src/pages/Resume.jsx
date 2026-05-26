import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Award, Briefcase, GraduationCap, Trophy, Download, ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import TiltCard from '../components/TiltCard';

/* ── Resume category definitions ─────────────────────────────────── */
const ALL_CATEGORIES = [
  "Олимпиада конкурс жеңүүчүсү", "Басылмага жарыялоо", "Долбоор",
  "Конференциялар", "Маданий иш-чаралар", "Спорт", "Практика учурунда",
  "Enactus", "Мобилдүүлук", "Билерман ордо", "Ыктыярчы",
  "Кошумча маалымат", "Ыраазычылык баракчасы"
];

/* ── 4 Sub-section tab mapping ───────────────────────────────────── */
// Map raw category indices → 4 sub-nav tabs
const TAB_MAP = {
  'Билим': [0, 1, 9],          // Олимпиада, Басылма, Билерман ордо
  'Тажрыйба': [2, 6, 7, 8, 10], // Долбоор, Практика, Enactus, Мобилдүүлук, Ыктыярчы
  'Сертификаттар': [3, 4, 5],   // Конференция, Маданий, Спорт
  'Жетишкендиктер': [11, 12],   // Кошумча, Ыраазычылык
};

const TABS = ['Билим', 'Тажрыйба', 'Сертификаттар', 'Жетишкендиктер'];

const TAB_ICONS = {
  'Билим': <GraduationCap size={16} />,
  'Тажрыйба': <Briefcase size={16} />,
  'Сертификаттар': <Award size={16} />,
  'Жетишкендиктер': <Trophy size={16} />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ── Card Colors ─────────────────────────────────────────────────── */
const CAT_COLORS = [
  'rgba(99,102,241,0.1)', 'rgba(236,72,153,0.1)', 'rgba(168,85,247,0.1)',
  'rgba(20,184,166,0.1)', 'rgba(234,179,8,0.1)', 'rgba(59,130,246,0.1)',
];

const Resume = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const catParam = searchParams.get('cat');
  const tabParam = searchParams.get('tab');

  const [resumeData, setResumeData] = useState([]);
  const [activeTab, setActiveTab] = useState(tabParam || 'Билим');

  useEffect(() => {
    fetch('/api/resume')
      .then(r => r.json())
      .then(d => setResumeData(d))
      .catch(() => {});
  }, []);

  /* Handle ?cat= param from navbar dropdown */
  useEffect(() => {
    if (catParam !== null) {
      const idx = parseInt(catParam);
      const tab = Object.entries(TAB_MAP).find(([, indices]) => indices.includes(idx));
      if (tab) setActiveTab(tab[0]);
    }
  }, [catParam]);

  /* Filter data by active tab */
  const filteredData = resumeData.filter(item =>
    TAB_MAP[activeTab]?.includes(parseInt(item.category || '0'))
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate('/resume');
  };

  /* Is it the "category view" from navbar? */
  const singleCategoryView = catParam !== null;
  const singleCatIndex = singleCategoryView ? parseInt(catParam) : -1;
  const singleCatItems = singleCategoryView
    ? resumeData.filter(item => parseInt(item.category) === singleCatIndex)
    : [];

  /* Helper: find PDF file */
  const pdfFile = '/pdf/43353453453453453453.pdf';

  return (
    <div style={{ paddingBottom: '6rem' }}>

      {/* ── Page Hero ── */}
      <div className="container page-hero" style={{ paddingBottom: '2rem' }}>
        <span className="badge-label">
          <FileText size={13} /> РЕЗЮМЕ
        </span>
        <h1 className="text-gradient">
          {singleCategoryView ? ALL_CATEGORIES[singleCatIndex] : 'Менин Резюмем'}
        </h1>
        <p>AYPERIнин билими, тажрыйбасы жана жетишкендиктери.</p>
      </div>

      {/* ── Controls Row ── */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {singleCategoryView && (
            <button onClick={() => navigate('/resume')} className="btn btn-glass btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={14} /> Артка
            </button>
          )}
          {!singleCategoryView && TABS.map(tab => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {TAB_ICONS[tab]} {tab}
            </button>
          ))}
        </div>

        {/* PDF Download */}
        <a
          href={pdfFile}
          download
          className="btn btn-glass btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={14} /> PDF жүктөө
        </a>
      </div>

      {/* ── Content ── */}
      <div className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={singleCategoryView ? `cat-${catParam}` : activeTab}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {(singleCategoryView ? singleCatItems : filteredData).length === 0 ? (
              <motion.div
                className="glass-panel"
                style={{ padding: '4rem', textAlign: 'center' }}
                variants={fadeUp}
              >
                <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--primary)', display: 'block' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Бул бөлүмгө азырынча маалымат кошула элек.</p>
              </motion.div>
            ) : (
              <>
                {/* Timeline style for Билим & Тажрыйба */}
                {(activeTab === 'Билим' || activeTab === 'Тажрыйба') && !singleCategoryView ? (
                  <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Vertical line */}
                    <div style={{
                      position: 'absolute', left: '1.75rem', top: 0, bottom: 0,
                      width: '2px',
                      background: 'linear-gradient(to bottom, var(--primary), var(--accent-purple), var(--secondary))',
                      opacity: 0.4
                    }} />

                    {filteredData.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                        style={{
                          display: 'flex', gap: '1.75rem',
                          paddingLeft: '1rem', marginBottom: '2rem', position: 'relative'
                        }}
                      >
                        {/* Dot */}
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--primary)', border: '3px solid var(--bg-main)',
                          marginTop: '1.6rem',
                          boxShadow: '0 0 10px var(--primary)',
                          position: 'relative', zIndex: 1
                        }} />

                        {/* Card */}
                        <TiltCard
                          maxTilt={6}
                          style={{
                            flex: 1, padding: '1.75rem 2rem', borderRadius: '18px',
                            background: 'rgba(17,24,39,0.55)', border: '1px solid var(--bg-glass-border)',
                          }}
                          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--bg-glass-border)'}
                        >
                          {/* Category Tag */}
                          <span style={{
                            display: 'inline-block', fontSize: '0.72rem', padding: '0.2rem 0.7rem',
                            background: CAT_COLORS[parseInt(item.category || '0') % CAT_COLORS.length],
                            color: 'var(--primary)', borderRadius: '100px', marginBottom: '0.75rem',
                            fontWeight: 600
                          }}>
                            {ALL_CATEGORIES[parseInt(item.category || '0')]}
                          </span>

                          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                            {item.description || 'Кененирээк маалымат берилген жок.'}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={12} /> {item.date}
                            </span>
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <ExternalLink size={12} /> Ачуу
                              </a>
                            )}
                          </div>
                        </TiltCard>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {/* Certificate grid for Сертификаттар */}
                {(activeTab === 'Сертификаттар' || singleCategoryView) && !singleCategoryView ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filteredData.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                      >
                        <TiltCard
                          maxTilt={8}
                          style={{
                            padding: '2rem', borderRadius: '18px',
                            background: 'rgba(17,24,39,0.55)', border: '1px solid var(--bg-glass-border)',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            height: '100%'
                          }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bg-glass-border)'; }}
                        >
                          <div style={{
                            width: 48, height: 48, borderRadius: '12px',
                            background: CAT_COLORS[idx % CAT_COLORS.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)'
                          }}>
                            <Award size={22} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                              {item.description || ALL_CATEGORIES[parseInt(item.category || '0')]}
                            </p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--bg-glass-border)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.date}</span>
                            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)', borderRadius: '100px', fontWeight: 600 }}>
                              {item.status}
                            </span>
                          </div>
                        </TiltCard>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {/* Trophy cards for Жетишкендиктер */}
                {activeTab === 'Жетишкендиктер' && !singleCategoryView ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filteredData.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                      >
                        <TiltCard
                          maxTilt={8}
                          style={{
                            padding: '2.25rem', borderRadius: '20px',
                            background: `linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.04) 100%)`,
                            border: '1px solid rgba(99,102,241,0.15)',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            height: '100%'
                          }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 20px 50px rgba(99,102,241,0.15)'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <Trophy size={32} style={{ color: '#F59E0B' }} />
                          <h3 style={{ fontSize: '1.2rem' }}>{item.title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, flex: 1 }}>
                            {item.description || 'Чоң жетишкендик.'}
                          </p>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 'auto' }}>{item.date}</span>
                        </TiltCard>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {/* Single category view (from navbar) — general grid */}
                {singleCategoryView ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {singleCatItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                      >
                        <TiltCard
                          maxTilt={8}
                          style={{
                            padding: '2rem', borderRadius: '18px',
                            background: 'rgba(17,24,39,0.55)', border: '1px solid var(--bg-glass-border)',
                            display: 'flex', flexDirection: 'column',
                            height: '100%'
                          }}
                        >
                          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                            <Award size={22} />
                          </div>
                          {item.url && (
                            <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem', maxHeight: '200px' }}>
                              <img src={item.url} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            </div>
                          )}
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, flex: 1, marginBottom: '1rem' }}>
                            {item.description || 'Кененирээк маалымат берилген жок.'}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--bg-glass-border)', paddingTop: '0.85rem', marginTop: 'auto' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.date}</span>
                            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'rgba(20,184,166,0.1)', color: '#14B8A6', borderRadius: '100px' }}>{item.status}</span>
                          </div>
                        </TiltCard>
                      </motion.div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Browse all categories (when not in single-cat view and no tab items) ── */}
        {!singleCategoryView && filteredData.length === 0 && (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Бөлүмдөр боюнча көрүү</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
              {ALL_CATEGORIES.map((cat, idx) => (
                <button key={idx} onClick={() => navigate(`/resume?cat=${idx}`)} className="btn btn-glass btn-sm">
                  {idx + 1}. {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;
