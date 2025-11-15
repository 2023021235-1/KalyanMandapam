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
import HallManagement from "./components/HallManagement";
import BookingManagement from "./components/BookingManagement";
import VerifyBooking from "./components/VerifyBooking";
import AdminStats from "./components/AdminStats";
import AdminManagement from "./components/AdminManagement";
// Set axios to send cookies with every request
axios.defaults.withCredentials = true;

function App() {
  const [languageType, setLanguageType] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // This state is key to the fix
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTokenExpiredDialog, setShowTokenExpiredDialog] = useState(false);
  const backend = "https://kalyanmandapam.onrender.com";

  const handleLogout = async () => {
    try {
      await axios.post(`${backend}/api/auth/logout`);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setIsAdmin(false); // Also reset admin status on logout
      navigate("/login");
    }
  };

  useEffect(() => {
    const MINIMUM_LOAD_TIME = 500;
    const startTime = Date.now();

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backend}/api/auth/profile`);
        setUser(res.data.user);
        if (res.data.user.role === 'Admin') {
            setIsAdmin(true);
        }
      } catch (err) {
        setUser(null);
        if (err.response && err.response.status === 401) {
          console.log("Session expired, user will be prompted to log in.");
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, MINIMUM_LOAD_TIME - elapsed);
        setTimeout(() => setLoading(false), delay);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401 && user) {
          setUser(null);
          setIsAdmin(false);
          setShowTokenExpiredDialog(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  return (
    <div className="App">
      <Navbar
        languageType={languageType}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        setLanguageType={setLanguageType}
        setUser={setUser}
      />

      {/* This conditional rendering fixes the race condition */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Loading...</h2>
        </div>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <LoginPage
                  languageType={languageType}
                  setIsAdmin={setIsAdmin}
                  setUser={setUser}
                />
              ) : isAdmin ? (
                <Navigate to="/admin/hall-management" />
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

          {/* Admin Routes */}
          <Route
            path="/admin/hall-management"
            element={isAdmin ? <HallManagement API_BASE_URL={backend + '/api'} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/booking-management"
            element={isAdmin ? <BookingManagement API_BASE_URL={backend + '/api'} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />}
          />
          <Route path="/admin/verify-booking" element={isAdmin ? <VerifyBooking API_BASE_URL={backend} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />} />
          <Route
            path="/admin/stats"
            element={isAdmin ? <AdminStats API_BASE_URL={backend + '/api'} getAuthToken={() => localStorage.getItem('token')} /> : <Navigate to="/" />}
          />
         <Route path="/admin/admin-management" element={isAdmin ? <AdminManagement languageType={languageType}/> : <Navigate to="/login" />} /> </Routes>

      )}

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
            navigate("/login");
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