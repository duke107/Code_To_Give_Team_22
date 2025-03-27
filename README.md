# Team 22 - Samarthanam Track | Code to Give 2K25

## 🌍 Overview

A **community-driven accessibility-first platform** designed to streamline **volunteer management, event coordination, and fundraising** for **Samarthanam Trust**. Our project enhances inclusivity, simplifies event participation, and fosters collaboration between volunteers, event organizers, and administrators.

## ✨ Features

### 🏠 Public Landing Page

- **About Us, Gallery, and Donate** sections
- **Contact Form**: Potential donors can request a callback
- **Accessibility Options** (available site-wide):
  - Adjustable font size
  - High contrast mode
  - Dark mode & grayscale
  - **Screen reader support** (reads aloud hovered elements)
  - **One-click translation** to multiple languages
  - **Voice-to-Text input** on form fields

### 🔑 Authentication & User Roles

- **Volunteer & Organizer Signup/Login**
- **Admin Login** for event approvals and platform management
- **Seamless Verification** for smooth authentication

## 🏆 User Flows

### 👥 Volunteer Experience

- **Dashboard**: View registered events, assigned tasks, task status, etc.
- **Events**:
  - List of nearby events (default view)
  - Search & filter by category, location, name, dates, etc.
  - Register for events and apply for specific volunteering positions
  - Access exclusive WhatsApp groups for event coordination
  - Update task completion status with proof of work 
- **Profile Management**:
  - Update profile picture, location, and password
  - View and edit skills and volunteering history

### 📅 Organizer Experience

- **Dashboard**: Track all organized events, volunteers, and donations received
- **Event Management**:
  - Create new events (**requires admin approval**)
  - Assign tasks to volunteers and track progress
  - Monitor event completion status
  - Approve or reject proof of work from volunteers to ensure honesty
- **Messaging System**: Directly communicate with volunteers for clarifications
- **AI-driven Reports**: Generate automatic event summaries and insights

### 🛠️ Admin Experience

- **Admin Dashboard**:
  - Overview of total events, volunteers, completed tasks, and donation statistics on all fronts
- **Approvals**: Review & approve event proposals and modifications
- **Event Summaries**: Analyze submitted reports from organizers
- **Messaging System**: Address volunteer and organizer queries
- **Data Visualization**: Access user details based on location and roles
- **Role Assignment**: Promote users to positions of responsibility 

## 💰 Donation System

- **General Donations**: Supports direct contributions to the nonprofit
- **Event-Based Donations**:
  - Users can donate to specific events
  - Organizers see total funds raised per event
- **Secure Payment Gateway**: **Stripe** integration for seamless transactions
- **Automated Email Confirmations**: Donors receive personalized gratitude emails

## 🚀 Tech Stack

### **Frontend**
- **React.js**: Component-based UI development
- **Tailwind CSS**: Utility-first styling for rapid development
- **React Router**: Navigation handling
- **React Toastify**: Notification system

### **Backend**
- **Node.js & Express.js**: REST API development
- **MongoDB & Mongoose**: NoSQL database for scalable data storage
- **JWT Authentication**: Secure authentication for different user roles
- **Nodemailer**: Automated email notifications
- **Google Cloud APIs**: **Speech-to-Text, Translate API** for accessibility features

### **Other Integrations**
- **Stripe**: Secure payment processing
- **Firebase**: Image uploads and storage
- **Google Translate API**: Multi-language support
- **Voice Recognition**: Hands-free interaction

---

### **Built with ❤️ by Team 22 - Samarthanam Track**
