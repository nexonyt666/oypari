import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, ArrowRight, X, ExternalLink, Calendar } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('ayperi_projects')) || [];
    setProjects(savedProjects);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '60vh', paddingBottom: '4rem', position: 'relative' }}>
      <div className="section-header">
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '100px', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <FolderGit2 size={16} className="text-primary" />
          Демилгелер
        </span>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Долбоорлор</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Биздин алдыңкы билим берүү системаларыбыз жана маданий мурастарды санариптештирүү платформалары.</p>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Азырынча долбоорлор кошула элек.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {projects.map((project, idx) => (
            <motion.div 
              key={project.id}
              className="feature-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div className="feature-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <FolderGit2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{project.title}</h3>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {project.description || `Бул долбоор ${project.date} күнү кошулган. Кошумча маалыматтарды көрүү үчүн төмөнкү шилтемени басыңыз.`}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--bg-glass-border)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem', background: project.status === 'Активдүү' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: project.status === 'Активдүү' ? 'var(--accent)' : '#EF4444', borderRadius: '100px' }}>
                  {project.status}
                </span>
                <button 
                  className="btn" 
                  style={{ padding: 0, color: 'var(--primary)', background: 'none' }}
                  onClick={() => setSelectedProject(project)}
                >
                  Көрүү <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              className="glass-panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: '700px', padding: '3rem', borderRadius: 'var(--radius-lg)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button 
                onClick={() => setSelectedProject(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#EF4444'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderGit2 size={30} />
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)', lineHeight: 1.2 }}>{selectedProject.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {selectedProject.date}
                    </span>
                    <span style={{ fontSize: '0.85rem', padding: '0.1rem 0.6rem', background: selectedProject.status === 'Активдүү' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: selectedProject.status === 'Активдүү' ? 'var(--accent)' : '#EF4444', borderRadius: '100px' }}>
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem' }}>Долбоор тууралуу:</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {selectedProject.description || "Кененирээк маалымат кошулган эмес."}
                </p>
              </div>

              {selectedProject.url && (
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <a href={selectedProject.url} target="_blank" rel="noreferrer" className="btn btn-primary">
                    Шилтемеге өтүү <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
