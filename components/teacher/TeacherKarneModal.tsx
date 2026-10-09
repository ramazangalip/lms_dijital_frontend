"use client";
import React from 'react';
import { 
  Users, X, Check, ListChecks, CheckCircle, AlertCircle, MessageSquare, Bot, Target, TrendingUp, TrendingDown, Minus 
} from 'lucide-react';
import { StudentAnalytics, getDeptName } from '@/components/types';

interface TeacherKarneModalProps {
  student: StudentAnalytics | null;
  onClose: () => void;
}

export default function TeacherKarneModal({
  student,
  onClose
}: TeacherKarneModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300 overflow-y-auto text-left leading-none">
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border-4 border-white my-auto text-left">
        
        {/* HEADER */}
        <div className="p-6 md:p-10 border-b bg-gray-50 flex justify-between items-center shrink-0 text-left leading-none">
          <div className="flex items-center gap-4 text-left leading-none">
            <div className="bg-secondary p-3 rounded-2xl text-white shadow-xl shrink-0 flex items-center justify-center">
              <Users size={28} />
            </div>
            <div className="text-left leading-none">
              <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter text-secondary leading-none mb-2">
                Akademik Performans Karnesi
              </h3>
              <p className="text-[10px] text-[#ce1212] font-black uppercase italic leading-none">
                {student.first_name} {student.last_name} | {getDeptName(student.department)}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="bg-white p-3 rounded-full hover:bg-red-50 border transition-all text-gray-400 shadow-sm active:scale-90 flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        {/* HAFTALIK DETAYLAR LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-white custom-scrollbar text-left leading-normal">
          {student.weekly_breakdown?.map((week) => {
            const hasQuiz = (week.quiz_results && week.quiz_results.length > 0) || (week.score_1 !== undefined && week.score_1 > 0) || (week.predicted_1 !== undefined && week.predicted_1 > 0);
            const diff1 = week.diff_1 ?? ((week.score_1 ?? 0) - (week.predicted_1 ?? 0));
            const diff2 = week.diff_2 ?? ((week.score_2 ?? 0) - (week.predicted_2 ?? 0));

            return (
              <div 
                key={week.week_number} 
                className="p-6 md:p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6 relative overflow-hidden text-left leading-normal"
              >
                {/* HAFTA BAŞLIĞI */}
                <div className="flex items-center gap-4 text-left leading-none">
                  <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border font-black text-secondary shrink-0 shadow-sm leading-none">
                    <span className="text-[9px] text-[#ce1212] uppercase leading-none mb-1">HAFTA</span>
                    <span className="text-xl leading-none">{week.week_number}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-black text-secondary leading-none">
                      T1: %{week.progress_1 ?? week.progress ?? 0} {week.is_round_2_started ? ` | T2: %${week.progress_2 ?? 0}` : ''}
                    </span>
                    {((week.progress_1 ?? week.progress ?? 0) === 100 || (week.progress_2 ?? 0) === 100) && (
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <Check size={12}/> BAŞARIYLA BİTİRİLDİ
                      </span>
                    )}
                  </div>
                </div>

                {/* SKOR VE TAHMİN FARK ANALİZ KARTLARI */}
                {hasQuiz && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-secondary leading-none mb-1">
                      <Target size={16} className="text-blue-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                        Sınav Hedef & Gerçekleşen Skor Analizi
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                      <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
                        <p className="text-[8px] font-black text-blue-500 uppercase mb-1">Hedef / Tahmin</p>
                        <p className="text-xl font-black text-blue-900">%{week.predicted_1 ?? 0}</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">1. Tur Skor</p>
                        <p className="text-xl font-black text-secondary">%{week.score_1 ?? 0}</p>
                      </div>

                      <div className={`p-3.5 rounded-2xl border ${
                        diff1 > 0 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : diff1 < 0 
                            ? 'bg-amber-50 border-amber-200 text-amber-800' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[8px] font-black uppercase">Skor Farkı (T1)</p>
                          {diff1 > 0 ? <TrendingUp size={12} /> : diff1 < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        </div>
                        <p className="text-xl font-black">{diff1 > 0 ? `+${diff1}` : diff1} Puan</p>
                      </div>

                      <div className="bg-green-50/70 p-3.5 rounded-2xl border border-green-100">
                        <p className="text-[8px] font-black text-green-600 uppercase mb-1">1. Tur Doğru / Yanlış</p>
                        <p className="text-xl font-black text-green-700">
                          {week.correct_1 ?? 0}D / {week.wrong_1 ?? 0}Y
                        </p>
                      </div>
                    </div>

                    {/* EĞER 2. TUR VARSA */}
                    {((week.score_2 !== undefined && week.score_2 > 0) || (week.correct_2 !== undefined && week.correct_2 > 0)) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left mt-2">
                        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                          <p className="text-[8px] font-black text-amber-700 uppercase mb-1">2. Tur Tahmin</p>
                          <p className="text-xl font-black text-amber-900">%{week.predicted_2 ?? 0}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm">
                          <p className="text-[8px] font-black text-amber-600 uppercase mb-1">2. Tur Skor</p>
                          <p className="text-xl font-black text-secondary">%{week.score_2 ?? 0}</p>
                        </div>
                        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
                          <p className="text-[8px] font-black text-amber-700 uppercase mb-1">2. Tur Fark</p>
                          <p className="text-xl font-black text-amber-900">{diff2 > 0 ? `+${diff2}` : diff2} Puan</p>
                        </div>
                        <div className="bg-green-50/70 p-3.5 rounded-2xl border border-green-100">
                          <p className="text-[8px] font-black text-green-600 uppercase mb-1">2. Tur D / Y</p>
                          <p className="text-xl font-black text-green-700">{week.correct_2 ?? 0}D / {week.wrong_2 ?? 0}Y</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 1. SINAV DETAY ANALİZİ */}
                {week.quiz_results && week.quiz_results.length > 0 && (
                  <div className="space-y-4 text-left leading-normal border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 text-secondary leading-none mb-2">
                      <ListChecks size={16} className="text-[#ce1212]" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                        Haftalık Soru Detay Analizi
                      </p>
                    </div>
                    <div className="grid gap-3 text-left">
                      {week.quiz_results.map((r, ri) => (
                        <div 
                          key={ri} 
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            r.is_correct ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3 text-left leading-tight">
                            <span className="text-[11px] font-bold text-secondary flex gap-2">
                              <span className="opacity-40">{ri + 1}.</span> {r.question_text}
                            </span>
                            {r.is_correct ? (
                              <CheckCircle size={14} className="text-green-500 shrink-0" />
                            ) : (
                              <AlertCircle size={14} className="text-red-500 shrink-0" />
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-6 border-t border-black/5 pt-3 text-left">
                            <div className="flex flex-col items-start leading-tight">
                              <span className="text-[8px] font-black text-gray-400 uppercase mb-1">Seçilen Şık</span>
                              <span className={`text-[10px] font-black ${r.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                {r.selected_option}
                              </span>
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
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                      Yapay Zekaya Sorduğu Sorular
                    </p>
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
          );
        })}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-gray-50 border-t flex justify-center shrink-0 leading-none">
          <button 
            type="button"
            onClick={onClose} 
            className="w-full md:w-auto bg-secondary text-white px-16 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl transition-all flex items-center justify-center leading-none"
          >
            PANELİ KAPAT VE LİSTEYE DÖN
          </button>
        </div>
      </div>
    </div>
  );
}
