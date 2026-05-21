import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Star, TrendingUp, Sparkles, BookOpen, Globe, Briefcase, GraduationCap, Quote, Mail, LayoutGrid } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('ayperi_projects')) || [];
    setRecentProjects(savedProjects.filter(p => p.status !== 'Бүттү').slice(0, 3));
  }, []);

  const timelineData = [
    {
      year: "2024",
      title: "Эл аралык Долбоорлор",
      desc: "Билим берүү жана жаштар саясаты боюнча эл аралык деңгээлдеги кызматташуу.",
      icon: <Globe size={20} />
    },
    {
      year: "2023",
      title: "Enactus Жетекчилиги",
      desc: "Команданы алдыга баштоо жана социалдык ишкердик боюнча долбоорлорду ишке ашыруу.",
      icon: <Briefcase size={20} />
    },
    {
      year: "2022",
      title: "Олимпиада Жеңүүчүсү",
      desc: "Илимий олимпиадаларда жогорку көрсөткүчтөр жана биринчи орундар.",
      icon: <Award size={20} />
    },
    {
      year: "2021",
      title: "Жаңы Кадамдар",
      desc: "Жогорку билимге болгон алгачкы кадамдар жана студенттик активдүүлүк.",
      icon: <GraduationCap size={20} />
    }
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="home-page">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="hero-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Sparkles size={16} className="text-primary" /> Жеке Портфолио
            </motion.div>
            
            <h2 className="greeting">Салам, мен</h2>
            <h1 className="hero-title">
              <span className="text-gradient">Айпери</span>
            </h1>
            
            <h3 className="hero-roles">Лидер <span className="dot">•</span> Инноватор <span className="dot">•</span> Ыктыярчы</h3>
            
            <p className="hero-subtitle">
              Билим берүү, маданий долбоорлор жана коомдук иш-чаралар аркылуу дүйнөнү өзгөртүүгө умтулган жаш лидермин. Менин тажрыйбам менен таанышыңыз.
            </p>
            
            <div className="hero-actions">
              <Link to="/resume" className="btn btn-primary btn-lg pulse-hover">
                Резюме <ArrowRight size={18} />
              </Link>
              <Link to="/projects" className="btn btn-glass btn-lg">
                <LayoutGrid size={18} /> Долбоорлор
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="photo-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                alt="Ayperi" 
                className="profile-photo"
              />
              <div className="photo-gradient"></div>
            </div>

            <motion.div className="glass-badge badge-1" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Award className="text-primary" size={24} />
              <div>
                <strong>Олимпиада</strong>
                <span>Жеңүүчүсү</span>
              </div>
            </motion.div>

            <motion.div className="glass-badge badge-2" animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <Star className="text-secondary" size={24} />
              <div>
                <strong>Активдүү</strong>
                <span>Коомдук ишмер</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="stats-section container">
        <motion.div 
          className="stats-grid glass-panel"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <div className="stat-item">
            <h2>3+</h2>
            <p>Жыл тажрыйба</p>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item">
            <h2>15+</h2>
            <p>Долбоорлор</p>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item">
            <h2>20+</h2>
            <p>Сертификаттар</p>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item">
            <h2>100%</h2>
            <p>Натыйжалуулук</p>
          </div>
        </motion.div>
      </section>

      {/* 3. SKILLS & EXPERTISE (Re-designed) */}
      <section className="expertise-section container">
        <div className="section-header center">
          <span className="section-label">Көндүмдөр</span>
          <h2 className="section-title">Менин Артыкчылыктарым</h2>
        </div>
        
        <div className="expertise-grid">
          {[{ name: "Лидерлик & Башкаруу", p: "95%" }, { name: "Долбоор жазуу", p: "85%" }, { name: "Эл алдында сүйлөө", p: "90%" }, { name: "Англис тили", p: "80%" }].map((skill, i) => (
            <motion.div className="skill-card glass-panel" key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="skill-top">
                <h3>{skill.name}</h3>
                <span className="text-gradient">{skill.p}</span>
              </div>
              <div className="skill-bar-wrapper">
                <motion.div className="skill-bar" initial={{ width: 0 }} whileInView={{ width: skill.p }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div className="tags-cloud" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {["Менеджмент", "Ишкердик", "Волонтёрлук", "IT Негиздери", "Команда менен иштөө", "Көйгөйлөрдү чечүү", "Креативдүүлүк"].map((tag, idx) => (
            <span key={idx} className="glass-tag">{tag}</span>
          ))}
        </motion.div>
      </section>

      {/* 4. TIMELINE (Re-designed, centered vertical) */}
      <section className="timeline-section container">
        <div className="section-header center">
          <span className="section-label">Тарых</span>
          <h2 className="section-title">Жашоо Жолум</h2>
        </div>
        
        <div className="modern-timeline">
          <div className="timeline-line"></div>
          {timelineData.map((item, idx) => (
            <motion.div 
              className={`timeline-row ${idx % 2 === 0 ? 'left' : 'right'}`} 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="timeline-dot-center"></div>
              <div className="timeline-card glass-panel">
                <div className="timeline-icon">{item.icon}</div>
                <h4 className="text-gradient">{item.year}</h4>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. LATEST PROJECTS */}
      <section className="latest-projects container">
        <div className="section-header flex-between">
          <div>
            <span className="section-label">Иштер</span>
            <h2 className="section-title">Акыркы Долбоорлор</h2>
          </div>
          <Link to="/projects" className="btn btn-glass">Бардыгы <ArrowRight size={16}/></Link>
        </div>

        <div className="projects-grid">
          {recentProjects.length > 0 ? recentProjects.map((project, idx) => (
            <motion.div 
              key={project.id}
              className="project-card glass-panel"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
            >
              <h3>{project.title}</h3>
              <p>{project.description?.substring(0, 90) || "Маалымат кошулган эмес."}...</p>
              <div className="project-footer">
                <span className="date">{project.date}</span>
                <span className="status text-accent">{project.status}</span>
              </div>
            </motion.div>
          )) : (
            <div className="glass-panel w-full text-center p-8"><p>Долбоорлор кошула элек.</p></div>
          )}
        </div>
      </section>

      {/* 6. QUOTE SECTION (Massive Glassmorphism) */}
      <section className="quote-section container">
        <motion.div className="quote-glass-box" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="quote-glow"></div>
          <Quote size={60} className="quote-mark" />
          <blockquote>
            "Ийгилик — бул күн сайын кайталанган кичинекей аракеттердин натыйжасы. Билим алууну жана өнүгүүнү эч качан токтотпоңуз."
          </blockquote>
          <div className="quote-author">
            <div className="author-line"></div>
            <span>Айпери</span>
            <div className="author-line"></div>
          </div>
        </motion.div>
      </section>

      {/* 7. CTA / CONTACT */}
      <section className="cta-section container">
        <motion.div className="cta-content" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2>Биргеликте жаңы ийгиликтерге!</h2>
          <p>Сизде долбоор же кызматташуу сунушу барбы? Мен ар дайым жаңы мүмкүнчүлүктөргө ачыкмын.</p>
          <div className="cta-buttons">
            <a href="mailto:info@ayperi.kg" className="btn btn-primary btn-lg">
              <Mail size={18} /> Байланышуу
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
