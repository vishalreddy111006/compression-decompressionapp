import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import FollowRequestsPage from './pages/FollowRequestsPage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute>
                  <ExplorePage />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/follow-requests" element={
                <ProtectedRoute>
                  <FollowRequestsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:username?" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/u/:username" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
