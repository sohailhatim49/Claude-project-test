import { useState, useRef } from 'react'
import './DropZone.css'

export default function DropZone({ accept, multiple, label, hint, onFiles }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  function handleChange(e) {
    const files = Array.from(e.target.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
    e.target.value = ''
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className="dropzone-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4v16M8 12l8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 24h24v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" fill="currentColor" opacity="0.15"/>
          <path d="M4 24h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="dropzone-label">{label}</p>
      <p className="dropzone-hint">{hint}</p>
      <span className="dropzone-browse">Browse files</span>
    </div>
  )
}
