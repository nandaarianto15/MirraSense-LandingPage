// src/components/Sidebar.tsx
import { useNavigate } from 'react-router-dom';
import logoText from '../assets/logo-text.png';

interface SidebarProps {
    activeMenu: string;
    setActiveMenu: (menu: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const Sidebar = ({ activeMenu, setActiveMenu, isOpen, setIsOpen, theme, setTheme }: SidebarProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleNavigation = (menu: string) => {
        setActiveMenu(menu);
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container - Menggunakan variabel CSS & Glass effect */}
            <aside className={`fixed h-full bg-[var(--bg-deep)]/80 backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col z-50 transition-all duration-500 ease-in-out w-72 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* Logo Area */}
                <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-center h-[100px] relative">
                    <img src={logoText} alt="Mirra Sense" className="w-36 object-contain transition-all duration-300" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40 blur-sm"></div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                        { id: 'articles', label: 'Artikel', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
                        { id: 'users', label: 'User', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleNavigation(item.id)} 
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden
                                ${activeMenu === item.id 
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_20px_-5px_rgba(var(--accent-rgb),0.3)]' 
                                    : 'hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-transparent'}`}
                        >
                            <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}></path></svg>
                            <span className="font-medium relative z-10">{item.label}</span>
                            
                            {activeMenu === item.id && (
                                <div className="absolute right-4 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom Section: Theme Toggle & Logout */}
                <div className="p-4 border-t border-[var(--glass-border)] space-y-3">
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme}
                        className="w-full px-4 py-3 rounded-xl flex items-center justify-between group hover:bg-[var(--glass-bg)] transition-all duration-300 border border-transparent hover:border-[var(--glass-border)]"
                    >
                        <div className="flex items-center gap-3 text-[var(--text-secondary)] group-hover:text-[var(--text-main)]">
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                            <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] relative transition-all`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--accent)] shadow-md transition-all duration-300 ${theme === 'dark' ? 'left-0.5' : 'left-[18px]'}`}></div>
                        </div>
                    </button>

                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 transition-all duration-300 flex items-center gap-3 group hover:text-red-400 border border-transparent hover:border-red-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;