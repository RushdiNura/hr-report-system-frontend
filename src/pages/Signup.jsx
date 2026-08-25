import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import API from "../api/axios";
import "../styles/create.css";

export default function CreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "head",
    qindeessaa: "foddaa1",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.name || e.target.name]: e.value || e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in every field before submitting.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { ...form, role: "head" });
      toast.success("Head account created successfully");
      navigate("/hr/heads");
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't create this account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-wrapper">
      <form className="create-user-card card" onSubmit={handleSubmit}>
        <div className="create-card-header">
          <div className="create-icon seal-ring">
            <UserPlus size={22} />
          </div>
          <div>
            <h2>Create Head Account</h2>
            <p>Register a new branch coordinator (Qindeessaa)</p>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            className="input"
            name="name"
            placeholder="e.g. Bekele Girma"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            className="input"
            name="email"
            placeholder="name@organization.com"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="signup-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="signup-password"
              className="input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
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

        <div className="field">
          <label className="field-label" htmlFor="signup-branch">Branch (Foddaa)</label>
          <select
            id="signup-branch"
            className="select"
            name="qindeessaa"
            value={form.qindeessaa}
            onChange={handleChange}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={`foddaa${i + 1}`}>
                Foddaa {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary create-submit">
          {loading ? <Spinner size={18} /> : "Create account"}
        </button>
      </form>
    </div>
  );
}
