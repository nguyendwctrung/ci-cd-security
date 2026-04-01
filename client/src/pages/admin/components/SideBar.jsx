import { User, FileText, LogOut, LayoutDashboard } from "lucide-react";
// @ts-expect-error
import milotic from "@/assets/icons/milotic.png";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${API_URL}/api/admin/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.removeItem("adminToken");
          toast.success("Logged out successfully");
          navigate("/admin/auth/login");
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
        // Still remove token and redirect on error
        localStorage.removeItem("adminToken");
        navigate("/admin/auth/login");
      });
  };

  useEffect(() => {
    const updatedMenuItems = menuItems.map((item) => ({
      ...item,
      active: item.link === location.pathname,
    }));
    setMenuItems(updatedMenuItems);
  }, [location]);
  const [menuItems, setMenuItems] = useState([
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      link: "/admin",
      active: false,
    },
    { icon: User, label: "Users", link: "/admin/users", active: false },
    { icon: FileText, label: "Posts", link: "/admin/posts", active: false },
  ]);

  return (
    <div className="w-64 h-screen fixed bg-white flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="rounded flex items-center justify-center">
          <img
            src={milotic}
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-2xl shadow-blue-400"
          />
        </div>
        <span className="text-xl font-semibold text-gray-700 font-bold">
          Admin
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              to={item.link}
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors  cursor-pointer ${
                item.active
                  ? "bg-rose-400 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 pt-6 border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
