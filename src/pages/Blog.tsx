// src/pages/Blog.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CanvasBackground from '../components/CanvasBackground';
import Navbar from '../components/Navbar';

interface NavbarProps {
    openLoginModal: () => void;
}

// --- KONFIGURASI API ---
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = '/api';

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
    views: number;
    created_at: string;
    // Untuk keperluan frontend saja
    excerpt?: string;
    tags?: string[];
    author?: string;
}

const Blog = ({ openLoginModal }: NavbarProps) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State untuk Search, Filter & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Batasi 8 card per halaman
    
    // Daftar Kategori
    const categories = ["Semua", "Teknologi Kesehatan", "Perawatan Kulit", "Tips Kecantikan", "Produk Review", "Berita Klinik"];

    // Fetch Data dari API
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/blog/list`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data: Article[] = await response.json();
                
                const processedData = data.map(article => {
                    const plainText = article.content.replace(/<[^>]*>/g, '');
                    const excerpt = plainText.substring(0, 300); 
                    const tags = article.tag.split(',').map(t => t.trim());

                    let imageUrl = article.image;
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `${API_BASE_URL}/${imageUrl}`;
                    }

                    return {
                        ...article,
                        image: imageUrl,
                        excerpt,
                        tags,
                        author: "Admin MirraSense",
                        views: article.views || 0
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

    // Reset ke halaman 1 jika filter atau search berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return {
            dateNum: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear()
        };
    };

    // Logic Filter & Search
    const filteredArticles = articles.filter(article => {
        const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = activeCategory === "Semua" || article.category === activeCategory;
        return matchSearch && matchCategory;
    });

    // Sorting (created_at / published_at)
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        const dateA = new Date(a.created_at || a.published_at).getTime();
        const dateB = new Date(b.created_at || b.published_at).getTime();
        return dateB - dateA;
    });

    // Artikel Featured (Hanya tampil di halaman 1 jika tidak ada filter)
    const showFeatured = searchQuery === "" && activeCategory === "Semua" && currentPage === 1;
    const featuredArticle = showFeatured ? sortedArticles[0] : null;
    
    // Daftar artikel untuk grid (hapus featured jika ditampilkan)
    const listArticles = showFeatured ? sortedArticles.slice(1) : sortedArticles;

    // Pagination Logic
    const indexOfLastArticle = currentPage * itemsPerPage;
    const indexOfFirstArticle = indexOfLastArticle - itemsPerPage;
    const currentArticles = listArticles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(listArticles.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                
                {/* HEADER - Rata Kiri */}
                <div className="text-left mb-12 reveal active">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-[rgba(var(--accent-rgb),0.3)] text-xs uppercase tracking-widest text-[var(--accent)] mb-6 bg-[rgba(var(--accent-rgb),0.05)] backdrop-blur-sm">
                        Mirra Sense Blog
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-semibold leading-tight mb-4">
                        Wawasan & Inspirasi <br />
                        <span className="text-gradient">Kecantikan</span>
                    </h1>
                    <p className="text-muted text-lg md:text-xl max-w-2xl leading-relaxed">
                        Temukan artikel terbaru seputar kesehatan kulit, teknologi dermatologi, dan tips perawatan dari para ahli.
                    </p>
                </div>

                {/* SEARCH & FILTER SECTION */}
                <div className="mb-12 reveal active delay-1 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:w-1/3">
                        <input 
                            type="text" 
                            placeholder="Cari judul artikel..." 
                            className="w-full pl-4 pr-4 py-3 rounded-xl glass-panel border border-white/10 focus:border-[var(--accent)] focus:outline-none bg-transparent text-[var(--text-main)] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Buttons Horizontal */}
                    <div className="flex gap-6 flex-wrap justify-start md:justify-end w-full md:w-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                                    activeCategory === cat 
                                    ? 'bg-[var(--accent)] text-white dark:text-black border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20' 
                                    : 'glass-panel text-muted hover:text-[var(--text-main)] hover:border-[var(--accent)] border-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KONDISI: Jika Artikel Kosong */}
                {sortedArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 reveal active">
                        <div className="glass-panel rounded-3xl p-10 text-center max-w-xl border border-[rgba(var(--accent-rgb),0.2)]">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(var(--accent-rgb),0.1)] flex items-center justify-center text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.2)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-display font-semibold mb-2">Tidak Ada Artikel</h3>
                            <p className="text-muted">Tidak ditemukan artikel dengan kata kunci atau kategori tersebut.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Featured Article (Hanya Halaman 1 & No Filter) */}
                        {featuredArticle && (
                            <div className="mb-6 reveal active delay-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></span>
                                    <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Artikel Terbaru</span>
                                </div>
                                
                                <Link 
                                    to={`/blog/${featuredArticle.slug}`} 
                                    className="group grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 glass-panel rounded-3xl overflow-hidden border border-transparent hover:border-[var(--accent)] transition-all duration-500 relative"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] via-transparent to-[var(--accent)] opacity-20 blur-xl"></div>
                                    </div>
                                    
                                    <div className="md:col-span-6 relative h-64 md:h-[450px] overflow-hidden">
                                        <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute top-6 left-6 bg-[var(--accent)] text-white dark:text-black rounded-lg p-3 text-center shadow-lg z-10">
                                            <span className="block text-xs font-bold uppercase">{formatDate(featuredArticle.published_at).month}</span>
                                            <span className="block text-3xl font-bold leading-none">{formatDate(featuredArticle.published_at).dateNum}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-center relative z-10">
                                        <span className="text-base text-[var(--accent)] font-medium mb-2">{featuredArticle.category}</span>
                                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 group-hover:text-[var(--accent)] transition-colors leading-tight">
                                            {featuredArticle.title}
                                        </h2>
                                        
                                        <p className="text-muted text-base mb-6 line-clamp-3">
                                            {featuredArticle.excerpt}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs border border-white/20">
                                                        {featuredArticle.author?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs opacity-80">{featuredArticle.author}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{featuredArticle.views}</span>
                                                </div>
                                            </div>
                                            <span className="text-sm text-[var(--text-main)] flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                                                Baca <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Grid Articles - 4 Kolom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {currentArticles.map((article, index) => {
                                const dateObj = formatDate(article.published_at);
                                return (
                                    <Link 
                                        key={article.id}
                                        to={`/blog/${article.slug}`}
                                        className={`group relative glass-panel rounded-2xl overflow-hidden border border-transparent hover:border-[var(--accent)] transition-all duration-500 flex flex-col h-full reveal active delay-${(index % 4) + 2}`}
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                                            <div className="absolute -inset-1 bg-gradient-to-t from-[var(--accent)] via-transparent to-transparent opacity-20 blur-xl"></div>
                                        </div>

                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden flex-shrink-0">
                                            <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>

                                            <div className="absolute top-4 left-4 bg-[var(--accent)] text-white dark:text-black rounded-lg p-2 text-center shadow-lg z-20">
                                                <span className="block text-[10px] font-bold uppercase">{dateObj.month}</span>
                                                <span className="block text-lg font-bold leading-none">{dateObj.dateNum}</span>
                                            </div>
                                            
                                            <div className="absolute top-4 right-4 z-20">
                                                <span className="px-3 py-1 bg-[var(--accent)] backdrop-blur-sm text-white text-[10px] rounded-full border border-white/10">
                                                    {article.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content - Flex Grow agar tinggi menyesuaikan */}
                                        <div className="p-5 flex-1 flex flex-col relative z-20">
                                            {/* Title: Hapus line-clamp agar bisa memanjang, tapi tetap rapi */}
                                            <h3 className="text-lg font-semibold mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
                                                {article.title}
                                            </h3>
                                            
                                            {/* Excerpt: Clamp 3 baris */}
                                            <p className="text-muted text-xs mb-4 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                            
                                            <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] mt-auto space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] border border-white/10">
                                                            {article.author?.charAt(0)}
                                                        </div>
                                                        <span className="text-xs text-muted group-hover:text-[var(--text-main)] transition-colors">{article.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>{article.views}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2 overflow-hidden">
                                                        {article.tags && article.tags.slice(0, 1).map((tag, i) => (
                                                            <span key={i} className="text-[10px] text-muted hover:text-[var(--accent)] transition-colors truncate">#{tag}</span>
                                                        ))}
                                                    </div>
                                                    <span className="text-muted text-[10px]">{dateObj.year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg glass-panel border border-white/10 hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => paginate(i + 1)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-[var(--accent)] text-white' 
                                                : 'glass-panel border border-white/10 hover:border-[var(--accent)]'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg glass-panel border border-white/10 hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Blog;