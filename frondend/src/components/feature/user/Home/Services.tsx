import React from "react";
import ServiceCard from "./ServiceCard";

const Services: React.FC = () => {
  const services = [
    {
      icon: "fas fa-robot",
      title: "AI Personal Trainer",
      description: "Get personalized workout plans powered by AI technology",
      features: ["Smart workout planning", "Progress tracking", "Exercise form guidance"],
      buttonText: "Start Free",
    },
    {
      icon: "fas fa-user-tie",
      title: "Human Trainer",
      description: "Get personal attention from certified fitness experts",
      features: ["1-on-1 coaching", "Video consultations", "Nutrition guidance"],
      buttonText: "Choose Trainer",
    },
    {
      icon: "fas fa-dumbbell",
      title: "Gym Access",
      description: "Access to premium gyms nationwide",
      features: ["Multiple locations", "Flexible timing", "Premium equipment"],
      buttonText: "Find a Gym",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Choose the perfect plan that fits your fitness journey
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              buttonText={service.buttonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;