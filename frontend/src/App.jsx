import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import OTP from './pages/OTP'
import ResetPassword from './pages/ResetPassword'
import { useDispatch, useSelector } from 'react-redux'
import { getUser } from './redux/slices/authSlice'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './components/Dashboard'
import Events from './components/Events'
import ChangeDetails from './components/ChangeDetails'
const App = () => {

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [])
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />}>
          {/* When the user visits '/', redirect them to '/dashboard' */}
          <Route index element={<Navigate to="/dashboard" />} />

          {/* Nested routes within Home */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="change-details" element={<ChangeDetails />} />
          <Route path="/event/:slug" element={<ChangeDetails />} />
        </Route>
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
      </Routes>
      <ToastContainer theme='dark' />
    </Router>
  );
};

export default App;