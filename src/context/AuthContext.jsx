import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL, authenticatedFetch } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await authenticatedFetch("/auth/me");
          setUser(profile);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    // 1. Login to get token
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Invalid credentials");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);

    // 2. Fetch Profile to get Role
    const profile = await authenticatedFetch("/auth/me");
    setUser(profile);
    
    return profile.role; // "client_admin" or "super_admin"
  };

  const register = async (email, password, name) => {
    await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    }).then(res => {
      if (!res.ok) throw new Error("Registration failed. Email might exist.");
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);