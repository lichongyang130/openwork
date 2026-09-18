import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import TaskView from './components/TaskView.jsx';
import { EskPage, AssistantPage, ProjectsPage, AutomationPage, LibraryPage, InspirationPage } from './components/Pages.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import SwarmLab from './components/SwarmLab.jsx';
import GeneMarket from './components/GeneMarket.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import BrainPage from './components/BrainPage.jsx';

export default function App() {
  const [S, setS] = useState(null);
  const [view, setView] = useState({ type: 'home' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInit, setSettingsInit] = useState('general');

  const refresh = useCallback(() => api.state().then(setS).catch(() => {}), []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    const open = (e) => { setSettingsInit(e?.detail?.page || 'general'); setSettingsOpen(true); };
    window.addEventListener('ow-open-settings', open);
    return () => { clearInterval(t); window.removeEventListener('ow-open-settings', open); };
  }, [refresh]);

  if (!S) return <div className="app" style={{ display: 'grid', placeItems: 'center' }}><div className="spin" style={{ width: 22, height: 22 }} /></div>;

  return (
    <div className="app">
      <Sidebar S={S} view={view} setView={setView} openSettings={() => setSettingsOpen(true)} />
      <main className="main">
        {view.type === 'home' && <Home S={S} setView={setView} refresh={refresh} />}
        {view.type === 'task' && <TaskView key={view.id} S={S} id={view.id} setView={setView} refresh={refresh} />}
        {view.type === 'esk' && <EskPage S={S} refresh={refresh} setView={setView} />}
        {view.type === 'assistant' && <AssistantPage S={S} setView={setView} />}
        {view.type === 'projects' && <ProjectsPage S={S} refresh={refresh} view={view} />}
        {view.type === 'automation' && <AutomationPage S={S} refresh={refresh} setView={setView} />}
        {view.type === 'library' && <LibraryPage S={S} setView={setView} />}
        {view.type === 'inspiration' && <InspirationPage S={S} setView={setView} refresh={refresh} />}
        {view.type === 'swarm-lab' && <SwarmLab S={S} setView={setView} refresh={refresh} />}
        {view.type === 'dashboard' && <DashboardPage S={S} />}
        {view.type === 'gene-market' && <GeneMarket S={S} refresh={refresh} />}
        {view.type === 'brain' && <BrainPage S={S} />}
      </main>
      {settingsOpen && <SettingsModal S={S} onClose={() => setSettingsOpen(false)} refresh={refresh} initialPage={settingsInit} />}
    </div>
  );
}
