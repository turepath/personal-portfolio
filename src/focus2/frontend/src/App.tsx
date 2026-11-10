import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { Community } from './pages/Community';
import { My } from './pages/My';
import { Settings } from './pages/Settings';
import { RoomPage } from './pages/RoomPage';
import { Messages } from './pages/Messages';
import { EditProfile } from './pages/EditProfile';
import { Store } from './pages/Store';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AvatarStudio } from './pages/AvatarStudio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => {}} />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />

      <Route path="/*" element={
        isAuthenticated ? (
          <MainLayout />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;