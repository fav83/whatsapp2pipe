import type { ReactNode } from 'react';

const DEFAULT_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/chat2deal-sync-your-whats/beggfpeeonokphednmofgjigfcdhkcji';

interface ChromeStoreLinkProps {
  children: ReactNode;
}

/**
 * Link to the Chrome Web Store listing.
 * URL is configurable via VITE_CHROME_STORE_URL environment variable.
 */
export function ChromeStoreLink({ children }: ChromeStoreLinkProps) {
  const url = import.meta.env.VITE_CHROME_STORE_URL || DEFAULT_CHROME_STORE_URL;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-button-primary hover:text-button-primary-hover underline"
    >
      {children}
    </a>
  );
}
