import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  // Data State
  const [jd, setJd] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("Drag & Drop or Click to Upload");
  const [dragActive, setDragActive] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const API_URL = "https://ai-resume-insight.onrender.com"; 

  // 1. Load Theme on Startup
  useEffect(() => {
    const savedTheme = localStorage.getItem('resume_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }
    fetchHistory();
  }, []);

  // 2. Theme Toggle
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('resume_theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('resume_theme', 'light');
    }
  };

  // 3. Score Animation
  useEffect(() => {
    if (result) {
      let start = 0;
      const end = parseInt(result.match_percentage);
      const timer = setInterval(() => {
        start += 1;
        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(timer);
        } else {
          setAnimatedScore(start);
        }
      }, 10);
      return () => clearInterval(timer);
    }
  }, [result]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleScan = async () => {
    if (!file || !jd) return alert("Please upload a resume and JD.");
    setLoading(true);
    setResult(null);
    setAnimatedScore(0);
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    try {
      const res = await axios.post(`${API_URL}/analyze`, formData);
      setResult(res.data.data);
      fetchHistory(); 
    } catch (err) {
      console.error(err);
      alert("Analysis failed.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className="sidebar">
       {/* Professional Name: Matches your Repo */}
        <div className="logo">AI Resume<span> Insight</span></div>
        
        <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </div>
        
        <div className={`menu-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          🗂️ Saved Reports
        </div>
      </nav>

      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <h2>
            {activeTab === 'dashboard' && 'New Analysis'}
            {activeTab === 'history' && 'Historical Reports'}
          </h2>
          
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>

        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="grid-layout">
            <div className="card input-section">
              <div className="form-group">
                <label>Job Description</label>
                <textarea placeholder="Paste job description here..." value={jd} onChange={(e) => setJd(e.target.value)}/>
              </div>
              <div className="form-group">
                <label>Candidate Resume</label>
                
                {/* FIX: Changed <div> to <label> so the whole box is clickable */}
                <label 
                  className={`drop-zone ${dragActive ? "drag-active" : ""}`} 
                  onDragEnter={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDragOver={handleDrag} 
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept=".pdf,.docx" 
                    onChange={handleFileChange}
                    hidden  /* Hides the ugly default button */
                  />
                  <div className="file-label-text">
                    <span className="icon">📂</span>
                    <span>{fileName}</span>
                  </div>
                </label>
              </div>

              <button onClick={handleScan} disabled={loading} className="primary-btn">
                {loading ? "Analyzing..." : "Run Analysis"}
              </button>
            </div>

            <div className="card result-section">
              {!result ? (
                <div className="empty-state"><p>Ready to analyze.</p></div>
              ) : (
                <div className="analysis-content fade-in">
                  <div className="score-header">
                    <div className="score-circle" style={{background: `conic-gradient(${animatedScore >= 80 ? '#22c55e' : '#ef4444'} ${animatedScore * 3.6}deg, var(--border) 0deg)`}}>
                      <div className="score-inner">
                        <span className="score-number">{animatedScore}%</span>
                        <span className="score-label">Match</span>
                      </div>
                    </div>
                  </div>
                  <div className="section"><h4>📝 Summary</h4><p className="summary-text">{result.summary}</p></div>
                  <div className="section"><h4>⚠️ Missing Skills</h4><div className="tags">{result.missing_keywords?.map((skill, i) => <span key={i} className="tag">{skill}</span>)}</div></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="card full-width">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Score</th><th>Job Description</th><th>Resume</th></tr></thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${item.score >= 80 ? 'green' : 'red'}`}>{item.score}%</span></td>
                    <td className="truncate">{item.jd}</td>
                    <td><a href={item.url} target="_blank" rel="noreferrer" className="view-link">View PDF ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;