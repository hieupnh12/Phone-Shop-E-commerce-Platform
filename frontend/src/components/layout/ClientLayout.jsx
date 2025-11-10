import React, { useState } from "react";
import Header from "./Header";
import ClientSidebar from "./ClientSidebar";
import backgroundImage from "../../image/background.jpg";
import Footer from "./Footer";


const ClientLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex pt-16 sm:pt-20">
        <ClientSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
    
  );
};

export default ClientLayout;
