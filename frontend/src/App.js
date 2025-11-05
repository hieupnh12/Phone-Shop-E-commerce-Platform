import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Home from "./pages/client/Home";
// import Products from "./pages/Products";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Signup from "./pages/client/Signup";
import NotFound from "./pages/client/NotFound";
import AdminRoute from "./routes/AdminRoute";
import HomeAdmin from "./pages/admin/HomeAdmin";
import ProductDetail from "./pages/client/Products/ProductDetail";
import AdminLayout from "./components/layout/AdminLayout";
import Statistic from "./pages/admin/Statistic";
import ClientHomePage from "./pages/client";


const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <ClientHomePage />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "products",
          // element: <Products />,
          children: [{ path: ":id", element: <ProductDetail /> }],
        },
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
