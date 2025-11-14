import React from "react";
import ClientLayout from "../../components/layout/ClientLayout";
import { Outlet, useLocation } from "react-router-dom";
import HomeClient from "./HomeClient";

const ClientHomePage = () => {
  const location = useLocation();
  // Chỉ show hero + hot products ở home page, không show ở child routes
  const isHome = location.pathname === "/";

  return (
    <ClientLayout showHero={isHome}>
      {isHome && <HomeClient />}
      <Outlet />
    </ClientLayout>
  );
};

export default ClientHomePage;
