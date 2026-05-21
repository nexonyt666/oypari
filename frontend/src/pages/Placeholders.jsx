import React from 'react';

const PagePlaceholder = ({ title, description }) => {
  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '60vh' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{description}</p>
    </div>
  );
};

export const Gallery = () => <PagePlaceholder title="Галерея" description="Көз ирмемдердин жана визуалдык мурастардын архиви." />;
export const Videos = () => <PagePlaceholder title="Видео" description="Билим берүүчү видеолор жана долбоорлордун презентациялары." />;
export const Projects = () => <PagePlaceholder title="Долбоорлор" description="Алдыңкы билим берүү системалары." />;
