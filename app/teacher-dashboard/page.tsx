"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import { 
  LayoutGrid, 
  Video, 
  Headphones, 
  Save, 
  Plus, 
  Trash2, 
  LogOut, 
  BarChart3, 
  Users, 
  Clock, 
  X, 
  Search, 
  MessageSquare, 
  ListChecks, 
  Check, 
  RefreshCcw,
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  Menu, 
  PlayCircle, 
  Type, 
  ShieldCheck,
  Calendar, 
  FileText, 
  Printer, 
  Download, 
  GraduationCap,
  Award,
  Filter,
  MapPin,
  Bot
} from 'lucide-react';

// --- VERİ TİPİ TANIMLAMALARI ---

interface Option {
  option_text: string;
  is_correct: boolean;
}

interface Question {
  question_text: string;
  options: Option[];
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

interface Flashcard {
  id?: number;
  question: string;
  answer: string;
}

interface Material {
  id?: number;
  content_type: 'video' | 'podcast' | 'form' | 'pdf';
  embed_url: string;
  title: string;
  point_value?: number; 
  quiz?: Quiz;
}

interface QuizDetailAnalysis {
  question_text: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
}

interface WeeklyProgress {
  week_number: number;
  progress: number;
  duration: string | number; // Toplam süre (Round 1 + Round 2)
  duration_seconds?: number; // Backend'den gelen ham saniye verisi
  duration_2?: string | number;
  score_1?: number;
  score_2?: number;
  correct_1?: number;
  wrong_1?: number;
  correct_2?: number;
  wrong_2?: number;
  questions?: string[];
  quiz_results?: QuizDetailAnalysis[];
  // YENİ: Her materyal için özel sürelerin tutulduğu liste
  material_details?: {
    title: string;
    content_type: string;
    duration_seconds: number;
  }[];
}

interface BulkStudentData {
  id: string | number;
  full_name: string;
  email: string;
  department: string;
  total_points: number;
  total_time: number; 
  weekly_breakdown: {
    week: number;
    progress: number;
    duration: string | number; 
    duration_seconds: number;
    duration_seconds_2: number;
    correct: number;
    wrong: number;
    correct_2: number;
    wrong_2: number;
    score_1?: number;
    score_2?: number;
    has_quiz: boolean;
    is_round_2_started: boolean;
    quiz_results?: QuizDetailAnalysis[]; 
    questions?: string[];
    // YENİ: PDF Raporunda tüm materyalleri listelemek için gereken alan
    material_details?: {
      title: string;
      content_type: string;
      duration_seconds: number;
    }[];
  }[];
}

interface StudentAnalytics {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  total_points: number;
  total_time_spent: string;
  overall_progress: number;
  weekly_breakdown: WeeklyProgress[];
}

export default function TeacherDashboard() {
  // --- STATE YÖNETİMİ ---
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'time_analytics'>('content');
  const [loading, setLoading] = useState(false);
const [pdfLoading, setPdfLoading] = useState(false);
const [karneLoading, setKarneLoading] = useState(false);
  const [fetchingWeek, setFetchingWeek] = useState(false);
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [bulkData, setBulkData] = useState<BulkStudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
const [selectedDepartment, setSelectedDepartment] = useState<string>('ilahiyat');  
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(''); 
  
  const [introTitle, setIntroTitle] = useState('Genel Tanıtım ve Oryantasyon');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [introDescription, setIntroDescription] = useState('');
  
  const [materials, setMaterials] = useState<Material[]>([{ content_type: 'video', embed_url: '', title: '', point_value: 10 }]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [systemTimeData, setSystemTimeData] = useState<any>(null);
const [systemTimeLoading, setSystemTimeLoading] = useState<boolean>(true);

useEffect(() => {
  // Sadece ilgili sekme aktifken istek atmasını garantiliyoruz
  if (activeTab !== 'time_analytics') return;

  setSystemTimeLoading(true);
  
  // API URL'ini temiz bir şekilde kurguluyoruz
  let url = '/contents/system-time-analytics/';
  if (selectedDepartment) {
    url += `?department=${selectedDepartment}`;
  }

  api.get(url)
    .then(res => {
      // Eğer backend'den gelen veri boş veya tanımsızsa, arayüzün boş kalmaması için mock/default şablon veriyoruz
      if (!res.data || Object.keys(res.data).length === 0 || !res.data.raw_student_list) {
        setSystemTimeData({
          max_engagement: { student: "Veri Yok", time: "0 Saat" },
          min_engagement: { student: "Veri Yok", time: "0 Saat" },
          activity_distribution: [
            { type: "Video İzleme", hours: 0 },
            { type: "Ders Notu Okuma (PDF)", hours: 0 },
            { type: "Bilgi Testi (Quiz)", hours: 0 },
            { type: "Podcast Dinleme", hours: 0 },
            { type: "Ödev Çözme", hours: 0 }
          ],
          raw_student_list: []
        });
      } else {
        setSystemTimeData(res.data);
      }
      setSystemTimeLoading(false);
    })
    .catch(err => {
      print("Zaman analitiği yüklenirken hata:", err);
      setSystemTimeLoading(false);
    });
}, [selectedDepartment, activeTab]);

  // --- BÖLÜM LİSTESİ ---
  const departmentList = [
    { id: 'ilahiyat', name: 'İlahiyat' },
    { id: 'isg', name: 'İş Sağlığı Ve Güvenliği' },
    { id: 'saglikyonetimi', name: 'Sağlık Yonetimi' },
    { id: 'beslenmevediyetetik', name: 'Beslenme Ve Diyetetik' },
    { id: 'hemsirelik', name: 'Hemşirelik' },
    { id: 'webtasarimvekodlama', name: 'Web Tasarım Ve Kodlama' }
  ];

  const getDeptName = (id: string) => {
    const dept = departmentList.find(d => d.id === id);
    return dept ? dept.name : id;
  };

  // --- SÜRE FORMATLAMA FONKSİYONU ---
 const formatDuration = (duration: string | number) => {
  if (!duration || duration === "Aktivite Kaydı Yok" || duration === "Aktivite Yok" || duration === 0) {
    return "0 dk";
  }

  let totalMinutes = 0;

  // Eğer gelen veri sadece sayı ise (Saniye cinsinden geliyordur)
  if (typeof duration === 'number') {
    totalMinutes = Math.floor(duration / 60);
  } 
  // Eğer gelen veri metin ise (Örn: "120 saniye" veya "2 sa 10 dk")
  else {
    const numbers = duration.match(/\d+/g)?.map(Number) || [];
    if (duration.toLowerCase().includes('sa')) {
      const hours = numbers[0] || 0;
      const mins = numbers[1] || 0;
      totalMinutes = (hours * 60) + mins;
    } else {
      totalMinutes = numbers[0] || 0;
    }
  }

  if (totalMinutes === 0) return "0 dk";
  if (totalMinutes < 60) return `${totalMinutes} dk`;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} sa ${minutes} dk`;
};

  // --- HAFTA DETAYI ÇEKME ---
  const fetchWeekDetail = useCallback(async (week: number) => {
    setFetchingWeek(true);
    try {
      const res = await api.get(`/contents/list/?week_number=${week}`);
      const data = res.data;
      setIntroDescription(data.intro_description || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      
      if (data.release_date) {
        setReleaseDate(data.release_date.split('T')[0]);
      } else {
        setReleaseDate('');
      }
      
      if (data.intro_video_url !== undefined) {
        setIntroVideoUrl(data.intro_video_url || '');
        setIntroTitle(data.intro_title || 'Genel Tanıtım ve Oryantasyon');
      }
      
      if (data.materials && data.materials.length > 0) {
        setMaterials(data.materials);
      } else {
        setMaterials([{ content_type: 'video', embed_url: '', title: '', point_value: 10 }]);
      }
      
      setFlashcards(data.flashcards || []);
      
    } catch (err) {
      setTitle('');
      setDescription('');
      setReleaseDate('');
      setMaterials([{ content_type: 'video', embed_url: '', title: '', point_value: 10 }]);
      setFlashcards([]);
    } finally {
      setFetchingWeek(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'content') {
        fetchWeekDetail(weekNumber);
    }
  }, [weekNumber, activeTab, fetchWeekDetail]);

  // --- ANALİZ VERİLERİNİ ÇEKME ---
  // --- ANALİZ VERİLERİNİ ÇEKME ---
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // SADECE ana tabloyu dolduracak hafif veriyi çekiyoruz
      const res = await api.get('/contents/analytics/');
      setAnalytics(res.data);
      // bulkRes isteği buradan tamamen silindi.
    } catch (err) {
      console.error("Analiz verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
        fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  // --- FİLTRELEME HESAPLAMALARI ---
  const filteredAnalytics = useMemo(() => {
  return analytics.filter(s => s.department === selectedDepartment);
}, [analytics, selectedDepartment]);

// PDF verisi zaten sadece seçili bölümden geleceği için filtreye gerek yok
const filteredBulkData = useMemo(() => bulkData, [bulkData]);

  // --- MATERYAL ETKİLEŞİMLERİ ---
  const addMaterialRow = () => {
    setMaterials([...materials, { content_type: 'video', embed_url: '', title: '', point_value: 10 }]);
  };
  
  const removeMaterialRow = (index: number) => {
    if (materials.length > 1) {
        setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const updateMaterial = (index: number, field: keyof Material, value: unknown) => {
    const newMaterials = [...materials];
    
    if (field === 'content_type') {
        newMaterials[index].content_type = value as any;
        if (value === 'form' && !newMaterials[index].quiz) {
            newMaterials[index].quiz = {
                title: newMaterials[index].title || "Haftalık Değerlendirme",
                description: "",
                questions: [{ 
                  question_text: "", 
                  options: [
                    { option_text: "", is_correct: true },
                    { option_text: "", is_correct: false },
                    { option_text: "", is_correct: false },
                    { option_text: "", is_correct: false },
                    { option_text: "", is_correct: false }
                  ]
                }]
            };
        }
    } else if (field === 'title') {
        newMaterials[index].title = value as string;
    } else if (field === 'embed_url') {
        newMaterials[index].embed_url = value as string;
    } else if (field === 'point_value') {
        newMaterials[index].point_value = Number(value);
    }
    
    setMaterials(newMaterials);
  };

  // --- SINAV (QUIZ) FONKSİYONLARI ---
  const addQuestion = (mIndex: number) => {
    const newMats = [...materials];
    if (newMats[mIndex].quiz) {
        newMats[mIndex].quiz!.questions.push({
            question_text: "",
            options: [
              { option_text: "", is_correct: true },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false }
            ]
        });
    }
    setMaterials(newMats);
  };

  const updateQuestionText = (mIndex: number, qIndex: number, text: string) => {
    const newMats = [...materials];
    if (newMats[mIndex].quiz) {
        newMats[mIndex].quiz!.questions[qIndex].question_text = text;
    }
    setMaterials(newMats);
  };

  const updateOption = (mIndex: number, qIndex: number, oIndex: number, text: string) => {
    const newMats = [...materials];
    if (newMats[mIndex].quiz) {
        newMats[mIndex].quiz!.questions[qIndex].options[oIndex].option_text = text;
    }
    setMaterials(newMats);
  };

  const setCorrectOption = (mIndex: number, qIndex: number, oIndex: number) => {
    const newMats = [...materials];
    if (newMats[mIndex].quiz) {
      newMats[mIndex].quiz!.questions[qIndex].options.forEach((opt, i) => {
        opt.is_correct = i === oIndex;
      });
    }
    setMaterials(newMats);
  };

  const updateFlashcard = (index: number, field: keyof Flashcard, value: string) => {
    const newCards = [...flashcards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFlashcards(newCards);
  };

  // --- KAYDETME VE YAYINLAMA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        week_number: Number(weekNumber), 
        title, 
        description, 
        release_date: releaseDate || null, 
        intro_title: introTitle, 
        intro_video_url: introVideoUrl, 
        intro_description: introDescription,
        materials, 
        flashcards: flashcards.map((f, index) => ({ ...f, order: index })) 
      };
      await api.post('/contents/list/', payload);
      alert("Haftalık içerik başarıyla güncellendi.");
      fetchWeekDetail(weekNumber);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      alert(error.response?.data?.detail || "Kayıt hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAll = async () => {
    if (!selectedDepartment || selectedDepartment === 'all') {
      alert("Lütfen önce bir bölüm seçiniz.");
      return;
    }

    setPdfLoading(true);
    setBulkData([]); // <--- KRİTİK: Önceki bölümün verilerini tamamen temizle!
    try {
      const res = await api.get(`/contents/bulk-academic-report/?department=${selectedDepartment}`);
      // Veriyi setliyoruz. Yazdırma işlemini useEffect yapacak.
      setBulkData(res.data);
    } catch (err) {
      alert("Rapor verileri çekilirken hata oluştu.");
      setPdfLoading(false);
    }
  };

  // bulkData dolduğunda ve pdfLoading true olduğunda yazdırmayı başlat
// PDF Yazdırma Takipçisi
  useEffect(() => {
    // bulkData dolduğunda VE pdfLoading true olduğunda (yani butona basılmışsa)
    if (bulkData.length > 0 && pdfLoading) {
      console.log("PDF Verisi hazır, yazdırma başlatılıyor...");
      
      const timer = setTimeout(() => {
        window.print();
        setPdfLoading(false); // İşlem bitince yüklemeyi kapat
      }, 1500); // 1.5 saniye bekle (DOM'un dolması için)
      
      return () => clearTimeout(timer);
    }
  }, [bulkData, pdfLoading]);

  // filteredBulkData'yı 6'şarlı gruplara bölen yardımcı fonksiyon

  return (
    <div className="min-h-screen bg-gray-50 font-roboto text-secondary text-left">
      
    
{/* 1. PDF ŞABLONU (Gizli - Sadece Yazıcıda Görünür) */}
{/* ---------------------------------------------------------------- */}
{/* PDF ÇIKTI ALANI */}
<div id="bulk-report-pdf" className="hidden print:block bg-white p-0 text-left">
    {/* Veriyi 6'şarlı gruplara bölüyoruz */}
    {Array.from({ length: Math.ceil(filteredBulkData.length / 6) }, (_, i) =>
        filteredBulkData.slice(i * 6, i * 6 + 6)
    ).map((studentGroup, pageIdx) => (
        <div 
            key={pageIdx} 
            className="p-10 text-left" 
            style={{ pageBreakAfter: 'always', minHeight: '100vh' }}
        >
            {/* LOGO VE BAŞLIK */}
            <div className="flex flex-col items-center mb-10 border-b-4 border-black pb-8 text-center">
                <img 
                    src="/okul-logo.png" 
                    alt="Okul Logosu" 
                    className="h-28 object-contain mb-6" 
                    onError={(e) => (e.currentTarget.style.display = 'none')} 
                />
                <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
                    SİSTEM GENELİ AKADEMİK GELİŞİM VE PERFORMANS ÇİZELGESİ
                </h1>
                <p className="text-lg font-bold text-gray-700 mt-2 uppercase tracking-widest">
                    Bölüm: {selectedDepartment === 'all' ? 'TÜM BÖLÜMLER' : getDeptName(selectedDepartment).toUpperCase()}
                </p>
                <div className="flex gap-10 mt-4 text-[10px] font-black uppercase text-gray-500">
                    <span>Ders: Dijital Okuryazarlık</span>
                    <span>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</span>
                    <span>Kayıtlı Öğrenci: {filteredBulkData.length} (Sayfa {pageIdx + 1})</span>
                </div>
            </div>

            {/* ANA TABLO */}
            <table className="w-full border-collapse border-2 border-black">
                <thead>
                    <tr className="bg-black text-white text-center">
                        <th className="border-2 border-black p-3 text-[10px] font-black uppercase leading-none text-left w-48">
                            Öğrenci Adı Soyadı
                        </th>
                        {Array.from({ length: 14 }, (_, i) => i + 1).map(n => (
                            <th key={n} className="border-2 border-black p-1 text-[7px] font-black uppercase leading-none text-center w-32">
                                H.{n} ANALİZİ
                            </th>
                        ))}
                        <th className="border-2 border-black p-3 text-[10px] font-black uppercase leading-none text-center bg-gray-800">
                            Top. Puan
                        </th>
                        <th className="border-2 border-black p-3 text-[10px] font-black uppercase text-center bg-gray-800">
                            Top. Süre
                        </th>
                    </tr>
                </thead>
                <tbody className="text-left font-bold">
                    {studentGroup.map((student, idx) => (
                        <tr key={idx} className="text-center hover:bg-gray-50 leading-none">
                            <td className="border-2 border-black p-3 text-[10px] font-black text-left uppercase leading-tight">
                                {student.full_name}
                            </td>

                            {/* PDF Sütunu İçindeki Haftalık Analiz Hücresi */}
                            {student.weekly_breakdown.map((week, wIdx) => (
                                <td key={wIdx} className="border-2 border-black p-1 text-[6px] font-bold leading-none align-top">
                                    <div className="flex flex-col gap-1.5">
                                        {/* TUR 1 VERİLERİ */}
                                        <div className="flex flex-col border-b border-gray-300 pb-1 w-full items-center bg-blue-50/30">
                                            <div className="flex justify-between w-full px-1 mb-0.5">
                                                <span className="text-gray-500 font-black scale-[0.8]">T1</span>
                                                <span className="text-blue-700 font-black">%{Math.round(week.progress)}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[5px] text-gray-700">{week.correct}D / {week.wrong}Y</span>
                                                <span className="text-[5px] text-blue-600 font-black">{formatDuration(week.duration_seconds)}</span>
                                            </div>
                                        </div>

                                        {/* --- MATERYALLERİN DETAYLI LİSTESİ --- */}
                                        <div className="flex flex-col gap-1 px-0.5">
                                            <p className="text-[4px] font-black text-gray-400 uppercase border-b border-gray-100 mb-1 text-left">Materyal Süreleri:</p>
                                            {week.material_details && week.material_details.length > 0 ? (
                                                week.material_details.map((mat, mi) => (
                                                    <div key={mi} className="flex justify-between items-start gap-1 text-[4.5px] text-gray-600 leading-[1.2] mb-0.5">
                                                        <span className="text-left break-words w-20">• {mat.title}</span>
                                                        <span className="font-black shrink-0 text-secondary">{formatDuration(mat.duration_seconds)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[4px] text-gray-300 italic text-center">Aktivite Yok</span>
                                            )}
                                        </div>

                                        {/* TUR 2 VERİLERİ (VARSA) */}
                                        {week.is_round_2_started ? (
                                            <div className="flex flex-col w-full items-center pt-1 border-t-2 border-amber-200 bg-amber-50/30 mt-auto">
                                                <span className="text-amber-600 font-black scale-[0.7]">T2 AKTİF</span>
                                                <span className="text-green-700 font-black">{week.correct_2}D / {week.wrong_2}Y</span>
                                                <span className="text-[5px] text-amber-700 font-bold">{formatDuration(week.duration_seconds_2)}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </td>
                            ))}

                            <td className="border-2 border-black p-3 text-sm font-black text-blue-800 bg-gray-50">
                                {student.total_points} P.
                            </td>
                            <td className="border-2 border-black p-3 text-[9px] font-black leading-none bg-gray-50 italic">
                                {formatDuration(student.total_time)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ))}
</div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. NORMAL ARAYÜZ (HEADER) */}
      {/* ---------------------------------------------------------------- */}
      <header className="bg-[#1a1a1a] p-4 md:p-6 shadow-xl sticky top-0 z-50 print:hidden text-left border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-left">
          <div className="flex items-center gap-3 w-full md:w-auto text-left leading-none text-left">
            <div className="bg-[#ce1212] p-2 rounded-lg shadow-lg shrink-0 text-left flex items-center justify-center">
              <LayoutGrid size={24} className="text-white text-left" />
            </div>
            <div className="text-left leading-none text-left text-left">
              <h1 className="text-lg md:text-xl font-black text-white uppercase leading-none text-left">Akademisyen Paneli</h1>
              <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest leading-none text-left mt-1 font-bold">AKADEMİK YÖNETİM</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar leading-none text-left">
            <button onClick={() => setActiveTab('content')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap leading-none ${activeTab === 'content' ? 'bg-[#ce1212] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <Plus size={16} /> İÇERİK YÖNETİMİ
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap leading-none ${activeTab === 'analytics' ? 'bg-[#ce1212] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <BarChart3 size={16} /> ÖĞRENCİ ANALİZLERİ
            </button>
            <button 
  onClick={() => setActiveTab('time_analytics')} 
  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap leading-none ${activeTab === 'time_analytics' ? 'bg-[#ce1212] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
>
  <Clock size={16} /> SİSTEM ZAMAN ANALİTİĞİ
</button>
            
            
          </div>

          <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold text-[10px] uppercase leading-none transition-all active:scale-95 text-left shadow-sm">
            <LogOut size={16} /> GÜVENLİ ÇIKIŞ
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* 3. ANA İÇERİK (MAIN) */}
      {/* ---------------------------------------------------------------- */}
      <main className="max-w-6xl mx-auto p-4 md:p-12 pt-8 md:pt-12 print:hidden text-left">
        {activeTab === 'content' ? (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
            <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden text-left leading-normal">
              {fetchingWeek && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center text-left">
                    <div className="flex flex-col items-center gap-3 font-black text-[#ce1212] animate-pulse text-center leading-none text-left">
                        <RefreshCcw className="animate-spin text-left" size={32} />
                        <span className="text-xs uppercase tracking-widest font-bold leading-none text-left">VERİLER ALINIYOR...</span>
                    </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
                <div className="md:col-span-1 text-left leading-none text-left">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">Düzenlenen Hafta</label>
                  <select value={weekNumber} onChange={(e) => setWeekNumber(Number(e.target.value))} className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black font-bold outline-none focus:border-red-500 transition-colors text-sm shadow-inner leading-none text-left">
                    {Array.from({ length: 14 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}. Hafta</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 text-left leading-none text-left">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">Haftalık Konu Başlığı</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black outline-none focus:border-red-500 font-bold transition-all text-sm shadow-inner leading-none text-left" placeholder="Haftanın ana başlığını giriniz..." />
                </div>
                <div className="md:col-span-1 text-left leading-none text-left">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">Erişim Tarihi (Kilit)</label>
                  <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none focus:border-red-500 shadow-inner leading-none text-left" />
                </div>
              </div>

             

              {weekNumber === 1 && (
                <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-red-50 to-white rounded-3xl border-2 border-[#ce1212]/20 shadow-sm space-y-6 text-left leading-normal text-left">
                  <div className="flex items-center gap-3 text-[#ce1212] border-b border-red-100 pb-4 leading-none text-left">
                    <ShieldCheck size={24} className="text-left" />
                    <div className="text-left leading-none text-left text-left">
                        <h3 className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-none text-left uppercase text-left text-left">SİSTEM GENELİ ORYANTASYON VİDEOSU</h3>
                        <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-tighter text-left leading-none">* Sisteme girişte izlenmesi zorunlu olan rehber içeriktir.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-none text-left">
                    <div className="text-left leading-none text-left">
                      <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none"><Type size={12} className="text-left" /> Oryantasyon Başlığı</label>
                      <input type="text" value={introTitle} onChange={(e) => setIntroTitle(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-red-500 bg-white leading-none text-left" />
                    </div>
                    <div className="text-left leading-none text-left">
                      <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none"><PlayCircle size={12} className="text-left" /> Video Embed URL</label>
                      <input type="url" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-red-500 bg-white leading-none text-left" />
                    </div>
                    <div className="md:col-span-4 text-left leading-none mt-4">
  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">Oryantasyon Metni (Opsiyonel)</label>
  <textarea 
    value={introDescription} 
    onChange={(e) => setIntroDescription(e.target.value)} 
    rows={4}
    className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black font-bold outline-none focus:border-red-500 transition-all text-sm shadow-inner leading-relaxed text-left" 
    placeholder="Hoş geldiniz metni veya sistem rehberini buraya yazabilirsiniz..." 
  />
</div>
                  </div>
                </div>
              )}

              <div className="space-y-6 text-left leading-normal text-left text-left text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4 leading-none text-left">
                  <h3 className="font-black text-secondary uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 text-left leading-none text-left text-left text-left"><ListChecks size={18} className="text-[#ce1212] text-left" /> Materyaller ve Puanlama</h3>
                  <button type="button" onClick={addMaterialRow} className="w-full sm:w-auto bg-red-50 text-[#ce1212] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black hover:bg-[#ce1212] hover:text-white transition-all shadow-sm leading-none text-left"><Plus size={16} className="text-left" /> MATERYAL EKLE</button>
                </div>
                <div className="grid gap-6 text-left">
                  {materials.map((mat, mIndex) => (
                    <div key={mIndex} className="p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-[2.5rem] border border-gray-200 space-y-4 hover:border-red-200 transition-all group leading-normal text-left">
                      <div className="flex flex-col lg:flex-row gap-4 items-center leading-none text-left text-left text-left text-left">
                        <div className="w-full lg:w-32 shrink-0 leading-none text-left">
                            <select value={mat.content_type} onChange={(e) => updateMaterial(mIndex, 'content_type', e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-black text-[9px] font-black bg-white outline-none shadow-sm leading-none text-left cursor-pointer">
                              <option value="video">🎥 Video</option>
                              <option value="podcast">🎙️ Podcast</option>
                              <option value="form">📝 Test</option>
                              <option value="pdf">📄 PDF</option>
                              <option value="assignment">📂 Ödev (MS Form)</option> {/* BURAYI EKLE */}
                            </select>
                        </div>
                        <div className="w-full flex-1 leading-none text-left">
                            <input type="text" placeholder="Materyal Başlığı" className="w-full p-3 rounded-xl border border-gray-200 text-black text-xs font-bold outline-none bg-white shadow-sm leading-none text-left" value={mat.title} onChange={(e) => updateMaterial(mIndex, 'title', e.target.value)} />
                        </div>
                        
                        {mat.content_type !== 'pdf' && (
                          <div className="w-full lg:w-28 shrink-0 flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm text-left">
                              <Award size={14} className="text-amber-500 ml-1 text-left" />
                              <input type="number" placeholder="Puan" className="w-full p-2 text-xs font-black text-secondary outline-none leading-none bg-transparent text-left" value={mat.point_value} onChange={(e) => updateMaterial(mIndex, 'point_value', e.target.value)} />
                          </div>
                        )}

                        {/* SADECE TEST DEĞİLSE URL INPUTU GÖSTER */}
                        {mat.content_type !== 'form' && (
                          <div className="w-full flex-[1.5] leading-none text-left">
                               <input type="url" placeholder={mat.content_type === 'pdf' ? "OneDrive İndirme Linki" : "Embed URL Adresi"} className="w-full p-3 rounded-xl border border-gray-200 text-black text-[10px] font-mono outline-none bg-white shadow-sm leading-none text-left" value={mat.embed_url} onChange={(e) => updateMaterial(mIndex, 'embed_url', e.target.value)} />
                          </div>
                        )}

                        <button type="button" onClick={() => removeMaterialRow(mIndex)} className="w-full lg:w-auto p-3 text-red-400 hover:text-red-600 transition-colors leading-none active:scale-90 text-left"><Trash2 size={20} className="text-left" /></button>
                      </div>

                      {mat.content_type === 'form' && mat.quiz && (
                        <div className="mt-4 bg-white p-5 rounded-2xl border-2 border-dashed border-red-100 space-y-6 text-left leading-normal text-left">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-3 text-left">
                            <div className="flex items-center gap-2 text-[#ce1212] font-black text-[10px] uppercase tracking-widest text-left"><ListChecks size={18} /> Sınav Düzenleyici</div>
                            <button type="button" onClick={() => addQuestion(mIndex)} className="text-[#ce1212] font-black text-[9px] uppercase hover:underline">+ Yeni Soru Ekle</button>
                          </div>
                          <div className="space-y-8 text-left">
                            {mat.quiz.questions.map((q, qIndex) => (
                              <div key={qIndex} className="p-4 bg-gray-50/50 rounded-xl space-y-4 border border-gray-100 text-left">
                                <div className="flex gap-4 items-start text-left">
                                    <span className="bg-[#ce1212] text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">{qIndex + 1}</span>
                                    <input type="text" placeholder="Soru metni..." className="w-full p-2.5 rounded-lg border text-xs font-bold focus:border-red-500 outline-none shadow-sm" value={q.question_text} onChange={(e) => updateQuestionText(mIndex, qIndex, e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:pl-11 text-left">
                                  {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${opt.is_correct ? 'bg-green-50 border-green-500' : 'bg-white border-gray-100'}`}>
                                      <button type="button" onClick={() => setCorrectOption(mIndex, qIndex, oIndex)} className={`w-5 h-5 rounded flex items-center justify-center shrink-0 shadow-sm ${opt.is_correct ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}><Check size={12} /></button>
                                      <input type="text" placeholder="Şık içeriği..." className="flex-1 bg-transparent text-[10px] font-bold outline-none" value={opt.option_text} onChange={(e) => updateOption(mIndex, qIndex, oIndex, e.target.value)} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 space-y-6 text-left leading-normal text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4 leading-none text-left">
                  <div className="flex items-center gap-2 text-secondary font-black text-[10px] md:text-xs uppercase tracking-widest leading-none text-left"><BookOpen size={18} className="text-blue-600" /> Haftalık Flashcardlar</div>
                  <button type="button" onClick={() => setFlashcards([...flashcards, { question: '', answer: '' }])} className="w-full sm:w-auto bg-blue-50 text-blue-600 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm leading-none text-left"><Plus size={16} /> KART EKLE</button>
                </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left leading-normal">
  {flashcards.map((card, idx) => (
    <div key={idx} className="p-5 md:p-6 bg-blue-50/30 rounded-2xl border-2 border-blue-100 space-y-4 relative group hover:border-blue-300 transition-all shadow-sm">
      <button 
        type="button" 
        onClick={() => setFlashcards(flashcards.filter((_, i) => i !== idx))} 
        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>
      
      <div className="space-y-4">
        {/* KAYNAK BAŞLIĞI (Eski Question) */}
        <div>
          <label className="block text-[9px] font-black text-blue-600 uppercase mb-1.5 tracking-widest">
            <Type size={10} className="inline mr-1" /> Kaynak / Döküman Adı
          </label>
          <input 
            type="text" 
            placeholder="Örn: Haftalık Özet Notları"
            className="w-full p-3 rounded-xl border border-blue-100 text-xs font-bold outline-none focus:border-blue-500 bg-white" 
            value={card.question} 
            onChange={(e) => updateFlashcard(idx, 'question', e.target.value)} 
          />
        </div>

        {/* ONEDRIVE LINKI (Eski Answer) */}
        <div>
          <label className="block text-[9px] font-black text-blue-600 uppercase mb-1.5 tracking-widest">
            <Download size={10} className="inline mr-1" /> OneDrive / Word / PDF Linki
          </label>
          <input 
            type="url" 
            placeholder="https://bingol-my.sharepoint.com/..."
            className="w-full p-3 rounded-xl border border-blue-100 text-[10px] font-mono outline-none focus:border-blue-500 bg-white" 
            value={card.answer} 
            onChange={(e) => updateFlashcard(idx, 'answer', e.target.value)} 
          />
        </div>
      </div>
    </div>
  ))}
</div>
              </div>
               <div className="mb-10 p-6 md:p-8 bg-amber-50/30 rounded-3xl border-2 border-amber-100 shadow-sm space-y-6 text-left leading-normal text-left">
                <div className="flex items-center gap-3 text-amber-600 border-b border-amber-100 pb-4 leading-none text-left">
                  <Calendar size={24} className="text-left" />
                  <div className="text-left leading-none text-left">
                      <h3 className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-none text-left uppercase text-left">HAFTALIK DERS NOTLARI VE ÖZET</h3>
                      <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-tighter text-left leading-none">* Öğrencilerin panelinde görüntülenecek olan haftalık akademik içerik.</p>
                  </div>
                </div>
                <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-5 md:p-8 rounded-2xl border-2 border-gray-100 bg-white text-black outline-none focus:border-amber-500 transition-all font-bold text-sm shadow-inner leading-relaxed text-left" placeholder="Ders notlarını, formülleri veya önemli hatırlatmaları buraya yazabilirsiniz..." />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-10 bg-[#1a1a1a] text-white py-6 rounded-[2rem] font-black tracking-[0.2em] hover:bg-black transition-all flex justify-center items-center gap-3 shadow-2xl active:scale-95 text-xs md:text-sm uppercase leading-none"><Save size={20} className="text-[#ce1212]" /> {loading ? "KAYDEDİLİYOR..." : "HAFTAYI KAYDET VE YAYINLA"}</button>
            </div>
          </form>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 md:space-y-8 pb-10 text-left leading-normal text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left">
               <div className="flex items-center gap-6 leading-none text-left text-left">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 flex items-center justify-center leading-none text-left"><Users size={32} className="text-left" /></div>
                  <div className="text-left leading-none text-left text-left"><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 leading-none text-left">Kayıtlı Öğrenci</p><p className="text-3xl font-black text-left">{filteredAnalytics.length}</p></div>
               </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto leading-none text-left">
  {/* BÖLÜM SEÇİCİ */}
  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 text-left">
    <Filter size={16} className="text-gray-400 text-left" />
    <select 
      value={selectedDepartment} 
      onChange={(e) => setSelectedDepartment(e.target.value)} 
      className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-left"
    >
      {/* 'Tüm Bölümler' seçeneği buradan silindi (Uyumsuzluk yarattığı için) */}
      {departmentList.map(d => (
        <option key={d.id} value={d.id} className="text-left">{d.name}</option>
      ))}
    </select>
  </div>

  {/* PDF RAPOR BUTONU */}
  <button 
    onClick={handlePrintAll} 
    disabled={pdfLoading} // İstek atılırken mükerrer tıklamayı önlemek için
    className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all leading-none active:scale-95 text-left ${
      loading ? 'bg-gray-500 cursor-wait' : 'bg-red-700 hover:bg-red-800 text-white'
    }`}
  >
    {pdfLoading ? (
      <RefreshCcw size={18} className="animate-spin text-left" />
    ) : (
      <FileText size={18} className="text-left" />
    )}
    
    {pdfLoading 
      ? "RAPOR HAZIRLANIYOR..." 
      : `${getDeptName(selectedDepartment).toUpperCase()} PDF RAPORU`
    }
  </button>
</div>
            </div>

            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden text-left leading-normal">
  <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <BarChart3 size={18} className="text-[#ce1212]" />
      <h2 className="font-black text-secondary uppercase text-[10px] md:text-xs tracking-widest">
        Akademik Takip Çizelgesi
      </h2>
    </div>
  </div>
  <div className="overflow-x-auto custom-scrollbar">
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-gray-100/50 text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">
          <th className="p-5 md:p-8">AD SOYAD / BÖLÜM</th>
          <th className="p-5 md:p-8">PUAN / AKTİF İLERLEME</th>
          <th className="p-5 md:p-8">TOPLAM SÜRE</th>
          <th className="p-5 md:p-8 text-center">İŞLEM</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {filteredAnalytics.map((student) => (
          <tr key={student.id} className="hover:bg-gray-50/50 transition-all group">
            <td className="p-5 md:p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ring-4 ring-gray-50 uppercase">
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="font-black text-black text-sm truncate uppercase">{student.first_name} {student.last_name}</p>
                  <p className="text-[9px] text-[#ce1212] font-black mt-1 uppercase">{getDeptName(student.department)}</p>
                </div>
              </div>
            </td>
            <td className="p-5 md:p-8">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-black text-[10px] border border-amber-200 shrink-0 shadow-sm">
                  {student.total_points} Puan
                </div>
                <div className="space-y-1.5 w-32">
                  <div className="flex justify-between items-center leading-none">
                    {/* EN SON YÜZDELİK VE TUR BİLGİSİ */}
                    <span className="text-[10px] font-bold text-secondary">
                      %{student.overall_progress}
                    </span>
                    {/* Eğer öğrenci herhangi bir haftada 2. tura geçtiyse bir uyarı ikonu eklenebilir */}
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">GÜNCEL</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${student.overall_progress === 100 ? 'bg-green-500' : 'bg-[#ce1212]'}`} 
                      style={{ width: `${student.overall_progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </td>
            <td className="p-5 md:p-8">
              <div className="flex items-center gap-2 text-gray-700 font-black text-xs md:text-sm">
                <Clock size={16} className="text-amber-500 shrink-0" /> 
                {formatDuration(student.total_time_spent)}
              </div>
            </td>
            <td className="p-5 md:p-8 text-center">
              <button 
                onClick={async () => {
   setKarneLoading(true);
    try {
      // Sadece bu öğrenciye özel haftalık detayları çekiyoruz
      const res = await api.get(`/contents/analytics/?student_id=${student.id}`);
      setSelectedStudent(res.data); // Veri gelince modal otomatik ve dolu açılır
    } catch (err) {
      alert("Karne verileri yüklenemedi.");
    } finally {
      setKarneLoading(false);
    }
  }}
                className="inline-flex items-center gap-2 text-[9px] font-black uppercase bg-secondary text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all active:scale-95 shadow-md"
              >
                <Search size={14} /> HAFTALIK KARNE
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
          </div>
        )}
   {/* --- SEKME 5: SİSTEM ZAMAN ANALİTİĞİ VE ETKİNLİK DAĞILIMLARI --- */}
{activeTab === 'time_analytics' && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
    
    {/* ÜST SEÇİM KONTROLÜ VE BÖLÜM FİLTRESİ */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left">
      <div className="text-left leading-none">
        <h2 className="text-xl font-black text-purple-950 uppercase leading-none border-l-4 border-purple-600 pl-3">Sistem Zaman Yönetimi Verileri</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest italic leading-none">Öğrencilerin Aktif Kalma Süreleri ve Materyal Dağılım Analizleri</p>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-left shadow-inner w-full md:w-auto">
        <Filter size={16} className="text-purple-600" />
        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-purple-950 w-full font-black">
          {Array.isArray(departmentList) && departmentList.map(d => (<option key={d.id} value={d.id} className="text-black">{d.name}</option>))}
        </select>
      </div>
    </div>

    {systemTimeLoading ? (
      <div className="bg-white p-16 text-center text-gray-400 font-black uppercase text-xs tracking-widest rounded-3xl border border-dashed shadow-sm animate-pulse">
        Sistem Zaman Analizleri Veritabanından Jet Hızıyla Çekiliyor...
      </div>
    ) : (
      (() => {
        const rawMax = systemTimeData?.max_engagement || { student: "Veri Yok", time: "0 Saat" };
        const rawMin = systemTimeData?.min_engagement || { student: "Veri Yok", time: "0 Saat" };
        const activityList = Array.isArray(systemTimeData?.activity_distribution) ? systemTimeData?.activity_distribution : [];
        const studentList = Array.isArray(systemTimeData?.raw_student_list) ? systemTimeData?.raw_student_list : [];
        const maxActivityHours = activityList.reduce((max, item) => item.hours > max ? item.hours : max, 1);

        // --- SAAT ONDALIK DEĞERİNİ METNE ÇEVİREN AKILLI DÖNÜŞTÜRÜCÜ ---
        // Örn: "6.07 Saat" veya 6.07 sayısal değerini -> "6 sa 4 dk" yapar
        const convertHoursToText = (timeVal: string | number) => {
          if (!timeVal || timeVal === "0 Saat") return "0 dk";
          const numericHours = typeof timeVal === 'number' ? timeVal : parseFloat(String(timeVal).replace(/[^0-9.]/g, ''));
          if (isNaN(numericHours) || numericHours === 0) return "0 dk";
          
          const totalMinutes = Math.round(numericHours * 60);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          
          if (hours === 0) return `${minutes} dk`;
          if (minutes === 0) return `${hours} sa`;
          return `${hours} sa ${minutes} dk`;
        };

        const maxEngagement = { student: rawMax.student, time: convertHoursToText(rawMax.time) };
        const minEngagement = { student: rawMin.student, time: convertHoursToText(rawMin.time) };

        const exportZamanRaporPDF = async () => {
          const { jsPDF } = await import('jspdf');
          const autoTable = (await import('jspdf-autotable')).default;
          const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const fixTR = (str) => !str ? "" : str.replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u").replace(/İ/g, "I").replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C").replace(/Ö/g, "O").replace(/Ü/g, "U");
          
          doc.setFont("Helvetica", "bold"); doc.setFillColor(67, 24, 108); doc.rect(0, 0, 210, 25, "F");
          doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.text("SISTEMDE AKTIF KATILIM VE CALISMA RAPORU", 30, 15);
          
          // PDF tablosuna da Türkçe karakter korumalı ve formatlanmış süreyi basıyoruz
          const pdfRows = studentList.map((item) => [ 
            `#${item.rank}`, 
            fixTR(item.student), 
            selectedDepartment ? fixTR(String(selectedDepartment).toUpperCase()) : "COCUK GELISIMI", 
            fixTR(convertHoursToText(item.time)) 
          ]);

          autoTable(doc, {
            startY: 35,
            head: [[fixTR('Sıralama'), fixTR('Ogrenci Adi Soyadi'), fixTR('Bolum / Departman'), fixTR('Toplam Aktif Sure')]],
            body: pdfRows,
            styles: { font: 'Helvetica', fontSize: 9 }
          });
          doc.save(`Sistem_Katilim_Zaman_Analizi.pdf`);
        };

        return (
          <>
            {/* EN AKTİF / EN AZ AKTİF ÖĞRENCİ KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-xl border-l-[10px] border-green-500 text-left flex flex-col justify-between min-h-[130px]">
                <div><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sistemde En Uzun Süre Kalan Öğrenci</span><h3 className="text-lg font-black text-purple-950 uppercase truncate">{maxEngagement.student}</h3></div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-4"><span className="text-[10px] text-gray-400 font-bold uppercase">Toplam Aktif Çalışma</span><span className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-xl text-sm">{maxEngagement.time}</span></div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-xl border-l-[10px] border-orange-500 text-left flex flex-col justify-between min-h-[130px]">
                <div><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sistemde En Az Süre Kalan Öğrenci</span><h3 className="text-lg font-black text-purple-950 uppercase truncate">{minEngagement.student}</h3></div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-4"><span className="text-[10px] text-gray-400 font-bold uppercase">Toplam Aktif Çalışma</span><span className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-xl text-sm">{minEngagement.time}</span></div>
              </div>
            </div>

            {/* ETKİNLİK DAĞILIM BARLARI GRAFİĞİ */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-left space-y-4">
              <h3 className="text-xs font-black text-purple-950 uppercase tracking-widest border-l-4 border-indigo-500 pl-2">Materyal ve Etkinlik Türlerine Göre Zaman Dağılımları</h3>
              <div className="grid grid-cols-1 gap-3">
                {activityList.map((act: any, idx: number) => {
                  const currentPct = Math.round((act.hours / maxActivityHours) * 100) || 0;
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                      <div className="sm:w-48 shrink-0"><span className="text-xs font-black text-purple-950 block">{act.type}</span></div>
                      <div className="flex-1 bg-gray-200 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner"><div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-full" style={{ width: `${currentPct}%` }} /></div>
                      <div className="sm:w-28 text-right font-black text-xs text-purple-950 shrink-0">{convertHoursToText(act.hours)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LİDERLİK SIRALAMA TABLOSU */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">
              <div className="p-6 border-b bg-purple-50/20 flex justify-between items-center">
                <h2 className="font-black text-purple-950 uppercase text-xs tracking-widest flex items-center gap-2 leading-none">⏱️ Öğrenci Katılım Sıralama Listesi</h2>
                <button onClick={exportZamanRaporPDF} className="bg-purple-950 hover:bg-purple-900 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"><FileText size={13} /> PDF Al</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-purple-950 text-white text-[10px] font-black uppercase tracking-widest">
                    <tr><th className="p-5 w-24 text-center">SIRA</th><th className="p-5">ÖĞRENCİ ADI SOYADI</th><th className="p-5 text-center w-48">TOPLAM AKTİF SÜRE</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-sm">
                    {studentList.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-purple-50/20 transition-all">
                        <td className="p-4 text-center"><span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gray-50 text-gray-500">#{item.rank}</span></td>
                        <td className="p-4 text-purple-950 font-black uppercase">{item.student}</td>
                        <td className="p-4 text-center"><span className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-black">{convertHoursToText(item.time)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      })()
    )}
  </div>
)}
      </main>

     {/* KARNE MODALI - SADECE AI SORULARI VE TEST SONUÇLARI */}
{selectedStudent && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300 overflow-y-auto text-left leading-none">
    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border-4 border-white my-auto text-left">
      
      {/* HEADER */}
      <div className="p-6 md:p-10 border-b bg-gray-50 flex justify-between items-center shrink-0 text-left leading-none">
        <div className="flex items-center gap-4 text-left leading-none">
          <div className="bg-secondary p-3 rounded-2xl text-white shadow-xl shrink-0 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div className="text-left leading-none">
            <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-secondary leading-none mb-2">Akademik Performans Karnesi</h3>
            <p className="text-[10px] text-[#ce1212] font-black uppercase italic leading-none">
              {selectedStudent.first_name} {selectedStudent.last_name} | {getDeptName(selectedStudent.department)}
            </p>
          </div>
        </div>
        <button onClick={() => setSelectedStudent(null)} className="bg-white p-3 rounded-full hover:bg-red-50 border transition-all text-gray-400 shadow-sm active:scale-90 flex items-center justify-center">
          <X size={24} />
        </button>
      </div>

      {/* HAFTALIK DETAYLAR LİSTESİ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-white custom-scrollbar text-left leading-normal">
        {selectedStudent.weekly_breakdown?.map((week) => (
          <div key={week.week_number} className="p-6 md:p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6 relative overflow-hidden text-left leading-normal">
            
            {/* HAFTA BAŞLIĞI */}
            <div className="flex items-center gap-4 text-left leading-none">
              <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border font-black text-secondary shrink-0 shadow-sm leading-none">
                <span className="text-[9px] text-[#ce1212] uppercase leading-none mb-1">HAFTA</span>
                <span className="text-xl leading-none">{week.week_number}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-black text-secondary leading-none">%{week.progress} Tamamlandı</span>
                {week.progress === 100 && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={12}/> BAŞARIYLA BİTİRİLDİ</span>}
              </div>
            </div>

            {/* 1. SINAV DETAY ANALİZİ */}
            {week.quiz_results && week.quiz_results.length > 0 && (
              <div className="space-y-4 text-left leading-normal border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-secondary leading-none mb-2">
                  <ListChecks size={16} className="text-[#ce1212]" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Haftalık Sınav Sonuç Analizi</p>
                </div>
                <div className="grid gap-3 text-left">
                  {week.quiz_results.map((r, ri) => (
                    <div key={ri} className={`p-4 rounded-2xl border-2 transition-all text-left ${r.is_correct ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                      <div className="flex justify-between items-start gap-3 text-left leading-tight">
                        <span className="text-[11px] font-bold text-secondary flex gap-2">
                          <span className="opacity-40">{ri + 1}.</span> {r.question_text}
                        </span>
                        {r.is_correct ? <CheckCircle size={14} className="text-green-500 shrink-0" /> : <AlertCircle size={14} className="text-red-500 shrink-0" />}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-6 border-t border-black/5 pt-3 text-left">
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-[8px] font-black text-gray-400 uppercase mb-1">Seçilen Şık</span>
                          <span className={`text-[10px] font-black ${r.is_correct ? 'text-green-600' : 'text-red-600'}`}>{r.selected_option}</span>
                        </div>
                        {!r.is_correct && (
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-[8px] font-black text-gray-400 uppercase mb-1">Doğru Şık</span>
                            <span className="text-[10px] font-black text-green-600">{r.correct_option}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. YAPAY ZEKA SORULARI */}
            {week.questions && week.questions.length > 0 && (
              <div className="bg-blue-50/30 p-6 rounded-3xl border-2 border-blue-100/50 space-y-4 text-left leading-normal border-t border-blue-100 mt-4">
                <div className="flex items-center gap-2 text-blue-600 leading-none">
                  <MessageSquare size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Yapay Zekaya Sorduğu Sorular</p>
                </div>
                <div className="space-y-3 text-left">
                  {week.questions.map((q, qi) => (
                    <div key={qi} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm relative group text-left">
                      <p className="text-[11px] font-medium italic text-gray-600 leading-relaxed text-left">
                        &quot;{q}&quot;
                      </p>
                      <Bot size={14} className="absolute top-4 right-4 text-blue-200 opacity-20" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AKTİVİTE YOKSA DURUMU */}
            {(!week.quiz_results || week.quiz_results.length === 0) && (!week.questions || week.questions.length === 0) && (
              <div className="text-left py-4 opacity-30 italic text-[10px] font-bold uppercase tracking-widest leading-none">
                Bu hafta henüz bir sınav veya AI etkileşimi bulunmuyor.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-8 bg-gray-50 border-t flex justify-center shrink-0 leading-none">
        <button 
          onClick={() => setSelectedStudent(null)} 
          className="w-full md:w-auto bg-secondary text-white px-16 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl transition-all flex items-center justify-center leading-none"
        >
          PANELİ KAPAT VE LİSTEYE DÖN
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}