import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, ArrowRight, Award } from 'lucide-react';

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

const Resume = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const catParam = searchParams.get('cat');
  
  const [resumeData, setResumeData] = useState([]);

  useEffect(() => {
    const savedResume = JSON.parse(localStorage.getItem('ayperi_resume')) || [];
    setResumeData(savedResume);
  }, []);

  const activeCategoryIndex = catParam ? parseInt(catParam) : -1;
  const filteredData = activeCategoryIndex >= 0 
    ? resumeData.filter(item => parseInt(item.category) === activeCategoryIndex)
    : resumeData;

  const currentCategoryName = activeCategoryIndex >= 0 
    ? resumeCategories[activeCategoryIndex] 
    : "Бардык Жетишкендиктер";

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '60vh', paddingBottom: '4rem' }}>
      
      {/* Category Nav for easy switching within Resume page */}
      {activeCategoryIndex >= 0 && (
        <button 
          onClick={() => navigate('/resume')} 
          className="btn btn-glass btn-sm"
          style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Артка (Бардыгын көрүү)
        </button>
      )}

      <div className="section-header">
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '100px', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <FileText size={16} className="text-secondary" />
          {activeCategoryIndex >= 0 ? `${activeCategoryIndex + 1}-бөлүм` : 'Жалпы резюме'}
        </span>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          {currentCategoryName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          {activeCategoryIndex >= 0 
            ? `Бул бөлүмдө ${currentCategoryName.toLowerCase()} боюнча жетишкендиктер камтылган.` 
            : 'AYPERIнин бардык жетишкендиктери, долбоорлору жана тажрыйбалары.'}
        </p>
      </div>

      {filteredData.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Бул бөлүмгө азырынча маалымат кошула элек.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {filteredData.map((item, idx) => (
            <motion.div 
              key={item.id}
              className="feature-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {item.url && (
                <div style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              {!item.url && (
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Award size={24} />
                </div>
              )}
              
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{item.title}</h3>
              
              {/* Show category tag only if we are viewing "All" */}
              {activeCategoryIndex < 0 && (
                <span style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)', borderRadius: '100px', marginBottom: '1rem' }}>
                  {resumeCategories[parseInt(item.category || 0)]}
                </span>
              )}

              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', flex: 1, lineHeight: '1.6' }}>
                {item.description || 'Кененирээк маалымат берилген жок.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--bg-glass-border)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {item.date}
                </span>
                <span style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent)', borderRadius: '100px' }}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid of Categories if viewing ALL */}
      {activeCategoryIndex < 0 && (
        <div style={{ marginTop: '5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Бөлүмдөр боюнча көрүү</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {resumeCategories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(`/resume?cat=${idx}`)}
                className="btn btn-glass"
                style={{ fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}
              >
                {idx + 1}. {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;
