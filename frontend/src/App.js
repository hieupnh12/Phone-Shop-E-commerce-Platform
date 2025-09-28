import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

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
          element: <Products />,
          children: [
          ],
        },
        { path: "cart", element: <Cart /> },
        { path: "login", element: <Login /> },
      ],
    },
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
