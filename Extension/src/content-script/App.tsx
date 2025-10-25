import React, { useState } from 'react'
import { testChromeStorage } from '../utils/storage-test'

export default function App() {
  const [pingCount, setPingCount] = useState(0)
  const [storageStatus, setStorageStatus] = useState<'untested' | 'success' | 'failed'>('untested')

  const handlePing = () => {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      console.log('Ping response:', response)
      setPingCount((c) => c + 1)
    })
  }

  const handleStorageTest = async () => {
    const success = await testChromeStorage()
    setStorageStatus(success ? 'success' : 'failed')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        Pipedrive for WhatsApp
      </h1>

      <div
        style={{
          padding: '12px',
          background: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '14px', margin: 0 }}>
          <strong>Status:</strong> Extension loaded ✓
        </p>
        <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
          Version: {chrome.runtime.getManifest().version}
        </p>
      </div>

      <button
        onClick={handlePing}
        style={{
          padding: '8px 16px',
          background: '#00A982',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginRight: '8px',
          marginBottom: '8px',
        }}
      >
        Test Service Worker ({pingCount} pings)
      </button>

      <button
        onClick={handleStorageTest}
        style={{
          padding: '8px 16px',
          background:
            storageStatus === 'success'
              ? '#4caf50'
              : storageStatus === 'failed'
                ? '#f44336'
                : '#757575',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '8px',
        }}
      >
        Test Storage ({storageStatus})
      </button>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
        <p>Next: Chat detection, Pipedrive auth, contact search</p>
      </div>
    </div>
  )
}
