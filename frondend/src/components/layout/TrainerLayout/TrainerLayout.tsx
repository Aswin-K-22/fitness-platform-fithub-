// src/presentation/layouts/TrainerLayout.tsx
import React from "react";

import { Outlet } from "react-router-dom"; 
import Navbar from "../../common/trainer/Navbar";
import Footer from "../../common/Footer";

 const TrainerLayout: React.FC<{ children?: React.ReactNode }> = () => (
    <div className="flex flex-col min-h-screen">
    <Navbar />
     <main className="flex-grow  pt-16">
      <Outlet /> {/* Render nested routes here */}
    </main>
    <Footer />
  </div>
);

export default TrainerLayout;
