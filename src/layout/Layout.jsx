import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  PlusCircle,
  LogOut,
  ChevronRight,
  Menu,
  UserCog,
  X,
  Users,
  Search,
  User as UserIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import "./layout.css";
import mesob from "../assets/mesob.jpg";
import { logout } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role")?.toLocaleLowerCase() || "Staff";
  const userName = localStorage.getItem("name") || "User";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("search-reports", { detail: searchQuery }),
      );
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentPath = location.pathname;

    if (!token && currentPath !== "/") {
      navigate("/", { replace: true });
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.clear();
      setLoggingOut(false);
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

 const menuItems =
   userRole === "hr"
     ? [
         { path: "/hr", label: "Dashboard", icon: LayoutDashboard },
         { path: "/hr/signup", label: "Create Qindeessaa", icon: UserPlus },
         { path: "/hr/heads", label: "Head Management", icon: UserCog },
       ]
     : [
         { path: "/form", label: "New Report", icon: PlusCircle },
         { path: "/form/employees", label: "Hojjataa", icon: Users },
       ];

  return (
    <div className="app-shell">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar ${sidebarOpen ? "desktop-open" : "desktop-closed"} ${mobileOpen ? "mobile-show" : ""}`}
      >
        <div className="sidebar-header">
          <div className="brand-box">
            <div className="logo-container seal-ring">
              <img src={mesob} alt="Logo" />
            </div>
            {(sidebarOpen || mobileOpen) && (
              <div className="brand-details">
                <span className="brand-main">Service Registry</span>
                <span className="brand-sub">Gabaasa Guyyaa</span>
              </div>
            )}
          </div>
          <button
            className="close-mobile-btn"
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item-link ${location.pathname === item.path ? "is-active" : ""}`}
            >
              <item.icon size={22} />
              {(sidebarOpen || mobileOpen) && (
                <span className="nav-text">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {(sidebarOpen || mobileOpen) && (
            <div className="profile-snippet">
              <div className="profile-avatar">{userName[0].toUpperCase()}</div>
              <div className="profile-info">
                <p className="p-name">{userName}</p>
                <p className="p-role">{userRole}</p>
              </div>
            </div>
          )}
          <button
            className="btn-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={20} />
            {(sidebarOpen || mobileOpen) && (
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            )}
          </button>
        </div>

        {!mobileOpen && (
          <div className="sidebar-toggle-container">
            <button
              className="sidebar-trigger-pro"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronRight size={14} className={sidebarOpen ? "flip" : ""} />
            </button>
          </div>
        )}
      </aside>

      <main className="main-viewport">
        <header className="main-header">
          <div className="header-left">
            <button
              className="btn-hamburger"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="header-title">
              {location.pathname.startsWith("/hr") ? "HR Dashboard" : "Branch Reporting"}
            </h1>
          </div>

          <div className="header-right-actions">
            {location.pathname === "/hr" && (
              <div className="search-pill">
                <Search size={16} className="search-icon-ui" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <div className="header-user-pill">
              <UserIcon size={16} />
              <span>{userName}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
