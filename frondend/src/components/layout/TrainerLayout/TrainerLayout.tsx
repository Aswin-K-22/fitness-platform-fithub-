// src/presentation/layouts/TrainerLayout.tsx
import React from "react";

import { Outlet } from "react-router-dom"; 
import Navbar from "../../common/trainer/Navbar";
import Footer from "../../common/Footer";

 const TrainerLayout: React.FC<{ children?: React.ReactNode }> = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main>
      <Outlet /> {/* Render nested routes here */}
    </main>
    <Footer />
  </div>
);

export default TrainerLayout;
