import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Hero from '../components/Home/Hero';
import EventList from '../components/Home/EventList';
import Features from '../components/Home/Features';
import Stats from '../components/Home/Stats';
import CTA from '../components/Home/CTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold">Timepulse</h1>
          <p className="mt-4 text-xl">Plateforme d'inscription et de chronométrage sportif</p>
        </div>
        <EventList />
        <Stats />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
