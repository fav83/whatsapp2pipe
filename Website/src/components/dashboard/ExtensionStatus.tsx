import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useExtensionDetection } from '../../hooks/useExtensionDetection';

/**
 * Detects mobile/tablet devices based on viewport width
 */
function isMobileDevice(): boolean {
  return window.innerWidth < 768; // Tailwind 'md' breakpoint
}

export function ExtensionStatus() {
  const { installed, version, loading } = useExtensionDetection();
  const isMobile = isMobileDevice();

  // Environment variable for Chrome Web Store URL
  const storeUrl = import.meta.env.VITE_EXTENSION_STORE_URL || '#';

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Checking extension status...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile/tablet: Show informational message
  if (isMobile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Extension available for desktop Chrome
          </p>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-button-primary hover:text-button-primary-hover hover:underline inline-flex items-center gap-1"
          >
            View in Chrome Web Store
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    );
  }

  // Desktop: Extension NOT installed
  if (!installed) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Extension not installed
            </p>
            <p className="text-sm text-slate-600">
              Install the Chat2Deal Chrome extension to connect WhatsApp with Pipedrive
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Install Extension
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Desktop: Extension IS installed
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chrome Extension</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Extension installed</span>
        </div>
        {version && (
          <p className="text-xs text-slate-600">Version {version}</p>
        )}
        <Button asChild variant="outline" size="default" className="w-full">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Chrome Web Store
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
