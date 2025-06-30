import React from "react";

const WhyChoose: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Why Choose FitHub?
        </h2>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        {[
          { icon: "fa-map-marker-alt", title: "Train Anywhere", desc: "Home or gym, your choice" },
          { icon: "fa-chart-line", title: "Personalized Plans", desc: "AI adapts to your progress" },
          { icon: "fa-certificate", title: "Certified Trainers", desc: "Expert guidance" },
          { icon: "fa-clock", title: "Flexible Memberships", desc: "No fixed contracts" },
          { icon: "fa-key", title: "Easy Access", desc: "Train at any partner gym" },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
              <i className={`fas ${item.icon}`}></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{item.title}</h3>
            <p className="mt-2 text-base text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChoose;