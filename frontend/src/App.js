import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import React from "react";
import Home from "./pages/client/HomeClient";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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
import UpdateInfor from "./pages/auth/UpdateInfor";
import OrderHistoryPage from "./components/profile/OrderHistoryPage";
import PersonalInfoForm from "./components/profile/PersonalInfoForm";
import ProfilePageLayout from "./components/profile/ProfilePageLayout";
import OrderDetailPage from "./components/profile/OrderDetailPage";
import ProductDetailPage from "./components/common/Product/ProductDetail";
import ProductsContainer from "./components/common/Product/ProductContainer";
import { useUrlTokenHandler } from "./hooks/useUrlTokenHandler";
import OrderHistory from "./pages/client/OrderHistory";
import PaymentSuccess from "./pages/client/PaymentSuccess";
import PaymentCancel from "./pages/client/PaymentCancel";
import AdminLogin from "./pages/auth/AdminLogin";
import AddProduct from "./pages/admin/Products/AddProduct";
import ListProduct from "./pages/admin/Products/ListProduct";
import EditProduct from "./pages/admin/Products/EditProduct";
import RoleManagementPage from "./pages/admin/Role/RoleManagementPage";
import EmployeeManagementPage from "./pages/admin/Employee/EmployeeManagementPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import Orders from "./pages/admin/Order";
import MyFeedbacksPage from "./pages/client/MyFeedbacks";
import UserHomePage from "./pages/client/UserHomePage";
import Customers from "./pages/admin/Customer";
import Employee from "./pages/admin/Employee";
import Role from "./pages/admin/Role";

const RouterInitializer = () => {
  useUrlTokenHandler();
  return <ClientHomePage />;
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RouterInitializer />,
      children: [{ index: true, element: <Home /> }],
    },

    {
      path: "/user",
      element: <UserHomePage />,
      children: [
        { index: true, element: <Home /> },
        { path: "feedbacks", element: <MyFeedbacksPage /> },

        {
          path: "products",
          element: <Products />,
          children: [
            { index: true, element: <ProductsContainer /> },
            { path: ":id", element: <ProductDetailPage /> },
          ],
        },

        {
          path: "cart",
          element: <CartLayout />,
          children: [{ index: true, element: <Cart /> }],
        },

        { path: "payment", element: <Payment /> },
        { path: "payment/success", element: <PaymentSuccess /> },
        { path: "payment/cancel", element: <PaymentCancel /> },
        { path: "orders", element: <OrderHistory /> },
        { path: "update", element: <UpdateInfor /> },

        {
          path: "profile",
          element: <ProfilePageLayout />,
          children: [
            { index: true, element: <Navigate to="info" replace /> },
            { path: "info", element: <PersonalInfoForm /> },
            { path: "order", element: <OrderHistoryPage /> },
            {
              path: "order/order-detail/:orderId",
              element: <OrderDetailPage />,
            },
          ],
        },
      ],
    },

    { path: "/set-password", element: <SetPasswordPage /> },
    { path: "/login", element: <Login /> },
    { path: "/admin-login", element: <AdminLogin /> },

    {
      path: "/admin",
      element: (
        <AdminRoute
          allowedRoles={["ROLE_ADMIN", "ROLE_SALE", "ROLE_SALE_LEAD"]}
        />
      ),
      children: [
        {
          element: <AdminLayout />,
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <HomeAdmin /> },

            {
              path: "products",
              children: [
                { index: true, element: <ListProduct /> },
                { path: "create", element: <AddProduct /> },
                { path: ":id/edit", element: <EditProduct /> },
              ],
            },

            { path: "orders", element: <Orders /> },

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
            { path: "roles", element: <RoleManagementPage /> },
            { path: "customers", element: <Customers /> },
            { path: "employee", element: <EmployeeManagementPage /> },
          ],
        },
      ],
    },

    { path: "*", element: <NotFound /> },
  ],
  {
    future: { v7_startTransition: true },
  }
);

const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Chatbot />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
