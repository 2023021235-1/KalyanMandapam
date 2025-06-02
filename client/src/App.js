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
import BookNowSection from "./components/Book"; // Keep AdminPanel for the main admin route
import HallManagement from "./components/HallManagement"; // Import HallManagement
import BookingManagement from "./components/BookingManagement"; // Import BookingManagement

function App() {
  const [languageType, setLanguageType] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTokenExpiredDialog, setShowTokenExpiredDialog] = useState(false); // New state for dialog
  const backend = "http://localhost:5000"; // Replace with your backend URL

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    navigate("/login");
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
        if (res.data.user.userType === 'Admin') {
          setIsAdmin(true);
          // Navigate to a default admin sub-route, e.g., hall management
   
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        localStorage.removeItem("token");
        setUser(null);
        setIsAdmin(false);
        if (err.response && err.response.status === 401) {
          setShowTokenExpiredDialog(true);
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_LOAD_TIME - elapsed);
        setTimeout(() => setLoading(false), delay);
      }
    };

    fetchUser();

    // Set up a periodic check every hour (3600000 milliseconds)
    const tokenCheckInterval = setInterval(fetchUser, 3600000);

    // Clear the interval when the component unmounts
    return () => clearInterval(tokenCheckInterval);

  }, [backend, navigate]); // Added navigate to dependency array

  return (
    <div className="App">
      <Navbar
        languageType={languageType}
        user={user}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
        setLanguageType={setLanguageType}
      />

      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage
                languageType={languageType}
                setIsAdmin={setIsAdmin}
                onLogin={handleLogin}
                setUser={setUser}
              />
            ) : isAdmin ? (
              <Navigate to="/admin/hall-management" /> // Redirect admin to a specific admin sub-route
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="/" element={<HomePage languageType={languageType} />} />
        <Route path="/home" element={<HomePage languageType={languageType} />} />
        <Route path="/book" element={user ? <BookNowSection user={user} languageType={languageType} /> : <Navigate to="/login" />} />
        <Route path="/contact" element={<ContactUsSection languageType={languageType} />} />
        <Route path="/feedback" element={<QueryFeedbackSection languageType={languageType} />} />
        <Route path="/check-rent" element={<CheckRentSection languageType={languageType} />} />
        <Route path="/availability" element={<CheckAvailabilitySection languageType={languageType} />} />
        <Route path="/refund-status" element={<CheckRefundStatusSection user={user} languageType={languageType} />} />
     
     
        {/* New specific admin sub-routes */}
        <Route 
          path="/admin/hall-management" 
          element={isAdmin ? <HallManagement API_BASE_URL={backend + '/api'} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/booking-management" 
          element={isAdmin ? <BookingManagement API_BASE_URL={backend + '/api'} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />} 
        />
        {/* Add other admin sub-routes here as needed, e.g., for verify-booking */}
        <Route path="/admin/verify-booking" element={isAdmin ? <div>Verify Booking Content (To be implemented)</div> : <Navigate to="/" />} />

      </Routes>

      {/* Token Expired Dialog */}
      {showTokenExpiredDialog && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <h3>Session Expired</h3>
          <p>Your session has expired. Please log in again.</p>
          <button onClick={() => {
            setShowTokenExpiredDialog(false);
            navigate("/login"); // Redirect to login page
          }} style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            OK
          </button>
        </div>
      )}

      <Footer languageType={languageType} />
    </div>
  );
}

export default App;
