import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function HowToUse() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>How to use</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ol className="space-y-3 text-sm text-slate-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-button-primary text-white text-xs font-medium">
              1
            </span>
            <span>Install the Chrome extension from the Chrome Web Store</span>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-button-primary text-white text-xs font-medium">
              2
            </span>
            <span>Open WhatsApp Web in Chrome</span>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-button-primary text-white text-xs font-medium">
              3
            </span>
            <span>Sign in with your Pipedrive account in the extension</span>
          </li>

          <li className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-button-primary text-white text-xs font-medium">
              4
            </span>
            <span>Select a WhatsApp conversation to automatically sync with Pipedrive</span>
          </li>
        </ol>

        {/* Video tutorial */}
        <div className="mt-6">
          <div className="relative rounded-lg overflow-hidden bg-slate-100 shadow-sm">
            <video
              controls
              className="w-full"
              preload="metadata"
            >
              <source src="/chat2deal-how-to-install.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
