import logoText from '../assets/only-text.png';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-[rgba(255,255,255,0.1)] relative z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <img src={logoText} alt="Mirra Sense" className="h-7 w-auto object-contain" />
                <p className="text-sm opacity-30 text-center">2025 ALENKOSA. Tech Development & Intelligence Company.</p>
            </div>
        </footer>
    );
};

export default Footer;