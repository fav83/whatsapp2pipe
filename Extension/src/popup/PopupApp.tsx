import React, { useState, useEffect } from 'react'

export default function PopupApp() {
  const [whatsappTabOpen, setWhatsappTabOpen] = useState(false)
  const [extensionVersion, setExtensionVersion] = useState('')

  useEffect(() => {
    // Get extension version
    setExtensionVersion(chrome.runtime.getManifest().version)

    // Check if WhatsApp Web tab is open
    chrome.tabs.query({ url: '*://web.whatsapp.com/*' }, (tabs) => {
      setWhatsappTabOpen(tabs.length > 0)
    })
  }, [])

  const openWhatsApp = () => {
    chrome.tabs.create({ url: 'https://web.whatsapp.com' })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="/icons/icon48.png"
          alt="Pipedrive WhatsApp"
          style={{ width: '48px', height: '48px' }}
        />
        <h1 style={{ fontSize: '16px', margin: '8px 0 4px 0' }}>Pipedrive for WhatsApp</h1>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>v{extensionVersion}</p>
      </div>

      <div
        style={{
          padding: '12px',
          background: whatsappTabOpen ? '#e8f5e9' : '#fff3e0',
          borderRadius: '4px',
          marginBottom: '16px',
          border: `1px solid ${whatsappTabOpen ? '#4caf50' : '#ff9800'}`,
        }}
      >
        <p style={{ fontSize: '14px', margin: 0 }}>
          {whatsappTabOpen ? (
            <>
              <strong>✓ WhatsApp Web is open</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Sidebar active on WhatsApp tabs
              </span>
            </>
          ) : (
            <>
              <strong>WhatsApp Web not detected</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Open WhatsApp Web to use this extension
              </span>
            </>
          )}
        </p>
      </div>

      {!whatsappTabOpen && (
        <button
          onClick={openWhatsApp}
          style={{
            width: '100%',
            padding: '10px',
            background: '#00A982',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Open WhatsApp Web
        </button>
      )}

      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#999',
        }}
      >
        <p style={{ margin: '4px 0' }}>
          <strong>Status:</strong> Extension loaded
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Auth:</strong> Not implemented
        </p>
      </div>
    </div>
  )
}
