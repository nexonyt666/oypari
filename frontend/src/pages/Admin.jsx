import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Settings, Users, Image as ImageIcon, Video, FolderGit2, FileText, X, Lock, LogOut, AlertCircle, Mail } from 'lucide-react';
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

const projectCategories = ["Билим берүү", "Коомдук", "Маданият", "IT"];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('ayperi_admin_authenticated') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  
  // Data States
  const [projects, setProjects] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [resume, setResume] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Settings States
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Telegram Test States
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testError, setTestError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Migration State
  const [hasLocalData, setHasLocalData] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: '', 
    status: 'Активдүү', 
    url: '', 
    category: '0', 
    description: '',
    tags: ''
  });

  const fetchSettings = async () => {
    try {
      const passwordHeader = sessionStorage.getItem('ayperi_admin_password') || '';
      const res = await fetch('/api/settings', {
        headers: { 'x-admin-password': passwordHeader }
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramToken(data.telegram_bot_token || '');
        setTelegramChatId(data.telegram_chat_id || '');
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setSettingsError("Жаңы сырсөздөр бири-бирине дал келбейт!");
      return;
    }
    setSettingsLoading(true);
    setSettingsMsg('');
    setSettingsError('');
    const passwordHeader = sessionStorage.getItem('ayperi_admin_password') || '';
    try {
      const body = {
        telegram_bot_token: telegramToken,
        telegram_chat_id: telegramChatId
      };
      if (newPassword) {
        body.new_password = newPassword;
      }
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': passwordHeader
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg("Жөндөөлөр ийгиликтүү сакталды!");
        if (newPassword) {
          sessionStorage.setItem('ayperi_admin_password', newPassword);
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        setSettingsError(data.error || "Сактоодо ката кетти.");
      }
    } catch (err) {
      setSettingsError("Сервер менен байланыш үзүлдү.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestLoading(true);
    setTestMsg('');
    setTestError('');
    const passwordHeader = sessionStorage.getItem('ayperi_admin_password') || '';
    try {
      // First save settings to make sure we test the active typed tokens
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': passwordHeader
        },
        body: JSON.stringify({
          telegram_bot_token: telegramToken,
          telegram_chat_id: telegramChatId
        })
      });

      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'x-admin-password': passwordHeader }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestMsg("Тест билдирүү жөнөтүлдү! Telegram'ды текшериңиз.");
      } else {
        setTestError(data.error || "Ката кетти.");
      }
    } catch (err) {
      setTestError("Сервер менен байланышуу мүмкүн эмес.");
    } finally {
      setTestLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const resProjects = await fetch('/api/projects');
      const dataProjects = await resProjects.json();
      setProjects(dataProjects);

      const resGallery = await fetch('/api/gallery');
      const dataGallery = await resGallery.json();
      setGallery(dataGallery);

      const resVideos = await fetch('/api/videos');
      const dataVideos = await resVideos.json();
      setVideos(dataVideos);

      const resResume = await fetch('/api/resume');
      const dataResume = await resResume.json();
      setResume(dataResume);

      // Fetch messages with authorization header
      const passwordHeader = sessionStorage.getItem('ayperi_admin_password') || '';
      const resMessages = await fetch('/api/messages', {
        headers: { 'x-admin-password': passwordHeader }
      });
      if (resMessages.ok) {
        const dataMessages = await resMessages.json();
        setMessages(dataMessages);
      }

      // Fetch dynamic settings
      await fetchSettings();
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();

      // Check if there is data in localStorage to migrate
      const localProjects = JSON.parse(localStorage.getItem('ayperi_projects')) || [];
      const localGallery = JSON.parse(localStorage.getItem('ayperi_gallery')) || [];
      const localVideos = JSON.parse(localStorage.getItem('ayperi_videos')) || [];
      const localResume = JSON.parse(localStorage.getItem('ayperi_resume')) || [];
      
      if (localProjects.length > 0 || localGallery.length > 0 || localVideos.length > 0 || localResume.length > 0) {
        setHasLocalData(true);
      }
    }
  }, [isAuthenticated]);

  const handleMigrateData = async () => {
    const localProjects = JSON.parse(localStorage.getItem('ayperi_projects')) || [];
    const localGallery = JSON.parse(localStorage.getItem('ayperi_gallery')) || [];
    const localVideos = JSON.parse(localStorage.getItem('ayperi_videos')) || [];
    const localResume = JSON.parse(localStorage.getItem('ayperi_resume')) || [];

    const totalItems = localProjects.length + localGallery.length + localVideos.length + localResume.length;
    if (window.confirm(`Браузериңиздеги жергиликтүү маалыматтарды базага (SQL) өткөрөсүзбү?\n\nЖалпы саны: ${totalItems} даана`)) {
      const password = sessionStorage.getItem('ayperi_admin_password') || '';
      try {
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password
          },
          body: JSON.stringify({
            projects: localProjects,
            gallery: localGallery,
            videos: localVideos,
            resume: localResume
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Импорттоо учурунда ката кетти.');
        }

        alert('Бардык маалыматтар ийгиликтүү базага өткөрүлдү!');
        localStorage.removeItem('ayperi_projects');
        localStorage.removeItem('ayperi_gallery');
        localStorage.removeItem('ayperi_videos');
        localStorage.removeItem('ayperi_resume');
        setHasLocalData(false);
        fetchData();
      } catch (err) {
        alert("Ката: " + err.message);
      }
    }
  };

  const tabs = [
    { id: 'resume', label: 'Резюме / Жетишкендиктер', icon: <FileText size={18} /> },
    { id: 'projects', label: 'Долбоорлор', icon: <FolderGit2 size={18} /> },
    { id: 'gallery', label: 'Галерея', icon: <ImageIcon size={18} /> },
    { id: 'videos', label: 'Видеолор', icon: <Video size={18} /> },
    { id: 'messages', label: 'Кабарлар (Inbox)', icon: <Mail size={18} /> },
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
        category: activeTab === 'projects' ? 'Билим берүү' : '0', 
        description: '',
        tags: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now(),
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0]
    };

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/${activeTab}/${editingItem.id}` : `/api/${activeTab}`;
    const password = sessionStorage.getItem('ayperi_admin_password') || '';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(newItem)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Сактоо учурунда ката кетти.');
      }

      const savedItem = await res.json();

      if (activeTab === 'projects') {
        if (editingItem) setProjects(projects.map(p => p.id === editingItem.id ? savedItem : p));
        else setProjects([savedItem, ...projects]);
      } else if (activeTab === 'gallery') {
        if (editingItem) setGallery(gallery.map(g => g.id === editingItem.id ? savedItem : g));
        else setGallery([savedItem, ...gallery]);
      } else if (activeTab === 'videos') {
        if (editingItem) setVideos(videos.map(v => v.id === editingItem.id ? savedItem : v));
        else setVideos([savedItem, ...videos]);
      } else if (activeTab === 'resume') {
        if (editingItem) setResume(resume.map(r => r.id === editingItem.id ? savedItem : r));
        else setResume([savedItem, ...resume]);
      }
      
      handleCloseModal();
    } catch (err) {
      alert("Ката: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Чын эле өчүрөсүзбү?")) {
      const password = sessionStorage.getItem('ayperi_admin_password') || '';
      try {
        const res = await fetch(`/api/${activeTab}/${id}`, {
          method: 'DELETE',
          headers: {
            'x-admin-password': password
          }
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Өчүрүү учурунда ката кетти.');
        }

        if (activeTab === 'projects') setProjects(projects.filter(p => p.id !== id));
        else if (activeTab === 'gallery') setGallery(gallery.filter(g => g.id !== id));
        else if (activeTab === 'videos') setVideos(videos.filter(v => v.id !== id));
        else if (activeTab === 'resume') setResume(resume.filter(r => r.id !== id));
      } catch (err) {
        alert("Ката: " + err.message);
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        sessionStorage.setItem('ayperi_admin_authenticated', 'true');
        sessionStorage.setItem('ayperi_admin_password', password);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Туура эмес сырсөз! Кайра аракет кылыңыз.');
      }
    } catch (err) {
      setLoginError('Сервер менен байланышуу мүмкүн болгон жок.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ayperi_admin_authenticated');
    sessionStorage.removeItem('ayperi_admin_password');
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

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Бул кабарды чын эле өчүрөсүзбү?")) {
      const password = sessionStorage.getItem('ayperi_admin_password') || '';
      try {
        const res = await fetch(`/api/messages/${id}`, {
          method: 'DELETE',
          headers: { 'x-admin-password': password }
        });
        if (res.ok) {
          setMessages(messages.filter(m => m.id !== id));
        } else {
          const errData = await res.json();
          throw new Error(errData.error || 'Кабарды өчүрүүдө ката кетти.');
        }
      } catch (err) {
        alert("Ката: " + err.message);
      }
    }
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {hasLocalData && (
            <button 
              onClick={handleMigrateData} 
              className="btn btn-primary btn-sm pulse-hover"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' }}
            >
              Базага импорттоо (LocalStorage)
            </button>
          )}
          <button 
            onClick={handleLogout} 
            className="btn btn-glass btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: '#EF4444', color: '#EF4444' }}
          >
            <LogOut size={16} /> Чыгуу
          </button>
        </div>
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
            {activeTab === 'messages' ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Аты-жөнү</th>
                    <th>Email</th>
                    <th>Кабар</th>
                    <th>Аракеттер</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr><td colSpan="5" className="text-center" style={{padding: '2rem', color: 'var(--text-secondary)'}}>Кабарлар жок</td></tr>
                  ) : (
                    messages.map(item => (
                      <tr key={item.id}>
                        <td style={{ whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: '1rem' }}>{item.date}</td>
                        <td style={{ fontWeight: 600, verticalAlign: 'top', paddingTop: '1rem' }}>{item.name}</td>
                        <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                          <a href={`mailto:${item.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{item.email}</a>
                        </td>
                        <td style={{ minWidth: '250px', maxWidth: '400px', whiteSpace: 'pre-wrap', lineHeight: 1.5, verticalAlign: 'top', paddingTop: '1rem' }}>{item.message}</td>
                        <td style={{ verticalAlign: 'top', paddingTop: '0.8rem' }}>
                          <button className="action-btn delete" onClick={() => handleDeleteMessage(item.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : activeTab === 'settings' ? (
              <div className="settings-panel" style={{ padding: '0.5rem 0' }}>
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Telegram Notifications */}
                  <div className="settings-section" style={{ padding: '1.75rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--bg-glass-border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#6366F1', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem' }}>
                      <Users size={20} /> Telegram Бот билдирүүлөрү
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Сайтта байланыш формасы толтурулганда маалыматты дароо өзүңүздүн Telegram аккаунтуңузга алуу үчүн ботту орнотуңуз.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Telegram Bot Token</label>
                        <input 
                          type="text" 
                          value={telegramToken} 
                          onChange={e => setTelegramToken(e.target.value)} 
                          placeholder="мисалы: 123456789:ABCdefGhIJKlmNoPQRsT..."
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-glass-border)', color: 'var(--text-main)', outline: 'none' }}
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Telegram Chat ID</label>
                        <input 
                          type="text" 
                          value={telegramChatId} 
                          onChange={e => setTelegramChatId(e.target.value)} 
                          placeholder="мисалы: 987654321"
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-glass-border)', color: 'var(--text-main)', outline: 'none' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <button 
                          type="button" 
                          onClick={handleTestTelegram} 
                          className="btn btn-glass btn-sm"
                          disabled={testLoading}
                          style={{ cursor: testLoading ? 'not-allowed' : 'pointer' }}
                        >
                          {testLoading ? 'Жөнөтүлүүдө...' : 'Ботту текшерүү (Тест билдирүү)'}
                        </button>
                        {testMsg && <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>✓ {testMsg}</span>}
                        {testError && <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>⚠ {testError}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Change Admin Password */}
                  <div className="settings-section" style={{ padding: '1.75rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--bg-glass-border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem' }}>
                      <Lock size={20} /> Администратор Сырсөзүн Өзгөртүү
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Жаңы сырсөз</label>
                        <input 
                          type="password" 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          placeholder="Жаңы коопсуз сырсөз жазыңыз..."
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-glass-border)', color: 'var(--text-main)', outline: 'none' }}
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Жаңы сырсөздү кайталаңыз</label>
                        <input 
                          type="password" 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                          placeholder="Жаңы сырсөздү кайра жазыңыз..."
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-glass-border)', color: 'var(--text-main)', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {settingsMsg && <div style={{ color: '#10B981', fontWeight: 600, fontSize: '0.95rem' }}>✓ {settingsMsg}</div>}
                  {settingsError && <div style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.95rem' }}>⚠ {settingsError}</div>}

                  {/* Actions */}
                  <div>
                    <button type="submit" className="btn btn-primary" disabled={settingsLoading} style={{ padding: '0.8rem 2rem', borderRadius: '10px' }}>
                      {settingsLoading ? 'Сакталууда...' : 'Өзгөртүүлөрдү Сактоо'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
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
            )}
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

                {activeTab === 'projects' && (
                  <>
                    <div className="form-group">
                      <label>Категория (Долбоор бөлүмү)</label>
                      <select name="category" value={formData.category || 'Билим берүү'} onChange={handleChange} required>
                        {projectCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Тегдер (Үтүр менен бөлүп жазыңыз)</label>
                      <input 
                        type="text" 
                        name="tags" 
                        value={formData.tags || ''} 
                        onChange={handleChange} 
                        placeholder="мисалы: Enactus, Лидерлик, IT..."
                      />
                    </div>
                  </>
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
