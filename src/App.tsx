// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import LoginModal from './components/LoginModal'; // Import Modal

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  // State global untuk Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <Router>
      {/* Render Modal di level tertinggi agar bisa muncul dimana saja */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      <Routes>
        {/* LandingPage menerima props untuk kontrol modal */}
        <Route path="/" element={<LandingPage openLoginModal={() => setIsLoginModalOpen(true)} />} />
        
        {/* Blog menerima props yang sama */}
        <Route path="/blog" element={<Blog openLoginModal={() => setIsLoginModalOpen(true)} />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        
        {/* Route Private */}
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;