import { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OrderForm } from './components/OrderForm';
import { HowItWorks } from './components/HowItWorks';
import { Benefits } from './components/Benefits';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

function App() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-primary">
      <Header />
      
      <main>
        <Hero />
        <HowItWorks />
        <OrderForm />
        <Benefits />
        <FAQ />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
