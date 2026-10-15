"use client";
import React, { useState } from 'react';
import { 
  HelpCircle, CheckCircle2, AlertCircle, Clock, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import api from '@/lib/api';
import { PreEvaluationTest, WeeklyContent } from '@/components/types';

interface StudentPreTestViewProps {
  selectedWeek: WeeklyContent;
  onCompleted: () => void;
}

export default function StudentPreTestView({
  selectedWeek,
  onCompleted
}: StudentPreTestViewProps) {
  const preTest: PreEvaluationTest | undefined = selectedWeek.pre_test;
  const questions = preTest?.questions || [];

  // Öğrencinin seçtiği şıklar: { [questionId: string]: string }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sonuç ekranı state'i
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    wrong: number;
    unlocked_weeks: number[];
  } | null>(null);

  const handleSelectOption = (questionId: string | number, optionId: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [String(questionId)]: String(optionId)
    }));
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    if (!preTest?.id) {
      setErrorMsg("Ön değerlendirme testi kimliği bulunamadı.");
      return;
    }

    // Tüm soruların yanıtlanıp yanıtlanmadığını kontrol et
    const unanswered = questions.filter(q => q.id && !answers[String(q.id)]);
    if (unanswered.length > 0) {
      setErrorMsg(`Lütfen tüm soruları yanıtlayınız. (${unanswered.length} soru boş bırakıldı)`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      answers: Object.entries(answers).map(([qId, optId]) => ({
        question_id: String(qId),
        option_id: String(optId),
        selected_option_id: String(optId)
      }))
    };

    try {
      const res = await api.post(`/contents/pre-test/${preTest.id}/submit/`, payload);
      setResult({
        score: res.data.score,
        correct: res.data.correct_answers,
        wrong: res.data.wrong_answers,
        unlocked_weeks: res.data.unlocked_weeks || []
      });
    } catch (err: any) {
      console.error("Ön test gönderim hatası:", err);
      setErrorMsg(err.response?.data?.detail || "Test gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setSubmitting(false);
    }
  };

  // Sonuç Ekranı Modal / View
  if (result) {
    const hasUnlockedWeeks = result.unlocked_weeks && result.unlocked_weeks.length > 0;

    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 my-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-400">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
          <Award size={40} className="stroke-[2.2]" />
        </div>

        <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
          {selectedWeek.week_number}. HAFTA ÖN DEĞERLENDİRME TAMAMLANDI
        </span>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-4 uppercase tracking-tight">
          Ön Değerlendirme Test Sonucu
        </h2>

        {/* Skor Kartları */}
        <div className="grid grid-cols-3 gap-3 my-6 max-w-md mx-auto">
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">BAŞARI</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">%{result.score}</p>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">DOĞRU</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{result.correct}</p>
          </div>
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">YANLIŞ</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{result.wrong}</p>
          </div>
        </div>

        {/* Telafi Kilit Açma Bildirimi */}
        {hasUnlockedWeeks ? (
          <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-left space-y-3 mb-8">
            <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wide">
              <Clock size={18} className="text-amber-600 shrink-0" />
              Telafi Amaçlı Kilidi Açılan Haftalar
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Ön değerlendirmede yanlış yanıtladığınız konularla ilişkili olarak aşağıdaki haftaların kilidi <strong>2 gün boyunca (48 saat)</strong> telafi amaçlı açılmıştır:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.unlocked_weeks.map((wNum) => (
                <span
                  key={wNum}
                  className="px-3 py-1 bg-amber-200 text-amber-950 font-black text-xs rounded-xl shadow-xs"
                >
                  {wNum}. Hafta (2 Gün Kilit Aktif)
                </span>
              ))}
            </div>
            <p className="text-[10px] text-amber-700 font-bold italic pt-1">
              * Bu telafi süresince önceki haftaların materyallerini tekrar inceleyebilir ve eksiklerinizi tamamlayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold mb-8 flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            Tebrikler! Ön testteki tüm soruları başarıyla yanıtladınız. Telafi ihtiyacı bulunmuyor.
          </div>
        )}

        <button
          type="button"
          onClick={onCompleted}
          className="w-full bg-[#1a1a1a] hover:bg-black text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
        >
          <span>Haftalık Materyallere Geçiş Yap</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 text-left animate-in fade-in duration-300">
      {/* ÜST BİLGİLENDİRME BAŞLIĞI */}
      <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-indigo-600 text-white rounded-full shadow-xs">
            {selectedWeek.week_number}. HAFTA ÖN DEĞERLENDİRME
          </span>
          <span className="text-xs font-bold text-gray-500">
            Toplam {questions.length} Soru (5 Şıklı)
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
            {preTest?.title || `${selectedWeek.week_number}. Hafta Ön Değerlendirme Testi`}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            Haftalık ders materyallerine ve içeriklere geçebilmek için bu ön değerlendirme testini tamamlamanız gerekmektedir.
          </p>
        </div>

        <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950 font-semibold leading-relaxed">
          <ShieldAlert size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <span>
            Bu testte yapacağınız yanlışlar, geçmiş haftalardaki eksik konularınızı tespit eder ve ilgili haftaların kilidini <strong>2 gün boyunca (48 saat)</strong> telafi amacıyla otomatik olarak açar.
          </span>
        </div>
      </div>

      {/* HATA MESAJI */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-700 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SORULAR LİSTESİ */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const qId = String(q.id ?? qIdx);
          const selectedOptId = answers[qId];

          return (
            <div
              key={qId}
              className="p-6 md:p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-5 hover:border-indigo-200 transition-all text-left"
            >
              {/* Soru Başlığı ve Metni */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  SORU {qIdx + 1}
                </span>
                <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed pt-1">
                  {q.question_text}
                </p>
              </div>

              {/* 5 Şık (A, B, C, D, E) */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {(q.options || []).map((opt, oIdx) => {
                  const optId = String(opt.id ?? oIdx);
                  const optLetter = ['A', 'B', 'C', 'D', 'E'][oIdx];
                  const isSelected = selectedOptId === optId;

                  return (
                    <button
                      key={optId}
                      type="button"
                      onClick={() => handleSelectOption(qId, optId)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-950 shadow-sm'
                          : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-gray-500 border border-gray-200'
                        }`}
                      >
                        {optLetter}
                      </div>
                      <span className="text-xs md:text-sm font-semibold flex-1">
                        {opt.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* GÖNDER BUTONU */}
      <div className="mt-8 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#ce1212] hover:bg-[#b00f0f] text-white py-5 rounded-2xl font-black tracking-widest text-xs md:text-sm uppercase transition-all shadow-xl active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <HelpCircle size={18} />
          {submitting ? "TEST DEĞERLENDİRİLİYOR..." : "ÖN DEĞERLENDİRME TESTİNİ BİTİR VE GÖNDER"}
        </button>
      </div>
    </div>
  );
}
