import './HistoryTab.css'

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function groupByDate(uploads) {
  const groups = {}
  for (const u of uploads) {
    const key = formatDate(u.uploadedAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(u)
  }
  return groups
}

export default function HistoryTab({ uploads, onNewUpload }) {
  if (uploads.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#F3F4F6"/>
            <path d="M14 12h14l6 6v18a2 2 0 01-2 2H14a2 2 0 01-2-2V14a2 2 0 012-2z" fill="#D1D5DB"/>
            <path d="M28 12v6h6" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M18 24h12M18 28h8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2>No uploads yet</h2>
        <p>Uploads you make will appear here with their date and time.</p>
        <button className="btn-primary" onClick={onNewUpload}>Start Uploading</button>
      </div>
    )
  }

  const groups = groupByDate(uploads)

  return (
    <div className="history-tab">
      <div className="history-header">
        <div>
          <h2>Upload History</h2>
          <p>{uploads.length} item{uploads.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button className="btn-primary" onClick={onNewUpload}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Upload
        </button>
      </div>

      <div className="history-list">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date} className="history-group">
            <div className="group-date">{date}</div>
            {items.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-item-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 2h8l4 4v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#4353FF" opacity="0.12"/>
                    <path d="M11 2v4h4" stroke="#4353FF" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M5 9h8M5 12h5" stroke="#4353FF" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="history-item-body">
                  <span className="history-item-title">{item.title}</span>
                  <span className="history-item-meta">
                    {item.imageCount} image{item.imageCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="history-item-time">
                  <span className="time-badge">{formatTime(item.uploadedAt)}</span>
                  <span className="status-dot" title="Uploaded" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
