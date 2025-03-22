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
import Events from './components/Events'
import ChangeDetails from './components/ChangeDetails'
import Translate from "./TranslateButton";
import TranslateButton from './TranslateButton'
import MainLayout from './components/MainLayout'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getUser } from './redux/slices/authSlice'
import Event from './components/Event'
import FullStory from './pages/FullStory'

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <TranslateButton/>
      <Routes>
        {/* Routes that require Header & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Conditionally render events based on user role */}
          <Route
            path="/events"
            element={
              user && user.role === "Event Organiser" ? <Events /> : <EventsUser />
            }
          />
          <Route path="/change-details" element={<ChangeDetails />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:slug" element={<Event />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/stories/:id" element={<FullStory />} />
          <Route path="/event/:slug" element={ user && user.role === "Event Organiser" ? <EventOrganiser /> : <Event />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer theme="dark" />
    </Router>
  );
}

export default App;
