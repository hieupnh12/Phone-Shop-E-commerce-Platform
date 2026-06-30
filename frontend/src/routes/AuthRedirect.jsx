import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function AuthRedirect({ children }) {
  const token = Cookies.get("token");

  // Nếu đã đăng nhập → chuyển sang dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
