// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Sidebar from '../components/Sidebar';

// --- KONFIGURASI API ---
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = '/api';

// --- TIPE DATA ---
interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    tag: string;
    image: string; // Path relatif dari DB
    status: 'Draft' | 'Published';
    published_at?: string;
}

interface Patient {
    id: number;
    name: string;
    email: string;
    phone: string;
}

// --- DATA STATIS ---
const CATEGORIES = [
    'Teknologi Kesehatan',
    'Perawatan Kulit',
    'Tips Kecantikan',
    'Produk Review',
    'Berita Klinik'
];

// --- KOMPONEN EDITOR TIP TAP ---
interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }}),
            Placeholder.configure({ placeholder: 'Mulai menulis artikel luar biasa Anda di sini...' }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-[var(--accent)] underline hover:opacity-80 cursor-pointer' }
            }),
            Highlight.configure({ multicolor: true }),
            Superscript,
            Subscript,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Image.configure({
                HTMLAttributes: { class: 'rounded-xl border border-[var(--glass-border)] max-w-full h-auto shadow-lg' }
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
        editorProps: {
            attributes: { 
                class: 'prose prose-invert prose-sm focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto p-6 bg-white/5 rounded-b-2xl border border-t-0 border-white/10 text-[var(--text-main)]' 
            },
        },
    });

    if (!editor) return null;

    const getBtnClass = (isActive: boolean) => `p-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive ? 'bg-[var(--accent)] text-white shadow-md' : 'hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`;

    const addImage = () => {
        const url = window.prompt('URL Gambar');
        if (url) { editor.chain().focus().setImage({ src: url }).run(); }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL Link', previousUrl);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex gap-1 p-2 border-b border-white/10 bg-white/5 flex-wrap items-center">
                <div className="flex gap-1 mr-2">
                    <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={getBtnClass(false)} title="Undo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 7"/></svg>
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={getBtnClass(false)} title="Redo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 7"/></svg>
                    </button>
                </div>
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={getBtnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getBtnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={getBtnClass(editor.isActive('bulletList'))} title="List">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={getBtnClass(editor.isActive('blockquote'))} title="Quote">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </button>

                <div className="w-px h-5 bg-white/10 mx-1"></div>
                
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={getBtnClass(editor.isActive('bold'))} title="Bold">B</button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={getBtnClass(editor.isActive('italic'))} title="Italic">I</button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={getBtnClass(editor.isActive('underline'))} title="Underline">U</button>
                <button type="button" onClick={setLink} className={getBtnClass(editor.isActive('link'))} title="Link">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </button>
                <button type="button" onClick={addImage} className={getBtnClass(false)} title="Image">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

// --- KOMPONEN UTAMA ---
const Dashboard = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isArticleModalOpen, setArticleModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isImagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({ status: 'Draft', content: '' });
    
    // State khusus untuk file gambar yang akan diupload
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // --- FETCH DATA FROM API ---
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch(`${API_BASE_URL}/crm/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            const mappedData = data.map((u: any) => ({ id: u.id, name: u.name, email: u.email, phone: u.tel }));
            setPatients(mappedData);
        } catch (error) { console.error("Error fetching users:", error); } 
        finally { setLoadingUsers(false); }
    };

    const fetchArticles = async () => {
        setLoadingArticles(true);
        try {
            const response = await fetch(`${API_BASE_URL}/blog/list`); 
            if (!response.ok) throw new Error('Failed to fetch articles');
            const data = await response.json();
            const mappedData = data.map((a: any) => ({
                id: a.id, title: a.title, slug: a.slug, content: a.content, category: a.category,
                tag: a.tag, 
                // Gabungkan base URL dengan path dari DB
                image: `${API_BASE_URL}/${a.image}`, 
                status: a.is_published ? 'Published' : 'Draft', 
                published_at: a.published_at
            }));
            setArticles(mappedData);
        } catch (error) { console.error("Error fetching articles:", error); } 
        finally { setLoadingArticles(false); }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.classList.toggle('light', initialTheme === 'light');
        fetchUsers();
        fetchArticles();
        const handleResize = () => { if (window.innerWidth >= 768) setIsSidebarOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    // --- CRUD HANDLERS ---
    
    // Handler untuk Upload Gambar
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file); // Simpan objek file asli
            const previewUrl = URL.createObjectURL(file); // Buat URL untuk preview
            setCurrentArticle(prev => ({ ...prev, image: previewUrl }));
        }
    };

    const handleSaveArticle = async () => {
        if (!currentArticle.title) return alert("Judul wajib diisi!");
        
        // Gunakan FormData untuk mengirim file dan teks sekaligus
        const formData = new FormData();
        formData.append('title', currentArticle.title);
        formData.append('category', currentArticle.category || 'Uncategorized');
        formData.append('tag', currentArticle.tag || '');
        formData.append('content', currentArticle.content || '');
        formData.append('is_published', String(currentArticle.status === 'Published'));
        
        // Jika ada file gambar baru, append file. 
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (!currentArticle.id) {
            // Jika create baru, gambar wajib
            return alert("Gambar wajib diisi!");
        }

        try {
            let response;
            if (currentArticle.id) {
                // UPDATE (PUT)
                response = await fetch(`${API_BASE_URL}/blog/${currentArticle.id}`, {
                    method: 'PUT',
                    body: formData,
                });
            } else {
                // CREATE (POST)
                response = await fetch(`${API_BASE_URL}/blog/create`, {
                    method: 'POST',
                    body: formData,
                });
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to save article');
            }
            
            setArticleModalOpen(false);
            setCurrentArticle({ status: 'Draft', content: '' });
            setImageFile(null);
            fetchArticles();
        } catch (error: any) {
            console.error(error);
            alert(`Gagal menyimpan artikel: ${error.message}`);
        }
    };

    const handleDeleteArticle = async (id: number) => {
        if(!confirm('Hapus artikel ini?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/blog/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            fetchArticles();
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus artikel");
        }
    };

    const openDetailModal = (article: Article) => { setCurrentArticle(article); setDetailModalOpen(true); };
    const openEditModal = (article: Article) => { 
        setCurrentArticle(article); 
        setImageFile(null); 
        setArticleModalOpen(true); 
    };
    const openImagePreview = (url: string) => { setPreviewImageUrl(url); setImagePreviewOpen(true); };

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const stripHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent || "";
    const editorKey = `${currentArticle.id || 'new'}-${isArticleModalOpen}`;

    return (
        <div className="min-h-screen text-[var(--text-main)] flex relative overflow-x-hidden transition-colors duration-500">
            
            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0 bg-[var(--bg-deep)] transition-colors duration-700" />
            <div className="fixed inset-0 z-0 overflow-hidden opacity-60">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-[80px] animate-blob opacity-40"></div>
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 opacity-30"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000 opacity-30"></div>
            </div>
            
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme} setTheme={handleThemeChange} />

            <main className="flex-1 p-4 md:p-8 relative z-10 w-full md:ml-72 transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] hover:bg-white/10 transition-colors backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold capitalize tracking-tight text-[var(--text-main)]">{activeMenu === 'dashboard' ? 'Overview' : activeMenu}</h1>
                            <p className="text-[var(--text-secondary)] text-base mt-1">Selamat datang kembali, Admin.</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA - DASHBOARD */}
                {activeMenu === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-down">
                        {[ 
                            { label: 'Total Pasien', value: patients.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }, 
                            { label: 'Artikel Terbit', value: articles.filter(a => a.status === 'Published').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }, 
                            { label: 'Draft Artikel', value: articles.filter(a => a.status === 'Draft').length, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' } 
                        ].map((card, i) => (
                            <div key={i} className="group relative p-[1px] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full bg-[var(--card-bg)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] shadow-lg">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-[var(--accent)]/20 transition-colors"></div>
                                    <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-4 font-medium">{card.label}</p>
                                    <div className="flex justify-between items-end">
                                        <h3 className="text-5xl font-bold text-[var(--text-main)]">{card.value}</h3>
                                        <div className="p-3 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                                            <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={card.icon}></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CONTENT AREA - ARTICLES TABLE */}
                {activeMenu === 'articles' && (
                    <div className="relative bg-[var(--card-bg)]/40 backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] animate-fade-in-down shadow-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-50"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="relative w-full md:w-auto md:flex-1 md:max-w-md group">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input type="text" placeholder="Cari artikel..." className="w-full py-3 !pl-11 pr-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-[var(--accent)] focus:bg-white/10 transition-all outline-none text-[var(--text-main)]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                            </div>
                            <button onClick={() => { setCurrentArticle({ status: 'Draft', content: '' }); setImageFile(null); setArticleModalOpen(true); }} className="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all flex items-center justify-center gap-2 btn-primary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Tambah Artikel
                            </button>
                        </div>
                        
                        {loadingArticles ? (
                            <div className="text-center py-10 text-[var(--text-secondary)]">Memuat data...</div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-black/10">
                                        <tr className="border-b border-[var(--glass-border)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                            <th className="py-4 px-4 font-medium w-[100px]">Gambar</th>
                                            <th className="py-4 px-4 font-medium min-w-[200px]">Info</th>
                                            <th className="py-4 px-4 font-medium min-w-[250px]">Preview</th>
                                            <th className="py-4 px-4 font-medium">Kategori</th>
                                            <th className="py-4 px-4 font-medium">Status</th>
                                            <th className="py-4 px-4 font-medium text-right w-[120px]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)]">
                                        {filteredArticles.map((article) => (
                                            <tr key={article.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <img src={article.image} alt={article.title} className="w-20 h-14 object-cover rounded-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md" onClick={() => openImagePreview(article.image)}/>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-medium text-[var(--text-main)] leading-tight">{article.title}</div>
                                                    <div className="text-[var(--text-secondary)] text-xs mt-1 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                        {article.slug}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-[var(--text-secondary)] text-sm">
                                                    <div className="line-clamp-2 font-light">{stripHtml(article.content)}</div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-[var(--text-main)]">{article.category}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${article.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{article.status}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openDetailModal(article)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)] group" title="Detail">
                                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button onClick={() => openEditModal(article)} className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-blue-400 group" title="Edit">
                                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteArticle(article.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-red-400 group" title="Hapus">
                                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* CONTENT AREA - USERS TABLE */}
                {activeMenu === 'users' && (
                     <div className="relative bg-[var(--card-bg)]/40 backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] animate-fade-in-down shadow-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-50"></div>
                         <div className="flex justify-between items-center mb-6">
                             <div className="relative flex-1 max-w-xs group">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input type="text" placeholder="Cari pasien..." className="w-full py-3 !pl-11 pr-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none transition-all text-[var(--text-main)]" />
                            </div>
                        </div>
                        {loadingUsers ? (
                             <div className="text-center py-10 text-[var(--text-secondary)]">Memuat data pasien...</div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                                <table className="w-full text-left">
                                    <thead className="bg-black/10">
                                        <tr className="border-b border-[var(--glass-border)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                            <th className="py-3 px-4 font-medium">Nama</th>
                                            <th className="py-3 px-4 font-medium">Email</th>
                                            <th className="py-3 px-4 font-medium">No. Telepon</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)]">
                                        {patients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-medium text-[var(--text-main)]">{patient.name}</td>
                                                <td className="py-4 px-4 text-[var(--text-secondary)]">{patient.email}</td>
                                                <td className="py-4 px-4 text-[var(--text-secondary)]">{patient.phone}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODALS */}

            {/* IMAGE PREVIEW MODAL */}
            {isImagePreviewOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 cursor-pointer animate-fade-in" onClick={() => setImagePreviewOpen(false)}>
                     <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 border border-white/10 rounded-full hover:bg-white/10 transition-all z-10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <img src={previewImageUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10" />
                </div>
            )}

            {/* CREATE/EDIT ARTICLE MODAL */}
            {isArticleModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] overflow-y-auto py-10 px-4">
                    <div className="relative w-full max-w-3xl mx-auto my-6 md:my-6 animate-fade-in-down">
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            
                            <div className="relative bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 border-b border-white/10">
                                <button onClick={() => setArticleModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[var(--accent)]/20 rounded-xl border border-[var(--accent)]/30">
                                        <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-semibold text-white">
                                            {currentArticle.id ? 'Edit Artikel' : 'Buat Artikel Baru'}
                                        </h3>
                                        <p className="text-sm text-white/50 mt-0.5">Isi detail artikel di bawah ini</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider font-medium">Judul Artikel</label>
                                    <input 
                                        type="text" 
                                        className="w-full py-3 px-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all text-white placeholder-white/30" 
                                        value={currentArticle.title || ''} 
                                        onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})} 
                                        placeholder="Contoh: Manfaat Skincare untuk Kulit"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider font-medium">Kategori</label>
                                        <select 
                                            className="w-full py-3 px-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none appearance-none cursor-pointer text-white" 
                                            value={currentArticle.category || ''} 
                                            onChange={(e) => setCurrentArticle({...currentArticle, category: e.target.value})}
                                        >
                                            <option value="" disabled className="text-gray-800">Pilih Kategori</option>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="text-gray-800">{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider font-medium">Tags</label>
                                        <input 
                                            type="text" 
                                            className="w-full py-3 px-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none text-white placeholder-white/30" 
                                            value={currentArticle.tag || ''} 
                                            onChange={(e) => setCurrentArticle({...currentArticle, tag: e.target.value})} 
                                            placeholder="Pisahkan dengan koma (,)"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload Area */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider font-medium">Gambar Utama</label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[var(--accent)]/50 hover:bg-white/5 transition-all group relative overflow-hidden">
                                        
                                        {currentArticle.image ? (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                                                <img src={currentArticle.image} alt="Preview" className="h-full w-full object-contain p-2"/>
                                                <div className="absolute bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">Klik untuk ganti</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center relative z-0">
                                                <svg className="w-10 h-10 mb-3 text-white/40 group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                <p className="mb-2 text-sm text-white/60"><span className="font-semibold text-[var(--accent)]">Klik untuk upload</span> atau drag & drop</p>
                                                <p className="text-xs text-white/40">PNG, JPG atau GIF</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider font-medium">Konten</label>
                                    <RichTextEditor key={editorKey} content={currentArticle.content || ''} onChange={(html) => setCurrentArticle(prev => ({ ...prev, content: html }))} />
                                </div>

                                <div className="flex items-center gap-3 pt-2 bg-white/5 p-3 rounded-xl border border-white/10">
                                    <input type="checkbox" id="publishStatus" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer" checked={currentArticle.status === 'Published'} onChange={(e) => setCurrentArticle({...currentArticle, status: e.target.checked ? 'Published' : 'Draft'})}/>
                                    <label htmlFor="publishStatus" className="text-sm cursor-pointer select-none text-white/80">Publish sekarang?</label>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-black/10 flex justify-end gap-3">
                                <button onClick={() => setArticleModalOpen(false)} className="py-2.5 px-5 rounded-xl text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">Batal</button>
                                <button onClick={handleSaveArticle} className="py-2.5 px-5 rounded-xl text-sm bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[var(--accent)]/20">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Simpan Artikel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL ARTICLE MODAL */}
            {isDetailModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start md:items-center justify-center overflow-y-auto animate-fade-in py-8 px-4">
                    <div className="relative bg-[var(--card-bg)]/90 backdrop-blur-xl p-8 rounded-2xl w-full max-w-2xl shadow-2xl my-auto md:my-8 border border-[var(--glass-border)]">
                        <button onClick={() => setDetailModalOpen(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div className="flex gap-2 text-xs mb-4">
                            <span className="px-3 py-1 bg-black/20 rounded-full text-[var(--text-secondary)] border border-[var(--glass-border)]">{currentArticle.category}</span>
                            <span className={`px-3 py-1 rounded-full border ${currentArticle.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{currentArticle.status}</span>
                        </div>

                        <h3 className="font-display text-3xl md:text-4xl mb-2 leading-tight text-[var(--text-main)]">{currentArticle.title}</h3>
                        <p className="text-[var(--text-secondary)] text-xs mb-6 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            {currentArticle.slug}
                        </p>
                        
                        {currentArticle.image && (
                            <img src={currentArticle.image} alt={currentArticle.title} className="w-full h-64 object-cover rounded-xl mb-6 border border-[var(--glass-border)] cursor-pointer hover:opacity-90 transition-opacity shadow-lg" onClick={() => openImagePreview(currentArticle.image || '')}/>
                        )}
                        
                        <div className="prose prose-sm max-w-none text-[var(--text-main)] leading-relaxed" dangerouslySetInnerHTML={{ __html: currentArticle.content || '' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;