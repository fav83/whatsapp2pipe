import logger from '../utils/logger'

export function injectMomoTrustDisplay() {
  try {
    // Avoid duplicate injection
    if (document.getElementById('chat2deal-fonts')) return

    // Use TTF provided in the extension bundle
    const regularTtf = chrome.runtime.getURL('fonts/MomoTrustDisplay-Regular.ttf')

    const style = document.createElement('style')
    style.id = 'chat2deal-fonts'
    style.textContent = `
      @font-face {
        font-family: 'Momo Trust Display';
        src: url('${regularTtf}') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      /* Optional: map 700 to regular file so bold doesn't fallback */
      @font-face {
        font-family: 'Momo Trust Display';
        src: url('${regularTtf}') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `
    document.head.appendChild(style)
  } catch (err) {
    // Non-fatal if fonts fail; falls back to Inter
    logger.warn('[chat2deal] Failed to inject brand fonts', err)
  }
}
