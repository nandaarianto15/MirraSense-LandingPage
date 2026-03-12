// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/only-logo.png';
import logoText from '../assets/only-text.png';

interface NavbarProps {
    openModal: () => void;
}

const Navbar = ({ openModal }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.add('light');
            setIsLight(true);
        }
    }, []);

    const toggleTheme = () => {
        if (isLight) {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
            setIsLight(false);
        } else {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
            setIsLight(true);
        }
    };

    return (
    <nav className="nav-glass fixed top-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
                
                <Link to="/" className="flex items-center gap-0 sm:gap-1 z-10">
                    <img src={logoIcon} alt="Mirra Sense Icon" className="h-10 sm:h-12 w-auto object-contain" />
                    <img src={logoText} alt="Mirra Sense Text" className="h-6 sm:h-8 w-auto object-contain" />
                </Link>

                <div className="hidden lg:flex items-center gap-8">
                    <a href="/#problem" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Tantangan</a>
                    <a href="/#solution" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Solusi</a>
                    <a href="/#how-it-works" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Cara Kerja</a>
                    <a href="/#benefits" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Keuntungan</a>
                    <a href="/#comparison" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Perbandingan</a>
                    {/* Link ke halaman Blog */}
                    <Link to="/blog" className="text-sm hover:text-[#FF8A9B] transition-colors duration-300">Blog</Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={toggleTheme} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform">
                        {isLight ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        )}
                    </button>

                    <button onClick={openModal} className="btn-primary text-xs sm:text-sm py-2 px-4 sm:py-2 sm:px-6 hidden md:block">Masuk</button>
                    
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform z-10">
                        {isOpen ? (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>

        <div className={`lg:hidden mobile-menu-container flex flex-col p-6 space-y-2 ${isOpen ? 'active' : ''}`}>
            <a href="/#problem" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Tantangan</a>
            <a href="/#solution" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Solusi</a>
            <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Cara Kerja</a>
            <a href="/#benefits" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Keuntungan</a>
            <a href="/#comparison" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Perbandingan</a>
            {/* Link Mobile ke Blog */}
            <Link to="/blog" onClick={() => setIsOpen(false)} className="block text-base sm:text-lg py-2 sm:py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">Blog</Link>
            
            <button onClick={() => { openModal(); setIsOpen(false); }} className="btn-primary w-full text-center mt-4 text-sm sm:text-base py-3">Masuk</button>
        </div>
    </nav>
    );
};

export default Navbar;