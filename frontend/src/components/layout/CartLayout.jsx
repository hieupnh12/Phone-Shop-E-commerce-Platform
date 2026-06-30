import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";


const CartLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      <main className="flex-1 w-full">
        {children}
        <Outlet />
      </main>
     
    </div>
  );
};

export default CartLayout;
