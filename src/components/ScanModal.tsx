import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import html2canvas from 'html2canvas';
import mirraLogo from '../assets/logo-text.png';
// TAMBAHKAN IMPORT LOTTIE DAN FILE ANIMASI
import Lottie from 'lottie-react';
import scanAnimation from '../assets/loading-animation/Face-ScanMirra.json';
// IMPORT DATA REKOMENDASI
import careRecommendations from '../recommendation/care-recommendations.json';

// ============================================================
// TIPE DATA & KONSTANTA
// ============================================================

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

const posePhotoLabel: Record<string, string> = {
  left: 'Kiri',
  center: 'Tengah',
  right: 'Kanan',
};

const poseInstruction: Record<PoseKey, string> = {
  left: 'Putar kepala sedikit ke kanan dan posisikan wajah di dalam bingkai.',
  center: 'Luruskan wajah ke kamera dan sejajarkan dengan bingkai.',
  right: 'Putar kepala sedikit ke kiri dan posisikan wajah di dalam bingkai.',
};

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

// ============================================================
// UPDATE: LABEL_DESC LENGKAP SESUAI BACKEND
// ============================================================
const LABEL_DESC: Record<string, string> = {
  "Jerawat": "Jerawat terjadi saat folikel rambut tersumbat oleh minyak dan sel kulit mati.",
  "Komedo Hitam": "Komedo hitam adalah pori-pori yang tersumbat dan teroksidasi menjadi hitam.",
  "Komedo Putih": "Komedo putih adalah pori-pori tersumbat yang tertutup lapisan tipis kulit.",
  "Flek Hitam": "Hiperpigmentasi kulit yang biasanya disebabkan oleh papuran sinar matahari.",
  "Kerutan": "Lipatan halus yang muncul seiring bertambahnya usia atau paparan UV.",
  "Kantung Mata": "Pembengkakan ringan di bawah mata, sering akibat kelelahan.",
  "Kulit Berminyak": "Kondisi kulit memproduksi sebum berlebih.",
  "Kulit Kering": "Kekurangan kelembaban alami, terasa kasar.",
  "Pori-pori Besar": "Pori-pori tampak jelas dan melebar.",
  "Kemerahan Kulit": "Tanda iritasi atau peradangan.",
  "Bekas Jerawat": "Bekas luka atau perubahan warna kulit yang tertinggal setelah jerawat sembuh.",
  "Papula": "Jenis jerawat berupa benjolan kecil solid dan kemerahan pada kulit tanpa nanah.",
  "Pustula": "Jerawat dengan benjolan merah yang memiliki pusat berisi nanah putih atau kuning.",
  "Nodul Jerawat": "Benjolan jerawat besar, keras, dan terasa nyeri yang berada jauh di bawah permukaan kulit.",
  "Jerawat Kistik": "Jenis jerawat paling parah, berisi cairan dan sangat nyeri, berisiko tinggi meninggalkan bekas.",
  "Folikulitis": "Peradangan atau infeksi pada kantong rambut yang menyebabkan benjolan merah kecil atau gatal.",
  "Milia": "Benjolan kecil berwarna putih seperti biji yang muncul biasanya di sekitar hidung atau pipi.",
  "Keloid": "Pertumbuhan jaringan parut yang berlebihan dari area luka, terasa keras dan menonjol.",
  "Siringoma": "Benjolan kecil berwarna kulit biasanya muncul di kelopak mata, terkait kelenjar keringat.",
  "Kutil Datar": "Benjolan kecil rata dengan permukaan sedikit kasar, disebabkan oleh infeksi virus (HPV).",
};

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
      overlay_image?: { base64: string; mime: string };
    };
  };
}

// ============================================================
// HELPER FUNCTION: MAPPING SEVERITY
// ============================================================
// Mapping dari 5 level severity backend ke 3 level severity rekomendasi
const getRecommendationSeverityKey = (severity: string): string => {
  if (severity === 'sangat ringan' || severity === 'ringan') return 'ringan';
  if (severity === 'sedang') return 'sedang';
  if (severity === 'berat' || severity === 'sangat berat') return 'berat';
  return 'ringan'; // fallback
};

// ============================================================
// KOMPONEN UI
// ============================================================

// const NotificationPopup = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
//   const [progress, setProgress] = useState(100);

//   useEffect(() => {
//     if (show) {
//       setProgress(100);
//       const startTime = Date.now();
//       const duration = 5000;

//       const interval = setInterval(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
//         setProgress(remaining);
//         if (remaining <= 0) {
//           clearInterval(interval);
//           onClose();
//         }
//       }, 50);

//       return () => clearInterval(interval);
//     }
//   }, [show, onClose]);

//   if (!show) return null;

//   return (
//     <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-bounce-in">
//       <div className="bg-gradient-to-r from-[#FF8A9B]/20 to-transparent p-4 rounded-xl border border-[#FF8A9B]/30 text-left shadow-2xl backdrop-blur-md bg-[#1a1a1a]/90 flex flex-col relative overflow-hidden">
//         <div className="flex items-center gap-3 relative z-10">
//           <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5">
//               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
//             </svg>
//           </div>
//           <div className="flex-1">
//             <p className="text-white text-sm font-medium">Rahasia kulitmu sudah terkirim!</p>
//             <p className="text-white/60 text-xs mt-1">Cek WhatsApp & Email untuk detail.</p>
//           </div>
//           <button onClick={onClose} className="text-white/40 hover.text:white p-1">
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//           </button>
//         </div>
//         <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
//           <div 
//             className="h-full bg-[#FF8A9B] transition-linear" 
//             style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

const ImageViewer = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Detail Scan" />
      <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

// REVISI: Menambahkan prop size untuk mengecilkan ukuran saat export
// DAN prop isExporting untuk perbaikan posisi teks
const MiniCircle = ({ score, severity, size = 'md', isExporting = false }: { score: number; severity: string; size?: 'md' | 'sm'; isExporting?: boolean }) => {
  const color = SEVERITY_COLOR_DOT[severity] || "#fff";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[14px]';

  // PENYESUAIAN: Menggunakan absolute positioning untuk export agar teks benar-benar di tengah
  // Karena html2canvas sering miss-align pada flexbox
  const textContainerClass = isExporting 
    ? "absolute top-1.5 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center"
    : "absolute inset-0 flex items-center justify-center";

  return (
    <div className={`relative ${sizeClasses} flex-shrink-0`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </g>
      </svg>
      <div className={textContainerClass}>
        {/* leading-none ditambahkan untuk konsistensi tinggi teks */}
        <span className={`${textSize} font-bold text-white leading-none`}>{Math.round(score)}</span>
      </div>
    </div>
  );
};

// REVISI: SeveritySummaryCard sekarang memiliki mode 'bar graph' untuk export
const SeveritySummaryCard = ({ severityCount, totalFindings, isExporting }: { severityCount: Record<string, number>; totalFindings: number; isExporting: boolean }) => {
  
  // Mode Export: Bar Graph (Vertical)
  if (isExporting) {
    const maxCount = Math.max(...Object.values(severityCount), 1); // Ambil nilai tertinggi untuk skala
    
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-2 w-full mt-1">
        <h4 className="text-white font-bold text-xs mb-3 -mt-2 text-center leading-none">Ringkasan Tingkat Keparahan</h4>
        <div className="flex justify-between items-end h-14 gap-1 px-1">
          {SEVERITY_ORDER.map((sev) => {
            const count = severityCount[sev] ?? 0;
            const heightPct = (count / maxCount) * 100;
            const color = SEVERITY_COLOR_DOT[sev] || "#fff";
            // Singkat label untuk export
            const shortLabel = SEVERITY_LABEL[sev].replace('Sangat ', 'S. ');

            return (
              <div key={sev} className="flex flex-col items-center flex-1 h-full justify-end">
                {/* Bar */}
                <div 
                  className="w-full rounded-t transition-all duration-300"
                  style={{ 
                    height: `${Math.max(heightPct, 5)}%`, // Minimal 2% biar kelihatan
                    backgroundColor: color,
                    opacity: count > 0 ? 1 : 0.3
                  }}
                />
                {/* Label & Count di bawah */}
                <div className="text-center mt-1">
                   <div className="text-[9px] text-white font-bold leading-none -mt-1">{count}</div>
                   <div className="text-[6px] text-white/70 mt-0.5">{shortLabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode Web View: Grid (Default)
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl mb-4 p-3 w-full">
      <h4 className="text-white font-bold text-sm mb-2 text-center leading-none">Ringkasan Tingkat Keparahan</h4>
      <div className="grid grid-cols-2 gap-1.5">
        {SEVERITY_ORDER.map((sev) => {
          const count = severityCount[sev] ?? 0;
          const pct = totalFindings > 0 ? Math.round((count / totalFindings) * 100) : 0;
          const bgClass = SEVERITY_COLOR_BG[sev] || "bg-white/10";
          const dotColor = SEVERITY_COLOR_DOT[sev] || "#fff";
          
          return (
            <div key={sev} className={`flex flex-col items-start justify-start p-1.5 rounded-lg border text-left ${bgClass}`}>
              <div className="w-full">
                <div className="flex items-center gap-1 mb-0.5 leading-none">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }}></div>
                  <p className="text-white text-[11px] font-bold leading-none">{count} {SEVERITY_LABEL[sev]}</p>
                </div>
                <p className="text-white/60 text-[10px] pl-2.5 leading-none mt-1">{pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
      <h4 className="text-white font-bold text-base mb-0">Hasil Analisa</h4>
      <p className="text-white/60 text-xs mb-3">Ketuk untuk melihat detail.</p>
      <div className="space-y-2">
        {aggregatedSummary.map((item) => {
          const isOpen = expandedLabel === item.label;
          return (
            <div key={item.label} className="rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition text-left"
                onClick={() => setExpandedLabel(isOpen ? null : item.label)}
              >
                <div className="flex-1 mr-2">
                  <p className="text-white text-[14px] font-medium">
                    {item.label} – <span className="text-[#FF8A9B]">{SEVERITY_LABEL[item.severity]}</span>
                  </p>
                  <p className="text-white/60 text-[12px]">Terdeteksi {item.count} kali</p>
                </div>
                <MiniCircle score={item.avg_severity_percentage} severity={item.severity} />
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
      <p className="text-white/40 text-xs mt-3 text-center">Catatan: Analisa AI, bukan diagnosis medis.</p>
    </div>
  );
};

// ============================================================
// KOMPONEN BARU: RECOMMENDATION SECTION
// ============================================================
const RecommendationSection = ({ aggregatedSummary }: { aggregatedSummary: SummaryItem[] }) => {
  if (aggregatedSummary.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
      <h4 className="text-white font-bold text-base mb-1">Rekomendasi Perawatan</h4>
      <p className="text-white/60 text-xs mb-3">Saran perawatan berdasarkan hasil analisis.</p>
      
      <div className="space-y-4">
        {aggregatedSummary.map((item) => {
          // Cari data rekomendasi berdasarkan label
          const recData = careRecommendations.find((rec) => rec.label === item.label);
          
          // Jika tidak ada data di JSON, skip
          if (!recData) return null;

          // Ambil key severity (ringan/sedang/berat)
          const severityKey = getRecommendationSeverityKey(item.severity);
          
          // Ambil list rekomendasi
          const recList = recData.recommendations[severityKey as 'ringan' | 'sedang' | 'berat'];

          if (!recList || recList.length === 0) return null;
          
          // Ambil warna dari severityKey (karena labelnya severityKey)
          const bgColor = SEVERITY_COLOR_DOT[severityKey] || "#888";

          return (
            <div key={item.label} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[#FF8A9B] font-bold text-sm">{item.label}</h5>
                {/* PERUBAHAN: Badge warna sesuai severity (background) dan teks putih */}
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full text-white capitalize"
                  style={{ backgroundColor: bgColor }}
                >
                  {severityKey}
                </span>
              </div>
              <ul className="space-y-1.5">
                {recList.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-white/80 text-xs">
                    <svg className="w-3 h-3 text-[#FF8A9B] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
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
  // const [showNotif, setShowNotif] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // State untuk modal instruksi kamera
  const [showCameraInstruction, setShowCameraInstruction] = useState(false);

  const [capturedFiles, setCapturedFiles] = useState<Record<PoseKey, File | null>>({
    center: null, left: null, right: null
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ============================================================
  // PERUBAHAN: Dynamic Date Real-time
  // ============================================================
  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // ============================================================

  // Funcs
  const resetModal = useCallback(() => {
    setStep(1); setConsent(false); setScore(0); setCurrentPoseIndex(0);
    setHasPermission(null); 
    setCapturedFiles({ center: null, left: null, right: null });
    setFormData({ name: '', email: '', phone: '' });
    setAnalysisResult(null);
    setExpandedLabel(null);
    // setShowNotif(false);
    setViewingImage(null);
    setShowCameraInstruction(false);
  }, []);

  const disableCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const enableCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) { console.error("Gagal mengakses kamera:", err); setHasPermission(false); }
  }, []);

  const resetScan = useCallback(() => setCurrentPoseIndex(0), []);

  // ============================================================
  // FIX: CAPTURE DENGAN CROP CENTER (SQUARE) UNTUK HINDARI GEPENG
  // ============================================================
  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (vw === 0 || vh === 0) return;

    // Ambil sisi terkecil untuk membuat kotak (square)
    const size = Math.min(vw, vh);
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hitung offset untuk crop bagian tengah
    const offsetX = (vw - size) / 2;
    const offsetY = (vh - size) / 2;

    // Lakukan mirror (flip horizontal)
    ctx.translate(size, 0);
    ctx.scale(-1, 1);

    // Gambar video ke canvas dengan crop center
    // Parameter: drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

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
        // await fetch('http://localhost:8000/users/register', {
        await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, tel: formData.phone })
        });
      } catch (dbError) { console.warn("Register skip/error:", dbError); }

      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('email', formData.email);
      apiFormData.append('phone', formData.phone);
      
      if (capturedFiles.left) apiFormData.append('left', capturedFiles.left);
      if (capturedFiles.center) apiFormData.append('center', capturedFiles.center);
      if (capturedFiles.right) apiFormData.append('right', capturedFiles.right);

      // const response = await fetch('http://localhost:8000/analyze-face', { method: 'POST', body: apiFormData });
      const response = await fetch('/api/analyze-face', { method: 'POST', body: apiFormData });
      
      const result = await response.json();
      
      setAnalysisResult(result);
      setStep(4);
      animateResult(Math.round(result.health_evaluation?.health_score || 75));
      // setShowNotif(true);

    } catch (error) {
      console.error(error);
      // alert("Terjadi kesalahan saat analisis.");
    } finally { setIsLoading(false); }
  }, [formData, capturedFiles, animateResult]);

  // FUNGSI DOWNLOAD DENGAN LAYOUT TIGHTENING
  const handleDownloadImage = async () => {
    if (!exportRef.current) return;

    const element = exportRef.current;
    const originalStyle = element.style.cssText;

    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for React render

      // Set Container Layout (360x640) - Tightened Spacing
      element.style.width = '360px';
      element.style.height = '640px';
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.justifyContent = 'flex-start'; // Start from top
      element.style.alignItems = 'stretch';
      element.style.overflow = 'hidden';
      element.style.padding = '20px'; // Reduced from 24px
      element.style.paddingTop = '16px'; // Dikurangi dari 24px agar naik ke atas
      element.style.paddingBottom = '16px';
      element.style.backgroundColor = '#18181b'; // Background di-set di sini via JS
      element.style.gap = '8px'; // Reduced from 16px

      // Render Canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#18181b',
        scale: 2,
        useCORS: true,
        width: 360,
        windowWidth: 720
      });

      const link = document.createElement('a');
      link.download = `MirraSense-Analysis.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (err) {
      console.error("Download failed", err);
    } finally {
      element.style.cssText = originalStyle;
      setIsExporting(false);
    }
  };

  // useEffect untuk handle perubahan step
  useEffect(() => {
    if (step === 2) {
      // Saat masuk step 2, tampilkan modal instruksi dulu (Jangan nyalakan kamera dulu)
      setShowCameraInstruction(true);
    } else {
      disableCamera();
    }
    return () => disableCamera();
  }, [step, disableCamera]);

  useEffect(() => { if (!isOpen) { disableCamera(); resetModal(); } }, [isOpen, disableCamera, resetModal]);

  // Handler untuk tombol "Oke" di modal instruksi
  const handleStartCameraFromInstruction = () => {
    setShowCameraInstruction(false);
    enableCamera();
  };

  if (!isOpen) return null;

  // Aggregation Logic
  const getAggregatedData = () => {
    if (!analysisResult) return { summary: [], severityCount: {}, totalFindings: 0, overlayImages: [] };
    const combinedSummaryMap: Record<string, SummaryItem> = {};
    const combinedSeverityCount: Record<string, number> = {};
    SEVERITY_ORDER.forEach(s => combinedSeverityCount[s] = 0);
    
    const overlayImages: {pose: string, src: string}[] = [];

    Object.entries(analysisResult.poses).forEach(([pose, poseData]) => {
      if (poseData.overlay_image?.base64) {
        overlayImages.push({
          pose: pose,
          src: `data:${poseData.overlay_image.mime};base64,${poseData.overlay_image.base64}`
        });
      }

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
    return { summary: summaryArray, severityCount: combinedSeverityCount, totalFindings, overlayImages };
  };

  const { summary: aggregatedSummary, severityCount: totalSeverityCounts, totalFindings, overlayImages } = getAggregatedData();
  const progress = ((currentPoseIndex + 1) / poseOrder.length) * 100;
  const currentPose = poseOrder[currentPoseIndex];

  return (
    <>
      {viewingImage && <ImageViewer src={viewingImage} onClose={() => setViewingImage(null)} />}
      {/* <NotificationPopup show={showNotif} onClose={() => setShowNotif(false)} /> */}

      <div className="modal-overlay active overflow-hidden py-8 px-4" onClick={() => { if(!isLoading) { onClose(); resetModal(); } }}>
        <div className="modal-content w-full max-w-lg mx-auto relative" onClick={e => e.stopPropagation()}>
          
          {/* HIDE CLOSE BUTTON WHEN LOADING */}
          {!isLoading && (
            <button onClick={() => { onClose(); resetModal(); }} className="absolute top-4 right-4 z-[60] w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm text-white transition-all" style={{ transform: 'translate(50%, -50%)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}

          <div className="p-2">
              {step === 1 && (
              <div className="modal-step active glass-panel rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8A9B] to-[#FFFFFF] flex items-center justify-center mx-auto mb-6">
                      {/* Icon ganti jadi Shield/Lock untuk indicasi keamanan */}
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3 className="font-display text-3xl font-medium mb-3">Keamanan Data</h3>
                  {/* Deskripsi diganti sesuai request */}
                  <p className="text-muted text-sm mb-6">Data wajah Anda akan diproses dengan aman dan terenkripsi. Privasi Anda adalah prioritas utama kami.</p>
                  <label className="flex items-start gap-3 mb-8 cursor-pointer text-left group">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 rounded accent-[#FF8A9B]" />
                    {/* Teks persetujuan disesuaikan */}
                    <span className="text-sm opacity-70">Saya menyetujui pemrosesan data yang aman dan terenkripsi.</span>
                  </label>
                  <button disabled={!consent} onClick={() => setStep(2)} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Lanjutkan</button>
              </div>
              )}

              {step === 2 && (
              <div className="modal-step active glass-panel rounded-3xl p-4 relative">
                  
                  {/* OVERLAY INSTRUKSI KAMERA */}
                  {showCameraInstruction && (
                    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-8 rounded-3xl transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-[rgba(255,138,155,0.1)] flex items-center justify-center mx-auto mb-4 border border-[#FF8A9B]">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3 text-center">Siap Memulai Scan?</h3>
                        <p className="text-white/60 text-sm mb-6 text-center">
                            Pastikan Anda berada di ruangan dengan pencahayaan yang terang dan tidak memakai kacamata untuk resultados terbaik.
                        </p>
                        <button onClick={handleStartCameraFromInstruction} className="btn-primary w-full max-w-xs">Oke, Mulai Scan</button>
                    </div>
                  )}

                  {/* KONTEN KAMERA (DI BELAKANG OVERLAY) */}
                  <div className="flex justify-between items-center mb-3 relative z-10">
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
                    <div className={`absolute top-4 left-4 z-20 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition-colors duration-300 ${hasPermission === true ? 'bg-green-500/40 text-green-100' : 'bg-red-500/40 text-red-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasPermission === true ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {hasPermission === true ? 'Kamera Aktif' : 'Kamera Tidak Aktif'}
                    </div>
                    {hasPermission === false && ( <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 p-4 text-center"> <p className="text-white text-sm mb-4">Akses kamera diblokir.</p> <button onClick={enableCamera} className="btn-secondary text-xs py-2 px-4">Coba Lagi</button> </div> )}
                    {/* PERBAIKAN: Typo items: diubah menjadi items-center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-52 h-72 rounded-full border-2 border-[#FF8A9B] opacity-70 shadow-[0_0_15px_rgba(255,138,155,0.3)]"></div>
                    </div>
                    {hasPermission && <div className="scan-line"></div>}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6 flex-1">Kembali</button>
                    <button onClick={handleCapture} className="btn-primary py-3 px-6 flex-[2]">Capture</button>
                  </div>
              </div>
              )}

              {step === 3 && (
              <div className="modal-step active glass-panel rounded-3xl p-8 text-center relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                  {isLoading ? (
                    // TAMPILAN LOADING ANIMASI
                    // Hanya menggunakan background modal utama (single background)
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                        <div className="w-48 h-48 mb-4">
                           {/* Pastikan install lottie-react: npm install lottie-react */}
                           <Lottie animationData={scanAnimation} loop={true} />
                        </div>
                        <h3 className="font-display text-xl font-medium text-white mb-2">Memproses Analisis...</h3>
                        <p className="text-white/60 text-sm text-center">AI sedang menganalisa kondisi kulit wajahmu.</p>
                    </div>
                  ) : (
                    // TAMPILAN FORM
                    <>
                      <div className="w-16 h-16 rounded-full bg-[rgba(255,138,155,0.1)] flex items-center justify-center mx-auto mb-4 border border-[#FF8A9B]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A9B" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <h3 className="font-display text-2xl font-medium text-[#FF8A9B]">Hampir Selesai</h3>
                      <p className="text-muted text-sm mt-2 mb-6">Masukkan data untuk melihat hasil.</p>
                      <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="Nama Lengkap" />
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="Email" />
                        <input type="tel" required maxLength={15}value={formData.phone} onChange={(e) => { const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 15); setFormData({...formData, phone: value}); }} className="w-full input-style rounded-xl text-white bg-white/10 border border-white/10 focus:outline-none focus:border-[#FF8A9B] p-3" placeholder="No. WhatsApp" inputMode="numeric" />
                        <button type="submit" className="w-full btn-primary mt-2 flex justify-center items-center gap-2">Lihat Hasil Analisis</button>
                      </form>
                    </>
                  )}
              </div>
              )}

              {step === 4 && (
              <div className="modal-step active glass-panel rounded-3xl p-6 relative overflow-y-auto max-h-[90vh]">
                  
                  {/* Area Export - REVISI: Hapus p-4, mx-auto, mb-4 agar hilang margin di web */}
                  <div ref={exportRef} className="relative w-full rounded-xl">
                      
                      {/* WRAPPER HEADER & SCORE - REVISI: Layout berubah saat export */}
                      <div className={`flex ${isExporting ? 'flex-row items-center justify-between gap-2' : 'flex-col'}`}>
                          
                          {/* Header Section */}
                          <div className={`${isExporting ? 'text-left flex-1 -mt-2' : 'text-center mb-4'}`}>
                              {/* REVISI: Ukuran font dikecilkan saat export agar tidak wrap/turun ke bawah */}
                              <h3 className={`font-display font-medium text-[#FF8A9B] ${isExporting ? 'text-3xl leading-none mb-2' : 'text-3xl'}`}>Hasil Analisis MirraAI</h3>
                              {/* PERUBAHAN: Tanggal Dinamis */}
                              <p className="text-white/40 text-sm mt-1">{currentDateStr}</p>
                          </div>

                          {/* Score Circle Section - REVISI: Posisi disesuaikan saat export */}
                          <div className={`${isExporting ? 'flex-shrink-0 mt-4' : 'flex justify-center mb-4'}`}>
                            <div className={`relative ${isExporting ? 'w-[85px] h-[85px]' : 'w-28 h-28'} rounded-full border-4 border-[rgba(255,138,155,0.2)] bg-[rgba(255,138,155,0.05)] flex items-center justify-center`}>

                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox="0 0 100 100"
                              >
                                <g transform="rotate(-90 50 50)">
                                  <circle
                                    id="score-circle"
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="#FF8A9B"
                                    strokeWidth="3"
                                    strokeDasharray="283"
                                    strokeDashoffset="283"
                                    strokeLinecap="round"
                                    fill="none"
                                  />
                                </g>
                              </svg>

                              {/* TEXT CENTER FIX - REVISI: MENAMBAHKAN /100 */}
                              <div className="text-center leading-tight">
                                <div
                                  className={`font-display text-4xl font-bold text-[#FF8A9B] mb-2 ${
                                    isExporting ? '-translate-y-2 mb-0' : ''
                                  }`}
                                >
                                  {score}
                                </div>
                                {/* PERBAIKAN: Teks dinamis */}
                                <div className={`text-[#FF8A9B] opacity-60 text-[11px] mb-2 ${isExporting ? 'text-[10px] pb-5' : ''}`}>
                                  dari 100
                                </div>
                              </div>

                            </div>
                          </div>
                      </div>
                      
                      {/* Foto Hasil Scan */}
                      <div className={`${isExporting ? '-mt-4 -mb-1' : 'mb-3'}`}>
                          <h4 className={`text-white font-bold text-sm mb-2 ${isExporting ? 'mb-3' : ''}`}>Foto Hasil Scan</h4>
                          <div className="grid grid-cols-3 gap-2">
                              {overlayImages.map((img) => (
                                  <div 
                                    key={img.pose} 
                                    className={`photo-result-container bg-black/40 rounded-xl overflow-hidden border border-white/10 relative ${isExporting ? 'rounded-xl' : ''}`}
                                    // FIX: Hanya pakai aspectRatio 1/1, biarkan grid yg atur lebar
                                    style={{ aspectRatio: '1 / 1' }}
                                    onClick={() => setViewingImage(img.src)}
                                  >
                                      <img 
                                        src={img.src} 
                                        alt={img.pose} 
                                        // FIX: Tambahkan w-full h-full agar memenuhi container kotak
                                        className="w-full h-full object-cover absolute inset-0"
                                      />
                                      {!isExporting && (
                                      <span
                                        className="absolute left-0 right-0 bottom-0 bg-black/60 text-white capitalize"
                                        style={{
                                          height: '16px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '8px',
                                          lineHeight: '16px',
                                          padding: 0,
                                          margin: 0,
                                        }}
                                      >
                                        {posePhotoLabel[img.pose] || img.pose}
                                      </span>
                                    )}
                                  </div>
                              ))}
                              {overlayImages.length === 0 && ['left', 'center', 'right'].map(p => (
                                  <div key={p} className="aspect-square bg-white/5 rounded flex items-center justify-center text-white/20 text-[10px]">No Image</div>
                              ))}
                          </div>
                      </div>

                      {/* ============================================================ */}
                      {/* REVISI: URUTAN UNTUK EXPORT (SEVERITY DULU, LALU SUMMARY) */}
                      {/* ============================================================ */}
                      
                      {/* 1. Severity Summary Card (BAR GRAPH) - Diletakkan di atas */}
                      <SeveritySummaryCard 
                        severityCount={totalSeverityCounts} 
                        totalFindings={totalFindings} 
                        isExporting={isExporting} 
                      />

                      {/* 2. Hasil Analisa (Summary Accordion) - Diletakkan di bawah Severity, didalam card */}
                      {/* REVISI: Padding dan font size dikecilkan saat export agar tidak kebawah */}
                      {/* FIX BUG: Menghapus -space-y-4 dan menambah padding agar teks tidak terpotong */}
                      {isExporting && aggregatedSummary.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 w-full">
                          <h4 className="text-white font-bold text-xs mb-3 -mt-2">Hasil Analisa</h4>
                          <div className="space-y-1.5">
                              {aggregatedSummary.slice(0, 2).map((item) => (
                                <div key={item.label} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                                  <div className="flex-1 -mt-4">
                                    <p className="text-white text-[11px] font-medium leading-tight">
                                      {item.label} – <span className="text-[#FF8A9B]">{SEVERITY_LABEL[item.severity]}</span>
                                    </p>
                                    <p className="text-white/60 text-[9px] leading-tight mt-1">Terdeteksi {item.count} kali</p>
                                  </div>
                                  {/* REVISI: Ukuran MiniCircle diperkecil untuk export */}
                                  <MiniCircle score={item.avg_severity_percentage} severity={item.severity} size="sm" isExporting={isExporting} />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* ===== BRANDING & CTA (EXPORT ONLY) ===== */}
                      {isExporting && (
                        <div className="pt-3 border-t border-white/10 text-center">
                          
                          {/* Logo */}
                          <div className="flex justify-center mb-0">
                            <img
                              src={mirraLogo}
                              alt="MirraSense"
                              style={{
                                width: '150px', // Sedikit diperkecil agar muat
                                objectFit: 'contain'
                              }}
                            />
                          </div>

                          {/* CTA */}
                          <div className="text-white text-xs leading-relaxed px-4">
                            <p className="font-semibold text-[#FF8A9B] text-[13.5px] mb-0.5">
                              Nantikan full versi kami di aplikasi MirraSense
                            </p>
                            <p className="text-white/70 text-sm -mt-1">
                              Yuk ikutan coba di
                            </p>
                            <p className="text-[#FF8A9B] font-bold text-sm">
                              mirrasense.my.id
                            </p>
                          </div>

                        </div>
                      )}
                  </div>

                  {/* Summary Accordion (Web View Only) */}
                  {!isExporting && (
                    <SummaryAccordion aggregatedSummary={aggregatedSummary} expandedLabel={expandedLabel} setExpandedLabel={setExpandedLabel} isPremium={true} />
                  )}

                  {/* ============================================================ */}
                  {/* REKOMENDASI PERAWATAN - WEB VIEW ONLY */}
                  {/* ============================================================ */}
                  {!isExporting && (
                    <RecommendationSection aggregatedSummary={aggregatedSummary} />
                  )}

                  {/* Tombol Aksi */}
                  <div className="mt-4 space-y-2">
                      <button onClick={handleDownloadImage} className="w-full py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition flex items-center justify-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download Hasil
                      </button>
                      <button onClick={() => { onClose(); resetModal(); }} className="w-full btn-secondary border-[#FF8A9B] text-[#FF8A9B]">Selesai</button>
                  </div>
              </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScanModal;