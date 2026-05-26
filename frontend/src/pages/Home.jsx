import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, Star, Sparkles, Globe,
  Briefcase, GraduationCap, Quote, Mail, LayoutGrid,
  Zap, Target, Users, TrendingUp
} from 'lucide-react';
import './Home.css';
import '../styles/effects3d.css';
import useMouseTilt from '../hooks/useMouseTilt';
import TiltCard from '../components/TiltCard';



// ── Animated Counter ──────────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target);
    const step = Math.ceil(end / (1800 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ── Framer variants ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = { visible: { transition: { staggerChildren: 0.11 } } };

// ── Data ──────────────────────────────────────────────────────────
const skills = [
  { name: 'Лидерлик & Башкаруу',    p: 95 },
  { name: 'Долбоор жазуу',          p: 85 },
  { name: 'Эл алдында сүйлөө',      p: 90 },
  { name: 'Англис тили',            p: 80 },
];

const tags = [
  'Менеджмент', 'Ишкердик', 'Волонтёрлук', 'IT Негиздери',
  'Команда менен иштөө', 'Көйгөйлөрдү чечүү', 'Креативдүүлүк',
  'Стратегиялык ой жүгүртүү', 'Коомдук баарлашуу'
];

const marqueeItems = [
  '🏆 Олимпиада Жеңүүчүсү', '🌍 Эл Аралык Долбоорлор', '🎓 Enactus',
  '📚 Академиялык Жетишкендиктер', '🤝 Мобилдүүлук', '⭐ Лидерлик',
  '🏆 Олимпиада Жеңүүчүсү', '🌍 Эл Аралык Долбоорлор', '🎓 Enactus',
  '📚 Академиялык Жетишкендиктер', '🤝 Мобилдүүлук', '⭐ Лидерлик',
];

const timelineData = [
  {
    year: '2024',
    title: 'Эл аралык Долбоорлор',
    desc: 'Билим берүү жана жаштар саясаты боюнча эл аралык деңгээлдеги кызматташуу.',
    icon: <Globe size={20} />
  },
  {
    year: '2023',
    title: 'Enactus Жетекчилиги',
    desc: 'Команданы алдыга баштоо жана социалдык ишкердик боюнча долбоорлорду ишке ашыруу.',
    icon: <Briefcase size={20} />
  },
  {
    year: '2022',
    title: 'Олимпиада Жеңүүчүсү',
    desc: 'Илимий олимпиадаларда жогорку көрсөткүчтөр жана биринчи орундар.',
    icon: <Award size={20} />
  },
  {
    year: '2021',
    title: 'Жаңы Кадамдар',
    desc: 'Жогорку билимге болгон алгачкы кадамдар жана студенттик активдүүлүктүн башталышы.',
    icon: <GraduationCap size={20} />
  },
];

const stats = [
  { val: 3, suffix: '+', label: 'Жыл Тажрыйба', icon: <Target size={16} /> },
  { val: 15, suffix: '+', label: 'Долбоорлор',   icon: <LayoutGrid size={16} /> },
  { val: 20, suffix: '+', label: 'Сертификат',   icon: <Award size={16} /> },
  { val: 100, suffix: '%', label: 'Берилгендик', icon: <Zap size={16} /> },
];

// ── HOME ──────────────────────────────────────────────────────────
const Home = () => {
  const [projects, setProjects] = useState([]);
  const photoTiltRef = useMouseTilt(14, 1.015, 550);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setErrorMsg(data.error || 'Жөнөтүүдө ката кетти. Кайра аракет кылыңыз.');
      }
    } catch (err) {
      setErrorMsg('Сервер менен байланышуу мүмкүн эмес.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProjects((d.length ? d : []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">



      {/* ═══════════════════════════════════════════════
           1. HERO
          ═══════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="container hero-container">

          {/* Left */}
          <motion.div
            className="hero-left"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Eyebrow */}
            <motion.div className="hero-eyebrow" variants={fadeUp}>
              <span className="hero-eyebrow-dot" />
              Жеке Портфолио
              <Sparkles size={14} />
            </motion.div>

            <motion.p className="hero-greeting" variants={fadeUp}>Салам, мен</motion.p>

            <motion.h1
              className="hero-name"
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
              }}
            >
              АЙПЕРИ
            </motion.h1>

            {/* Role badges */}
            <motion.div className="hero-roles" variants={fadeUp}>
              <span className="role-badge role-badge-1">Лидер</span>
              <span className="role-badge role-badge-2">Инноватор</span>
              <span className="role-badge role-badge-3">Ыктыарчы</span>
            </motion.div>

            <motion.p className="hero-description" variants={fadeUp}>
              Билим берүү, маданий долбоорлор жана коомдук иш-чаралар аркылуу
              дүйнөнү жакшыртууга умтулган жаш лидермин.
              Менин тажрыйбам жана жетишкендиктерим менен таанышыңыз.
            </motion.p>

            {/* Inline stats */}
            <motion.div className="hero-stats-row" variants={fadeUp}>
              {stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-num">
                    <Counter target={s.val} suffix={s.suffix} />
                  </div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div className="hero-cta-row" variants={fadeUp}>
              <Link to="/resume" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Резюме <ArrowRight size={17} />
              </Link>
              <Link to="/projects" className="btn btn-glass btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutGrid size={17} /> Долбоорлор
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — 3D Photo Universe */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, scale: 0.88, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '1000px' }}
          >
            {/* Tilt wrapper */}
            <div ref={photoTiltRef} style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
              <div className="photo-universe">

                {/* Background glow */}
                <div className="photo-glow-bg" />

                {/* Orbital rings */}
                <div className="orbit-ring orbit-ring-1" />
                <div className="orbit-ring orbit-ring-2" />
                <div className="orbit-ring orbit-ring-3" />

                {/* Orbiting dots */}
                <div className="orbit-dot orbit-dot-1" />
                <div className="orbit-dot orbit-dot-2" />
                <div className="orbit-dot orbit-dot-3" />

                {/* Photo circle with gradient border */}
                <div className="photo-circle">
                  <div className="photo-circle-inner">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                      alt="Ayperi"
                      className="profile-photo"
                    />
                    <div className="photo-overlay" />
                  </div>
                </div>

                {/* Floating badge — top left */}
                <motion.div
                  className="hero-badge-float badge-tl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transform: 'translateZ(50px)' }}
                >
                  <div className="badge-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Award size={20} color="#6366F1" />
                  </div>
                  <div>
                    <strong>Олимпиада</strong>
                    <span>Жеңүүчүсү 🏅</span>
                  </div>
                </motion.div>

                {/* Floating badge — bottom right */}
                <motion.div
                  className="hero-badge-float badge-br"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <div className="badge-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>
                    <Users size={20} color="#A855F7" />
                  </div>
                  <div>
                    <strong>Лидер ⭐</strong>
                    <span>Коомдук Ишмер</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
           2. MARQUEE SCROLL
          ═══════════════════════════════════════════════ */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
           3. SKILLS
          ═══════════════════════════════════════════════ */}
      <section className="expertise-section container">
        <div className="section-header center">
          <span className="section-label"><Zap size={13} /> АРТЫКЧЫЛЫКТАР</span>
          <h2 className="section-title">Менин Көндүмдөрүм</h2>
        </div>

        <div className="expertise-grid">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              className="skill-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="skill-top">
                <h3>{skill.name}</h3>
                <span className="skill-pct">{skill.p}%</span>
              </div>
              <div className="skill-bar-wrapper">
                <motion.div
                  className="skill-bar"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.p}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="tags-cloud"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {tags.map((tag, i) => (
            <span key={i} className="skill-tag">{tag}</span>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
           4. TIMELINE
          ═══════════════════════════════════════════════ */}
      <section className="timeline-section container">
        <div className="section-header center">
          <span className="section-label"><TrendingUp size={13} /> ТАРЫХ</span>
          <h2 className="section-title">Жашоо Жолум</h2>
        </div>

        <div className="modern-timeline">
          <div className="timeline-line" />
          {timelineData.map((item, idx) => (
            <motion.div
              key={idx}
              className={`timeline-row ${idx % 2 !== 0 ? 'right' : ''}`}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="timeline-dot-center" />
              <TiltCard className="timeline-card" maxTilt={8}>
                <div className="timeline-icon">{item.icon}</div>
                <p className="timeline-year">{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
           5. RECENT PROJECTS
          ═══════════════════════════════════════════════ */}
      {projects.length > 0 && (
        <section className="latest-projects container">
          <div className="section-header flex-between">
            <div>
              <span className="section-label"><LayoutGrid size={13} /> ИШТЕР</span>
              <h2 className="section-title">Акыркы Долбоорлор</h2>
            </div>
            <Link to="/projects" className="btn btn-glass" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Бардыгы <ArrowRight size={15} />
            </Link>
          </div>

          <div className="projects-mini-grid">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                className="proj-mini-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="proj-num">0{i + 1}</div>
                <h3>{p.title}</h3>
                <p>{(p.description || '').substring(0, 100) || 'Маалымат кошулган эмес.'}...</p>
                <div className="proj-footer">
                  <span className="proj-date">{p.date}</span>
                  <span className="proj-status">{p.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
           6. QUOTE
          ═══════════════════════════════════════════════ */}
      <section className="quote-section container">
        <motion.div
          className="quote-box"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ rotateX: 1.5, scale: 1.005 }}
          style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
        >
          <div className="quote-icon"><Quote size={26} /></div>
          <p className="quote-text">
            "Ийгилик — бул күн сайын кайталанган кичинекей аракеттердин натыйжасы.
            Билим алууну жана өнүгүүнү эч качан токтотпоңуз."
          </p>
          <div className="quote-author">
            <div className="quote-line" />
            <span className="quote-name">АЙПЕРИ</span>
            <div className="quote-line" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
           7. CONTACT & CTA SECTION
          ═══════════════════════════════════════════════ */}
      <section id="contact" className="contact-section container">
        <div className="contact-grid">
          
          {/* Left Side: Contact Information */}
          <motion.div 
            className="contact-info-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="section-label"><Mail size={13} /> БАЙЛАНЫШ</span>
            <h2 className="section-title">Биргеликте жаңы <span className="text-gradient">ийгиликтерге!</span></h2>
            <p className="contact-desc">
              Менин иштерим сизге жактыбы же суроолоруңуз барбы? Форманы толтуруңуз же мага түздөн-түз почта же социалдык тармактар аркылуу жазыңыз. Ар дайым жаңы мүмкүнчүлүктөргө ачыкмын!
            </p>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}><Mail size={18} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Почта</h4>
                  <a href="mailto:info@ayperi.kg" style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 600, textDecoration: 'none' }}>info@ayperi.kg</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}><Globe size={18} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Жайгашкан жери</h4>
                  <span style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 600 }}>Бишкек шаары, Кыргызстан</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Contact Form */}
          <motion.div 
            className="contact-form-panel glass-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              padding: '2.5rem',
              borderRadius: '24px',
              border: '1px solid var(--bg-glass-border)',
              background: 'rgba(13, 17, 40, 0.45)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {submitted ? (
              <motion.div 
                className="contact-success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1.5rem 0' }}
              >
                <div className="success-icon-check" style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}>✓</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Кабарыңыз жөнөтүлдү!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Рахмат, мен сиз менен жакынкы убакта байланышам.</p>
                <button className="btn btn-glass btn-sm" onClick={() => setSubmitted(false)}>Кайра жөнөтүү</button>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Аты-жөнүңүз</label>
                  <input 
                    type="text" 
                    required 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    placeholder="Атыңызды жазыңыз..." 
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--bg-glass-border)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email дарегиңиз</label>
                  <input 
                    type="email" 
                    required 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)} 
                    placeholder="email@example.com" 
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--bg-glass-border)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Кабар / Сунуш</label>
                  <textarea 
                    required 
                    value={contactMessage} 
                    onChange={e => setContactMessage(e.target.value)} 
                    placeholder="Жумуш сунушу же сурооңузду жазыңыз..." 
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--bg-glass-border)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      minHeight: '120px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                    {errorMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Жөнөтүлүүдө...' : 'Кабарды Жөнөтүү'}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default Home;
