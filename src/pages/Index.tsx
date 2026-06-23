import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { LiveDemo } from "@/components/LiveDemo";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Services } from "@/components/Services";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <LiveDemo />
      <About />
      <Skills />
      <Services />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
