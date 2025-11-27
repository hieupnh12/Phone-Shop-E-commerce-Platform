import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Header2 from "./Header2";
import Footer from "./Footer";

const CartLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header2 onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="flex-1 w-full">
        {children}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CartLayout;
