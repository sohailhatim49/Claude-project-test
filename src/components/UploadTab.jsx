import { useState, useRef } from 'react'
import DropZone from './DropZone'
import './UploadTab.css'

const UPLOAD_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
}

export default function UploadTab({ onUploadSuccess, onViewHistory }) {
  const [docFile, setDocFile] = useState(null)
  const [images, setImages] = useState([])
  const [status, setStatus] = useState(UPLOAD_STATES.IDLE)

  function handleDocDrop(file) {
    setDocFile(file)
  }

  function handleImagesDrop(files) {
    setImages(prev => {
      const existing = new Set(prev.map(f => f.name))
      const newFiles = files.filter(f => !existing.has(f.name))
      return [...prev, ...newFiles]
    })
  }

  function removeImage(name) {
    setImages(prev => prev.filter(f => f.name !== name))
  }

  function removeDoc() {
    setDocFile(null)
  }

  function reset() {
    setDocFile(null)
    setImages([])
    setStatus(UPLOAD_STATES.IDLE)
  }

  async function handleUpload() {
    if (!docFile) return
    setStatus(UPLOAD_STATES.LOADING)

    try {
      const formData = new FormData()
      formData.append('doc', docFile)
      images.forEach(img => formData.append('images', img))

      const res = await fetch('https://claude-project-test-production.up.railway.app/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { upload } = await res.json()
      onUploadSuccess({
        id: upload.id,
        title: upload.title,
        imageCount: upload.imageCount,
        uploadedAt: new Date(upload.uploadedAt),
      })
      setStatus(UPLOAD_STATES.SUCCESS)
    } catch (err) {
      console.error(err)
      setStatus(UPLOAD_STATES.IDLE)
      alert(`Upload failed: ${err.message}`)
    }
  }

  if (status === UPLOAD_STATES.SUCCESS) {
    return (
      <div className="success-screen">
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#ECFDF5"/>
            <path d="M14 24l8 8 12-16" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Upload Successful</h2>
        <p>Your document and assets have been published to Webflow CMS.</p>
        <div className="success-actions">
          <button className="btn-primary" onClick={reset}>
            Upload Next Set
          </button>
          <button className="btn-ghost" onClick={onViewHistory}>
            View History
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-tab">
      <section className="upload-section">
        <div className="section-label">
          <span className="section-number">01</span>
          <div>
            <h2>Google Doc</h2>
            <p>Upload the content document from your team</p>
          </div>
        </div>
        {docFile ? (
          <div className="file-card">
            <div className="file-card-icon doc-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#4353FF" opacity="0.15"/>
                <path d="M12 2v4h4M6 9h8M6 12h8M6 15h5" stroke="#4353FF" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="file-card-info">
              <span className="file-name">{docFile.name}</span>
              <span className="file-meta">{(docFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button className="remove-btn" onClick={removeDoc} title="Remove">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <DropZone
            accept=".doc,.docx,.gdoc"
            multiple={false}
            label="Drop your Google Doc here"
            hint="Supports .doc, .docx"
            onFiles={(files) => handleDocDrop(files[0])}
          />
        )}
      </section>

      <div className="divider" />

      <section className="upload-section">
        <div className="section-label">
          <span className="section-number">02</span>
          <div>
            <h2>Images</h2>
            <p>Upload all images needed for this CMS entry</p>
          </div>
        </div>
        <DropZone
          accept="image/*"
          multiple={true}
          label="Drop images here"
          hint="PNG, JPG, WebP, SVG — multiple files supported"
          onFiles={handleImagesDrop}
        />
        {images.length > 0 && (
          <div className="image-grid">
            {images.map(img => (
              <div key={img.name} className="image-thumb">
                <img
                  src={URL.createObjectURL(img)}
                  alt={img.name}
                />
                <button
                  className="thumb-remove"
                  onClick={() => removeImage(img.name)}
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="upload-footer">
        <div className="upload-summary">
          {docFile
            ? `${docFile.name} · ${images.length} image${images.length !== 1 ? 's' : ''}`
            : 'No document selected'}
        </div>
        <button
          className={`btn-primary upload-btn ${!docFile ? 'disabled' : ''}`}
          onClick={handleUpload}
          disabled={!docFile || status === UPLOAD_STATES.LOADING}
        >
          {status === UPLOAD_STATES.LOADING ? (
            <>
              <span className="spinner" />
              Uploading to Webflow…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M4 5l4-4 4 4M2 12h12v2H2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload to Webflow
            </>
          )}
        </button>
      </div>
    </div>
  )
}
