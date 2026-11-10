import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { MainLayout } from "./layouts/MainLayout";
import { Rooms } from "./pages/Rooms";
import { RoomPage } from "./pages/RoomPage";
import { Community } from "./pages/Community";
import { CommunityDemo } from "./pages/CommunityDemo";
import { Messages } from "./pages/Messages";
import { My } from "./pages/My";
import { Store } from "./pages/Store";
import { Settings } from "./pages/Settings";
import { EditProfile } from "./pages/EditProfile";

// 后端健康检查组件
const BackendHealthCheck: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // 尝试连接后端健康检查端点
        const response = await fetch(`/api/health`, {
          method: "GET",

        });
        setIsBackendHealthy(response.ok);
      } catch (error) {
        // 连接失败，后端可能未开启
        setIsBackendHealthy(false);
      }
    };

    checkBackendHealth();
    // 每分钟检查一次
    const interval = setInterval(checkBackendHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  // 如果正在检查或后端不健康，显示维修页面
  if (isBackendHealthy === null || !isBackendHealthy) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-earth-bg">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-earth-accent rounded-full flex items-center justify-center text-white font-black text-2xl mb-6 shadow-lg">
            ⚙️
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-earth-text mb-4">
            服务器正在维修
          </h1>
          <p className="text-earth-text-sec text-lg md:text-xl mb-8">
            请稍后再试，我们正在进行维护工作
          </p>
          {isBackendHealthy === null && (
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-earth-accent/40 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-earth-accent/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-earth-accent/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// 私有路由组件，需要登录才能访问
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-earth-bg">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-earth-accent rounded-full animate-spin mb-4"></div>
          <p className="text-earth-text font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // 未登录状态下重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RoomProvider>
        <BackendHealthCheck>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<MainLayout />}>
                {/* 所有主页面都需要登录才能访问 */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <PrivateRoute>
                      <Rooms />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/room/:roomId"
                  element={
                    <PrivateRoute>
                      <RoomPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <PrivateRoute>
                      <Community />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/community-demo"
                  element={
                    <PrivateRoute>
                      <CommunityDemo />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <Messages />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my"
                  element={
                    <PrivateRoute>
                      <My />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/store"
                  element={
                    <PrivateRoute>
                      <Store />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <PrivateRoute>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </BackendHealthCheck>
      </RoomProvider>
    </AuthProvider>
  );
};

export default App;
