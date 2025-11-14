import React from "react";
import ClientLayout from "../../components/layout/ClientLayout";
import HomeClient from "./HomeClient";
import { Home } from "lucide-react";
import Footer from "../../components/layout/Footer";
import { Outlet } from "react-router-dom";



const ClientHomePage = () => {
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
