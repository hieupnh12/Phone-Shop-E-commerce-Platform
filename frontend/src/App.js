import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/client/Home";
// import Products from "./pages/Products";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/client/Cart";
import Payment from "./pages/client/Payment";
import Signup from "./pages/client/Signup";
import NotFound from "./pages/client/NotFound";
import AdminRoute from "./routes/AdminRoute";
import HomeAdmin from "./pages/admin/HomeAdmin";
import ProductDetail from "./pages/client/Products/ProductDetail";
import AdminLayout from "./components/layout/AdminLayout";
import Statistic from "./pages/admin/Statistic";

// Layout chính (Header + Footer)
function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* 👈 chỗ render trang con */}
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />, // Layout bọc chung
      children: [
        { index: true, element: <Home /> }, // "/" -> Home
        {
          path: "products",
          // element: <Products />,
          children: [{ path: ":id", element: <ProductDetail /> }],
        },
        { path: "cart", element: <Cart /> },
        { path: "payment", element: <Payment /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { path: "dashboard", element: <HomeAdmin /> },
            // {
            //   path: "products",
            //   element: <Products />,
            //   children: [],
            // },
            // { path: "customers", element: <Customers /> },
            // { path: "staff", element: <Staff /> },
            { path: "statistic", element: <Statistic /> },
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
