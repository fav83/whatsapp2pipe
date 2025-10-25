import React from 'react'
import ReactDOM from 'react-dom/client'
import './popup.css'

function App() {
  return (
    <div className="popup-container">
      <h1>WhatsApp2Pipe</h1>
      <p>Extension popup placeholder</p>
    </div>
  )
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
