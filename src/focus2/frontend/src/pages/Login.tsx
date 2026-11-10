
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Common';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    try {
      // 调用 AuthContext 的 login（后端将通过 cookie 识别会话）
      await login({ email: identifier, password });
      onLoginSuccess(); // 保持原有调用以兼容 App 的回调
      navigate('/');
    } catch (err: any) {
      console.error('Login failed', err);
      alert(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-bg p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-earth-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-earth-accent/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-earth-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto mb-6">F</div>
          <h1 className="text-4xl font-black text-earth-text tracking-tighter uppercase mb-2">Welcome Back</h1>
          <p className="text-earth-text-sec font-medium opacity-70">Sign in to your focus sanctuary.</p>
        </div>

        <div className="bg-white border border-earth-border rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">Account ID or Email</label>
              <input 
                type="text" 
                placeholder="e.g. 88776655 or alex@focus.com"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em]">Password</label>
                <a href="#" className="text-[9px] font-black uppercase text-earth-accent hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 text-lg shadow-xl font-black uppercase tracking-widest mt-4"
              isLoading={isLoading}
            >
              Login to Hub
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-earth-border text-center">
            <p className="text-sm text-earth-text-sec font-medium">
              Don't have an account yet? <br/>
              <Link to="/register" className="text-earth-accent font-black hover:underline mt-1 inline-block">Create New Profile</Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-earth-text-sec font-black uppercase tracking-[0.3em] opacity-30">
          Focus Companion &copy; 2024
        </p>
      </div>
    </div>
  );
};
