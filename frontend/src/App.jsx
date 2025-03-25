import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Home from './pages/Home'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Donate from './pages/Donate'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import OTP from './pages/OTP'
import ResetPassword from './pages/ResetPassword'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './components/Dashboard'
import UserDashboard from './pages/UserDashboard';
import Events from './components/Events'
import ChangeDetails from './components/ChangeDetails'
import Translate from "./TranslateButton";
import TranslateButton from './TranslateButton'
import MainLayout from './components/MainLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUser } from './redux/slices/authSlice'
import Event from './components/Event'
import FullStory from './pages/FullStory'
import EventOrganiser from './components/EventOrganiser'
import EventsUser from './components/EventsUser'
import ScreenReaderButton from './ScreenReaderButton'
import Notification from './pages/Notification'
import { AccessibilityProvider } from "./components/Accessibility/AccessibilityContext.Provider";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import PendingApprovals from './components/PendingApprovals'
import PastEvents from './components/PastEvents'

import { useState } from 'react'
import AccessibilityMenu from './components/AccessibilityMenu'

function App() {
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log('User:', user);

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/notification", {
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Fetch notifications on mount and poll every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScreenReaderButton />
      <AccessibilityMenu />
      <TranslateButton />
      <AccessibilityMenu/>
      {/* <AccessibilityProvider >
      <AccessibilityToolbar /> */}
      <Routes>
        {/* Routes that require Header & Footer */}
        <Route element={<MainLayout notifications={notifications} />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/dashboard" element={user?.role === "Event Organiser" ? <Dashboard /> : <UserDashboard />} />
          <Route
            path="/events"
            element={user && user.role === "Event Organiser" ? <Events /> : <EventsUser />}
          />
          <Route path="/change-details" element={<ChangeDetails />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/stories/:id" element={<FullStory />} />
          <Route
            path="/event/:slug"
            element={user && user.role === "Event Organiser" ? <EventOrganiser /> : <Event />}
          />
          <Route
            path="/notification"
            element={<Notification notifications={notifications} fetchNotifications={fetchNotifications} />}
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route path="/admin/login" element={<AdminLogin /> }/>

        <Route path="/admin" element={<AdminRoute />}>
        {/* Admin Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Pending Approvals directly under /admin */}
        <Route path="pending-approvals" element={<PendingApprovals />} />
        <Route path="past-events" element={<PastEvents />} />
      </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
      <ToastContainer theme='dark' />
    </Router>
  );
}

export default App;