"use client";
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, FileText, Download, ListChecks, Award, ArrowRight, Target, TrendingUp, TrendingDown, Minus, Edit3, AlertCircle
} from 'lucide-react';
import { Material, WeeklyContent, QuizResultState } from '@/components/types';

interface StudentMaterialViewerProps {
  activeMaterial: Material;
  selectedWeek: WeeklyContent;
  completedMaterials: string[];
  quizResult: QuizResultState | null;
  predictedScore: number;
  onPredictedScoreChange: (score: number) => void;
  selectedAnswers: Record<number, number>;
  onSelectOption: (questionId: number, optionId: number) => void;
  onCompleteMaterial: (materialId: number | string) => void;
  onQuizSubmit: () => void;
  quizSubmitting: boolean;
  onOpenAIAnalysis: () => void;
}

export default function StudentMaterialViewer({
  activeMaterial,
  selectedWeek,
  completedMaterials,
  quizResult,
  predictedScore,
  onPredictedScoreChange,
  selectedAnswers,
  onSelectOption,
  onCompleteMaterial,
  onQuizSubmit,
  quizSubmitting,
  onOpenAIAnalysis
}: StudentMaterialViewerProps) {
  const [isPredictionConfirmed, setIsPredictionConfirmed] = useState(false);

  // Hafta, materyal veya tur değiştiğinde ön test tahmin onayını sıfırla
  useEffect(() => {
    setIsPredictionConfirmed(false);
  }, [activeMaterial?.id, selectedWeek?.id, selectedWeek?.current_attempt_round]);

  return (
    <section className="material-display-area text-left">
      {activeMaterial.content_type === 'assignment' ? (
        <div className="bg-white border-4 border-gray-50 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-6 right-6 bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-black text-[10px] shadow-sm border border-amber-200 tracking-widest uppercase">
            +{activeMaterial.point_value || 0} PUAN
          </div>
          <div className="bg-amber-50 p-6 rounded-3xl text-amber-600 animate-pulse mt-4"><Sparkles size={64} /></div>
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tighter leading-none">HAFTALIK ÖDEV FORMU</h3>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-md mx-auto">
              {selectedWeek.current_attempt_round > 1 ? "2. Tur kapsamında ödevi tekrar inceleyebilirsin." : "Ödevi tamamlayarak akademik puanını kazan!"}
            </p>
          </div>
          <a 
            href={activeMaterial.embed_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => { if (activeMaterial.id !== undefined) onCompleteMaterial(activeMaterial.id); }} 
            className="bg-secondary text-white px-12 py-5 rounded-2xl font-black tracking-[0.2em] flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase"
          >
            ÖDEVİ AÇ 
          </a>
        </div>
      ) : activeMaterial.content_type === 'pdf' ? (
        <div className="bg-white border-4 border-gray-50 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 text-center max-w-3xl mx-auto">
          <div className="bg-primary/10 p-6 rounded-3xl text-primary animate-pulse"><FileText size={64} /></div>
          <div className="space-y-2 leading-tight">
            <h3 className="text-2xl font-black text-secondary uppercase tracking-tighter">{activeMaterial.title}</h3>
            <p className="text-xs text-gray-500 font-medium">OneDrive üzerinden dökümana ulaşabilirsiniz.</p>
          </div>
          <a 
            href={activeMaterial.embed_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => { if (activeMaterial.id !== undefined) onCompleteMaterial(activeMaterial.id); }} 
            className="bg-secondary text-white px-12 py-5 rounded-2xl font-black tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-xs uppercase"
          >
            <Download size={18} className="text-primary" /> DERS NOTUNU AÇ / İNDİR
          </a>
        </div>
      ) : activeMaterial.content_type !== 'form' ? (
        <div className="relative aspect-video shadow-2xl rounded-3xl overflow-hidden bg-black border-4 border-gray-50 ring-1 ring-gray-200 w-full">
          <iframe 
            src={activeMaterial.embed_url} 
            className="absolute inset-0 w-full h-full" 
            allowFullScreen
            title={activeMaterial.title}
          />
        </div>
      ) : (
        /* SINAV (QUIZ) GÖRÜNÜMÜ */
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden w-full flex flex-col animate-in fade-in text-left">
          <div className="bg-secondary p-6 flex items-center justify-between text-white border-b-2 border-primary">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shrink-0"><ListChecks size={20} /></div>
              <div>
                <h2 className="text-white font-black text-base md:text-lg uppercase tracking-tighter mb-1">
                  {activeMaterial.quiz?.title || activeMaterial.title}
                </h2>
                <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest">
                  {selectedWeek.current_attempt_round}. Tur Değerlendirmesi
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 md:p-10 space-y-8 bg-gray-50/20">
            {(completedMaterials.includes(String(activeMaterial.id)) || quizResult) ? (
              /* DURUM 1: TEST BİTTİĞİNDE SONUÇ EKRANI (GÖRSEL TASARIM BİREBİR) */
              <div className="text-center py-2 space-y-5 animate-in zoom-in-95 max-w-xl mx-auto">
                {/* İKON */}
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs">
                  <Award size={26} strokeWidth={2.2} />
                </div>

                {/* BAŞLIK & ALT BAŞLIK */}
                <div className="space-y-1 text-center">
                  <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">
                    TEBRİKLER! TESTİ TAMAMLADINIZ
                  </h2>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider uppercase">
                    HAFTALIK DEĞERLENDİRME &amp; ÜSTBİLİŞSEL KALİBRASYON RAPORU
                  </p>
                </div>

                {quizResult && (
                  <div className="space-y-4">
                    {/* ÜST 3'LÜ SKOR KARTLARI */}
                    <div className="grid grid-cols-3 gap-3 w-full">
                      <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center shadow-xs">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          GERÇEK SKOR
                        </p>
                        <p className="text-xl md:text-2xl font-black text-slate-900">
                          %{quizResult.score}
                        </p>
                      </div>

                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-center shadow-xs">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-1">
                          DOĞRU SAYISI
                        </p>
                        <p className="text-xl md:text-2xl font-black text-emerald-600">
                          {quizResult.correct}
                        </p>
                      </div>

                      <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3.5 text-center shadow-xs">
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mb-1">
                          YANLIŞ SAYISI
                        </p>
                        <p className="text-xl md:text-2xl font-black text-red-600">
                          {quizResult.wrong}
                        </p>
                      </div>
                    </div>

                    {/* KOYU RENK ÜSTBİLİŞSEL TAHMİN & KALİBRASYON KARTI */}
                    <div className="w-full bg-[#121624] text-white rounded-3xl p-4 md:p-5 shadow-xl space-y-3.5 text-left border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400">
                          <Target size={16} strokeWidth={2.4} />
                          <span className="text-[11px] md:text-xs font-black tracking-wider uppercase">
                            ÜSTBİLİŞSEL TAHMİN &amp; KALİBRASYON KARTI
                          </span>
                        </div>
                        <span className="bg-[#1c2234] border border-slate-700/80 text-gray-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          ÖN TAHMİN ANALİZİ
                        </span>
                      </div>

                      {/* İÇ STATS KUTUSU */}
                      <div className="bg-[#1a2030] rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center border border-slate-700/40">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">ÖN TAHMİN</p>
                          <p className="text-base md:text-lg font-black text-white">%{quizResult.predicted_score ?? 0}</p>
                        </div>
                        <div className="space-y-0.5 border-x border-slate-700/60">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">GERÇEK BAŞARI</p>
                          <p className="text-base md:text-lg font-black text-white">%{quizResult.score}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">KALİBRASYON SAPMASI</p>
                          <p className={`text-base md:text-lg font-black ${
                            (quizResult.score_difference ?? 0) === 0 
                              ? 'text-emerald-400' 
                              : (quizResult.score_difference ?? 0) > 0 
                                ? 'text-emerald-400' 
                                : 'text-red-400'
                          }`}>
                            {(quizResult.score_difference ?? 0) > 0 
                              ? `+${quizResult.score_difference}` 
                              : (quizResult.score_difference ?? 0) < 0 
                                ? `${quizResult.score_difference}` 
                                : '0'} Puan
                          </p>
                        </div>
                      </div>

                      {/* UYARI / BİLGİ KUTUSU */}
                      <div className="bg-[#fffbeb] border border-amber-200/80 rounded-xl p-3 flex items-start sm:items-center gap-2 text-amber-900 shadow-xs">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-[11px] font-semibold leading-snug">
                          {(quizResult.score_difference ?? 0) === 0
                            ? "Mükemmel kalibrasyon! Tahminin ile gerçek başarın birebir örtüştü."
                            : (quizResult.score_difference ?? 0) > 0
                              ? "Tebrikler! Gerçek başarın tahmin ettiğin hedefin üzerine çıktı."
                              : "Tahminin ile gerçek başarın arasında fark var; eksik konuları pekiştirme turunda tekrar gözden geçirebilirsin."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={onOpenAIAnalysis} 
                  className="mx-auto flex items-center gap-2 bg-[#121624] hover:bg-black text-white px-7 py-3 rounded-2xl font-black text-[11px] shadow-lg uppercase active:scale-95 transition-all cursor-pointer tracking-wider"
                >
                  <Sparkles size={14} className="text-amber-400 animate-pulse" /> ANALİZİ GÖR VE DEVAM ET
                </button>
              </div>
            ) : !isPredictionConfirmed ? (
              /* DURUM 2: TEST ÖNCESİ BAŞARI TAHMİNİ ADIMI (ZORUNLU - KİBAR & KOMPAKT TASARIM) */
              <div className="py-2 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* İKON & ROZET */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#ce1212] shadow-sm">
                    <Target size={24} strokeWidth={2.2} />
                  </div>
                  <span className="inline-block bg-red-50 text-[#ce1212] border border-red-200/80 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
                    Zorunlu Üstbilişsel Adım
                  </span>
                </div>

                {/* BAŞLIK & AÇIKLAMA */}
                <div className="space-y-1 text-center">
                  <h3 className="text-lg md:text-xl font-black text-secondary uppercase tracking-tight">
                    Test Öncesi Başarı Tahmini
                  </h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Test sorularını görmeden önce bu testten kaç puan alacağını tahmin et (%0 - %100).
                  </p>
                </div>

                {/* TAHMİN AYARLAMA KARTI */}
                <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-4 md:p-5 shadow-xs space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-secondary uppercase tracking-wide">
                      Tahmini Başarı Yüzden:
                    </span>
                    <div className="bg-red-50/80 border border-red-200/80 rounded-xl px-3 py-1 flex items-center justify-center gap-1 shadow-xs">
                      <span className="text-red-600 font-black text-sm">%</span>
                      <span className="text-lg font-black text-secondary">{predictedScore}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 px-0.5">
                      <span>%0</span>
                      <span>%50</span>
                      <span>%100</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={100} 
                      step={1}
                      value={predictedScore}
                      onChange={(e) => onPredictedScoreChange(Number(e.target.value))}
                      className="w-full accent-[#ce1212] h-2 bg-gray-100 rounded-lg cursor-pointer transition-all"
                    />
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">
                      Hızlı Seçim:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 25, 50, 60, 75, 80, 90, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => onPredictedScoreChange(val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                            predictedScore === val 
                              ? 'bg-[#ce1212] text-white shadow-xs scale-105' 
                              : 'bg-gray-100 text-gray-600 font-bold hover:bg-gray-200'
                          }`}
                        >
                          %{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TESTE BAŞLA BUTONU */}
                <button 
                  type="button"
                  onClick={() => setIsPredictionConfirmed(true)} 
                  className="w-full bg-[#ce1212] hover:bg-[#b51010] active:scale-[0.98] text-white py-3 px-5 rounded-xl font-black text-xs tracking-wider uppercase shadow-md shadow-red-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Target size={15} /> TAHMİNİ ONAYLA VE TESTE BAŞLA
                </button>
              </div>
            ) : (
              /* DURUM 3: TAHMİN ONAYLANDIKTAN SONRA SORULAR EKRANI */
              <div className="space-y-10 text-left animate-in fade-in duration-300">
                {/* ONAYLANAN HEDEF BİLGİSİ BARI */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl text-[#ce1212] font-black shrink-0">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Belirlediğin Hedef Skor</p>
                      <p className="text-base font-black text-secondary">%{predictedScore}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPredictionConfirmed(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#ce1212] bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-gray-200 transition-all"
                  >
                    <Edit3 size={13} /> Değiştir
                  </button>
                </div>

                {/* SINAV SORULARI */}
                {activeMaterial.quiz?.questions.map((q, qIdx) => (
                  <div key={q.id} className="space-y-5 text-left border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                    <h3 className="text-sm md:text-base font-black text-secondary flex gap-3 leading-tight">
                      <span className="text-primary shrink-0">0{qIdx + 1}.</span> 
                      <span className="break-words">{q.question_text}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pl-8 text-left">
                      {q.options.map((opt, oIdx) => {
                        const optLetter = String.fromCharCode(65 + oIdx);
                        const isSelected = selectedAnswers[q.id || 0] === opt.id;
                        return (
                          <button 
                            key={opt.id || oIdx} 
                            type="button"
                            onClick={() => opt.id && q.id && onSelectOption(q.id, opt.id)} 
                            className={`p-4 rounded-2xl text-left text-[11px] font-bold border-2 transition-all flex items-center justify-between group min-h-[56px] ${
                              isSelected 
                                ? 'bg-primary border-primary text-white shadow-lg scale-[1.01]' 
                                : 'bg-white border-gray-100 text-gray-700 hover:border-primary/40 hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 pr-2 min-w-0">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                              }`}>
                                {optLetter}
                              </span>
                              <span className="break-words">{opt.option_text}</span>
                            </div>
                            {isSelected && <ArrowRight size={14} className="shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={onQuizSubmit} 
                  disabled={quizSubmitting} 
                  className="w-full bg-secondary text-white py-5 rounded-2xl font-black tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-200 uppercase mt-8 text-xs transition-all hover:bg-black"
                >
                  {quizSubmitting ? "GÖNDERİLİYOR..." : "TESTİ TAMAMLA"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
