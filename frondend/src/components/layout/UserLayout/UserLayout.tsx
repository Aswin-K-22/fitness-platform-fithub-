// src/presentation/layouts/UserLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../common/user/Navbar";
import Footer from "../../common/Footer";

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;