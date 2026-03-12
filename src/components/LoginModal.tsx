// src/components/LoginModal.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Inisialisasi navigate

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Logika login (Sama dengan yang di Dashboard sebelumnya)
        if (email === 'admin@mirra.com' && password === 'admin123') {
            localStorage.setItem('isLoggedIn', 'true'); // Set flag login
            onClose(); // Tutup modal
            navigate('/dashboard'); // Arahkan ke dashboard
        } else {
            alert('Email atau password salah! \n(Hint: admin@mirra.com / admin123)');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay active`} onClick={onClose}>
            <div className="modal-content glass-panel p-8 rounded-3xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 className="font-display text-3xl mb-2 text-center">Welcome Back</h2>
                <p className="text-muted text-center mb-8 text-sm">Masuk ke Dashboard Mirra Sense</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-wider opacity-50 mb-2">Email</label>
                        <input 
                            type="email" 
                            className="input-style rounded-xl"
                            placeholder="admin@mirra.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider opacity-50 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="input-style rounded-xl"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary w-full text-sm mt-4">
                        Masuk Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;