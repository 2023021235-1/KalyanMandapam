import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import Navbar from './components/Navbar';
import HomePage from "./components/home/HomeSection";
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import ContactUsSection from "./components/Contact";
import QueryFeedbackSection from "./components/QueryFeedbackSection";
import CheckRentSection from "./components/CheckRentSection";
import CheckAvailabilitySection from "./components/CheckAvailabilitySection";
import CheckRefundStatusSection from "./components/CheckRefundStatusSection";
import BookNowSection from "./components/Book";
function App() {
  const [languageType, setLanguageType] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const backend = "http://localhost:5000";

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    navigate("/");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLanguageChange = (lang) => {
    setLanguageType(lang);
  };

  useEffect(() => {
    const MINIMUM_LOAD_TIME = 500; 
    const startTime = Date.now();

    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_LOAD_TIME - elapsed);
        setTimeout(() => setLoading(false), delay);
        return;
      }

      try {
        const res = await axios.get(`${backend}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        localStorage.removeItem("token");
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_LOAD_TIME - elapsed);
        setTimeout(() => setLoading(false), delay);
      }
    };

    fetchUser();
  }, []);



  return (
    <div className="App">
      <Navbar
        languageType={languageType}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
       setLanguageType={setLanguageType}
      />

      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage onLogin={handleLogin} setUser={setUser} /> : <Navigate to="/" />}
        />
        <Route path="/" element={<HomePage languageType={languageType}/>} />
        <Route path="/home" element={<HomePage languageType={languageType}/>} />
        <Route path="/book" element={<BookNowSection languageType={languageType}/>} />
        <Route path="/contact" element={<ContactUsSection languageType={languageType}/>} />
        <Route path="/feedback" element={<QueryFeedbackSection languageType={languageType}/>} />
         <Route path="/check-rent" element={<CheckRentSection languageType={languageType}/>} />
         <Route path="/availability" element={<CheckAvailabilitySection languageType={languageType}/>} />
         <Route path="/refund-status" element={<CheckRefundStatusSection languageType={languageType}/>} />
      </Routes>

    <Footer languageType={languageType}/>
    </div>
  );
}

export default App;
