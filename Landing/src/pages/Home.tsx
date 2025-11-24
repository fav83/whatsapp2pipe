import { PageHelmet } from '../components/SEO';
import { Hero } from '../components/Hero';
import { DemoVideo } from '../components/DemoVideo';
import { Benefits } from '../components/Benefits';
import { Pricing } from '../components/Pricing';
import { HowItWorks } from '../components/HowItWorks';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <>
      <PageHelmet
        title="Chat2Deal - Sync your WhatsApp to Pipedrive"
        description="Connect WhatsApp Web to Pipedrive CRM. Sync contacts, log chats, and close more deals with our Chrome extension."
        keywords="WhatsApp CRM, Pipedrive integration, WhatsApp Web, CRM extension, sales automation, contact sync, Chrome extension"
        url="/"
      />
      <div className="min-h-screen">
        <Hero />
        <main>
          <DemoVideo />
          <Benefits />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
