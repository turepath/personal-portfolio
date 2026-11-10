
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { Community } from './pages/Community';
import { My } from './pages/My';
import { Settings } from './pages/Settings';
import { RoomPage } from './pages/RoomPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Router>
      <Routes>
        {/* Full screen room page, outside MainLayout */}
        <Route path="/room/:id" element={<RoomPage />} />
        
        <Route path="*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/community" element={<Community />} />
              <Route path="/my" element={<My />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
