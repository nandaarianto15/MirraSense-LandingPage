// src/pages/Blog.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CanvasBackground from '../components/CanvasBackground';
import Navbar from '../components/Navbar';

interface NavbarProps {
    openLoginModal: () => void;
}

// --- KONFIGURASI API ---
const API_BASE_URL = 'http://localhost:8000';

// Interface untuk data dari API
interface Article {
    id: number;
    title: string;
    slug: string;
    content: string; 
    category: string;
    tag: string; 
    image: string;
    published_at: string; 
    author_id: number;
    // Untuk keperluan frontend saja
    excerpt?: string; 
    tags?: string[];
    date?: string;
    author?: string;
}

const Blog = ({ openLoginModal }: NavbarProps) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data dari API
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/blog/list`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: Article[] = await response.json();
                
                // Proses data untuk menyesuaikan dengan tampilan
                const processedData = data.map(article => {
                    // Generate excerpt
                    const excerpt = article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
                    
                    // Convert tag string ke array
                    const tags = article.tag.split(',').map(t => t.trim());
                    
                    // Formatting date
                    const dateObj = new Date(article.published_at);
                    const date = dateObj.toISOString().split('T')[0];

                    // PERBAIKAN IMAGE URL:
                    // Jika image adalah path relatif dari DB (misal "blog_image/..."), tambahkan base URL
                    let imageUrl = article.image;
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `${API_BASE_URL}/${imageUrl}`;
                    }

                    return {
                        ...article,
                        image: imageUrl, // Gunakan URL yang sudah lengkap
                        excerpt,
                        tags,
                        date,
                        author: "Admin" 
                    };
                });

                setArticles(processedData);
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return {
            dateNum: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear()
        };
    };

    // Sorting
    const sortedArticles = [...articles].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
    const featuredArticle = sortedArticles[0];
    const restArticles = sortedArticles.slice(1);

    // --- RENDER STATES ---

    if (loading) {
        return (
            <div className="min-h-screen relative text-[var(--text-main)] flex items-center justify-center">
                <CanvasBackground />
                <Navbar openModal={openLoginModal} />
                <p className="text-xl animate-pulse z-10">Memuat artikel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen relative text-[var(--text-main)] flex items-center justify-center">
                <CanvasBackground />
                <Navbar openModal={openLoginModal} />
                <div className="text-center z-10">
                    <p className="text-xl text-red-400 mb-4">Error: {error}</p>
                    <p className="text-sm text-muted">Pastikan backend sudah berjalan di http://localhost:8000</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative text-[var(--text-main)]">
            <CanvasBackground />
            <Navbar openModal={openLoginModal} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
                
                {/* Header */}
                <div className="text-center mb-16 reveal active">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-[rgba(var(--accent-rgb),0.3)] text-xs uppercase tracking-widest text-[var(--accent)] mb-6 bg-[rgba(var(--accent-rgb),0.05)] backdrop-blur-sm">
                        Mirra Sense Blog
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-semibold leading-tight mb-6">
                        Wawasan & Inspirasi <br />
                        <span className="text-gradient">Kecantikan</span>
                    </h1>
                    <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Temukan artikel terbaru seputar kesehatan kulit, teknologi dermatologi, dan tips perawatan dari para ahli.
                    </p>
                </div>

                {/* KONDISI: Jika Artikel Kosong */}
                {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 reveal active">
                        <div className="glass-panel rounded-3xl p-10 md:p-16 text-center max-w-xl border border-[rgba(var(--accent-rgb),0.2)] shadow-xl hover:shadow-[0_0_30px_-5px_rgba(var(--accent-rgb),0.15)] transition-all duration-500">
                            
                            {/* Icon */}
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[rgba(var(--accent-rgb),0.1)] flex items-center justify-center text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.2)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-display font-semibold mb-3 text-[var(--text-main)]">
                                Belum Ada Artikel
                            </h3>
                            <p className="text-muted text-base leading-relaxed mb-8">
                                Maaf, saat ini belum ada artikel yang dipublikasikan. Tim kami sedang menyiapkan konten menarik seputar kesehatan kulit. Silakan kembali lagi nanti!
                            </p>

                            <Link 
                                to="/" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white dark:text-black rounded-full font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(var(--accent-rgb),0.3)]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* KONDISI: Jika Artikel Ada */
                    <>
                        {/* Featured Article */}
                        {featuredArticle && (
                            <div className="mb-16 reveal active delay-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></span>
                                    <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Artikel Terbaru</span>
                                </div>
                                
                                <Link to={`/blog/${featuredArticle.slug}`} className="group grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 glass-panel rounded-3xl overflow-hidden hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_-10px_rgba(var(--accent-rgb),0.15)]">
                                    
                                    {/* Image Section */}
                                    <div className="md:col-span-7 relative h-64 md:h-[450px] overflow-hidden">
                                        <img 
                                            src={featuredArticle.image} 
                                            alt={featuredArticle.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:bg-gradient-to-t md:from-black md:to-transparent"></div>
                                        
                                        <div className="absolute top-6 left-6 bg-[var(--accent)] text-white dark:text-black rounded-lg p-3 text-center shadow-lg shadow-[rgba(var(--accent-rgb),0.3)]">
                                            <span className="block text-xs font-bold uppercase">{formatDate(featuredArticle.published_at).month}</span>
                                            <span className="block text-3xl font-bold leading-none">{formatDate(featuredArticle.published_at).dateNum}</span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="md:col-span-5 p-8 flex flex-col justify-center relative">
                                        <span className="text-xs text-[var(--accent)] font-medium mb-2">{featuredArticle.category}</span>
                                        <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4 group-hover:text-[var(--accent)] transition-colors leading-tight">
                                            {featuredArticle.title}
                                        </h2>
                                        <p className="text-muted text-sm mb-6 line-clamp-3">{featuredArticle.excerpt}</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-[var(--text-main)]">{featuredArticle.author?.charAt(0)}</div>
                                                <span className="text-xs text-muted">{featuredArticle.author}</span>
                                            </div>
                                            <span className="text-sm text-[var(--text-main)] flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                                                Baca <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Grid Articles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {restArticles.map((article, index) => {
                                const dateObj = formatDate(article.published_at);
                                return (
                                    <Link 
                                        key={article.id}
                                        to={`/blog/${article.slug}`}
                                        className={`group relative glass-panel rounded-2xl overflow-hidden hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-500 flex flex-col reveal active delay-${(index % 3) + 2} shadow-lg hover:shadow-xl`}
                                    >
                                        {/* Image Wrapper */}
                                        <div className="relative h-56 overflow-hidden">
                                            <img 
                                                src={article.image} 
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            
                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="absolute top-4 left-4 bg-[var(--accent)] text-white dark:text-black rounded-lg p-2 text-center shadow-lg">
                                                <span className="block text-[10px] font-bold uppercase">{dateObj.month}</span>
                                                <span className="block text-lg font-bold leading-none">{dateObj.dateNum}</span>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-[10px] rounded-full border border-white/10">
                                                    {article.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Wrapper */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-semibold mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors flex-grow">
                                                {article.title}
                                            </h3>
                                            <p className="text-muted text-xs mb-4 line-clamp-2">{article.excerpt}</p>
                                            
                                            {/* Footer Meta */}
                                            <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center mt-auto">
                                                <div className="flex gap-2">
                                                    {article.tags && article.tags.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] text-muted">#{tag}</span>
                                                    ))}
                                                </div>
                                                <span className="text-muted text-xs">{dateObj.year}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Blog;