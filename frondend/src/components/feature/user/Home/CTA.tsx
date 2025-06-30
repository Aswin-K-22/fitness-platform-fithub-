import React from "react";

const CTA: React.FC = () => (
  <section className="bg-blue-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="mt-4 text-xl text-blue-100">
          Join thousands of members achieving their fitness goals with FitHub
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button className="rounded-md bg-white text-blue-500 px-8 py-3 text-base font-medium hover:bg-gray-50">
            Start Free Trial
          </button>
          <button className="rounded-md bg-transparent text-white px-8 py-3 text-base font-medium border-2 border-white hover:bg-blue-700">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;