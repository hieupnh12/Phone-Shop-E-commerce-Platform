import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

import React from "react";
import Home from "./pages/client/HomeClient";
import Login from "./pages/auth/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Payment from "./pages/client/Payment";
import Signup from "./pages/client/Signup";    
import NotFound from "./pages/client/NotFound";
import AdminRoute from "./routes/AdminRoute";
import HomeAdmin from "./pages/admin/HomeAdmin";
import ProductDetail from "./pages/client/Products/ProductDetail";
import AdminLayout from "./components/layout/AdminLayout";
import Statistic from "./pages/admin/Statistic";
import UserStatistic from "./pages/admin/Statistic/Pages/Users/UserStatistic";
import DashboardStatistic from "./pages/admin/Statistic/Pages/Dashboard/DashboardStatistic";
import Overview from "./pages/admin/Statistic/Pages/Users/SubPages/Overview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductStatistic from "./pages/admin/Statistic/Pages/Product/ProductStatistics";
import Chatbot from "./pages/chatbot";
import ClientHomePage from "./pages/client";
import Products from "./pages/client/Products";
import Settings from "./pages/admin/Statistic/Pages/Setting";
import OrderStatistic from "./pages/admin/Statistic/Pages/Order";
import RevenueStatistic from "./pages/admin/Statistic/Pages/Revenue";
import AuthRedirect from "./routes/AuthRedirect";
import Cart from "./pages/client/Cart";
import CartLayout from "./components/layout/CartLayout";


// Protected Route Component (Tạm comment để test cart)
// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/login" replace />;
//   return children;
// };

// Bypass login check tạm thời
const ProtectedRoute = ({ children }) => children;

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <ClientHomePage />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "products",
          element: <Products />,
          children: [{ path: "", element: <Products /> }],
        },
      ],
    },
    {
      path: "/cart",
      element: <CartLayout />,
      children: [{ index: true, element: <Cart /> }],
    },
    {
      path: "/login",
      element: (
        <AuthRedirect>
          <Login />
        </AuthRedirect>
      ),
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/admin",
      element: <AdminRoute allowedRoles={"ROLE_ADMIN"} />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { index: true, element: <HomeAdmin /> },
            { path: "dashboard", element: <HomeAdmin /> },
            // {
            //   path: "products",
            //   element: <Products />,
            //   children: [],
            // },
            // { path: "customers", element: <Customers /> },
            // { path: "staff", element: <Staff /> },
            {
              path: "statistic",
              element: <Statistic />,
              children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <DashboardStatistic /> },
                { path: "products", element: <ProductStatistic /> },
                { path: "orders", element: <OrderStatistic /> },
                { path: "revenue", element: <RevenueStatistic /> },
                { path: "setting", element: <Settings /> },
              ],
            },
          ],
        },
      ],
    },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Chatbot />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
