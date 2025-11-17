import React from "react";
import ClientLayout from "../../components/layout/ClientLayout";
import { Outlet, useLocation } from "react-router-dom";
import HomeClient from "./HomeClient";
import { Home } from "lucide-react";
import Footer from "../../components/layout/Footer";
import { Outlet } from "react-router-dom";



const ClientHomePage = () => {
  const location = useLocation();
  // Chỉ show hero + hot products ở home page, không show ở child routes
  const isHome = location.pathname === "/";

  return (
    <div>
      <ClientLayout></ClientLayout>
        <HomeClient></HomeClient>
        <Outlet></Outlet>
        <Footer></Footer>
    </div>
  );
};

export default ClientHomePage;
