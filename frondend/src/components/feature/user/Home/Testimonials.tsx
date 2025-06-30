// Testimonials.tsx
import React from "react";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      img: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      text: "FitHub's AI trainer has completely transformed my workout routine.",
    },
    {
      name: "Michael Chen",
      img: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      text: "The flexibility to work out at any partner gym is amazing.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            What Our Members Say
          </h2>
        </div>
        <div className="mt-12">
          {testimonials.map((t, index) => (
            <div key={index} className="p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <img className="h-12 w-12 rounded-full" src={t.img} alt={t.name} />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold">{t.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span> // Use plain stars for testing
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;