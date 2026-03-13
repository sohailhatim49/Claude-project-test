import { useState, useEffect } from 'react'
import UploadTab from './components/UploadTab'
import HistoryTab from './components/HistoryTab'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploads, setUploads] = useState([])

  useEffect(() => {
    fetch('https://claude-project-test-production.up.railway.app/api/history')
      .then(r => r.json())
      .then(data => setUploads(data.map(u => ({ ...u, uploadedAt: new Date(u.uploadedAt) }))))
      .catch(console.error)
  }, [])

  function addUpload(entry) {
    setUploads(prev => [entry, ...prev])
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#4353FF"/>
            <path d="M6 7h10M6 11h6M6 15h8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>CMS Uploader</span>
        </div>
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
            {uploads.length > 0 && <span className="badge">{uploads.length}</span>}
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'upload' ? (
          <UploadTab
            onUploadSuccess={(entry) => addUpload(entry)}
            onViewHistory={() => setActiveTab('history')}
          />
        ) : (
          <HistoryTab
            uploads={uploads}
            onNewUpload={() => setActiveTab('upload')}
          />
        )}
      </main>
    </div>
  )
}
