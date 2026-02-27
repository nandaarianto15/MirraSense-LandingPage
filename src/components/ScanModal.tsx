import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PoseKey = 'center' | 'right' | 'left';

const poseOrder: PoseKey[] = ['center', 'right', 'left'];

const poseLabel: Record<PoseKey, string> = {
  left: 'Sisi Kiri',
  center: 'Sisi Tengah',
  right: 'Sisi Kanan',
};

const poseInstruction: Record<PoseKey, string> = {
  left: 'Putar kepala sedikit ke kiri dan posisikan wajah di dalam bingkai.',
  center: 'Luruskan wajah ke kamera dan sejajarkan dengan bingkai.',
  right: 'Putar kepala sedikit ke kanan dan posisikan wajah di dalam bingkai.',
};

// ============================================================
// KONSTANTA UI
// ============================================================

const SEVERITY_ORDER = ['sangat ringan', 'ringan', 'sedang', 'berat', 'sangat berat'];

const SEVERITY_LABEL: Record<string, string> = {
  "sangat ringan": "Sangat Ringan",
  "ringan": "Ringan",
  "sedang": "Sedang",
  "berat": "Berat",
  "sangat berat": "Sangat Berat",
};

const SEVERITY_COLOR_DOT: Record<string, string> = {
  "sangat ringan": "#4ade80",
  "ringan": "#22c55e",
  "sedang": "#facc15",
  "berat": "#fb923c",
  "sangat berat": "#ef4444",
};

const SEVERITY_COLOR_BG: Record<string, string> = {
  "sangat ringan": "bg-green-500/10 border-green-500/20",
  "ringan": "bg-green-500/10 border-green-500/20",
  "sedang": "bg-yellow-500/10 border-yellow-500/20",
  "berat": "bg-orange-500/10 border-orange-500/20",
  "sangat berat": "bg-red-500/10 border-red-500/20",
};

const LABEL_DESC: Record<string, string> = {
  "Jerawat": "Jerawat terjadi saat folikel rambut tersumbat oleh minyak dan sel kulit mati.",
  "Komedo Hitam": "Komedo hitam adalah pori-pori yang tersumbat dan teroksidasi menjadi hitam.",
  "Komedo Putih": "Komedo putih adalah pori-pori tersumbat yang tertutup lapisan tipis kulit.",
  "Flek Hitam": "Hiperpigmentasi kulit yang biasanya disebabkan oleh paparan sinar matahari.",
  "Kerutan": "Lipatan halus yang muncul seiring bertambahnya usia atau paparan UV.",
  "Kantung Mata": "Pembengkakan ringan di bawah mata, sering akibat kelelahan.",
  "Kulit Berminyak": "Kondisi kulit memproduksi sebum berlebih.",
  "Kulit Kering": "Kekurangan kelembaban alami, terasa kasar.",
  "Pori-pori Besar": "Pori-pori tampak jelas dan melebar.",
  "Kemerahan Kulit": "Tanda iritasi atau peradangan.",
};

// Interface
interface SummaryItem {
  label: string;
  count: number;
  avg_confidence: number;
  severity: string;
  avg_severity_percentage: number;
}

interface HealthEvaluation {
  health_score: number;
  health_status: string;
  main_concerns: string[];
  message: string;
}

interface AnalysisResult {
  health_evaluation: HealthEvaluation;
  poses: {
    [key: string]: {
      summary: SummaryItem[];
      severity_counts: Record<string, number>;
    };
  };
}

// ============================================================
// KOMPONEN UI
// ============================================================

// 1. Mini Circle Component (Untuk Accordion)
const MiniCircle = ({ score, severity }: { score: number; severity: string }) => {
  const color = SEVERITY_COLOR_DOT[severity] || "#fff";
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{Math.round(score)}</span>
      </div>
    </div>
  );
};

// 2. SeveritySummaryCard
const SeveritySummaryCard = ({ severityCount, totalFindings }: { severityCount: Record<string, number>; totalFindings: number }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
      <h4 className="text-white font-bold text-sm mb-1">Ringkasan Tingkat Keparahan</h4>
      <p className="text-white/60 text-xs mb-3">Distribusi temuan berdasarkan tingkat keparahan.</p>
      <div className="space-y-2">
        {SEVERITY_ORDER.map((sev) => {
          const count = severityCount[sev] ?? 0;
          const pct = totalFindings > 0 ? Math.round((count / totalFindings) * 100) : 0;
          const bgClass = SEVERITY_COLOR_BG[sev] || "bg-white/10";
          const dotColor = SEVERITY_COLOR_DOT[sev] || "#fff";
          return (
            <div key={sev} className={`flex items-center gap-3 p-2 rounded-lg border ${bgClass}`}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dotColor }}></div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">{SEVERITY_LABEL[sev]}: {count}</p>
                <p className="text-white/60 text-[10px]">{pct}% dari total</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. SummaryAccordion
const SummaryAccordion = ({
  aggregatedSummary,
  expandedLabel,
  setExpandedLabel,
  isPremium,
}: {
  aggregatedSummary: SummaryItem[];
  expandedLabel: string | null;
  setExpandedLabel: (s: string | null) => void;
  isPremium: boolean;
}) => {
  if (aggregatedSummary.length === 0) {
    return <p className="text-center text-white/60 text-sm py-4">Tidak ada temuan signifikan.</p>;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
      <h4 className="text-white font-bold text-sm mb-1">Hasil Analisa</h4>
      <p className="text-white/60 text-xs mb-3">Ketuk untuk melihat detail.</p>
      <div className="space-y-2">
        {aggregatedSummary.map((item) => {
          const isOpen = expandedLabel === item.label;
          const pct = item.avg_severity_percentage;
          return (
            <div key={item.label} className="rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition text-left"
                onClick={() => setExpandedLabel(isOpen ? null : item.label)}
              >
                <div className="flex-1 mr-2">
                  <p className="text-white text-xs font-medium">
                    {item.label} – <span className="text-[#FF8A9B]">{SEVERITY_LABEL[item.severity]}</span>
                  </p>
                  <p className="text-white/60 text-[10px]">Terdeteksi {item.count} kali</p>
                </div>
                <MiniCircle score={pct} severity={item.severity} />
                <svg className={`w-4 h-4 text-white/60 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && isPremium && (
                <div className="p-3 bg-black/20 border-t border-white/10">
                  <p className="text-white/80 text-xs leading-relaxed">
                    {LABEL_DESC[item.label] || "Temuan ini berkaitan dengan kondisi permukaan kulit yang perlu dipantau."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-white/40 text-[10px] mt-3 text-center">Catatan: Analisa berbasis AI, bukan diagnosis medis.</p>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ScanModal = ({ isOpen, onClose }: ScanModalProps) => {
  const [step, setStep] = useState(1);
  const [consent, setConsent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [score, setScore] = useState(0);

  const [capturedFiles, setCapturedFiles] = useState<Record<PoseKey, File | null>>({
    center: null, left: null, right: null
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // PERBAIKAN: Variabel showShareMenu dihapus karena tidak digunakan
  const [isLoading, setIsLoading] = useState(false);

  // Funcs
  const resetModal = useCallback(() => {
    setStep(1); setConsent(false); setScore(0); setCurrentPoseIndex(0);
    setHasPermission(null); 
    // PERBAIKAN: setShowShareMenu(false) dihapus
    setCapturedFiles({ center: null, left: null, right: null });
    setFormData({ name: '', email: '', phone: '' });
    setAnalysisResult(null);
    setExpandedLabel(null);
  }, []);

  const disableCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const enableCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 1280 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) { console.error("Gagal mengakses kamera:", err); setHasPermission(false); }
  }, []);

  const resetScan = useCallback(() => setCurrentPoseIndex(0), []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white z-50';
    flash.style.borderRadius = 'inherit';
    const container = document.getElementById('camera-container');
    if (container) container.appendChild(flash);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${poseOrder[currentPoseIndex]}.jpg`, { type: 'image/jpeg' });
        setCapturedFiles(prev => ({ ...prev, [poseOrder[currentPoseIndex]]: file }));
        setTimeout(() => {
          if (flash && flash.parentNode) flash.remove();
          if (currentPoseIndex < poseOrder.length - 1) setCurrentPoseIndex(prev => prev + 1);
          else setStep(3);
        }, 200);
      }
    }, 'image/jpeg', 0.9);
  }, [currentPoseIndex]);

  const animateResult = useCallback((target: number) => {
    let c = 0;
    const interval = setInterval(() => {
      c++;
      if (c >= target) clearInterval(interval);
      setScore(c);
      const circle = document.getElementById('score-circle');
      if (circle) circle.style.strokeDashoffset = `${283 - (283 * c) / 100}`;
    }, 20);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!capturedFiles.left && !capturedFiles.center && !capturedFiles.right) {
      alert("Error: Tidak ada foto."); setIsLoading(false); return;
    }

    try {
      try {
        const registerRes = await fetch('http://localhost:8000/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            tel: formData.phone
          })
        });

        if (!registerRes.ok) {
          console.warn("Gagal menyimpan data user ke database (mungkin email sudah terdaftar).");
        } else {
          console.log("Data user berhasil disimpan.");
        }
      } catch (dbError) {
        console.error("Error koneksi ke endpoint register:", dbError);
      }

      // 2. Proses Analisis Wajah & Notifikasi
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('email', formData.email);
      apiFormData.append('phone', formData.phone); 
      
      if (capturedFiles.left) apiFormData.append('left', capturedFiles.left);
      if (capturedFiles.center) apiFormData.append('center', capturedFiles.center);
      if (capturedFiles.right) apiFormData.append('right', capturedFiles.right);

      const response = await fetch('http://localhost:8000/analyze-face', { method: 'POST', body: apiFormData });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Gagal memproses analisis");
      }
      
      const result = await response.json();
      
      setAnalysisResult(result);
      setStep(4);
      animateResult(Math.round(result.health_evaluation?.health_score || 75));

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat analisis.");
    } finally { setIsLoading(false); }
  }, [formData, capturedFiles, animateResult]);

  useEffect(() => { if (step === 2) enableCamera(); else disableCamera(); return () => disableCamera(); }, [step, enableCamera, disableCamera]);
  useEffect(() => { 
    if (!isOpen) { 
        disableCamera(); 
        // PERBAIKAN: setShowShareMenu(false) dihapus
        resetModal(); 
    } 
}, [isOpen, disableCamera, resetModal]);

  if (!isOpen) return null;

  // Aggregation Logic
  const getAggregatedData = () => {
    if (!analysisResult) return { summary: [], severityCount: {}, totalFindings: 0 };
    const combinedSummaryMap: Record<string, SummaryItem> = {};
    const combinedSeverityCount: Record<string, number> = {};
    SEVERITY_ORDER.forEach(s => combinedSeverityCount[s] = 0);
    Object.values(analysisResult.poses).forEach(poseData => {
      if (poseData.severity_counts) {
        Object.entries(poseData.severity_counts).forEach(([sev, count]) => {
          combinedSeverityCount[sev] = (combinedSeverityCount[sev] || 0) + count;
        });
      }
      if (poseData.summary) {
        poseData.summary.forEach(item => {
          if (!combinedSummaryMap[item.label]) {
            combinedSummaryMap[item.label] = { ...item };
          } else {
            const existing = combinedSummaryMap[item.label];
            existing.count += item.count;
            existing.avg_severity_percentage = Math.max(existing.avg_severity_percentage, item.avg_severity_percentage);
            if (SEVERITY_ORDER.indexOf(item.severity) > SEVERITY_ORDER.indexOf(existing.severity)) {
              existing.severity = item.severity;
            }
          }
        });
      }
    });
    const totalFindings = Object.values(combinedSeverityCount).reduce((a, b) => a + b, 0);
    const summaryArray = Object.values(combinedSummaryMap).sort((a, b) => b.count - a.count);
    return { summary: summaryArray, severityCount: combinedSeverityCount, totalFindings };
  };

  const { summary: aggregatedSummary, severityCount: totalSeverityCounts, totalFindings } = getAggregatedData();
  const progress = ((currentPoseIndex + 1) / poseOrder.length) * 100;
  const currentPose = poseOrder[currentPoseIndex];

  return (
    <div className="modal-overlay active" onClick={() => { onClose(); resetModal(); }}>
      <div className="modal-content w-full max-w-lg mx-4 relative" onClick={e => e.stopPropagation()}>
        
        <button 
            onClick={() => { onClose(); resetModal(); }} 
            className="absolute top-4 right-4 z-[60] w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm text-white transition-all"
            style={{ transform: 'translate(50%, -50%)' }}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="p-2">
            {/* Step 1: Consent */}
            {step === 1 && (
            <div className="modal-step active glass-panel rounded-3xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8A9B] to-[#FFFFFF] flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="font-display text-3xl font-medium mb-3">Persetujuan Pengguna</h3>
                <p className="text-muted text-sm mb-6">Sebelum memulai scan, harap setujui syarat dan ketentuan.</p>
                <label className="flex items-start gap-3 mb-8 cursor-pointer text-left group">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 rounded accent-[#FF8A9B]" />
                <span className="text-sm opacity-70">Saya menyetujui syarat dan ketentuan.</span>
                </label>
                <button disabled={!consent} onClick={() => setStep(2)} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Lanjutkan</button>
            </div>
            )}

            {/* Step 2: Camera */}
            {step === 2 && (
            <div className="modal-step active glass-panel rounded-3xl p-4">
                <div className="flex justify-between items-center mb-3 relative z-20">
                <div className="flex-1">
                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                    <div className="bg-[#FF8A9B] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-white/70">Langkah {currentPoseIndex + 1}/3 • {poseLabel[currentPose]}</p>
                </div>
                <button onClick={resetScan} className="ml-4 flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[10px] text-white hover:bg-white/20 transition">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Reset
                </button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 text-center">
                <h4 className="font-bold text-white text-sm mb-1">{poseLabel[currentPose]}</h4>
                <p className="text-white/60 text-xs">{poseInstruction[currentPose]}</p>
                </div>
                <div id="camera-container" className="aspect-[3/4] rounded-2xl relative overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                {hasPermission === false && ( <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 p-4 text-center"> <p className="text-white text-sm mb-4">Akses kamera diblokir.</p> <button onClick={enableCamera} className="btn-secondary text-xs py-2 px-4">Coba Lagi</button> </div> )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-52 h-72 rounded-full border-2 border-[#FF8A9B] opacity-70 shadow-[0_0_15px_rgba(255,138,155,0.3)]"></div>
                </div>
                {hasPermission && <div className="scan-line"></div>}
                </div>
                <div className="mt-4 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6 flex-1">Kembali</button>
                <button onClick={handleCapture} className="btn-primary py-3 px-6 flex-[2]"> {currentPoseIndex < poseOrder.length - 1 ? 'Capture' : 'Selesai Scan'} </button>
                </div>
            </div>
            )}

            {/* Step 3: Form */}
            {step === 3 && (
            <div className="modal-step active glass-panel rounded-3xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,138,155,0.1)] flex items-center justify-center mx-auto mb-4 border border-[#FF8A9B]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 className="font-display text-2xl font-medium text-[#FF8A9B]">Hampir Selesai</h3>
                <p className="text-muted text-sm mt-2 mb-6">Masukkan data untuk melihat hasil.</p>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="Nama Lengkap" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="Email" />
                <input type="tel" required maxLength={15}value={formData.phone} onChange={(e) => { 
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
                    setFormData({...formData, phone: value});
                  }} 
                  className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="No. WhatsApp" inputMode="numeric" />
                
                <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isLoading ? ( <> <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <span>Memproses...</span> </> ) : 'Lihat Hasil Analisis'}
                </button>
                </form>
            </div>
            )}

            {/* Step 4: Result */}
            {step === 4 && (
            <div className="modal-step active glass-panel rounded-3xl p-6 relative overflow-hidden max-h-[85vh] overflow-y-auto">
                <div className="text-center mb-6"><h3 className="font-display text-2xl font-medium text-[#FF8A9B]">Hasil Analisis AI</h3></div>
                
                {/* Notification */}
                <div className="mb-6 bg-gradient-to-r from-[#FF8A9B]/20 to-transparent p-4 rounded-xl border border-[#FF8A9B]/30 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div>
                    <p className="text-white text-sm font-medium">Rahasia kulitmu sudah terkirim!</p>
                    <p className="text-white/60 text-xs mt-1">Cek WhatsApp & Email untuk detail.</p>
                    </div>
                </div>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-6">
                <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-4 border-[rgba(255,138,155,0.2)] bg-[rgba(255,138,155,0.05)]">
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="font-display text-5xl font-bold text-[#FF8A9B]">{score}</span>
                        <span className="text-[#FF8A9B] opacity-60 text-xs">Skor Kesehatan</span>
                    </div>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle id="score-circle" cx="50" cy="50" r="45" stroke="#FF8A9B" strokeWidth="3" strokeDasharray="283" strokeDashoffset="283" strokeLinecap="round" fill="none"/>
                    </svg>
                </div>
                </div>

                {/* Status Global */}
                {analysisResult && (
                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                    <p className="text-white/60 text-xs mb-1">Status Kulit</p>
                    <p className="text-white font-bold capitalize">{analysisResult.health_evaluation?.health_status || "Tidak Diketahui"}</p>
                </div>
                )}

                {/* Severity Summary Card */}
                <SeveritySummaryCard severityCount={totalSeverityCounts} totalFindings={totalFindings} />

                {/* Summary Accordion */}
                <SummaryAccordion 
                aggregatedSummary={aggregatedSummary} 
                expandedLabel={expandedLabel} 
                setExpandedLabel={setExpandedLabel} 
                isPremium={true} 
                />
                
                <button onClick={() => { onClose(); resetModal(); }} className="w-full btn-secondary border-[#FF8A9B] text-[#FF8A9B] mb-3">Selesai</button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScanModal;