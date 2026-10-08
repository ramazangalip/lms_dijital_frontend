"use client";
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { PlayCircle, Eye, RefreshCcw } from 'lucide-react';

import { 
  Material, 
  WeeklyContent, 
  ProgressData,
  QuizResultState
} from '@/components/types';

import StudentPointsBadge from '@/components/student/StudentPointsBadge';
import StudentHeaderMobile from '@/components/student/StudentHeaderMobile';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentIntroView from '@/components/student/StudentIntroView';
import StudentMaterialList from '@/components/student/StudentMaterialList';
import StudentMaterialViewer from '@/components/student/StudentMaterialViewer';
import StudentFlashcards from '@/components/student/StudentFlashcards';
import StudentAIChat from '@/components/student/StudentAIChat';
import StudentAnalysisModal from '@/components/student/StudentAnalysisModal';
import StudentTotalPointsCard from '@/components/student/StudentTotalPointsCard';
import InactivityTimeoutModal from '@/components/common/InactivityTimeoutModal';

export default function StudentDashboard() {
  const [contents, setContents] = useState<WeeklyContent[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyContent | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [isIntroView, setIsIntroView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [predictedScore, setPredictedScore] = useState<number>(80);
  const [quizResult, setQuizResult] = useState<QuizResultState | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [aiAnalysisFeedback, setAiAnalysisFeedback] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Merhaba! Ben BÜ-LMS Yapay Zeka asistanıyım. Sana nasıl yardımcı olabilirim?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const materialWatchThreshold = 300; 
  const introWatchThreshold = 240;    
  const [watchTime, setWatchTime] = useState(0);
  const [introWatchTime, setIntroWatchTime] = useState(0);
  const activeMaterialRef = useRef<Material | null>(null);
  const watchTimeInternalRef = useRef(0);
  const introWatchTimeInternalRef = useRef(0);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const introTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => { 
    activeMaterialRef.current = activeMaterial; 
  }, [activeMaterial]);

  const getSortedMaterials = (mats: Material[]) => {
    const orderMap = { pdf: 1, video: 2, podcast: 3, form: 4, assignment: 5 };
    return [...mats].sort((a, b) => (orderMap[a.content_type] || 6) - (orderMap[b.content_type] || 6));
  };

  const isQuizLocked = () => {
    if (!selectedWeek) return false;
    const requiredMaterials = selectedWeek.materials.filter(m => m.content_type !== 'form');
    return requiredMaterials.some(m => !completedMaterials.includes(String(m.id)));
  };

  const getIntroData = () => {
    const weekOne = contents.find(c => c.week_number === 1);
    return {
      url: weekOne?.intro_video_url || "",
      title: weekOne?.intro_title || "Genel Oryantasyon",
      isWatched: weekOne?.is_intro_watched || false,
      description: weekOne?.intro_description || "" 
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
      const mergedData = rawContents.map((week: WeeklyContent) => {
        const foundProgress = progressRes.data.find((p: ProgressData) => String(p.weekly_content) === String(week.id));
        return { 
          ...week, 
          progress: foundProgress ? Math.round(foundProgress.completion_percentage) : 0, 
          is_completed: foundProgress ? foundProgress.is_completed : false 
        };
      });
      setContents(mergedData);

      if (selectedWeek) {
        const freshWeekData = mergedData.find((w: WeeklyContent) => w.id === selectedWeek.id);
        if (freshWeekData) {
          setSelectedWeek(freshWeekData);
        }
      }

      const currentWeek = selectedWeek || mergedData.sort((a: any, b: any) => a.week_number - b.week_number)[0];
      if (currentWeek) {
        const quizMat = currentWeek.materials.find((m: any) => m.content_type === 'form');
        if (quizMat && stringifiedCompleted.includes(String(quizMat.id))) {
          const res = await api.get(`/contents/quiz/${quizMat.quiz?.id}/last-attempt/`);
          if (res.data) {
            setQuizResult({
              score: res.data.score,
              correct: res.data.correct,
              wrong: res.data.wrong
            });
            setCurrentAttemptId(String(res.data.id));
          }
        }
      }

      if (isInitialMount.current && mergedData.length > 0 && !selectedWeek) {
        setSelectedWeek(mergedData.sort((a: any, b: any) => a.week_number - b.week_number)[0]);
        setIsIntroView(true); 
        isInitialMount.current = false;
      }
    } catch (err) { 
      console.error("Veri çekme hatası."); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchContents(); 
  }, []);

  const handleCompleteMaterial = async (materialId: number | string) => {
    if (!materialId) return;
    const matIdStr = String(materialId);

    // 1. Optimistic Update: Tik işaretini ve yüzdeyi beklemeden ANINDA güncelle
    setCompletedMaterials(prev => prev.includes(matIdStr) ? prev : [...prev, matIdStr]);

    setContents(prevContents => prevContents.map(week => {
      const hasMat = week.materials?.some(m => String(m.id) === matIdStr);
      if (!hasMat) return week;
      const totalMats = week.materials.length;
      const doneCount = week.materials.filter(m => String(m.id) === matIdStr || completedMaterials.includes(String(m.id))).length;
      const newPercentage = totalMats > 0 ? Math.round((doneCount / totalMats) * 100) : 0;
      return {
        ...week,
        progress: newPercentage,
        is_completed: newPercentage >= 100
      };
    }));

    setSelectedWeek(prevWeek => {
      if (!prevWeek) return null;
      const hasMat = prevWeek.materials?.some(m => String(m.id) === matIdStr);
      if (!hasMat) return prevWeek;
      const totalMats = prevWeek.materials.length;
      const doneCount = prevWeek.materials.filter(m => String(m.id) === matIdStr || completedMaterials.includes(String(m.id))).length;
      const newPercentage = totalMats > 0 ? Math.round((doneCount / totalMats) * 100) : 0;
      return {
        ...prevWeek,
        progress: newPercentage,
        is_completed: newPercentage >= 100
      };
    });

    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    watchTimeInternalRef.current = 0; 
    setWatchTime(0);

    try {
      const res = await api.post('/contents/complete-material/', { material_id: matIdStr });
      if (res.data.status === "success") {
        if (res.data.new_points_earned > 0) {
          setPointsEarned({ show: true, amount: res.data.new_points_earned });
          setUserTotalPoints(res.data.total_points);
          setTimeout(() => setPointsEarned({ show: false, amount: 0 }), 5000);
        }

        if (res.data.current_percentage !== undefined) {
          const exactPercent = Math.round(res.data.current_percentage);
          setContents(prevContents => prevContents.map(week => {
            const hasMat = week.materials?.some(m => String(m.id) === matIdStr);
            if (!hasMat) return week;
            return {
              ...week,
              progress: exactPercent,
              is_completed: exactPercent >= 100
            };
          }));
          setSelectedWeek(prevWeek => {
            if (!prevWeek) return null;
            const hasMat = prevWeek.materials?.some(m => String(m.id) === matIdStr);
            if (!hasMat) return prevWeek;
            return {
              ...prevWeek,
              progress: exactPercent,
              is_completed: exactPercent >= 100
            };
          });
        }
      }
    } catch (err) { 
      console.error("Tamamlama hatası."); 
      await fetchContents(true);
    }
  };

  useEffect(() => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
    if (selectedWeek) {
      const sendPing = async () => {
        try {
          await api.post('/contents/track-activity/', {
            weekly_content_id: selectedWeek.id,
            material_id: activeMaterial?.id || null, 
            seconds: 30 
          });
        } catch (err) { 
          console.error("Ping hatası"); 
        }
      };
      trackingInterval.current = setInterval(sendPing, 30000);
    }
    return () => { 
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }
    };
  }, [selectedWeek?.id, activeMaterial?.id]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleQuizSubmit = async () => {
    if (!activeMaterial?.quiz) return;
    const totalQs = activeMaterial.quiz.questions.length;
    if (Object.keys(selectedAnswers).length < totalQs) { 
      alert("Lütfen tüm soruları cevaplayın."); 
      return; 
    }
    setQuizSubmitting(true);
    const quizMatIdStr = String(activeMaterial.id);

    // Optimistic Update: Sınav tikini ve yüzdesini hemen güncelle
    setCompletedMaterials(prev => prev.includes(quizMatIdStr) ? prev : [...prev, quizMatIdStr]);
    setContents(prevContents => prevContents.map(week => {
      const hasMat = week.materials?.some(m => String(m.id) === quizMatIdStr);
      if (!hasMat) return week;
      const totalMats = week.materials.length;
      const doneCount = week.materials.filter(m => String(m.id) === quizMatIdStr || completedMaterials.includes(String(m.id))).length;
      const newPercentage = totalMats > 0 ? Math.round((doneCount / totalMats) * 100) : 0;
      return {
        ...week,
        progress: newPercentage,
        is_completed: newPercentage >= 100
      };
    }));
    setSelectedWeek(prevWeek => {
      if (!prevWeek) return null;
      const hasMat = prevWeek.materials?.some(m => String(m.id) === quizMatIdStr);
      if (!hasMat) return prevWeek;
      const totalMats = prevWeek.materials.length;
      const doneCount = prevWeek.materials.filter(m => String(m.id) === quizMatIdStr || completedMaterials.includes(String(m.id))).length;
      const newPercentage = totalMats > 0 ? Math.round((doneCount / totalMats) * 100) : 0;
      return {
        ...prevWeek,
        progress: newPercentage,
        is_completed: newPercentage >= 100
      };
    });

    try {
      const answers = Object.entries(selectedAnswers).map(([qId, oId]) => ({ 
        question_id: String(qId), 
        option_id: String(oId) 
      }));
      
      const res = await api.post(`/contents/quiz/${String(activeMaterial.quiz.id)}/submit/`, { 
        answers, 
        predicted_score: predictedScore 
      });
      
      setQuizResult({ 
        score: res.data.score, 
        predicted_score: res.data.predicted_score,
        score_difference: res.data.score_difference,
        correct: res.data.correct, 
        wrong: res.data.wrong 
      });
      setCurrentAttemptId(String(res.data.attempt_id));

      if (res.data.next_round_activated) {
        alert("Yanlış cevaplarınız olduğu için Yapay Zeka analizinden sonra 2. Tur başlayacaktır. Materyalleri tekrar gözden geçirebilirsiniz.");
      }

      const earned = res.data.points_earned || 0;
      if (earned > 0) {
        setPointsEarned({ show: true, amount: earned });
        setUserTotalPoints(prev => prev + earned);
        setTimeout(() => setPointsEarned({ show: false, amount: 0 }), 5000);
      }
      
      await fetchContents(true);
    } catch (err) { 
      alert("Test gönderim hatası."); 
    } finally { 
      setQuizSubmitting(false); 
    }
  };

  const handleFetchAIAnalysis = async () => {
    if (!currentAttemptId) return;
    setIsAnalysisLoading(true);
    setIsAnalysisModalOpen(true);
    setAiAnalysisFeedback("");

    try {
      const res = await api.get(`/contents/quiz-analysis/${currentAttemptId}/`);
      if (res.data && res.data.ai_feedback) {
        setAiAnalysisFeedback(res.data.ai_feedback);
      } else {
        setAiAnalysisFeedback("Analiz verisi bulunamadı.");
      }
    } catch (err) {
      console.error("Analiz Hatası:", err);
      setAiAnalysisFeedback("Analiz yüklenirken bir hata oluştu.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput(""); 
    setIsTyping(true);
    try {
      const res = await api.post('/contents/ai-chat/', { message: userMsg, weekly_content_id: selectedWeek?.id });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err) { 
      setMessages(prev => [...prev, { role: 'bot', content: 'Hata oluştu.' }]); 
    } finally { 
      setIsTyping(false); 
    }
  };

  const introStatus = getIntroData();

  useEffect(() => {
    if (introTimerRef.current) clearInterval(introTimerRef.current);
    
    if (isIntroView && !introStatus.isWatched) {
      if (!introStatus.url) {
        const timer = setTimeout(() => {
          api.post('/contents/weeks/complete-intro/')
             .then(() => fetchContents(true))
             .catch(err => console.error("Metin onayı hatası:", err));
        }, 2000);
        return () => clearTimeout(timer);
      }

      introWatchTimeInternalRef.current = 0;
      introTimerRef.current = setInterval(() => {
        introWatchTimeInternalRef.current += 1; 
        setIntroWatchTime(introWatchTimeInternalRef.current);
        
        if (introWatchTimeInternalRef.current >= introWatchThreshold) {
          api.post('/contents/weeks/complete-intro/')
             .then(() => fetchContents(true));
        }
      }, 1000);
    }

    return () => { 
      if (introTimerRef.current) clearInterval(introTimerRef.current); 
    };
  }, [isIntroView, introStatus.url, introStatus.isWatched]);

  useEffect(() => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    if (!isIntroView && activeMaterial && (activeMaterial.content_type === 'video' || activeMaterial.content_type === 'podcast') && !completedMaterials.includes(String(activeMaterial.id)) && introStatus.isWatched) {
      const requiredDuration = (activeMaterial.duration_seconds && activeMaterial.duration_seconds > 0)
        ? activeMaterial.duration_seconds
        : 120;
      watchTimeInternalRef.current = 0;
      watchTimerRef.current = setInterval(() => {
        watchTimeInternalRef.current += 1; 
        setWatchTime(watchTimeInternalRef.current);
        if (watchTimeInternalRef.current >= requiredDuration) { 
          if (activeMaterialRef.current?.id !== undefined) handleCompleteMaterial(activeMaterialRef.current.id); 
        }
      }, 1000);
    }
    return () => { 
      if (watchTimerRef.current) clearInterval(watchTimerRef.current); 
    };
  }, [activeMaterial?.id, activeMaterial?.duration_seconds, isIntroView, completedMaterials.length, introStatus.isWatched]);

  const handleWeekSelection = (weekData: WeeklyContent) => {
    if (weekData.is_locked) return;
    setSelectedWeek(weekData);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentAttemptId(null);
    setIsIntroView(false);
    
    const quizMat = weekData.materials.find(m => m.content_type === 'form');
    if (quizMat && completedMaterials.includes(String(quizMat.id))) {
      api.get(`/contents/quiz/${quizMat.quiz?.id}/last-attempt/`).then(res => {
        setQuizResult({ 
          score: res.data.score, 
          predicted_score: res.data.predicted_score,
          score_difference: res.data.score_difference,
          correct: res.data.correct, 
          wrong: res.data.wrong 
        });
        setCurrentAttemptId(String(res.data.id));
      }).catch(() => {});
    }

    if (weekData.materials.length > 0) {
      setActiveMaterial(getSortedMaterials(weekData.materials)[0]);
    } else {
      setActiveMaterial(null);
    }
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
      {/* 1. YEŞİL ŞEFFAF PUAN BİLDİRİMİ */}
      <StudentPointsBadge 
        show={pointsEarned.show} 
        amount={pointsEarned.amount} 
      />

      {/* 2. MOBİL ÜST BAR */}
      <StudentHeaderMobile 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />

      {/* 3. SOL MENÜ (SIDEBAR) */}
      <StudentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isIntroView={isIntroView}
        onSelectIntro={() => { setIsIntroView(true); setActiveMaterial(null); }}
        contents={contents}
        selectedWeek={selectedWeek}
        introWatched={introStatus.isWatched}
        onSelectWeek={handleWeekSelection}
        onLogout={handleLogout}
      />

      {/* 4. ANA İÇERİK ALANI */}
      <main className="flex-1 overflow-y-auto bg-white custom-scrollbar pt-14 lg:pt-0 text-left">
        {selectedWeek ? (
          <div className="animate-in fade-in duration-500 text-left">
            {isIntroView ? (
              /* TANITIM GÖRÜNÜMÜ */
              <StudentIntroView
                title={introStatus.title}
                url={introStatus.url}
                description={introStatus.description}
                isWatched={introStatus.isWatched}
              />
            ) : (
              /* HAFTA İÇERİĞİ GÖRÜNÜMÜ */
              <div className="max-w-screen-2xl mx-auto p-4 md:p-10 text-left">
                {/* Hafta Başlık Barı ve Toplam Puan Kartı */}
                <div className="mb-10 border-b pb-8 border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                  <div className="flex flex-col gap-4 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-left">
                      <span className="bg-secondary text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                        HAFTA {selectedWeek.week_number}
                      </span>
                      {selectedWeek.current_attempt_round > 1 && (
                        <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-200 animate-pulse">
                          <RefreshCcw size={8} className="inline mr-1" /> 2. TUR (GELİŞİM)
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-secondary uppercase tracking-tighter leading-tight text-left">
                      {selectedWeek.title}
                    </h1>
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex-1 max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden border shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${selectedWeek.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${selectedWeek.progress || 0}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        %{selectedWeek.progress || 0} TAMAMLANDI
                      </span>
                    </div>
                  </div>

                  {/* ÖĞRENCİ TOPLAM PUAN KARTI */}
                  <StudentTotalPointsCard points={userTotalPoints} />
                </div>

                {/* Ana Grid: Solda Materyal Listesi, Sağda İçerik */}
                <div className="flex flex-col lg:flex-row gap-10 items-start text-left">
                  <StudentMaterialList
                    materials={selectedWeek.materials}
                    activeMaterial={activeMaterial}
                    completedMaterials={completedMaterials}
                    isQuizLocked={isQuizLocked()}
                    onSelectMaterial={(mat) => setActiveMaterial(mat)}
                  />

                  <div className="flex-1 min-w-0 w-full text-left">
                    {activeMaterial ? (
                      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                        <StudentMaterialViewer
                          activeMaterial={activeMaterial}
                          selectedWeek={selectedWeek}
                          completedMaterials={completedMaterials}
                          quizResult={quizResult}
                          predictedScore={predictedScore}
                          onPredictedScoreChange={setPredictedScore}
                          selectedAnswers={selectedAnswers}
                          onSelectOption={(qId, oId) => setSelectedAnswers(prev => ({ ...prev, [qId]: oId }))}
                          onCompleteMaterial={handleCompleteMaterial}
                          onQuizSubmit={handleQuizSubmit}
                          quizSubmitting={quizSubmitting}
                          onOpenAIAnalysis={handleFetchAIAnalysis}
                        />

                        <StudentFlashcards
                          flashcards={selectedWeek.flashcards}
                          description={selectedWeek.description}
                        />
                      </div>
                    ) : (
                      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 text-gray-300 gap-5">
                        <Eye size={64} className="opacity-10" />
                        <span className="font-black uppercase tracking-widest italic">MATERYAL SEÇİNİZ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-200 p-8 gap-6">
            <PlayCircle size={120} strokeWidth={0.5} className="animate-pulse opacity-10" />
            <p className="text-xl font-black uppercase tracking-[0.5em] opacity-20 text-secondary">Hafta Seçiniz</p>
          </div>
        )}
      </main>

      {/* 5. AI CHAT ASİSTAN PANELİ */}
      <StudentAIChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        messages={messages}
        chatInput={chatInput}
        onInputChange={setChatInput}
        onSendMessage={handleSendChatMessage}
        isTyping={isTyping}
      />

      {/* 6. AI ANALİZ MODALI */}
      <StudentAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        isLoading={isAnalysisLoading}
        feedback={aiAnalysisFeedback}
        onContinue={async () => {
          setIsAnalysisModalOpen(false);
          setQuizResult(null); 
          setSelectedAnswers({});
          setCurrentAttemptId(null);
          await fetchContents(true); 
        }}
      />

      {/* 7. HAREKETSİZLİK ZAMAN AŞIMI MODALI (15 DK İŞLEMSİZLİK & 10 SN GERİ SAYIM) */}
      <InactivityTimeoutModal />
    </div>
  );
}