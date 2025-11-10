import React from "react";
import ClientLayout from "../../components/layout/ClientLayout";
import HomeClient from "./HomeClient";
import { Home } from "lucide-react";





const ClientHomePage = () => {
  return (
    <div>
      <ClientLayout></ClientLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to the Client Dashboard
        </h1>
        <Home></Home>
        <HomeClient></HomeClient>
    </div>
  );
};

export default ClientHomePage;
