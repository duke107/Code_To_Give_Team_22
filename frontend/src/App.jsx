import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password/forgot" element={<ForgotPassword />} />
              <Route path="/otp-verification/:email" element={<OTP />} />
              <Route path="/password/reset/:token" element={<ResetPassword />} />
          </Routes>
          <ToastContainer theme='dark'/>
      </Router>
  );
};

export default App;