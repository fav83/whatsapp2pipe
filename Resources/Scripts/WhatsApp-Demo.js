(function () {
  const N = [
    'Simon',
    'Olivia',
    'Henry',
    'Emma',
    'Lucas',
    'Sophia',
    'James',
    'Harper',
    'Liam',
    'Isabella',
    'Benjamin',
    'Charlotte',
    'Alexander',
    'Mia',
    'Evelyn',
    'Noah',
    'Amelia',
    'Oliver',
    'Ava',
    'William',
    'Elijah',
  ]
  const MSG = [
    'Got it, sending now.',
    'Quick call in 5 min?',
    'Thanks! That helps a lot.',
    "Here's the file: draft_v3.pdf",
    'Can you check section 2?',
    'Meeting moved to 14:00.',
    'Any update on this?',
    'Done. Please review.',
    'Sent you the link.',
    "Let's go with option B.",
  ]
  const COL = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52B788',
    '#E63946',
    '#457B9D',
    '#F4A261',
    '#E76F51',
    '#2A9D8F',
    '#E9C46A',
    '#F77F00',
    '#D62828',
    '#023E8A',
    '#0096C7',
  ]
  const selectors = [
    '[data-testid="conversation-info-message"]',
    '[data-testid="conversation-info-secondary"]',
    '[data-testid="last-msg-preview"]',
    '[data-testid="msg-preview"]',
    '[data-testid="cell-frame-secondary"]',
  ]

  const processed = new WeakSet()
  let iCounter = 0

  const ini = (s) => s.charAt(0).toUpperCase()

  function mkAvatar(name, color) {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 100, 100)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 50px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ini(name), 50, 50)
    return canvas.toDataURL()
  }

  function setName(row, name) {
    const target = row.querySelector(
      '[data-testid="cell-frame-title"] span[dir],[role="gridcell"] div span[dir]'
    )
    if (target && target.textContent !== name) target.textContent = name
  }

  function resolvePreviewNode(row) {
    for (const selector of selectors) {
      const host = row.querySelector(selector)
      if (!host) continue
      const span = host.querySelector('span[dir]') || host
      if (span) return span
    }
    const nameSpan = row.querySelector('[data-testid="cell-frame-title"] span[dir]')
    const spans = Array.from(row.querySelectorAll('span[dir]')).filter((span) => {
      if (span === nameSpan) return false
      return (span.textContent || '').trim().length > 0
    })
    return spans.pop() || null
  }

  function setPreview(row, message) {
    const target = resolvePreviewNode(row)
    if (!target) return
    const clone = target.cloneNode(false)
    clone.textContent = message
    clone.setAttribute('dir', 'auto')
    clone.setAttribute('title', message)
    target.replaceWith(clone)
    const announcer = clone.closest('[data-testid="conversation-info-message"]') || clone.parentElement
    if (announcer) {
      announcer.setAttribute('aria-label', message)
      announcer.setAttribute('title', message)
    }
  }

  function setAvatar(row, name, color) {
    const data = mkAvatar(name, color)
    const img = row.querySelector(
      '[data-testid="cell-frame-avatar"] img,[data-testid="avatar"] img,figure img,img'
    )
    if (img) {
      if (img.src !== data) {
        img.src = data
        img.srcset = data
        img.style.borderRadius = '50%'
      }
    } else {
      const host = row.querySelector('[data-testid="cell-frame-avatar"],[data-testid="avatar"],figure')
      if (host) {
        host.style.backgroundImage = `url(${data})`
        host.style.backgroundSize = 'cover'
        host.style.backgroundPosition = 'center'
        host.style.borderRadius = '50%'
      }
    }
  }

  function applyRow(row, idx) {
    if (processed.has(row)) return
    const nm = N[iCounter % N.length]
    const col = COL[iCounter % COL.length]
    const msg = MSG[Math.floor(Math.random() * MSG.length)]
    setName(row, nm)
    if (idx !== 0) setPreview(row, msg)
    setAvatar(row, nm, col)
    processed.add(row)
    iCounter++
  }

  function init() {
    const list = document.querySelector('[role="grid"][aria-label="Chat list"]')
    if (!list) {
      setTimeout(init, 1000)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rows = [...list.querySelectorAll('[role="row"]')]
            const idx = rows.indexOf(entry.target)
            applyRow(entry.target, idx)
            io.unobserve(entry.target)
          }
        })
      },
      { root: list, threshold: 0 }
    )

    list.querySelectorAll('[role="row"]').forEach((row) => io.observe(row))

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes?.forEach((node) => {
          if (node.nodeType !== 1) return
          if (node.matches?.('[role="row"]')) io.observe(node)
          node.querySelectorAll?.('[role="row"]').forEach((row) => io.observe(row))
        })
      }
    })

    mo.observe(list, { childList: true, subtree: true })
  }

  init()
})()