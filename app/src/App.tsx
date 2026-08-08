import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OrderForm } from './components/OrderForm';
import { HowItWorks } from './components/HowItWorks';
import { Benefits } from './components/Benefits';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

function App() {
  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-primary">
      <Header />
      
      <main>
        <Hero />
        <HowItWorks />
        <OrderForm />
        <Benefits />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
