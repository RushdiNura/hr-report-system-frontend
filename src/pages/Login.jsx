import { useState } from "react";
import toast from "react-hot-toast";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { Eye, EyeOff } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import mesob from "../assets/mesob.jpg";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("qindeessaa", res.data.qindeessaa);

      toast.success("Welcome back!");

      if (res.data.role === "hr") navigate("/hr");
      else navigate("/form");
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-header">
          <div className="login-seal seal-ring">
            <img src={mesob} alt="" className="login-seal-img" />
          </div>
          <h1 className="login-title">Service Registry</h1>
          <p className="login-subtitle">Sign in to record and review branch reports</p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-password">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="login-password"
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
          {loading ? <Spinner size={20} /> : "Sign in"}
        </button>
      </form>
    </div>
  );
}
