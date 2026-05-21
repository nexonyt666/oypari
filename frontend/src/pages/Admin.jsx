import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Settings, Users, Image as ImageIcon, Video, FolderGit2, FileText, X, Lock, LogOut, AlertCircle } from 'lucide-react';
import './Admin.css';

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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('ayperi_admin_authenticated') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  
  // Data States
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('ayperi_projects')) || []);
  const [gallery, setGallery] = useState(() => JSON.parse(localStorage.getItem('ayperi_gallery')) || []);
  const [videos, setVideos] = useState(() => JSON.parse(localStorage.getItem('ayperi_videos')) || []);
  const [resume, setResume] = useState(() => JSON.parse(localStorage.getItem('ayperi_resume')) || []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: '', 
    status: 'Активдүү', 
    url: '', 
    category: '0', 
    description: '' 
  });

  useEffect(() => { localStorage.setItem('ayperi_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ayperi_gallery', JSON.stringify(gallery)); }, [gallery]);
  useEffect(() => { localStorage.setItem('ayperi_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('ayperi_resume', JSON.stringify(resume)); }, [resume]);

  const tabs = [
    { id: 'resume', label: 'Резюме / Жетишкендиктер', icon: <FileText size={18} /> },
    { id: 'projects', label: 'Долбоорлор', icon: <FolderGit2 size={18} /> },
    { id: 'gallery', label: 'Галерея', icon: <ImageIcon size={18} /> },
    { id: 'videos', label: 'Видеолор', icon: <Video size={18} /> },
    { id: 'users', label: 'Колдонуучулар', icon: <Users size={18} /> },
    { id: 'settings', label: 'Жөндөөлөр', icon: <Settings size={18} /> },
  ];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ 
        title: '', 
        status: 'Активдүү', 
        url: '', 
        category: '0', 
        description: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now(),
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0]
    };

    if (activeTab === 'projects') {
      if (editingItem) setProjects(projects.map(p => p.id === editingItem.id ? newItem : p));
      else setProjects([...projects, newItem]);
    } else if (activeTab === 'gallery') {
      if (editingItem) setGallery(gallery.map(g => g.id === editingItem.id ? newItem : g));
      else setGallery([...gallery, newItem]);
    } else if (activeTab === 'videos') {
      if (editingItem) setVideos(videos.map(v => v.id === editingItem.id ? newItem : v));
      else setVideos([...videos, newItem]);
    } else if (activeTab === 'resume') {
      if (editingItem) setResume(resume.map(r => r.id === editingItem.id ? newItem : r));
      else setResume([...resume, newItem]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Чын эле өчүрөсүзбү?")) {
      if (activeTab === 'projects') setProjects(projects.filter(p => p.id !== id));
      else if (activeTab === 'gallery') setGallery(gallery.filter(g => g.id !== id));
      else if (activeTab === 'videos') setVideos(videos.filter(v => v.id !== id));
      else if (activeTab === 'resume') setResume(resume.filter(r => r.id !== id));
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === 'ayperi2026') {
      sessionStorage.setItem('ayperi_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Туура эмес сырсөз! Кайра аракет кылыңыз.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ayperi_admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  const renderTableData = () => {
    let data = [];
    if (activeTab === 'projects') data = projects;
    else if (activeTab === 'gallery') data = gallery;
    else if (activeTab === 'videos') data = videos;
    else if (activeTab === 'resume') data = resume;
    else return <tr><td colSpan="5" className="text-center" style={{padding: '2rem'}}>Бул бөлүм азырынча бош</td></tr>;

    if (data.length === 0) {
      return <tr><td colSpan="5" className="text-center" style={{padding: '2rem', color: 'var(--text-secondary)'}}>Маалымат табылган жок</td></tr>;
    }

    return data.map(item => (
      <tr key={item.id}>
        <td>#{item.id.toString().slice(-4)}</td>
        <td>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            {activeTab === 'gallery' && item.url && (
              <img src={item.url} alt="thumb" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{item.title}</span>
              {activeTab === 'resume' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px' }}>
                  {resumeCategories[parseInt(item.category || 0)]}
                </span>
              )}
            </div>
          </div>
        </td>
        <td>
          <span className={`status-badge ${item.status === 'Активдүү' ? 'active' : 'inactive'}`}>
            {item.status || 'Активдүү'}
          </span>
        </td>
        <td>{item.date}</td>
        <td>
          <div className="action-buttons">
            <button className="action-btn edit" onClick={() => handleOpenModal(item)}><Edit3 size={16} /></button>
            <button className="action-btn delete" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
          </div>
        </td>
      </tr>
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container container">
        <motion.div 
          className="login-card glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-icon-wrapper">
            <Lock size={32} />
          </div>
          <h1 className="login-title font-primary">Администратор</h1>
          <p className="login-subtitle">Башкаруу панелине кирүү үчүн сырсөздү жазыңыз</p>
          
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="login-input-group">
              <input 
                type="password" 
                className="login-input" 
                placeholder="Сырсөздү жазыңыз..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              {loginError && (
                <div className="login-error-msg">
                  <AlertCircle size={16} /> {loginError}
                </div>
              )}
            </div>
            
            <button type="submit" className="btn-login">
              Кирүү
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page container" style={{ paddingTop: '8rem', minHeight: '80vh', position: 'relative' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--bg-glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', margin: 0 }}>Админ Панель</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Сайттын маалыматтарын толук башкаруу системасы.</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-glass btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: '#EF4444', color: '#EF4444' }}
        >
          <LogOut size={16} /> Чыгуу
        </button>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar glass-panel">
          <ul className="admin-tabs">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button 
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-content glass-panel">
          <div className="content-header">
            <h2>{tabs.find(t => t.id === activeTab)?.label} Башкаруу</h2>
            {['projects', 'gallery', 'videos', 'resume'].includes(activeTab) && (
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
                <Plus size={16} /> Кошуу
              </button>
            )}
          </div>

          <div className="content-body" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Аталышы</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Аракеттер</th>
                </tr>
              </thead>
              <tbody>
                {renderTableData()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content glass-panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header">
                <h3>{editingItem ? 'Өзгөртүү' : 'Жаңы Кошуу'}</h3>
                <button type="button" className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                
                {activeTab === 'resume' && (
                  <div className="form-group">
                    <label>Категория (Резюме бөлүмү)</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                      {resumeCategories.map((cat, idx) => (
                        <option key={idx} value={idx}>{idx + 1}. {cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Аталышы / Темасы</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="Аталышын жазыңыз..."
                  />
                </div>
                
                {(activeTab === 'gallery' || activeTab === 'videos' || activeTab === 'resume' || activeTab === 'projects') && (
                  <div className="form-group">
                    <label>
                      {activeTab === 'gallery' ? 'Сүрөт URL' : 
                       activeTab === 'videos' ? 'Видео URL' : 
                       activeTab === 'projects' ? 'Долбоордун шилтемеси (URL)' :
                       'Сүрөт URL (Милдеттүү эмес)'}
                    </label>
                    <input 
                      type="text" 
                      name="url" 
                      value={formData.url || ''} 
                      onChange={handleChange} 
                      placeholder="Шилтемени киргизиңиз (URL)..."
                    />
                  </div>
                )}

                {(activeTab === 'resume' || activeTab === 'projects') && (
                  <div className="form-group">
                    <label>Толук маалымат / Текст</label>
                    <textarea 
                      name="description"  
                      value={formData.description || ''} 
                      onChange={handleChange} 
                      placeholder="Кененирээк маалымат жазыңыз..."
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--bg-glass-border)', 
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-secondary)',
                        minHeight: '100px',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Статус</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Активдүү">Активдүү</option>
                    <option value="Бүттү">Бүттү</option>
                    <option value="Күтүүдө">Күтүүдө</option>
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={handleCloseModal}>Жокко чыгаруу</button>
                  <button type="submit" className="btn btn-primary">{editingItem ? 'Сактоо' : 'Кошуу'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
