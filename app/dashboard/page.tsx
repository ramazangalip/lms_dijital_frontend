"use client";
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
  PlayCircle, Headphones, FileText, ChevronRight, ChevronLeft,
  LogOut, Video, CheckCircle2, Send, X, Bot, Award, ArrowRight, 
  ListChecks, BookOpen, RefreshCcw, Sparkles, Lock, Menu,
  ShieldCheck, Zap, Eye, AlertCircle, Calendar, Download
} from 'lucide-react';

// --- VERİ TİPİ TANIMLAMALARI ---
interface Option { id: number; option_text: string; }
interface Question { id: number; question_text: string; options: Option[]; }
interface Quiz { id: number; title: string; description: string; questions: Question[]; }
interface FlashcardData { id: number; question: string; answer: string; }
interface Material { 
  id: number; 
  content_type: 'video' | 'podcast' | 'form' | 'pdf'; 
  embed_url: string; 
  title: string; 
  point_value?: number; 
  quiz?: Quiz; 
}
interface WeeklyContent {
  id: number; week_number: number; title: string; description: string;
  intro_title?: string; intro_video_url?: string; release_date?: string; 
  is_locked: boolean; lock_reason?: string; is_intro_watched: boolean;
  materials: Material[]; flashcards: FlashcardData[]; progress?: number; is_completed?: boolean;
}
interface ProgressData { weekly_content: number | string; completion_percentage: number; is_completed: boolean; }

// --- 3D FLASHCARD BİLEŞENİ ---
const Flashcard = ({ question, answer }: { question: string, answer: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="group w-full max-w-xl mx-auto h-64 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div className="absolute inset-0 w-full h-full bg-white border-2 border-gray-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
          <div className="bg-red-50 text-primary p-3 rounded-2xl mb-4 text-center">
            <BookOpen size={24} className="mx-auto" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">SORU</span>
          <p className="text-center font-bold text-secondary text-base leading-tight">{question}</p>
          <div className="absolute bottom-4 flex items-center gap-2 text-[9px] text-primary font-bold uppercase animate-pulse">
            <RefreshCcw size={10} /> Cevabı Gör
          </div>
        </div>
        <div className="absolute inset-0 w-full h-full bg-primary text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] text-center">
          <span className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-4">CEVAP</span>
          <p className="text-center font-medium text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [contents, setContents] = useState<WeeklyContent[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyContent | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [isIntroView, setIsIntroView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<{show: boolean, amount: number}>({show: false, amount: 0});
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{score: number, correct: number, wrong: number} | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [aiAnalysisFeedback, setAiAnalysisFeedback] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'bot', content: string}[]>([{ role: 'bot', content: 'Merhaba! Ben BÜ-LMS Yapay Zeka asistanıyım. Sana nasıl yardımcı olabilirim?' }]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const materialWatchThreshold = 420; 
  const introWatchThreshold = 240;    
  const [watchTime, setWatchTime] = useState(0);
  const [introWatchTime, setIntroWatchTime] = useState(0);
  const activeMaterialRef = useRef<Material | null>(null);
  const watchTimeInternalRef = useRef(0);
  const introWatchTimeInternalRef = useRef(0);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const introTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => { activeMaterialRef.current = activeMaterial; }, [activeMaterial]);

  const getSortedMaterials = (mats: Material[]) => {
    const orderMap = { video: 1, podcast: 2, form: 3, pdf: 4 };
    return [...mats].sort((a, b) => (orderMap[a.content_type] || 5) - (orderMap[b.content_type] || 5));
  };

  const isQuizLocked = () => {
    if (!selectedWeek || !activeMaterial || activeMaterial.content_type !== 'form') return false;
    const mediaToFinish = selectedWeek.materials.filter(m => m.content_type === 'video' || m.content_type === 'podcast');
    return mediaToFinish.some(m => !completedMaterials.includes(String(m.id)));
  };

  const getIntroData = () => {
    const weekOne = contents.find(c => c.week_number === 1);
    return {
      url: weekOne?.intro_video_url || selectedWeek?.intro_video_url || "",
      title: weekOne?.intro_title || selectedWeek?.intro_title || "Genel Oryantasyon",
      isWatched: weekOne?.is_intro_watched || selectedWeek?.is_intro_watched || false
    };
  };

  const fetchContents = async (isUpdate = false) => {
    try {
      const [contentRes, progressRes, completedMatsRes, analyticsRes] = await Promise.all([
        api.get('/contents/list/'), 
        api.get('/contents/studentprogress/'),
        api.get('/contents/completed-materials-ids/'), 
        api.get('/contents/analytics/')
      ]);
      setUserTotalPoints(analyticsRes.data.total_points || 0);
      const stringifiedCompleted = (completedMatsRes.data || []).map((id: any) => String(id));
      setCompletedMaterials(stringifiedCompleted);
      const rawContents = contentRes.data;
      const progressData = progressRes.data;
      const mergedData = rawContents.map((week: WeeklyContent) => {
        const foundProgress = progressData.find((p: ProgressData) => String(p.weekly_content) === String(week.id));
        return { ...week, progress: foundProgress ? Math.round(foundProgress.completion_percentage) : 0, is_completed: foundProgress ? foundProgress.is_completed : false };
      });
      setContents(mergedData);
      if (isInitialMount.current && mergedData.length > 0 && !selectedWeek) {
        const firstWeek = mergedData.sort((a: any, b: any) => a.week_number - b.week_number)[0];
        setSelectedWeek(firstWeek); setIsIntroView(true); isInitialMount.current = false;
      } else if (selectedWeek) {
        const updated = mergedData.find((c: any) => String(c.id) === String(selectedWeek.id));
        if (updated) setSelectedWeek(prev => prev ? { ...updated, materials: prev.materials } : updated);
      }
    } catch (err) { console.error("Veri çekme hatası."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchContents(); }, []);

  const handleCompleteMaterial = async (materialId: number | string) => {
    if (!materialId) return;
    try {
      const res = await api.post('contents/complete-material/', { material_id: String(materialId) });
      if (res.data.status === "success") {
          if (res.data.new_points_earned > 0) {
              setPointsEarned({ show: true, amount: res.data.new_points_earned });
              setUserTotalPoints(res.data.total_points);
              setTimeout(() => setPointsEarned({ show: false, amount: 0 }), 5000);
          }
      }
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
      watchTimeInternalRef.current = 0; setWatchTime(0);
      await fetchContents(true);
    } catch (err) { console.error("Tamamlama hatası."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleQuizSubmit = async () => {
    if (!activeMaterial?.quiz) return;
    const totalQs = activeMaterial.quiz.questions.length;
    if (Object.keys(selectedAnswers).length < totalQs) { alert("Lütfen tüm soruları cevaplayın."); return; }
    setQuizSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([qId, oId]) => ({ question_id: String(qId), option_id: String(oId) }));
      const res = await api.post(`/contents/quiz/${String(activeMaterial.quiz.id)}/submit/`, { answers });
      setQuizResult({ score: res.data.score, correct: res.data.correct || res.data.correct_answers || 0, wrong: res.data.wrong || res.data.wrong_answers || 0 });
      setCurrentAttemptId(String(res.data.attempt_id));
      const earned = res.data.points_earned || 0;
      if (earned > 0) {
          setPointsEarned({ show: true, amount: earned });
          setUserTotalPoints(prev => prev + earned);
          setTimeout(() => setPointsEarned({ show: false, amount: 0 }), 5000);
      }
      setCompletedMaterials(prev => [...prev, String(activeMaterial.id)]);
      await fetchContents(true);
    } catch (err) { alert("Test gönderim hatası."); } finally { setQuizSubmitting(false); }
  };

  const handleFetchAIAnalysis = async () => {
    if (!currentAttemptId) return;
    setIsAnalysisLoading(true); setIsAnalysisModalOpen(true);
    try {
      const res = await api.get(`/contents/quiz-analysis/${String(currentAttemptId)}/`);
      setAiAnalysisFeedback(res.data.ai_feedback);
    } catch (err) { setAiAnalysisFeedback("Analiz yüklenemedi."); } finally { setIsAnalysisLoading(false); }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput(""); setIsTyping(true);
    try {
      const res = await api.post('/contents/ai-chat/', { message: userMsg, weekly_content_id: selectedWeek?.id });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'bot', content: 'Hata oluştu.' }]); } finally { setIsTyping(false); }
  };

  const introStatus = getIntroData();

  useEffect(() => {
    if (introTimerRef.current) clearInterval(introTimerRef.current);
    if (isIntroView && introStatus.url && !introStatus.isWatched) {
      introWatchTimeInternalRef.current = 0;
      introTimerRef.current = setInterval(() => {
        introWatchTimeInternalRef.current += 1; setIntroWatchTime(introWatchTimeInternalRef.current);
        if (introWatchTimeInternalRef.current >= introWatchThreshold) api.post('/contents/weeks/complete-intro/').then(() => fetchContents(true));
      }, 1000);
    }
    return () => { if (introTimerRef.current) clearInterval(introTimerRef.current); };
  }, [isIntroView, introStatus.url, introStatus.isWatched]);

  useEffect(() => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    if (!isIntroView && activeMaterial && (activeMaterial.content_type === 'video' || activeMaterial.content_type === 'podcast') && !completedMaterials.includes(String(activeMaterial.id)) && introStatus.isWatched) {
      watchTimeInternalRef.current = 0;
      watchTimerRef.current = setInterval(() => {
        watchTimeInternalRef.current += 1; setWatchTime(watchTimeInternalRef.current);
        if (watchTimeInternalRef.current >= materialWatchThreshold) { if (activeMaterialRef.current) handleCompleteMaterial(activeMaterialRef.current.id); }
      }, 1000);
    }
    return () => { if (watchTimerRef.current) clearInterval(watchTimerRef.current); };
  }, [activeMaterial?.id, isIntroView, completedMaterials.length, introStatus.isWatched]);

  const handleWeekSelection = (weekData: WeeklyContent) => {
    if (weekData.is_locked) return;
    setSelectedWeek(weekData); setQuizResult(null); setSelectedAnswers({}); setCurrentAttemptId(null); setCurrentCardIndex(0); watchTimeInternalRef.current = 0; setWatchTime(0); setIsIntroView(false); 
    if (weekData.materials.length > 0) setActiveMaterial(getSortedMaterials(weekData.materials)[0]);
    else setActiveMaterial(null);
    setIsSidebarOpen(false); 
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4 text-left text-secondary">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">YÜKLENİYOR...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-roboto relative text-secondary text-left">
      
      {/* YEŞİL ŞEFFAF PUAN BİLDİRİMİ */}
      {pointsEarned.show && (
        <div className="fixed top-6 right-6 z-[1000] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-green-500/10 backdrop-blur-md border border-green-500/20 text-green-700 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-500/30">
                <Award size={20} />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] font-bold uppercase opacity-70">Tebrikler!</p>
                <p className="text-sm font-black">+{pointsEarned.amount} Puan Kazandınız!</p>
              </div>
           </div>
        </div>
      )}

      {/* MOBİL ÜST BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-secondary flex items-center justify-between px-6 z-[60] shadow-md">
        <h2 className="text-white font-black uppercase text-xs tracking-widest text-primary">BÜ-LMS</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-1.5 bg-gray-800 rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      {/* SOL MENÜ (SIDEBAR) */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-secondary shadow-2xl flex flex-col border-r border-gray-800 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-700 bg-black/20 text-center flex items-center justify-between shrink-0">
          <div className="w-full text-center ml-2">
            <h2 className="logo-text text-lg text-white tracking-widest text-primary font-bold uppercase leading-none">BÜ-LMS</h2>
            <p className="text-[9px] text-gray-500 uppercase mt-1.5 tracking-tighter text-center">ÖĞRENCİ PANELİ</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 absolute right-4 top-5"><X size={20} /></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar leading-tight text-left">
          <button onClick={() => { setIsIntroView(true); setActiveMaterial(null); }} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border ${isIntroView ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
            <div className="bg-white/10 p-1.5 rounded-lg shrink-0"><Video size={16}/></div>
            <div className="text-left"><p className="text-[8px] font-black uppercase tracking-widest mb-1 text-gray-400">Tanıtım</p><p className="text-xs font-bold uppercase">TANITIM VİDEOSU</p></div>
          </button>
          <div className="h-px bg-gray-700/50 mx-2 my-1" />
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((num) => {
            const weekData = contents.find((c) => c.week_number === num);
            const isActive = selectedWeek?.week_number === num && !isIntroView;
            const isFinished = weekData?.is_completed;
            const introLocked = !introStatus.isWatched;
            const isWeekLocked = weekData?.is_locked || introLocked;
            const lockReason = weekData?.lock_reason || (introLocked ? "Önce tanıtım videosunu izlemelisiniz." : "");

            return (
              <div key={`sidebar-week-wrapper-${num}`} className="relative group">
                <button 
                  disabled={!weekData || isWeekLocked} 
                  onClick={() => weekData && handleWeekSelection(weekData)} 
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all border ${isActive ? 'bg-primary border-primary text-white shadow-lg' : isWeekLocked ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-40' : weekData ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-transparent border-dashed border-gray-700 text-gray-700 opacity-20'}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {isWeekLocked ? (
                      <Lock size={14} className="text-gray-600" />
                    ) : isFinished ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : (
                      <span className="text-[10px] font-bold">{num < 10 ? `0${num}` : num}</span>
                    )}
                    <div className="text-left leading-tight">
                      <p className="text-xs font-semibold">Hafta {num}</p>
                      {weekData && !isWeekLocked && <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5">%{weekData.progress} TAMAMLANDI</p>}
                      {isWeekLocked && weekData && <p className="text-[7px] text-red-500 font-bold uppercase mt-0.5">KİLİTLİ</p>}
                    </div>
                  </div>
                  {weekData && !isWeekLocked && <ChevronRight size={12} className="opacity-40" />}
                </button>

                {isWeekLocked && weekData && (
                  <div className="hidden group-hover:block absolute left-full ml-2 top-0 w-48 bg-black text-white text-[9px] p-2 rounded-lg z-[110] shadow-xl border border-gray-700 animate-in fade-in slide-in-from-left-1">
                    <p className="font-bold flex items-center gap-1 text-red-400 uppercase mb-1">
                      <AlertCircle size={10} /> Erişim Engellendi
                    </p>
                    {lockReason}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="p-5 border-t border-gray-700 flex items-center justify-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-[10px] tracking-widest uppercase shrink-0"><LogOut size={14} /> GÜVENLİ ÇIKIŞ</button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white custom-scrollbar pt-14 lg:pt-0">
        {selectedWeek ? (
          <div className="animate-in fade-in duration-500">
            {isIntroView ? (
              <div className="max-w-3xl mx-auto p-6 md:p-14 space-y-10 text-center">
                <div className="text-center space-y-3">
                  <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 animate-pulse text-left"><Zap size={28} /></div>
                  <h2 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tighter leading-none">{introStatus.title}</h2>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border flex items-center gap-3 mx-auto w-fit shadow-sm"><ShieldCheck size={16} className={introStatus.isWatched ? "text-green-500" : "text-primary"} /><span className="text-[10px] font-black uppercase tracking-widest text-secondary">{introStatus.isWatched ? "TANITIM TAMAMLANDI, HAFTALAR ERİŞİME AÇILDI." : "HAFTALARIN AÇILMASI İÇİN VİDEOYU İZLEMELİSİNİZ."}</span></div>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50 ring-1 ring-gray-200 bg-secondary">
                  {introStatus.url ? <iframe src={introStatus.url} className="w-full h-full text-center" allowFullScreen></iframe> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 text-center"><Lock size={40} className="opacity-20" /><p className="font-black italic uppercase tracking-widest text-[10px]">İçerik Yok</p></div>}
                </div>
              </div>
            ) : (
              <div className="max-w-screen-xl mx-auto p-6 md:p-10">
                <div className="mb-10 border-b pb-8 border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-6 leading-tight">
                  <div className="flex-1 space-y-4 leading-tight text-left">
                    <div className="flex items-center gap-3 text-left"><span className="bg-secondary text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest leading-none">HAFTA {selectedWeek.week_number}</span></div>
                    <h1 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tighter leading-tight text-left">{selectedWeek.title}</h1>
                    <div className="flex items-center gap-3 text-left"><div className="flex-1 max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden border shadow-inner text-left"><div className={`h-full transition-all duration-1000 ${selectedWeek.progress === 100 ? 'bg-green-500 text-left' : 'bg-primary text-left'}`} style={{ width: `${selectedWeek.progress || 0}%` }} /></div><span className="text-[10px] font-black text-gray-400 uppercase text-left">%{selectedWeek.progress || 0} TAMAMLANDI</span></div>
                  </div>
                  <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200 overflow-x-auto no-scrollbar max-w-full shrink-0 leading-none text-left">
                    {getSortedMaterials(selectedWeek.materials).map((mat) => {
                      let MatIcon = mat.content_type === 'video' ? Video : mat.content_type === 'podcast' ? Headphones : mat.content_type === 'pdf' ? Download : ListChecks;
                      const isTestLocked = mat.content_type === 'form' && selectedWeek.materials.filter(m => m.content_type !== 'form').some(m => !completedMaterials.includes(String(m.id)));
                      return (<button key={mat.id} onClick={() => setActiveMaterial(mat)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap leading-none ${activeMaterial?.id === mat.id ? 'bg-white text-primary shadow-md scale-105' : 'text-gray-500'} text-left`}>{completedMaterials.includes(String(mat.id)) ? <CheckCircle2 size={14} className="text-green-500" /> : isTestLocked ? <Lock size={14} className="text-gray-400" /> : <MatIcon size={14} />}<span className="ml-1 leading-none uppercase text-left">{mat.title}</span></button>);
                    })}
                  </div>
                </div>

                {activeMaterial ? (
                  <div className="space-y-12 animate-in slide-in-from-bottom-2 leading-normal text-left">
                    <section className="material-display-area text-left">
                    {activeMaterial.content_type === 'pdf' ? (
                      <div className="bg-white border-4 border-gray-50 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 text-center max-w-3xl mx-auto text-left">
                        <div className="bg-primary/10 p-6 rounded-3xl text-primary animate-pulse text-center text-left"><FileText size={64} className="text-left" /></div>
                        <div className="space-y-2 leading-tight text-center text-left">
                            <h3 className="text-2xl font-black text-secondary uppercase tracking-tighter leading-tight text-left">{activeMaterial.title}</h3>
                            <p className="text-xs text-gray-500 font-medium text-left text-center"> OneDrive üzerinden indirebilirsiniz.</p>
                        </div>
                        <a href={activeMaterial.embed_url} target="_blank" rel="noopener noreferrer" onClick={() => handleCompleteMaterial(activeMaterial.id)} className="bg-secondary text-white px-12 py-5 rounded-2xl font-black tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-xs text-left"><Download size={18} className="text-primary text-left" /> DERS NOTUNU İNDİR (PDF)</a>
                      </div>
                    ) : activeMaterial.content_type !== 'form' ? (
                      <div className="relative aspect-video shadow-2xl rounded-3xl overflow-hidden bg-black border-4 border-gray-50 ring-1 ring-gray-200 max-w-4xl mx-auto text-left"><iframe src={activeMaterial.embed_url} className="absolute inset-0 w-full h-full text-left" allowFullScreen></iframe></div>
                    ) : (
                      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto text-left">
                        <div className="bg-secondary p-5 md:p-6 flex items-center justify-between text-white border-b-2 border-primary shrink-0 leading-none text-left text-left">
                          <div className="flex items-center gap-4 leading-none text-left">
                            <div className="bg-primary p-2.5 rounded-xl shadow-lg leading-none text-center text-left"><ListChecks size={20} className="text-left" /></div>
                            <div className="text-left leading-none text-left text-left"><h2 className="text-white font-black text-base md:text-lg uppercase tracking-tighter mb-1 text-left">{activeMaterial.quiz?.title || activeMaterial.title}</h2><p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest text-left">Değerlendirme Sınavı</p></div>
                          </div>
                        </div>
                        <div className="p-5 md:p-8 space-y-8 bg-gray-50/20 leading-normal text-left text-left">
                          {isQuizLocked() ? (
                            <div className="text-center py-12 px-6 flex flex-col items-center gap-6 animate-in zoom-in-95 leading-none text-left text-center">
                              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border-2 border-red-100 shadow-lg  text-center"><Lock size={32} /></div>
                              <div className="space-y-2 text-left text-center"><h3 className="text-lg font-black text-secondary uppercase tracking-tight  text-center">Sınav Kilitli</h3><p className="text-xs text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-left text-center">Lütfen önce bu haftanın videolarını bitiriniz.</p></div>
                              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                                {getSortedMaterials(selectedWeek.materials).filter(m => m.content_type !== 'form').map(m => {
                                  const Icon = m.content_type === 'video' ? Video : m.content_type === 'podcast' ? Headphones : Download;
                                  const isDone = completedMaterials.includes(String(m.id));
                                  return (<button key={m.id} onClick={() => setActiveMaterial(m)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black border transition-all ${isDone ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-400'}`}>{isDone ? <CheckCircle2 size={12} /> : <Icon size={12} />}{m.title.toUpperCase()}</button>);
                                })}
                              </div>
                            </div>
                          ) : (completedMaterials.includes(String(activeMaterial.id)) || quizResult) ? (
                            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 leading-none text-left text-center">
                              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-100 shadow-xl animate-bounce leading-none text-left text-center text-center"><Award size={28} /></div>
                              {quizResult && (<div className="space-y-4 text-center leading-none text-left text-center text-center"><h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tighter text-primary text-center">Tebrikler!</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-lg mx-auto text-center"><div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100 text-center shadow-sm text-left"><p className="text-[8px] font-black text-gray-400 uppercase mb-2 text-left">Puan</p><p className="text-xl font-black text-secondary text-left text-center">%{quizResult.score}</p></div><div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 text-center shadow-sm text-left text-center"><p className="text-[8px] font-black text-green-600 uppercase mb-2 text-left text-center">Doğru</p><p className="text-xl font-black text-green-600 text-left text-center">{quizResult.correct}</p></div><div className="bg-red-50 p-4 rounded-xl border-2 border-red-100 text-center shadow-sm text-left text-center"><p className="text-[8px] font-black text-red-600 uppercase mb-2 text-center text-center">Yanlış</p><p className="text-xl font-black text-red-600 text-left text-center">{quizResult.wrong}</p></div></div></div>)}
                              <button onClick={handleFetchAIAnalysis} className="mx-auto flex items-center gap-2 bg-secondary text-white px-10 py-5 rounded-2xl font-black text-[10px] shadow-xl uppercase hover:scale-105 active:scale-95 transition-all mt-4 text-left text-center text-center text-center"><Sparkles size={16} className="text-primary animate-pulse text-left" /> ANALİZİ GÖR</button>
                            </div>
                          ) : (
                            <>
                              {activeMaterial.quiz?.questions.map((q, qIdx) => (
                                <div key={q.id} className="space-y-4 text-left border-b border-gray-100 pb-6 last:border-0 leading-normal text-left text-left">
                                  <h3 className="text-sm md:text-base font-black text-secondary flex gap-3 leading-tight text-left text-left"><span className="text-primary text-left">0{qIdx + 1}.</span> {q.question_text}</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:pl-8 text-left text-left text-left">
                                    {q.options.map((opt) => (<button key={opt.id} onClick={() => setSelectedAnswers(prev => ({...prev, [q.id]: opt.id}))} className={`p-3.5 rounded-xl text-left text-[11px] font-bold border-2 transition-all flex items-center justify-between group leading-tight ${selectedAnswers[q.id] === opt.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-red-100 text-left'}`}>{opt.option_text}{selectedAnswers[q.id] === opt.id && <ArrowRight size={12} className="text-left" />}</button>))}
                                  </div>
                                </div>
                              ))}
                              <button onClick={handleQuizSubmit} disabled={quizSubmitting} className="w-full bg-secondary text-white py-4 rounded-xl font-black tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-200 uppercase mt-6 text-[10px] leading-none text-left text-center">TAMAMLA</button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    </section>
                    <section className="flashcard-notes-grid space-y-12 leading-normal text-left text-left text-left text-left">
                      {selectedWeek.flashcards && selectedWeek.flashcards.length > 0 && (
                        <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 space-y-8 leading-normal text-left text-left">
                            <div className="flex items-center justify-between leading-none text-left text-left">
                              <div className="flex items-center gap-4 shrink-0 text-left text-left"><div className="bg-primary p-3 rounded-2xl text-white shadow-lg leading-none text-center text-left text-left"><BookOpen size={24} className="text-left" /></div><h3 className="font-black text-secondary uppercase text-lg tracking-tighter text-left text-left">TEKRAR KARTLARI</h3></div>
                              <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border shadow-sm shrink-0 leading-none text-left text-left text-left text-left">
                                  <button onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))} className="p-2 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-20 leading-none text-left text-left" disabled={currentCardIndex === 0}><ChevronLeft size={20} className="text-left" /></button>
                                  <span className="text-[10px] font-black w-10 text-center leading-none text-left">{currentCardIndex + 1}/{selectedWeek.flashcards.length}</span>
                                  <button onClick={() => setCurrentCardIndex(prev => Math.min(selectedWeek.flashcards.length - 1, prev + 1))} className="p-2 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-20 leading-none text-left text-left" disabled={currentCardIndex === selectedWeek.flashcards.length - 1}><ChevronRight size={20} className="text-left" /></button>
                              </div>
                            </div>
                            <Flashcard key={`fc-${selectedWeek.flashcards[currentCardIndex].id}`} question={selectedWeek.flashcards[currentCardIndex].question} answer={selectedWeek.flashcards[currentCardIndex].answer} />
                        </div>
                      )}
                      <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-xl overflow-hidden flex flex-col min-h-[400px] leading-normal text-left text-left text-left text-left">
                         <div className="bg-gray-50/80 px-8 py-6 border-b border-gray-100 flex items-center gap-4 shrink-0 leading-none text-left text-left"><FileText size={24} className="text-primary leading-none text-left text-left" /><h3 className="font-black text-secondary uppercase tracking-widest text-[10px] leading-none text-left text-left">Haftalık Not Özeti</h3></div>
                         <div className="p-8 md:p-10 text-gray-600 leading-relaxed text-base italic font-light overflow-y-auto flex-1 custom-scrollbar leading-relaxed text-left text-left text-left text-left">{selectedWeek.description || "Bulunamadı."}</div>
                      </div>
                    </section>
                  </div>
                ) : <div className="bg-gray-50 rounded-[3rem] p-24 text-center border-4 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest italic flex flex-col items-center gap-5 leading-none text-left text-left text-center"> <Eye size={64} className="opacity-10 text-left text-left text-left text-left" /> İÇERİK SEÇİNİZ</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-200 p-8 text-center gap-6 leading-none text-left text-left text-center text-center"><PlayCircle size={120} strokeWidth={0.5} className="animate-pulse opacity-10 text-left text-left text-left text-left" /><p className="text-xl font-black uppercase tracking-[0.5em] opacity-20 text-secondary text-center leading-none text-left text-center text-center text-center">Hafta Seçiniz</p></div>
        )}
      </main>

      {/* AI CHAT PANELİ */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col items-end gap-2 shrink-0 leading-none text-left text-left text-left text-left text-left">
        {isChatOpen && (
          <div className="w-[240px] md:w-[280px] h-[360px] bg-white rounded-[1.25rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5 leading-none text-left text-left text-left">
            <div className="bg-secondary p-3 flex items-center justify-between text-white shadow-lg leading-none text-left text-left text-left"><div className="flex items-center gap-2 leading-none text-left text-left text-left text-left"><div className="bg-primary p-1.5 rounded-lg shadow-md leading-none text-center text-left text-left text-left"><Bot size={14} className="text-left" /></div><h4 className="text-[9px] font-black tracking-widest uppercase leading-none text-left text-left text-left">BÜ-AI ASİSTAN</h4></div><button onClick={() => setIsChatOpen(false)} className="hover:text-primary transition-all leading-none text-left text-left text-left"><X size={14} className="text-left text-left" /></button></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50/50 custom-scrollbar leading-relaxed text-left text-left text-left text-left">
              {messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end text-left' : 'justify-start text-left'} animate-in fade-in leading-relaxed text-left text-left`}><div className={`max-w-[90%] p-2 rounded-lg text-[9px] font-medium shadow-sm leading-relaxed text-left text-left ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none text-left' : 'bg-white text-secondary rounded-tl-none border border-gray-100 text-left'}`}>{msg.content}</div></div>))}
              {isTyping && <div className="flex justify-start leading-none text-left text-left text-left text-left text-left text-left"><div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm flex gap-1 animate-pulse border border-gray-100 leading-none text-left text-left"><span className="w-1 h-1 bg-gray-300 rounded-full text-left text-left"></span><span className="w-1 h-1 bg-gray-300 rounded-full text-left text-left"></span><span className="w-1 h-1 bg-gray-300 rounded-full text-left text-left"></span></div></div>}
              <div ref={chatEndRef} className="text-left text-left text-left text-left" />
            </div>
            <form onSubmit={handleSendChatMessage} className="p-2.5 bg-white border-t border-gray-100 flex gap-2 leading-none text-left text-left text-left text-left text-left"><input type="text" placeholder="Sor..." className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-lg px-3 py-1.5 text-[9px] outline-none focus:border-primary transition-all font-bold text-secondary shadow-inner leading-none text-left text-left" value={chatInput} onChange={(e) => setChatInput(e.target.value)} /><button type="submit" className="bg-primary text-white p-2 rounded-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center leading-none text-left text-left"><Send size={12} className="text-left" /></button></form>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 z-[1000] border-2 border-white leading-none text-left text-left text-left text-left text-left ${isChatOpen ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>{isChatOpen ? <X size={18} /> : <Bot size={20} />}</button>
      </div>

      {/* AI ANALİZ MODALI */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-secondary/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto leading-none text-left text-left text-left text-left">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white my-auto flex flex-col max-h-[90vh] leading-none text-left text-left text-left text-left text-left">
            <div className="bg-secondary p-8 flex items-center justify-between text-white border-b-4 border-primary leading-none text-left"><div className="flex items-center gap-5 leading-none text-left text-left text-left text-left text-left"><div className="bg-primary p-3 rounded-2xl shadow-lg leading-none text-center text-left text-left text-left text-left shadow-red-500/20"><Bot size={28} className="text-left" /></div><div className="leading-none text-left text-left text-left text-left text-left text-left text-left text-left"><h3 className="font-black uppercase tracking-tighter text-xl leading-none text-left text-left text-left text-left">BÜ-AI Analiz Raporu</h3><p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1 leading-none text-left text-left text-left text-left">Eğitim Mentörü</p></div></div><button onClick={() => setIsAnalysisModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all leading-none text-left text-left text-left text-left text-left text-center text-center text-center text-center text-center"><X size={24} className="text-left" /></button></div>
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 min-h-[300px] leading-relaxed  text-left">
              {isAnalysisLoading ? (<div className="flex flex-col items-center justify-center py-20 gap-8 leading-none  text-center"><div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin leading-none text-left text-left text-left text-left text-left text-left"></div><p className="text-secondary font-black text-xl uppercase tracking-widest animate-pulse leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left">Veriler Analiz Ediliyor...</p></div>
              ) : (<div className="bg-white border-2 border-primary/10 p-8 rounded-[2.5rem] shadow-sm leading-relaxed animate-in slide-in-from-bottom-4   text-left"><div className="flex items-center gap-3 mb-6 text-primary leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><Sparkles size={20} className="text-left text-left" /><span className="font-black text-xs uppercase tracking-widest leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Akıllı Geri Bildirim</span></div><p className="text-secondary font-medium leading-loose text-base italic leading-relaxed whitespace-pre-line text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">&quot;{aiAnalysisFeedback}&quot;</p></div>)}
            </div>
            <div className="p-8 bg-white border-t flex justify-center leading-none  text-left"><button onClick={() => setIsAnalysisModalOpen(false)} className="w-full md:w-auto bg-secondary text-white px-16 py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl active:scale-95 leading-none text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left">Kapat Ve Devam Et</button></div>
          </div>
        </div>
      )}
    </div>
  );
}