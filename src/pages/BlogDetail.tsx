// src/pages/BlogDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CanvasBackground from '../components/CanvasBackground';

// --- KONFIGURASI API ---
const API_BASE_URL = 'http://localhost:8000';

// Interface untuk data dari API
interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    tag: string; // CSV string dari backend
    image: string;
    published_at: string; // ISO Date string
    author_id: number;
    // Untuk keperluan frontend saja
    tags?: string[];
    author?: string;
}

const formatDateDetail = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
};

const BlogDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`${API_BASE_URL}/blog/${slug}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Artikel tidak ditemukan');
                    }
                    throw new Error('Gagal memuat artikel');
                }
                
                const data: Article = await response.json();
                
                // Proses data
                let imageUrl = data.image;
                // Tambahkan Base URL jika path relatif
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `${API_BASE_URL}/${imageUrl}`;
                }

                const processedData = {
                    ...data,
                    image: imageUrl, // Gunakan URL yang sudah lengkap
                    tags: data.tag ? data.tag.split(',').map(t => t.trim()) : [],
                    author: "Admin MirraSense" // Default author
                };
                
                setArticle(processedData);
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen relative text-[var(--text-main)] flex items-center justify-center">
                <CanvasBackground />
                <div className="text-center z-10">
                    <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl animate-pulse">Memuat artikel...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center relative text-[var(--text-main)]">
                <CanvasBackground />
                <div className="text-center z-10 p-8 glass-panel rounded-2xl max-w-md border border-red-500/20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-display mb-2 text-[var(--text-main)]">{error || "Artikel Tidak Ditemukan"}</h1>
                    <p className="text-muted text-sm mb-6">Kemungkinan artikel telah dihapus atau link yang Anda masukkan salah.</p>
                    <button onClick={() => navigate('/blog')} className="px-6 py-3 rounded-xl text-sm font-medium bg-[var(--accent)] text-white transition-all shadow-lg shadow-[var(--accent)]/20">
                        Kembali ke Blog
                    </button>
                </div>
            </div>
        );
    }

    // Share URL Logic
    const shareUrl = window.location.href;
    const shareText = `Baca artikel menarik ini: ${article.title}`;

    return (
        <div className="min-h-screen relative text-[var(--text-main)]">
            <CanvasBackground />

            {/* Floating Back Button - Glass Style */}
            <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
                <button 
                    onClick={() => navigate('/blog')} 
                    className="p-3 rounded-full glass-panel hover:scale-110 transition-all group"
                >
                    <svg className="w-5 h-5 text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <span className="hidden md:block text-sm text-muted">Kembali</span>
            </div>

            {/* Hero Image Header */}
            <div className="relative h-[60vh] w-full">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent"></div>
            </div>

            {/* Content Area */}
            <article className="relative z-10 max-w-3xl mx-auto px-4 -mt-40 pb-20">
                <div className="glass-panel rounded-3xl p-6 md:p-10 lg:p-12 shadow-2xl">
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-[var(--accent)] text-white dark:text-black text-xs font-semibold rounded-full">{article.category}</span>
                        <span className="text-muted text-xs">{formatDateDetail(article.published_at)}</span>
                        <span className="text-muted">•</span>
                        <span className="text-muted text-xs">{article.author}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold leading-tight mb-8">
                        {article.title}
                    </h1>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[rgba(var(--accent-rgb),0.1)]">
                        <span className="text-xs text-muted uppercase tracking-wider">Share:</span>
                        
                        {/* WhatsApp Share */}
                        <a 
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full glass-panel hover:bg-[#25D366]/20 hover:border-[#25D366] transition-all group"
                            title="Share to WhatsApp"
                        >
                            <svg className="w-5 h-5 text-muted group-hover:text-[#25D366] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>

                        {/* Copy Link */}
                        <button 
                            onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link disalin!'); }} 
                            className="p-2 rounded-full glass-panel hover:bg-[var(--accent)]/20 hover:border-[var(--accent)] transition-all group"
                            title="Copy Link"
                        >
                            <svg className="w-5 h-5 text-muted group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10a2 2 0 00-2 2v3m0 0h4m-4 0h4"/></svg>
                        </button>
                    </div>

                    {/* Article Body - Dynamic Colors */}
                    <div 
                        className="prose prose-lg max-w-none 
                        prose-headings:font-display prose-headings:text-[var(--text-main)] prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                        prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                        prose-strong:text-[var(--text-main)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-[var(--accent)] prose-blockquote:bg-[rgba(var(--accent-rgb),0.05)] prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-[var(--text-secondary)]"
                        dangerouslySetInnerHTML={{ __html: article.content }} 
                    />

                    {/* Tags Footer */}
                    <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)]">
                        <h4 className="text-xs uppercase tracking-widest text-muted mb-4">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {article.tags && article.tags.map((tag, i) => (
                                <span key={i} className="px-4 py-2 glass-panel text-muted text-sm rounded-full hover:border-[var(--accent)] transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;