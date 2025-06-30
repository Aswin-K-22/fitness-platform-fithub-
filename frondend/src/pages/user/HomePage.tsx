import React from "react";
import Hero from "../../components/feature/user/Home/Hero";
import Services from "../../components/feature/user/Home/Services";
import ExperiencePremium from "../../components/feature/user/Home/ExperiencePremium";
import AITrainer from "../../components/feature/user/Home/AITrainer";
import Testimonials from "../../components/feature/user/Home/Testimonials";
import WhyChoose from "../../components/feature/user/Home/WhyChoose";
import BecomeATriiner from "../../components/feature/user/Home/BecomeATrainer";
import CTA from "../../components/feature/user/Home/CTA";


const HomePage: React.FC = () => (
  <div className="font-sans">
    <main className="pt-16">
      <Hero />
      <Services />
      <ExperiencePremium />
      <AITrainer />
      <WhyChoose />
      <Testimonials />
      <CTA />
      <BecomeATriiner/>
    </main>
  </div>
);

export default HomePage;