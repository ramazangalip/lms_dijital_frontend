"use client";
import React from 'react';
import { 
  RefreshCcw, ShieldCheck, Type, PlayCircle, ListChecks, Plus, Award, 
  Trash2, Check, BookOpen, Download, Calendar, Save, Filter, Clock,
  HelpCircle, Lock, Unlock
} from 'lucide-react';
import { Material, Flashcard, DepartmentSchedule, DepartmentItem, PreEvaluationTest } from '@/components/types';

interface TeacherContentTabProps {
  weekNumber: number;
  onWeekNumberChange: (week: number) => void;
  title: string;
  onTitleChange: (title: string) => void;
  releaseDate: string;
  onReleaseDateChange: (date: string) => void;
  deactivationDate: string;
  onDeactivationDateChange: (date: string) => void;
  departments: DepartmentItem[];
  departmentSchedules: DepartmentSchedule[];
  onUpdateDepartmentSchedule: (deptKey: string, field: 'release_date' | 'deactivation_date', val: string) => void;
  onApplyToAllDepartments: (relDate?: string, deactDate?: string) => void;
  introTitle: string;
  onIntroTitleChange: (val: string) => void;
  introVideoUrl: string;
  onIntroVideoUrlChange: (val: string) => void;
  introDescription: string;
  onIntroDescriptionChange: (val: string) => void;
  materials: Material[];
  onAddMaterialRow: () => void;
  onUpdateMaterial: (mIndex: number, field: keyof Material, value: any) => void;
  onRemoveMaterialRow: (mIndex: number) => void;
  onAddQuestion: (mIndex: number) => void;
  onUpdateQuestionText: (mIndex: number, qIndex: number, text: string) => void;
  onSetCorrectOption: (mIndex: number, qIndex: number, oIndex: number) => void;
  onUpdateOption: (mIndex: number, qIndex: number, oIndex: number, text: string) => void;
  flashcards: Flashcard[];
  onSetFlashcards: (cards: Flashcard[]) => void;
  onUpdateFlashcard: (idx: number, field: 'question' | 'answer', value: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  isPretestActive: boolean;
  onIsPretestActiveChange: (active: boolean) => void;
  preTest: PreEvaluationTest;
  onAddPreTestQuestion: () => void;
  onRemovePreTestQuestion: (qIndex: number) => void;
  onUpdatePreTestQuestionText: (qIndex: number, text: string) => void;
  onUpdatePreTestQuestionTargetWeek: (qIndex: number, target: number) => void;
  onSetPreTestCorrectOption: (qIndex: number, oIndex: number) => void;
  onUpdatePreTestOption: (qIndex: number, oIndex: number, text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  fetchingWeek: boolean;
}

export default function TeacherContentTab({
  weekNumber,
  onWeekNumberChange,
  title,
  onTitleChange,
  releaseDate,
  onReleaseDateChange,
  deactivationDate,
  onDeactivationDateChange,
  departments,
  departmentSchedules,
  onUpdateDepartmentSchedule,
  onApplyToAllDepartments,
  introTitle,
  onIntroTitleChange,
  introVideoUrl,
  onIntroVideoUrlChange,
  introDescription,
  onIntroDescriptionChange,
  materials,
  onAddMaterialRow,
  onUpdateMaterial,
  onRemoveMaterialRow,
  onAddQuestion,
  onUpdateQuestionText,
  onSetCorrectOption,
  onUpdateOption,
  flashcards,
  onSetFlashcards,
  onUpdateFlashcard,
  description,
  onDescriptionChange,
  isPretestActive,
  onIsPretestActiveChange,
  preTest,
  onAddPreTestQuestion,
  onRemovePreTestQuestion,
  onUpdatePreTestQuestionText,
  onUpdatePreTestQuestionTargetWeek,
  onSetPreTestCorrectOption,
  onUpdatePreTestOption,
  onSubmit,
  loading,
  fetchingWeek
}: TeacherContentTabProps) {
  // Seçili bölümün tarihlerini yönetmek için state
  const [selectedDeptForSchedule, setSelectedDeptForSchedule] = React.useState<string>('siyasetbilimivekamuyonetimi');

  React.useEffect(() => {
    if (departments.length > 0 && !departments.some(d => d.key === selectedDeptForSchedule)) {
      setSelectedDeptForSchedule(departments[0].key);
    }
  }, [departments, selectedDeptForSchedule]);

  const currentSchedule = departmentSchedules.find(s => s.department === selectedDeptForSchedule);

  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
      <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden text-left leading-normal">
        {fetchingWeek && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center text-left">
            <div className="flex flex-col items-center gap-3 font-black text-[#ce1212] animate-pulse text-center leading-none text-left">
              <RefreshCcw className="animate-spin" size={32} />
              <span className="text-xs uppercase tracking-widest font-bold leading-none">VERİLER ALINIYOR...</span>
            </div>
          </div>
        )}
        
        {/* Üst Form Başlık ve Tarih Alanları (Birebir Tasarım) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 mb-6 text-left">
          {/* Düzenlenen Hafta */}
          <div className="lg:col-span-2 text-left leading-none">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
              Düzenlenen Hafta
            </label>
            <select 
              value={weekNumber} 
              onChange={(e) => onWeekNumberChange(Number(e.target.value))} 
              className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black font-bold outline-none focus:border-red-500 transition-colors text-sm shadow-inner leading-none text-left cursor-pointer"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}. Hafta</option>
              ))}
            </select>
          </div>

          {/* Haftalık Konu Başlığı */}
          <div className="lg:col-span-4 text-left leading-none">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
              Haftalık Konu Başlığı
            </label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)} 
              className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black outline-none focus:border-red-500 font-bold transition-all text-sm shadow-inner leading-none text-left" 
              placeholder="Haftanın ana başlığını giriniz..." 
            />
          </div>

          {/* TARİH İÇİN BÖLÜM */}
          <div className="lg:col-span-2 text-left leading-none">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#ce1212] uppercase mb-2 tracking-widest text-left leading-none">
              <Filter size={12} className="text-[#ce1212]" /> TARİH İÇİN BÖLÜM
            </label>
            <select 
              value={selectedDeptForSchedule} 
              onChange={(e) => setSelectedDeptForSchedule(e.target.value)} 
              className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black font-bold outline-none focus:border-red-500 transition-colors text-sm shadow-inner leading-none text-left cursor-pointer"
            >
              {departments.map(d => (
                <option key={d.key} value={d.key}>
                  📍 {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* ERİŞİM TARİHİ (AKTİF) */}
          <div className="lg:col-span-2 text-left leading-none">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
              ERİŞİM TARİHİ (AKTİF)
            </label>
            <input 
              type="datetime-local" 
              value={currentSchedule?.release_date || ''} 
              onChange={(e) => onUpdateDepartmentSchedule(selectedDeptForSchedule, 'release_date', e.target.value)} 
              className="w-full p-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none focus:border-red-500 shadow-inner leading-none text-left text-xs sm:text-sm" 
            />
          </div>

          {/* KAPANIŞ TARİHİ (PASİF) */}
          <div className="lg:col-span-2 text-left leading-none">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
              KAPANIŞ TARİHİ (PASİF)
            </label>
            <input 
              type="datetime-local" 
              value={currentSchedule?.deactivation_date || ''} 
              onChange={(e) => onUpdateDepartmentSchedule(selectedDeptForSchedule, 'deactivation_date', e.target.value)} 
              className="w-full p-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none focus:border-red-500 shadow-inner leading-none text-left text-xs sm:text-sm" 
            />
          </div>
        </div>

        {/* Bölüm Takvimi Hızlı Barı & Tüm Bölümlere Kopyalama */}
        <div className="mb-10 p-4 bg-gray-50/80 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ce1212] shrink-0"></span>
            <span>
              Şu an <strong className="text-black uppercase tracking-tight">{departments.find(d => d.key === selectedDeptForSchedule)?.name || selectedDeptForSchedule}</strong> bölümünün tarihleri görüntüleniyor/düzenleniyor.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onApplyToAllDepartments(currentSchedule?.release_date || '', currentSchedule?.deactivation_date || '')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-[#ce1212] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shrink-0"
            title="Seçili bölümün tarihlerini tüm diğer bölümlere de tek tıkla uygular"
          >
            <Calendar size={13} />
            BU TARİHLERİ TÜM BÖLÜMLERE KOPYALA
          </button>
        </div>

        {/* 1. Hafta ise Oryantasyon Videosu Ayarları */}
        {weekNumber === 1 && (
          <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-red-50 to-white rounded-3xl border-2 border-[#ce1212]/20 shadow-sm space-y-6 text-left leading-normal">
            <div className="flex items-center gap-3 text-[#ce1212] border-b border-red-100 pb-4 leading-none text-left">
              <ShieldCheck size={24} />
              <div className="text-left leading-none">
                <h3 className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-none">
                  SİSTEM GENELİ ORYANTASYON VİDEOSU
                </h3>
                <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-tighter leading-none">
                  * Sisteme girişte izlenmesi zorunlu olan rehber içeriktir.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-none text-left">
              <div className="text-left leading-none">
                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
                  <Type size={12} /> Oryantasyon Başlığı
                </label>
                <input 
                  type="text" 
                  value={introTitle} 
                  onChange={(e) => onIntroTitleChange(e.target.value)} 
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-red-500 bg-white leading-none text-left" 
                />
              </div>
              <div className="text-left leading-none">
                <label className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left leading-none">
                  <PlayCircle size={12} /> Video Embed URL
                </label>
                <input 
                  type="url" 
                  value={introVideoUrl} 
                  onChange={(e) => onIntroVideoUrlChange(e.target.value)} 
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-red-500 bg-white leading-none text-left" 
                />
              </div>
              <div className="md:col-span-2 text-left leading-none mt-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">
                  Oryantasyon Metni (Opsiyonel)
                </label>
                <textarea 
                  value={introDescription} 
                  onChange={(e) => onIntroDescriptionChange(e.target.value)} 
                  rows={4}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black font-bold outline-none focus:border-red-500 transition-all text-sm shadow-inner leading-relaxed text-left" 
                  placeholder="Hoş geldiniz metni veya sistem rehberini buraya yazabilirsiniz..." 
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Hafta ve Sonrası: Haftalık Ön Değerlendirme Testi */}
        {weekNumber >= 2 && (
          <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/30 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-6 text-left leading-normal">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-indigo-100 pb-4 gap-4 leading-none text-left">
              <div className="flex items-center gap-3 text-indigo-700 leading-none text-left">
                <HelpCircle size={24} className="text-indigo-600 shrink-0" />
                <div className="text-left leading-none">
                  <h3 className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-none">
                    HAFTALIK ÖN DEĞERLENDİRME TESTİ (TELAFİ MEKANİZMASI)
                  </h3>
                  <p className="text-[9px] text-gray-500 font-bold mt-2 uppercase tracking-tighter leading-none">
                    * Öğrenci bu testi çözmeden haftalık materyallere geçiş yapamaz. Yanlış yapılan sorular ilgili önceki haftanın kilidini 2 gün açar.
                  </p>
                </div>
              </div>

              {/* Ön Değerlendirme Kilidi Toggle Butonu */}
              <button
                type="button"
                onClick={() => onIsPretestActiveChange(!isPretestActive)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shrink-0 ${
                  isPretestActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {isPretestActive ? (
                  <>
                    <Lock size={14} /> ÖN DEĞERLENDİRME: AKTİF (ZORUNLU)
                  </>
                ) : (
                  <>
                    <Unlock size={14} /> ÖN DEĞERLENDİRME: PASİF (KAPALI)
                  </>
                )}
              </button>
            </div>

            {/* Bilgilendirme Notu */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed font-semibold">
              <p>
                <strong>Nasıl Çalışır?</strong> Ön değerlendirme testi aktif edildiğinde, öğrenci haftaya giriş yaptığında ilk olarak bu 5 şıklı testi çözer. Yanlış yaptığı sorunun hedeflediği önceki haftanın kilidi <strong>2 gün boyunca (48 saat)</strong> telafi amaçlı açılır ve öğrenciye sidebar üzerinde bildirilir. Bu telafi sürecinde öğrenci önceki haftayı tamamlasa bile <strong>DB'ye puan/ilerleme kaydedilmez</strong>. Hedef hafta bilgisi öğrenciye asla gösterilmez.
              </p>
            </div>

            {isPretestActive && (
              <div className="space-y-6 pt-2 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                    Ön Değerlendirme Soruları ({preTest?.questions?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={onAddPreTestQuestion}
                    className="bg-indigo-600 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Plus size={14} /> YENİ SORU EKLE
                  </button>
                </div>

                {(!preTest?.questions || preTest.questions.length === 0) ? (
                  <div className="p-6 bg-white rounded-2xl border border-dashed border-indigo-200 text-center text-gray-400 text-xs font-bold">
                    Henüz soru eklenmedi. Yukarıdaki &quot;Yeni Soru Ekle&quot; butonuna basarak soru ekleyebilirsiniz.
                  </div>
                ) : (
                  preTest.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-5 bg-white rounded-2xl border-2 border-indigo-100 space-y-4 hover:border-indigo-300 transition-all shadow-sm text-left"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
                        <span className="font-black text-indigo-700 text-xs uppercase">
                          Soru #{qIndex + 1}
                        </span>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tight whitespace-nowrap">
                              Yanlışta Açılacak Hafta:
                            </label>
                            <select
                              value={q.target_week ?? 1}
                              onChange={(e) => onUpdatePreTestQuestionTargetWeek(qIndex, Number(e.target.value))}
                              className="p-1.5 px-3 rounded-lg border border-indigo-200 text-xs font-black bg-indigo-50/50 text-indigo-900 outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {Array.from({ length: weekNumber - 1 }, (_, i) => i + 1).map((wNum) => (
                                <option key={wNum} value={wNum}>
                                  {wNum}. Hafta
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemovePreTestQuestion(qIndex)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Soruyu Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Soru Metni */}
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1.5 tracking-widest text-left">
                          Soru Metni
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ön değerlendirme sorusu metnini yazınız..."
                          className="w-full p-3 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-indigo-500 bg-gray-50/50 text-slate-800"
                          value={q.question_text}
                          onChange={(e) => onUpdatePreTestQuestionText(qIndex, e.target.value)}
                        />
                      </div>

                      {/* 5 Şıklı Seçenekler */}
                      <div className="space-y-2 text-left">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">
                          5 Seçenek (Doğru cevabın harfine tıklayarak yeşil yapınız)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                          {(q.options && q.options.length === 5
                            ? q.options
                            : Array.from({ length: 5 }, (_, i) => q.options?.[i] || { option_text: '', is_correct: i === 0 })
                          ).map((opt, oIndex) => {
                            const optLetter = ['A', 'B', 'C', 'D', 'E'][oIndex];
                            return (
                              <div
                                key={oIndex}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  opt.is_correct
                                    ? 'bg-green-50 border-green-500 ring-1 ring-green-500'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => onSetPreTestCorrectOption(qIndex, oIndex)}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] shadow-sm transition-all ${
                                    opt.is_correct
                                      ? 'bg-green-500 text-white shadow-green-200'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  title={opt.is_correct ? "Doğru Cevap" : "Doğru Cevap Olarak Seç"}
                                >
                                  {optLetter}
                                </button>
                                <input
                                  type="text"
                                  placeholder={`${optLetter} şıkkı...`}
                                  className="flex-1 bg-transparent text-[11px] font-bold outline-none text-slate-800"
                                  value={opt.option_text}
                                  onChange={(e) => onUpdatePreTestOption(qIndex, oIndex, e.target.value)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Materyaller ve Puanlama */}
        <div className="space-y-6 text-left leading-normal">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4 leading-none text-left">
            <h3 className="font-black text-secondary uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 text-left leading-none">
              <ListChecks size={18} className="text-[#ce1212]" /> Materyaller ve Puanlama
            </h3>
            <button 
              type="button" 
              onClick={onAddMaterialRow} 
              className="w-full sm:w-auto bg-red-50 text-[#ce1212] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black hover:bg-[#ce1212] hover:text-white transition-all shadow-sm leading-none text-left"
            >
              <Plus size={16} /> MATERYAL EKLE
            </button>
          </div>

          <div className="grid gap-6 text-left">
            {materials.map((mat, mIndex) => (
              <div key={mIndex} className="p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-[2.5rem] border border-gray-200 space-y-4 hover:border-red-200 transition-all group leading-normal text-left">
                <div className="flex flex-col lg:flex-row gap-4 items-center leading-none text-left">
                  <div className="w-full lg:w-32 shrink-0 leading-none text-left">
                    <select 
                      value={mat.content_type} 
                      onChange={(e) => onUpdateMaterial(mIndex, 'content_type', e.target.value)} 
                      className="w-full p-3 rounded-xl border border-gray-200 text-black text-[9px] font-black bg-white outline-none shadow-sm leading-none text-left cursor-pointer"
                    >
                      <option value="video">🎥 Video</option>
                      <option value="podcast">🎙️ Podcast</option>
                      <option value="form">📝 Test</option>
                      <option value="pdf">📄 PDF</option>
                      <option value="assignment">📂 Ödev (MS Form)</option>
                    </select>
                  </div>

                  <div className="w-full flex-1 leading-none text-left">
                    <input 
                      type="text" 
                      placeholder="Materyal Başlığı" 
                      className="w-full p-3 rounded-xl border border-gray-200 text-black text-xs font-bold outline-none bg-white shadow-sm leading-none text-left" 
                      value={mat.title} 
                      onChange={(e) => onUpdateMaterial(mIndex, 'title', e.target.value)} 
                    />
                  </div>
                  
                  {mat.content_type !== 'pdf' && (
                    <div className="w-full lg:w-28 shrink-0 flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm text-left">
                      <Award size={14} className="text-amber-500 ml-1 text-left" />
                      <input 
                        type="number" 
                        placeholder="Puan" 
                        className="w-full p-2 text-xs font-black text-secondary outline-none leading-none bg-transparent text-left" 
                        value={mat.point_value} 
                        onChange={(e) => onUpdateMaterial(mIndex, 'point_value', e.target.value)} 
                      />
                    </div>
                  )}

                  {(mat.content_type === 'video' || mat.content_type === 'podcast') && (
                    <div className="w-full lg:w-32 shrink-0 flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-100 shadow-sm text-left">
                      <Clock size={14} className="text-blue-500 ml-1.5 shrink-0 text-left" />
                      <input 
                        type="number" 
                        min="0"
                        placeholder="120" 
                        className="w-full p-2 text-xs font-black text-secondary outline-none leading-none bg-transparent text-left" 
                        value={mat.duration_seconds ?? 120} 
                        onChange={(e) => onUpdateMaterial(mIndex, 'duration_seconds', e.target.value === '' ? '' : parseInt(e.target.value) || 0)} 
                      />
                      <span className="text-[10px] font-bold text-gray-400 mr-2 shrink-0">sn</span>
                    </div>
                  )}

                  {mat.content_type !== 'form' && (
                    <div className="w-full flex-[1.5] leading-none text-left">
                      <input 
                        type="url" 
                        placeholder={mat.content_type === 'pdf' ? "OneDrive İndirme Linki" : "Embed URL Adresi"} 
                        className="w-full p-3 rounded-xl border border-gray-200 text-black text-[10px] font-mono outline-none bg-white shadow-sm leading-none text-left" 
                        value={mat.embed_url} 
                        onChange={(e) => onUpdateMaterial(mIndex, 'embed_url', e.target.value)} 
                      />
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={() => onRemoveMaterialRow(mIndex)} 
                    className="w-full lg:w-auto p-3 text-red-400 hover:text-red-600 transition-colors leading-none active:scale-90 text-left"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {mat.content_type === 'form' && mat.quiz && (
                  <div className="mt-4 bg-white p-5 rounded-2xl border-2 border-dashed border-red-100 space-y-6 text-left leading-normal">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3 text-left">
                      <div className="flex items-center gap-2 text-[#ce1212] font-black text-[10px] uppercase tracking-widest text-left">
                        <ListChecks size={18} /> Sınav Düzenleyici
                      </div>
                      <button 
                        type="button" 
                        onClick={() => onAddQuestion(mIndex)} 
                        className="text-[#ce1212] font-black text-[9px] uppercase hover:underline"
                      >
                        + Yeni Soru Ekle
                      </button>
                    </div>

                    <div className="space-y-8 text-left">
                      {mat.quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-4 bg-gray-50/50 rounded-xl space-y-4 border border-gray-100 text-left">
                          <div className="flex gap-4 items-start text-left">
                            <span className="bg-[#ce1212] text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">
                              {qIndex + 1}
                            </span>
                            <input 
                              type="text" 
                              placeholder="Soru metni..." 
                              className="w-full p-2.5 rounded-lg border text-xs font-bold focus:border-red-500 outline-none shadow-sm" 
                              value={q.question_text} 
                              onChange={(e) => onUpdateQuestionText(mIndex, qIndex, e.target.value)} 
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:pl-11 text-left">
                            {q.options.map((opt, oIndex) => {
                              const optLetter = String.fromCharCode(65 + oIndex);
                              return (
                                <div 
                                  key={oIndex} 
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                                    opt.is_correct ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <button 
                                    type="button" 
                                    onClick={() => onSetCorrectOption(mIndex, qIndex, oIndex)} 
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] shadow-sm transition-all ${
                                      opt.is_correct ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                    title={opt.is_correct ? "Doğru Cevap" : "Doğru Cevap Olarak Seç"}
                                  >
                                    {optLetter}
                                  </button>
                                  <input 
                                    type="text" 
                                    placeholder={`${optLetter} şıkkı metni...`} 
                                    className="flex-1 bg-transparent text-[11px] font-bold outline-none text-slate-800" 
                                    value={opt.option_text} 
                                    onChange={(e) => onUpdateOption(mIndex, qIndex, oIndex, e.target.value)} 
                                  />
                                </div>
                              );
                            })}
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

        {/* Haftalık Flashcardlar */}
        <div className="mt-12 space-y-6 text-left leading-normal">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4 leading-none text-left">
            <div className="flex items-center gap-2 text-secondary font-black text-[10px] md:text-xs uppercase tracking-widest leading-none text-left">
              <BookOpen size={18} className="text-blue-600" /> Haftalık Flashcardlar
            </div>
            <button 
              type="button" 
              onClick={() => onSetFlashcards([...flashcards, { question: '', answer: '' }])} 
              className="w-full sm:w-auto bg-blue-50 text-blue-600 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm leading-none text-left"
            >
              <Plus size={16} /> KART EKLE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left leading-normal">
            {flashcards.map((card, idx) => (
              <div key={idx} className="p-5 md:p-6 bg-blue-50/30 rounded-2xl border-2 border-blue-100 space-y-4 relative group hover:border-blue-300 transition-all shadow-sm text-left">
                <button 
                  type="button" 
                  onClick={() => onSetFlashcards(flashcards.filter((_, i) => i !== idx))} 
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[9px] font-black text-blue-600 uppercase mb-1.5 tracking-widest text-left">
                      <Type size={10} className="inline mr-1" /> Kaynak / Döküman Adı
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Haftalık Özet Notları"
                      className="w-full p-3 rounded-xl border border-blue-100 text-xs font-bold outline-none focus:border-blue-500 bg-white text-left" 
                      value={card.question} 
                      onChange={(e) => onUpdateFlashcard(idx, 'question', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-blue-600 uppercase mb-1.5 tracking-widest text-left">
                      <Download size={10} className="inline mr-1" /> OneDrive / Word / PDF Linki
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://bingol-my.sharepoint.com/..."
                      className="w-full p-3 rounded-xl border border-blue-100 text-[10px] font-mono outline-none focus:border-blue-500 bg-white text-left" 
                      value={card.answer} 
                      onChange={(e) => onUpdateFlashcard(idx, 'answer', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Haftalık Ders Notları ve Özet */}
        <div className="my-10 p-6 md:p-8 bg-amber-50/30 rounded-3xl border-2 border-amber-100 shadow-sm space-y-6 text-left leading-normal">
          <div className="flex items-center gap-3 text-amber-600 border-b border-amber-100 pb-4 leading-none text-left">
            <Calendar size={24} />
            <div className="text-left leading-none">
              <h3 className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-none">
                HAFTALIK DERS NOTLARI VE ÖZET
              </h3>
              <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-tighter leading-none">
                * Öğrencilerin panelinde görüntülenecek olan haftalık akademik içerik.
              </p>
            </div>
          </div>
          <textarea 
            rows={5} 
            value={description} 
            onChange={(e) => onDescriptionChange(e.target.value)} 
            className="w-full p-5 md:p-8 rounded-2xl border-2 border-gray-100 bg-white text-black outline-none focus:border-amber-500 transition-all font-bold text-sm shadow-inner leading-relaxed text-left" 
            placeholder="Ders notlarını, formülleri veya önemli hatırlatmaları buraya yazabilirsiniz..." 
          />
        </div>

        {/* Kaydet Butonu */}
        <button 
          type="submit" 
          disabled={loading || fetchingWeek} 
          className="w-full mt-10 bg-[#1a1a1a] text-white py-6 rounded-[2rem] font-black tracking-[0.2em] hover:bg-black transition-all flex justify-center items-center gap-3 shadow-2xl active:scale-95 text-xs md:text-sm uppercase leading-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} className="text-[#ce1212]" /> 
          {loading ? "KAYDEDİLİYOR..." : fetchingWeek ? "HAFTA YÜKLENİYOR..." : "HAFTAYI KAYDET VE YAYINLA"}
        </button>
      </div>
    </form>
  );
}
