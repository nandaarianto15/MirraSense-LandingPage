import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScanModal from './components/ScanModal';
import CanvasBackground from './components/CanvasBackground';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic untuk Scroll Reveal & Counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Counter logic
            if (entry.target.classList.contains('counter')) {
              const target = parseInt((entry.target as HTMLElement).dataset.target || '0');
              let count = 0;
              const interval = setInterval(() => {
                count += target / 50;
                if (count >= target) {
                  (entry.target as HTMLElement).innerText = target.toString();
                  clearInterval(interval);
                } else {
                  (entry.target as HTMLElement).innerText = Math.floor(count).toString();
                }
              }, 30);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .counter').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Logic untuk Generate Stars
  useEffect(() => {
    const bgDecor = document.getElementById('bg-decorations');
    if (bgDecor) {
      bgDecor.querySelectorAll('.star').forEach(s => s.remove());
      const count = window.innerWidth < 768 ? 15 : 25;
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        bgDecor.appendChild(star);
      }
    }
  }, []);

  return (
    <div className="relative">
      <CanvasBackground />
      
      {/* Background Decorations */}
      <div id="bg-decorations" className="bg-decorations">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <Navbar openModal={() => setIsModalOpen(true)} />

      <main className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-screen relative overflow-hidden flex items-center pt-20 sm:pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 items-center">
              <div className="space-y-6 sm:space-y-8 relative z-10 text-center lg:text-left">
                <div className="reveal active">
                  {/* <div className="glass-panel px-4 sm:px-5 py-2 inline-flex items-center gap-2 sm:gap-3 rounded-full">
                    <span className="w-2 h-2 bg-[#FF8A9B] rounded-full animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-medium">AI-Powered Skin Diagnostics</span>
                  </div> */}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight reveal active delay-1">
                  Unlock the Future of<br/><span className="italic text-gradient">Your Skin's Secret</span>
                </h1>
                <p className="reveal active delay-2 text-base sm:text-lg opacity-70 max-w-xl leading-relaxed mx-auto lg:mx-0">
                  Platform diagnostik berbasis Artificial Intelligence yang merevolusi layanan perawatan kulit dengan akurasi presisi, real-time monitoring, dan personalisasi tanpa tertandingi.
                </p>
                <div className="reveal active delay-3 flex flex-wrap gap-3 sm:gap-5 justify-center lg:justify-start">
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm sm:text-base">Scan Kulitmu Sekarang</button>
                  {/* <button className="btn-secondary text-sm sm:text-base hidden sm:block">Pelajari Lebih Lanjut</button> */}
                </div>
                <div className="reveal active delay-4 flex items-center justify-center lg:justify-start gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-[rgba(255,255,255,0.1)] mt-6 sm:mt-8">
                  <div>
                    <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#FF8A9B] counter" data-target="98">0</div>
                    <div className="text-[10px] sm:text-xs opacity-50 mt-1">Akurasi Diagnostik</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#FF8A9B] counter" data-target="10">0</div>
                    <div className="text-[10px] sm:text-xs opacity-50 mt-1">Kondisi Teranalisis</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#FF8A9B]">24/7</div>
                    <div className="text-[10px] sm:text-xs opacity-50 mt-1">Monitoring Aktif</div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="reveal-scale active delay-2 relative flex justify-center lg:block">
                <div className="glass-panel p-2 sm:p-3 rounded-[24px] sm:rounded-[32px] relative overflow-hidden w-full sm:max-w-none">
                  <div className="aspect-[3/4] rounded-[20px] sm:rounded-[26px] relative overflow-hidden bg-gradient-to-br from-[rgba(136,14,49,0.2)] to-[rgba(0,0,0,0.2)]">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="relative w-[200px] sm:w-[260px] h-[400px] sm:h-[520px] rounded-[2rem] border-[5px] border-[rgba(30,30,30,0.9)] bg-[#0a0a0a] shadow-2xl overflow-hidden float">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-[#111] rounded-full z-20 flex items-center justify-center">
                          <div className="w-6 sm:w-8 h-2 sm:h-3 bg-[#222] rounded-full"></div>
                        </div>
                        <div className="w-full h-full bg-gradient-to-br from-[#880E31] to-[#4a0517] pt-8 sm:pt-10 px-2 sm:px-3 relative overflow-hidden">
                          <div className="flex justify-between items-center mb-3 sm:mb-4 px-2 text-white/60 text-[8px] sm:text-[10px]">
                            <span>9:41</span>
                            <div className="flex gap-1 items-center"><div className="w-4 sm:w-5 h-2 border border-current rounded-sm"></div></div>
                          </div>
                          <div className="text-center mt-1 sm:mt-2">
                            <div className="text-white/50 text-[8px] sm:text-[10px] uppercase tracking-wider mb-2">Skin Analysis</div>
                            <div className="relative w-20 sm:w-28 h-20 sm:h-28 mx-auto mb-3 sm:mb-4">
                              <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-white/10"></div>
                              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-[#FF8A9B]" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="87, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <span className="font-display text-xl sm:text-3xl font-bold">87</span>
                                <span className="text-[6px] sm:text-[8px] opacity-70">Score</span>
                              </div>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2 text-left px-1 sm:px-2">
                              <div className="bg-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex justify-between items-center border border-white/5">
                                <span className="text-white/60 text-[8px] sm:text-[10px]">Hydration</span>
                                <span className="text-[#FF8A9B] text-[8px] sm:text-[10px] font-bold">85%</span>
                              </div>
                              <div className="bg-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex justify-between items-center border border-white/5">
                                <span className="text-white/60 text-[8px] sm:text-[10px]">Texture</span>
                                <span className="text-[#FF8A9B] text-[8px] sm:text-[10px] font-bold">92%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="scan-line"></div>
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 glass-panel px-2 sm:px-3 py-1 text-[8px] sm:text-[10px] text-[#FF8A9B] tracking-wider rounded-full z-20">ANALYZING</div>
                  </div>
                  
                  <div className="mt-2 sm:mt-3 p-3 sm:p-4 glass-panel bg-[rgba(255,255,255,0.05)] rounded-[16px] sm:rounded-[20px]">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[10px] sm:text-xs opacity-40">Skin Health Score</div>
                        <div className="font-display text-lg sm:text-2xl font-medium">87<span className="text-[#FF8A9B]">/100</span></div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <div className="glass-panel px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] phone-tag-text rounded-full">Hydra</div>
                        <div className="glass-panel px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] phone-tag-text rounded-full">Smooth</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PROBLEM SECTION --- */}
        <section id="problem" className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full inline-block mb-4 sm:mb-6 reveal">Tantangan Utama</div>
              <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium reveal delay-1">
                Mengapa Metode Konvensional<br/><span className="italic text-gradient">Tidak Cukup?</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Card 1 */}
              <div className="glass-panel p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] reveal delay-1 group hover:border-[#FF8A9B] transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5" className="sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3">Diagnosis Awal Subjektif</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Pemeriksaan visual konvensional rentan terhadap subjektivitas. Dokter sulit mencapai standarisasi 100%.</p>
                <div className="text-2xl sm:text-3xl font-display text-[#FF8A9B]">67%</div>
                <div className="text-[10px] sm:text-xs opacity-40">Variasi Diagnosis</div>
              </div>
              {/* Card 2 */}
              <div className="glass-panel p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] reveal delay-2 group hover:border-[#FF8A9B] transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5" className="sm:w-7 sm:h-7 md:w-8 md:h-8">
                     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                   </svg>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3">Lost Visibility</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Kehilangan visibilitas terhadap kepatuhan pasien setelah meninggalkan klinik.</p>
                <div className="text-2xl sm:text-3xl font-display text-[#FF8A9B]">82%</div>
                <div className="text-[10px] sm:text-xs opacity-40">Tidak Patuh</div>
              </div>
              {/* Card 3 */}
              <div className="glass-panel p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] reveal delay-3 group hover:border-[#FF8A9B] transition-colors sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5" className="sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3">Kurangnya Bukti</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Sulit meyakinkan pasien dengan bukti visual kualitatif tanpa data terukur.</p>
                <div className="text-2xl sm:text-3xl font-display text-[#FF8A9B]">45%</div>
                <div className="text-[10px] sm:text-xs opacity-40">Retensi Rendah</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SOLUTION SECTION --- */}
        <section id="solution" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 md:gap-20 items-center">
              {/* Image/Animation Side */}
              <div className="reveal-left order-2 lg:order-1">
                <div className="glass-panel p-1.5 sm:p-2 rounded-[24px] sm:rounded-[32px]">
                  <div className="aspect-square rounded-[20px] sm:rounded-[26px] relative overflow-hidden flex items-center justify-center bg-[rgba(136,14,49,0.2)]">
                     <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-0">
                        <div className="absolute w-60 sm:w-80 h-60 sm:h-80 rounded-full pulse-ring border-2 border-[rgba(255,138,155,0.3)]"></div>
                        <div className="relative w-56 sm:w-72 h-56 sm:h-72 rounded-full overflow-hidden border-2 border-[rgba(255,138,155,0.5)] shadow-[0_0_40px_rgba(255,138,155,0.2)] z-10">
                            <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop" alt="Woman scanning face" className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#880E31]/60 via-transparent to-transparent"></div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              {/* Text Side */}
              <div className="reveal-right order-1 lg:order-2 space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full inline-block text-xs sm:text-sm">Solusi MIRRA SENSE</div>
                <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">
                  Clarity Beyond<br/><span className="italic text-gradient">The Mirror</span>
                </h2>
                <p className="text-muted leading-relaxed text-sm sm:text-base">
                  Platform diagnostik berbasis AI yang dirancang untuk merevolusi layanan klinik Anda. Ekosistem digital yang menjamin perawatan objektif, real-time, dan berbasis data.
                </p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex gap-3 sm:gap-5 items-start group cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-panel flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-[#FF8A9B]">
                      <span className="font-semibold text-[#FF8A9B] text-sm sm:text-base">01</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium mb-1 text-base sm:text-lg">Analisis Presisi AI</h4>
                      <p className="text-muted text-xs sm:text-sm">Menganalisis kondisi kulit dengan standarisasi AI.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-5 items-start group cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-panel flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-[#FF8A9B]">
                      <span className="font-semibold text-[#FF8A9B] text-sm sm:text-base">02</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium mb-1 text-base sm:text-lg">Patient Monitoring Hub</h4>
                      <p className="text-muted text-xs sm:text-sm">Pantau progres visual pasien dari jarak jauh.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-5 items-start group cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-panel flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-[#FF8A9B]">
                      <span className="font-semibold text-[#FF8A9B] text-sm sm:text-base">03</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium mb-1 text-base sm:text-lg">Bukti Hasil yang Meyakinkan</h4>
                      <p className="text-muted text-xs sm:text-sm">Tracking harian dan Before/After memperkuat brand trust.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section id="how-it-works" className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full inline-block mb-4 sm:mb-6 reveal">Cara Kerja</div>
              <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium reveal delay-1">
                Tiga Langkah Menuju<br/><span className="italic text-gradient">Kulit Sempurna</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Step 1 */}
              <div className="reveal delay-1 group h-full">
                <div className="glass-panel p-6 rounded-[28px] h-full flex flex-col hover:border-[#FF8A9B] transition-colors relative overflow-hidden">
                   <div className="anim-box">
                      <div className="radar-container">
                         <div className="radar-dot"></div>
                         <div className="radar-sweep"></div>
                      </div>
                   </div>
                   <div className="relative z-10 flex-1 flex flex-col">
                      <div className="font-display text-5xl text-white/5 absolute -top-2 -right-2">01</div>
                      <h3 className="font-display text-xl font-medium mb-3">Analisis Presisi</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4 flex-grow">Self-scan atau dipandu scan wajah. AI menganalisis lebih dari 10 kondisi kulit dan mengeluarkan Skor Kesehatan 0-100.</p>
                      <div className="flex items-center gap-2 text-[#FF8A9B] text-sm font-medium">
                        <span>Radar Detection</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                   </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="reveal delay-2 group h-full">
                <div className="glass-panel p-6 rounded-[28px] h-full flex flex-col hover:border-[#FF8A9B] transition-colors relative overflow-hidden">
                   <div className="anim-box">
                      <div className="ai-brain">
                         <div className="ai-center-node"></div>
                         <div className="ai-orbit"><div className="ai-node"></div></div>
                         <div className="ai-orbit"><div className="ai-node"></div></div>
                         <div className="ai-orbit"><div className="ai-node"></div></div>
                      </div>
                   </div>
                   <div className="relative z-10 flex-1 flex flex-col">
                      <div className="font-display text-5xl text-white/5 absolute -top-2 -right-2">02</div>
                      <h3 className="font-display text-xl font-medium mb-3">Rekomendasi Personal</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4 flex-grow">Aplikasi merekomendasikan layanan dan produk skincare. Data terekam ke Dashboard Klinik untuk ditinjau dokter.</p>
                      <div className="flex items-center gap-2 text-[#FF8A9B] text-sm font-medium">
                        <span>Neural Processing</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                   </div>
                </div>
              </div>
              {/* Step 3 */}
              <div className="reveal delay-3 group h-full sm:col-span-2 lg:col-span-1">
                <div className="glass-panel p-6 rounded-[28px] h-full flex flex-col hover:border-[#FF8A9B] transition-colors relative overflow-hidden">
                   <div className="anim-box">
                      <div className="chart-container">
                         <div className="chart-bar" style={{ animationDelay: '0s', height: '40%' }}></div>
                         <div className="chart-bar" style={{ animationDelay: '0.2s', height: '70%' }}></div>
                         <div className="chart-bar" style={{ animationDelay: '0.4s', height: '50%' }}></div>
                         <div className="chart-bar" style={{ animationDelay: '0.1s', height: '90%' }}></div>
                         <div className="chart-bar" style={{ animationDelay: '0.3s', height: '60%' }}></div>
                      </div>
                   </div>
                   <div className="relative z-10 flex-1 flex flex-col">
                      <div className="font-display text-5xl text-white/5 absolute -top-2 -right-2">03</div>
                      <h3 className="font-display text-xl font-medium mb-3">Monitoring Berkelanjutan</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4 flex-grow">Tracking Harian dan Before/After. Dokter memantau progres visual dan respons pasien dari jarak jauh.</p>
                      <div className="flex items-center gap-2 text-[#FF8A9B] text-sm font-medium">
                        <span>Real-time Analytics</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- BENEFITS SECTION --- */}
        <section id="benefits" className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium reveal">
                Transformasi Data Menjadi<br/><span className="italic text-gradient">Loyalitas Pasien</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {/* Benefit 1 - Tambahkan 'rounded-2xl' di sini */}
              <div className="glass-panel rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row gap-6 reveal delay-1 group hover:scale-[1.01] transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-[#FF8A9B]">Akurasi Maksimal</h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">Menguatkan objektivitas dokter melalui hasil analisis AI yang ilmiah.</p>
                </div>
              </div>
              {/* Benefit 2 */}
              <div className="glass-panel rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row gap-6 reveal delay-2 group hover:scale-[1.01] transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-[#FF8A9B]">Retensi Meningkat</h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">Bukti visual yang terukur mendorong repeat service dan loyalitas.</p>
                </div>
              </div>
              {/* Benefit 3 */}
              <div className="glass-panel rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row gap-6 reveal delay-3 group hover:scale-[1.01] transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-[#FF8A9B]">Wawasan Real-Time</h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">Dashboard analitik untuk strategi pemasaran dan pengembangan layanan.</p>
                </div>
              </div>
              {/* Benefit 4 */}
              <div className="glass-panel rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row gap-6 reveal delay-4 group hover:scale-[1.01] transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,138,155,0.1)] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-[#FF8A9B]">Skalabilitas Tanpa Batas</h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">Pantau kepatuhan pasien dari jarak jauh dengan efisien.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- COMPARISON SECTION --- */}
        <section id="comparison" className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium reveal delay-1">
                Konvensional vs<br/><span className="italic text-gradient">Mirra Sense</span>
              </h2>
            </div>
            
            {/* Tambahkan class 'comparison-table' untuk styling scrollbar khusus */}
            <div className="reveal-scale delay-2 glass-panel rounded-[24px] sm:rounded-[32px] overflow-x-auto scroll-touch relative comparison-table">
              <table className="w-full text-left min-w-[600px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)]">
                    {/* Kolom 1: Standar */}
                    <th className="p-4 sm:p-6 font-medium opacity-50 text-sm sm:text-base">Aspek</th>
                    
                    {/* Kolom 2 (Konvensional): Diubah paddingnya agar geser ke kanan */}
                    {/* Kita tambahkan pl-8 sm:pl-12 (padding left besar) */}
                    <th className="py-4 pr-4 pl-12 sm:py-6 sm:pr-6 sm:pl-12 font-medium opacity-50 text-sm sm:text-base">Konvensional</th>
                    
                    {/* Kolom 3: Standar */}
                    <th className="p-4 sm:p-6 font-medium text-[#FF8A9B] text-sm sm:text-base">Mirra Sense</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                    <td className="p-4 sm:p-6 font-medium text-sm sm:text-base">Akurasi</td>
                    {/* Kolom Konvensional: Padding kiri diperbesar */}
                    <td className="py-4 pr-4 pl-12 sm:py-6 sm:pr-6 sm:pl-12 text-muted text-xs sm:text-sm">Subjektif, eye-test</td>
                    <td className="p-4 sm:p-6 text-[#FF8A9B] text-xs sm:text-sm">Objektif & Presisi (AI/ML)</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                    <td className="p-4 sm:p-6 font-medium text-sm sm:text-base">Monitoring</td>
                    {/* Kolom Konvensional: Padding kiri diperbesar */}
                    <td className="py-4 pr-4 pl-12 sm:py-6 sm:pr-6 sm:pl-12 text-muted text-xs sm:text-sm">Manual, kunjungan fisik</td>
                    <td className="p-4 sm:p-6 text-[#FF8A9B] text-xs sm:text-sm">Otomatis & Jarak Jauh</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                    <td className="p-4 sm:p-6 font-medium text-sm sm:text-base">Tracking</td>
                    {/* Kolom Konvensional: Padding kiri diperbesar */}
                    <td className="py-4 pr-4 pl-12 sm:py-6 sm:pr-6 sm:pl-12 text-muted text-xs sm:text-sm">Kualitatif</td>
                    <td className="p-4 sm:p-6 text-[#FF8A9B] text-xs sm:text-sm">Kuantitatif & Visual</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-4 sm:p-6 font-medium text-sm sm:text-base">Data</td>
                    {/* Kolom Konvensional: Padding kiri diperbesar */}
                    <td className="py-4 pr-4 pl-12 sm:py-6 sm:pr-6 sm:pl-12 text-muted text-xs sm:text-sm">Sulit dianalisis</td>
                    <td className="p-4 sm:p-6 text-[#FF8A9B] text-xs sm:text-sm">Terpusat & Terstruktur</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] opacity-40 mt-3 md:hidden">Geser ke kanan untuk melihat detail</p>
          </div>
        </section>

        {/* --- GALLERY SECTION --- */}
        <section className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium reveal delay-1">
                Terintegrasi dengan<br/><span className="italic text-gradient">Klinik Anda</span>
              </h2>
              <p className="text-muted mt-4 reveal delay-2 text-sm sm:text-base">Platform yang dirancang untuk mendukung operasional klinik modern.</p>
            </div>
            
            <div className="gallery-grid">
              <div className="gallery-item reveal delay-1 group">
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" alt="Clinical Setup" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">In-Clinic Setup</span></div>
              </div>
              <div className="gallery-item reveal delay-2 group">
                <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop" alt="Doctor using tablet" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">Tablet Integration</span></div>
              </div>
              <div className="gallery-item reveal delay-3 group">
                <img src="https://cliniify.com/assets/img/how-face-recognition-improves-patient-experience.jpg" alt="Patient Scan" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">Quick Scan</span></div>
              </div>
              <div className="gallery-item reveal delay-4 group">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop" alt="Consultation" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">Consultation</span></div>
              </div>
              <div className="gallery-item reveal delay-1 group">
                <img src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=800&auto=format&fit=crop" alt="Device Close Up" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">High-Res Imaging</span></div>
              </div>
              <div className="gallery-item reveal delay-2 group">
                <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop" alt="Product Texture" />
                <div className="gallery-caption"><span className="text-white text-sm font-medium">Texture Analysis</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 sm:mb-8 reveal">
              Siap Membawa Klinik Anda<br/><span className="italic text-gradient">ke Era Digital?</span>
            </h2>
            <div className="reveal delay-1">
              <button onClick={() => setIsModalOpen(true)} className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4">Coba Demo Sekarang</button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <ScanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;