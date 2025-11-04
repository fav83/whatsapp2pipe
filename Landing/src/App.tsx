import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <main>
        <Benefits />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
