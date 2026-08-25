import axios from "axios";
import toast from "react-hot-toast";


const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api  ";
   ;

const API = axios.create({ baseURL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  if (req.data instanceof FormData) {
    delete req.headers["Content-Type"];
  } else {
    req.headers["Content-Type"] = "application/json";
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem("token")) {
        localStorage.clear();
        toast.error("Session expired. Please login again.");
      }
    }

    // Deliberately do NOT clear storage/redirect on 403 — that means the
    // logged-in user is authenticated but not allowed to do this specific
    // thing, not that their session is invalid.
    return Promise.reject(error);
  },
);

export default API;
