// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Logika login sederhana (simulasi)
        if (email === 'admin@mirra.com' && password === 'admin123') {
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/dashboard');
        } else {
            alert('Email atau password salah! (Hint: admin@mirra.com / admin123)');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#880E31] to-[#4a0517] z-0"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[rgba(255,138,155,0.2)] rounded-full filter blur-[100px]"></div>
            
            <div className="relative z-10 w-full max-w-md p-8">
                <div className="glass-panel rounded-[32px] p-8 sm:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl sm:text-4xl font-medium text-gradient">Mirra Sense</h1>
                        <p className="text-muted mt-2 text-sm">Dashboard Login</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Email</label>
                            <input 
                                type="email" 
                                className="input-style w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF8A9B] outline-none transition-all"
                                placeholder="admin@mirra.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Password</label>
                            <input 
                                type="password" 
                                className="input-style w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF8A9B] outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary w-full py-3 text-base">
                            Masuk ke Dashboard
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-muted hover:text-[#FF8A9B] transition-colors">
                            &larr; Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;