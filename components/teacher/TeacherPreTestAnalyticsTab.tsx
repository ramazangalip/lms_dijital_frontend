"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, Users, Filter, Printer, Award, AlertTriangle, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, Clock, BookOpen, Zap, Video, FileText, Headphones, Sparkles, Check 
} from 'lucide-react';
import api from '@/lib/api';
import { 
  DepartmentItem, DEPARTMENT_MAP, PreTestAnalyticsResponse, 
  PreTestStudentData, PreTestStudentWeekResult 
} from '@/components/types';

interface TeacherPreTestAnalyticsTabProps {
  departments?: DepartmentItem[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
}

const getMaterialTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <Video size={13} className="text-rose-500 shrink-0" />;
    case 'audio':
      return <Headphones size={13} className="text-violet-500 shrink-0" />;
    case 'pdf':
    case 'text':
      return <FileText size={13} className="text-blue-500 shrink-0" />;
    default:
      return <BookOpen size={13} className="text-amber-500 shrink-0" />;
  }
};

export default function TeacherPreTestAnalyticsTab({
  departments,
  selectedDepartment,
  onDepartmentChange
}: TeacherPreTestAnalyticsTabProps) {
  const [data, setData] = useState<PreTestAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [openStudentAccordion, setOpenStudentAccordion] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Verileri çekme
  useEffect(() => {
    setLoading(true);
    let url = '/contents/pre-test-analytics/';
    if (selectedDepartment && selectedDepartment !== 'all') {
      url += `?department=${selectedDepartment}`;
    }

    api.get(url)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ön değerlendirme analitiği yüklenirken hata:", err);
        setLoading(false);
      });
  }, [selectedDepartment]);

  // Bölüm veya hafta değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setCurrentPage(1);
    setOpenStudentAccordion(null);
  }, [selectedDepartment, selectedWeekFilter]);

  const studentsList: PreTestStudentData[] = useMemo(() => {
    return data?.students || [];
  }, [data]);

  const totalPages = Math.ceil(studentsList.length / pageSize) || 1;
  const paginatedStudents = studentsList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // PDF Çıktısı Alma (jspdf + jspdf-autotable)
  const exportPreTestPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const fixTR = (str: string) => !str ? "" : str
        .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
        .replace(/İ/g, "I").replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C").replace(/Ö/g, "O").replace(/Ü/g, "U");

      const deptName = selectedDepartment !== 'all' ? (departments?.find(d => d.key === selectedDepartment)?.name || selectedDepartment) : 'Tüm Bölümler';

      // Header Banner
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 0, 297, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(fixTR(`${deptName.toUpperCase()} - D2 HAFTALIK ÖN DEĞERLENDİRME & TELAFİ RAPORU`), 15, 11);

      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.text(fixTR(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} | Toplam D2: ${data.total_students} | Ort. Ön Test: %${data.average_score} | Ort. Telafi İlerlemesi: %${data.avg_remediation_progress ?? 0} (${data.active_remediations_count || 0} Aktif)`), 15, 18);

      // Tablo Satırları
      const tableRows: any[] = [];
      data.students.forEach((st, idx) => {
        const remList = (st.all_remediations && st.all_remediations.length > 0)
          ? st.all_remediations
          : (st.active_remediations || []);

        const remediationsStr = remList.length > 0
          ? remList.map(r => {
              const status = r.is_active ? `Aktif (${r.hours_remaining}s kaldı)` : 'Kapandı';
              let line = `${r.week_number}.H [${status}]\n- İlerleme: %${r.completion_percentage ?? 0} | Süre: ${r.duration_minutes ?? 0} dk (${r.completed_count ?? 0}/${r.total_materials_count ?? 0} mat)`;
              if (r.materials_breakdown && r.materials_breakdown.length > 0) {
                const matLines = r.materials_breakdown.map(m => 
                  `  • ${m.title} (${m.duration_minutes} dk, ${m.is_completed ? 'Tamamlandı' : 'İnceleniyor'})`
                ).join('\n');
                line += `\n${matLines}`;
              }
              return line;
            }).join('\n\n')
          : 'Yok';

        // Hafta bazında sonuçlar
        const weekDetails = (st.weekly_results || [])
          .filter(w => selectedWeekFilter === 'all' || String(w.week_number) === selectedWeekFilter)
          .map(w => {
            if (!w.is_pretest_active) return `${w.week_number}.H: Pasif`;
            if (!w.has_attempt) return `${w.week_number}.H: Çözmedi`;
            const wrongNotes = w.wrong_questions && w.wrong_questions.length > 0
              ? ` [Yanlış: ${w.wrong_questions.map(wq => `W${wq.target_week} telafi`).join(', ')}]`
              : ' [Tam]';
            return `${w.week_number}.H: %${w.score} (${w.correct}D/${w.wrong}Y)${wrongNotes}`;
          })
          .join('\n');

        tableRows.push([
          idx + 1,
          fixTR(st.full_name),
          st.email,
          fixTR(st.department_name),
          fixTR(remediationsStr),
          fixTR(weekDetails || '-')
        ]);
      });

      autoTable(doc, {
        head: [['#', 'Öğrenci Adı Soyadı', 'E-Posta', 'Bölüm', 'Telafi Kilitleri & Materyal İncelemeleri', 'Haftalık Ön Test Sonuçları & Tetiklenen Haftalar']],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
        headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 42 },
          3: { cellWidth: 38 },
          4: { cellWidth: 75 },
          5: { cellWidth: 70 }
        }
      });

      doc.save(`on-degerlendirme-d2-rapor-${selectedDepartment || 'all'}.pdf`);
    } catch (err) {
      console.error("PDF oluşturulurken hata:", err);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-3 duration-300 space-y-6 text-left leading-normal">
      {/* ÜST İSTATİSTİK VE FİLTRE KARTI */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="flex flex-wrap items-center gap-6 leading-none text-left">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 flex items-center justify-center leading-none text-left border border-indigo-100 shadow-xs">
              <HelpCircle size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                TOPLAM D2 ÖĞRENCİ
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {data?.total_students || 0}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 flex items-center justify-center leading-none text-left border border-emerald-100 shadow-xs">
              <Award size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                ORT. ÖN TEST SKORU
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                %{data?.average_score || 0}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 flex items-center justify-center leading-none text-left border border-amber-100 shadow-xs">
              <Clock size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                TOPLAM ÇÖZÜLEN ÖN TEST
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {data?.total_attempts || 0}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="bg-violet-50 p-3 rounded-2xl text-violet-600 flex items-center justify-center leading-none text-left border border-violet-100 shadow-xs">
              <Zap size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                ORT. TELAFİ İLERLEMESİ
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-black text-slate-900">
                  %{data?.avg_remediation_progress ?? 0}
                </p>
                <span className="text-[10px] font-bold text-slate-500">
                  ({data?.active_remediations_count || 0} Aktif / {data?.total_remediations || 0} Toplam)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FİLTRELER VE PDF BUTONU */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-left">
          {/* BÖLÜM SEÇİCİ */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select 
              value={selectedDepartment} 
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">TÜM BÖLÜMLER</option>
              {(departments && departments.length > 0) ? (
                departments.map(d => (
                  <option key={d.key} value={d.key}>
                    {d.name.toUpperCase()}
                  </option>
                ))
              ) : (
                Object.entries(DEPARTMENT_MAP).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name.toUpperCase()}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* HAFTA SEÇİCİ */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
            <BookOpen size={14} className="text-gray-400 shrink-0" />
            <select
              value={selectedWeekFilter}
              onChange={(e) => setSelectedWeekFilter(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-800 cursor-pointer"
            >
              <option value="all">TÜM HAFTALAR</option>
              {Array.from({ length: 14 }, (_, i) => i + 2).map(wNum => (
                <option key={wNum} value={String(wNum)}>
                  {wNum}. HAFTA
                </option>
              ))}
            </select>
          </div>

          {/* PDF YAZDIR / İNDİR BUTONU */}
          <button
            type="button"
            onClick={exportPreTestPDF}
            disabled={pdfLoading || loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Printer size={15} />
            {pdfLoading ? "HAZIRLANIYOR..." : "PDF RAPORU AL"}
          </button>
        </div>
      </div>

      {/* TELAFİ İSTATİSTİK ŞERİDİ */}
      {/* {data?.remediation_summary && Object.keys(data.remediation_summary).length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs font-bold text-amber-900">
          <div className="flex items-center gap-2 text-amber-700 uppercase font-black tracking-wider text-[11px]">
            <AlertTriangle size={16} /> TELAFİ TETİKLENME SAYILARI:
          </div>
          {Object.entries(data.remediation_summary).map(([targetW, count]) => (
            <span key={targetW} className="bg-white/80 px-3 py-1 rounded-full border border-amber-200 text-amber-800 font-extrabold shadow-xs">
              {targetW}. Hafta: <span className="text-red-600">{count} kez</span> kilit açıldı
            </span>
          ))}
        </div>
      )} */}

      {/* ÖĞRENCİ LİSTESİ TABLOSU */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              D2 KATEGORİSİ ÖĞRENCİ ÖN DEĞERLENDİRME DETAYLARI
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
              * Yalnızca D2 grubu öğrenciler listelenir. Öğrencinin üzerine tıklayarak yanlış soruları ve telafi detaylarını inceleyebilirsiniz.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            Toplam: {studentsList.length} Öğrenci
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400 font-bold animate-pulse text-xs uppercase tracking-widest">
            Ön değerlendirme verileri yükleniyor...
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="p-16 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">
            Seçili kriterlere uygun D2 öğrencisi bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedStudents.map((st) => {
              const isOpen = openStudentAccordion === st.id;
              const hasActiveRemediation = st.active_remediations && st.active_remediations.length > 0;

              return (
                <div key={st.id} className="transition-all hover:bg-slate-50/60">
                  {/* ÖĞRENCİ SATIR BAŞLIĞI */}
                  <div
                    onClick={() => setOpenStudentAccordion(isOpen ? null : st.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                        {st.full_name?.charAt(0) || 'Ö'}
                      </div>
                      <div className="leading-tight">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          {st.full_name}
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-indigo-100 text-indigo-800 uppercase">
                            D2
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {st.email} • <span className="font-bold text-slate-600">{st.department_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* AKTİF TELAFİ VE HAFTALIK ÖZET ROZETLERİ */}
                    <div className="flex flex-wrap items-center gap-2">
                      {hasActiveRemediation ? (
                        st.active_remediations.map((ar, i) => (
                          <span
                            key={i}
                            className="bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1.5 shadow-xs"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <Clock size={12} className="text-amber-700" />
                            <span>{ar.week_number}.H Telafi ({ar.hours_remaining}s kaldı)</span>
                            <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-extrabold text-[9px]">
                              %{ar.completion_percentage ?? 0}
                            </span>
                            <span className="bg-white/80 text-amber-900 px-1.5 py-0.5 rounded font-bold text-[9px]">
                              {ar.duration_minutes ?? 0} dk
                            </span>
                          </span>
                        ))
                      ) : (st.all_remediations && st.all_remediations.length > 0) ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>{st.all_remediations.length} Telafi Kilidi Açıldı (Süreç Tamamlandı)</span>
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          Telafi Kilidi Yok
                        </span>
                      )}

                      <div className="p-1 rounded-xl text-gray-400 hover:text-slate-800 transition-colors">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* AKORDİYON DETAY: HAFTA BAZINDA TEST VE YANLIŞ CEVAPLAR */}
                  {isOpen && (
                    <div className="px-5 pb-6 pt-3 bg-indigo-50/20 border-t border-indigo-50 space-y-4 text-left">
                      {/* TELAFİ KİLİDİ AÇILAN HAFTALAR VE GERÇEKLEŞEN İLERLEME/SÜRE */}
                      {((st.all_remediations && st.all_remediations.length > 0) || (st.active_remediations && st.active_remediations.length > 0)) && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1.5">
                              <Zap size={14} className="text-amber-700" />
                              Ön Test Sonucu Tetiklenen Telafi Kilitleri ve Gerçekleşen İlerlemeler (İzole Telafi Süreci)
                            </span>
                            <span className="text-[9px] font-bold text-amber-700/80 italic">
                              * Normal dönem T1/T2 sürelerini etkilemeyen bağımsız telafi verileridir
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(st.all_remediations || st.active_remediations).map((rem, ri) => (
                              <div key={ri} className="bg-white rounded-xl border border-amber-200/90 p-3 shadow-xs space-y-2.5 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                                    <BookOpen size={13} className="text-amber-600" />
                                    {rem.week_number}. Hafta Telafi Kilidi
                                  </span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    rem.is_active 
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {rem.is_active ? (
                                      <>
                                        <Clock size={10} className="text-amber-700" />
                                        <span>{rem.hours_remaining}s kaldı</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={10} className="text-emerald-600" />
                                        <span>Süre Doldu</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                {/* İlerleme Çubuğu */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[9px] font-black text-amber-800">
                                    <span>TELAFİ TAMAMLAMA</span>
                                    <span>%{rem.completion_percentage ?? 0}</span>
                                  </div>
                                  <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(100, rem.completion_percentage ?? 0)}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-left">
                                  <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                    <p className="text-[8px] font-black text-amber-700 uppercase">Geçirilen Toplam Süre</p>
                                    <p className="text-sm font-black text-amber-950">
                                      {rem.duration_minutes ?? 0} dk
                                    </p>
                                  </div>
                                  <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                    <p className="text-[8px] font-black text-amber-700 uppercase">Materyal Durumu</p>
                                    <p className="text-sm font-black text-amber-950">
                                      {rem.completed_count ?? (rem.completed_materials?.length || 0)} / {rem.total_materials_count ?? (rem.completed_materials?.length || 0)}
                                    </p>
                                  </div>
                                </div>

                                {/* Materyal Dökümü */}
                                {rem.materials_breakdown && rem.materials_breakdown.length > 0 ? (
                                  <div className="pt-2 border-t border-amber-100 space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] font-black text-amber-900 uppercase">
                                      <span>Materyal Bazında Telafi Takibi</span>
                                      <span className="text-[8px] text-amber-700 lowercase font-medium">({rem.materials_breakdown.length} materyal)</span>
                                    </div>
                                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                      {rem.materials_breakdown.map((mb) => (
                                        <div 
                                          key={mb.id} 
                                          className={`p-1.5 rounded-lg border text-[10px] flex items-center justify-between gap-2 ${
                                            mb.is_completed 
                                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                                              : (mb.duration_seconds || 0) > 0 
                                              ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
                                              : 'bg-gray-50 border-gray-100 text-gray-500'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            {getMaterialTypeIcon(mb.content_type)}
                                            <span className="font-bold truncate max-w-[150px] sm:max-w-[190px]" title={mb.title}>
                                              {mb.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0 text-[9px] font-black">
                                            <span className="bg-white/80 px-1.5 py-0.5 rounded border border-gray-200/60 text-slate-700">
                                              {(mb.duration_minutes || 0) > 0 
                                                ? `${mb.duration_minutes} dk` 
                                                : ((mb.duration_seconds || 0) > 0 ? `${mb.duration_seconds} sn` : '0 dk')}
                                            </span>
                                            {mb.is_completed ? (
                                              <span className="flex items-center gap-0.5 text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">
                                                <Check size={11} className="stroke-[3]" /> Tamam
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 font-semibold">
                                                {(mb.duration_seconds || 0) > 0 ? 'İnceleniyor' : 'Açılmadı'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : rem.completed_materials && rem.completed_materials.length > 0 ? (
                                  <div className="pt-1.5 border-t border-amber-100">
                                    <p className="text-[8px] font-black text-amber-800 uppercase mb-1">
                                      Tamamlanan Materyaller ({rem.completed_materials.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {rem.completed_materials.map((cm, cmi) => (
                                        <span key={cmi} className="bg-amber-50 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200/60 truncate max-w-[200px]">
                                          ✓ {cm}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(st.weekly_results || [])
                          .filter(w => selectedWeekFilter === 'all' || String(w.week_number) === selectedWeekFilter)
                          .map((w) => (
                            <div
                              key={w.week_number}
                              className={`p-4 rounded-2xl border transition-all text-left ${
                                !w.is_pretest_active
                                  ? 'bg-gray-50 border-gray-200 opacity-60'
                                  : w.has_attempt
                                  ? 'bg-white border-indigo-100 shadow-xs'
                                  : 'bg-white border-dashed border-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                <span className="font-black text-xs text-slate-800 uppercase">
                                  {w.week_number}. Hafta Ön Testi
                                </span>
                                {!w.is_pretest_active ? (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                    PASİF
                                  </span>
                                ) : w.has_attempt ? (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    (w.score ?? 0) >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    %{w.score} ({w.correct}D / {w.wrong}Y)
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 text-red-600">
                                    GİRMEDİ
                                  </span>
                                )}
                              </div>

                              {w.has_attempt && (
                                <div className="space-y-2 text-[11px]">
                                  <p className="text-[10px] text-gray-400 font-semibold">
                                    Tamamlandı: {w.completed_at || '-'}
                                  </p>

                                  {w.wrong_questions && w.wrong_questions.length > 0 ? (
                                    <div className="space-y-1.5 pt-1">
                                      <p className="text-[10px] font-black text-red-600 uppercase tracking-tight flex items-center gap-1">
                                        <XCircle size={12} /> Yanlış Yapılan Sorular ve Açılan Kilitler:
                                      </p>
                                      {w.wrong_questions.map((wq, wqi) => (
                                        <div key={wqi} className="bg-red-50/70 p-2 rounded-xl border border-red-100 text-[10px]">
                                          <p className="font-bold text-slate-800 line-clamp-2">
                                            {wq.question_text}
                                          </p>
                                          <div className="mt-1 flex items-center justify-between text-[9px] font-extrabold text-indigo-700">
                                            <span>Seçilen: {wq.selected_option}</span>
                                            <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                                              {wq.target_week}. Hafta Kilidi Açıldı (48s)
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                                      <CheckCircle2 size={13} /> Tüm sorular doğru çözüldü, telafi gerekmedi.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SAYFALAMA */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white text-xs font-bold text-slate-600">
            <span>
              Sayfa {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
