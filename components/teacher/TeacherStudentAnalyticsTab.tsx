"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Filter, Clock, Search, Loader2, ChevronLeft, ChevronRight, FileText, BarChart2, CheckCircle2, Calendar 
} from 'lucide-react';
import { StudentAnalytics, formatDuration, getDeptName, DepartmentItem, DEPARTMENT_MAP } from '@/components/types';

interface TeacherStudentAnalyticsTabProps {
  filteredAnalytics: StudentAnalytics[];
  departments?: DepartmentItem[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  onExportBulkPDF: () => void;
  pdfLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  loadingKarneStudentId: string | number | null;
  onOpenKarne: (studentId: number | string) => void;
}

export default function TeacherStudentAnalyticsTab({
  filteredAnalytics,
  departments,
  selectedDepartment,
  onDepartmentChange,
  onExportBulkPDF,
  pdfLoading,
  currentPage,
  onPageChange,
  pageSize,
  loadingKarneStudentId,
  onOpenKarne
}: TeacherStudentAnalyticsTabProps) {
  const totalPages = Math.ceil(filteredAnalytics.length / pageSize) || 1;
  const paginatedStudents = filteredAnalytics.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Mevcut haftaları d2 öğrencilerinin haftalık dökümünden dinamik olarak çek
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<number>();
    filteredAnalytics.forEach(student => {
      student.weekly_breakdown?.forEach(wb => {
        if (typeof wb.week_number === 'number') {
          weeksSet.add(wb.week_number);
        }
      });
    });
    const sorted = Array.from(weeksSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [1, 2, 3, 4, 5, 6];
  }, [filteredAnalytics]);

  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Eğer seçili hafta mevcut haftalar listesinde yoksa ilk haftaya dön
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  // Seçilen haftayı %100 tamamlayan d2 öğrenci sayısı
  const completedCount = useMemo(() => {
    return filteredAnalytics.filter(student =>
      student.weekly_breakdown?.some(
        wb => wb.week_number === selectedWeek && (wb.is_completed || (typeof wb.progress === 'number' && wb.progress >= 100))
      )
    ).length;
  }, [filteredAnalytics, selectedWeek]);

  const totalStudents = filteredAnalytics.length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

  return (
    <div className="animate-in slide-in-from-bottom-3 duration-300 space-y-6 text-left leading-normal">
      {/* ÜST BİLGİ VE FİLTRELEME BARI */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        {/* SOL: TOPLAM KAYITLI ÖĞRENCİ */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
            <Users size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-left leading-tight">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              TOPLAM KAYITLI ÖĞRENCİ
            </p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {filteredAnalytics.length}
            </p>
          </div>
        </div>

        {/* SAĞ: BÖLÜM SEÇİCİ VE RAPOR BUTONU */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-left">
          {/* Bölüm Filtresi */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select 
              value={selectedDepartment} 
              onChange={(e) => {
                onDepartmentChange(e.target.value);
                onPageChange(1);
              }}
              className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-800 cursor-pointer"
            >
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

          {/* Bölüm Akademik Rapor Butonu */}
          <button 
            type="button"
            onClick={onExportBulkPDF} 
            disabled={pdfLoading}
            className="flex items-center gap-2 bg-[#ce1212] hover:bg-[#b51010] active:scale-95 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-60"
          >
            <FileText size={15} /> 
            {pdfLoading ? "HAZIRLANIYOR..." : `${getDeptName(selectedDepartment).toUpperCase()} AKADEMİK RAPOR`}
          </button>
        </div>
      </div>

      {/* D2 KATEGORİSİ HAFTALIK %100 TAMAMLAMA KPI KARTI */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        {/* SOL: İKON VE TAMAMLAMA VERİLERİ */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <CheckCircle2 size={24} className="stroke-[2.5]" />
          </div>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-tight text-slate-400">
                {selectedWeek}. HAFTA İÇERİĞİNİ %100 TAMAMLAYAN ÖĞRENCİ SAYISI
              </span>
              <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase">
                D2 KATEGORİSİ
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {completedCount}
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-400">
                / {totalStudents} Öğrenci
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-black ml-2 md:ml-3">
                %{completionPercentage} Tamamlama Oranı
              </span>
            </div>
          </div>
        </div>

        {/* SAĞ: HAFTA SEÇİCİ */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span className="text-[11px] font-black uppercase text-slate-500">HAFTA:</span>
          </div>
          <select 
            value={selectedWeek} 
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-800 cursor-pointer"
          >
            {availableWeeks.map((w) => (
              <option key={w} value={w}>
                {w}. HAFTA
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ANA TABLO KARTI */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        {/* Kart Başlığı */}
        <div className="p-5 md:p-6 pb-3 md:pb-4 flex items-center gap-2 text-left">
          <BarChart2 size={18} className="text-[#ce1212] stroke-[2.5]" />
          <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">
            AKADEMİK TAKİP ÇİZELGESİ (SAYFA {currentPage})
          </h2>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50/40 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">AD SOYAD / BÖLÜM</th>
                <th className="py-4 px-6">PUAN / AKTİF İLERLEME</th>
                <th className="py-4 px-6">TOPLAM SÜRE</th>
                <th className="py-4 px-6 text-center">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Bu bölüme ait kayıtlı öğrenci verisi bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase();

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* 1. AD SOYAD / BÖLÜM */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5 text-left">
                          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shrink-0 uppercase shadow-xs">
                            {initials}
                          </div>
                          <div className="text-left leading-tight">
                            <p className="font-black text-slate-900 uppercase text-xs md:text-sm tracking-tight">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[9px] md:text-[10px] font-black text-[#ce1212] uppercase tracking-wider mt-0.5">
                              {getDeptName(student.department)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. PUAN / AKTİF İLERLEME */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 md:gap-4 text-left">
                          <div className="bg-amber-50/90 border border-amber-200/90 text-amber-800 font-black text-[10px] px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                            {student.total_points || 0} Puan
                          </div>

                          <div className="space-y-1 w-28 md:w-36">
                            <div className="flex items-center justify-between text-[9px] font-bold">
                              <span className="text-slate-800 font-black">%{student.overall_progress || 0}</span>
                              <span className="text-[8px] font-bold text-blue-500 uppercase tracking-wider">GÜNCEL</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-300/80">
                              <div 
                                className="h-full bg-[#ce1212] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, student.overall_progress || 0))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. TOPLAM SÜRE */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <Clock size={14} className="text-amber-500 shrink-0 stroke-[2.2]" /> 
                          <span>{formatDuration(student.total_time_spent)}</span>
                        </div>
                      </td>

                      {/* 4. İŞLEM */}
                      <td className="py-4 px-6 text-center">
                        <button 
                          type="button"
                          disabled={loadingKarneStudentId !== null}
                          onClick={() => onOpenKarne(student.id)}
                          className={`inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${
                            loadingKarneStudentId === student.id
                              ? 'bg-gray-400 text-white cursor-wait opacity-90'
                              : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
                          }`}
                        >
                          {loadingKarneStudentId === student.id ? (
                            <>
                              <Loader2 size={13} className="animate-spin text-white" /> YÜKLENİYOR...
                            </>
                          ) : (
                            <>
                              <Search size={13} /> HAFTALIK KARNE
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SAYFALAMA ALTI (PAGINATION) */}
        {filteredAnalytics.length > 0 && (
          <div className="p-4 md:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              TOPLAM {filteredAnalytics.length} ÖĞRENCİDEN {paginatedStudents.length} TANESİ GÖSTERİLİYOR
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === 1 
                    ? 'text-gray-300 border border-gray-100 cursor-not-allowed' 
                    : 'text-slate-700 hover:bg-gray-100 border border-gray-200 cursor-pointer shadow-xs'
                }`}
              >
                <ChevronLeft size={15} />
              </button>

              <span className="bg-white border border-gray-200 text-[11px] font-black px-3.5 py-1.5 rounded-xl text-slate-800 shadow-xs uppercase tracking-wide">
                SAYFA {currentPage}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  currentPage >= totalPages 
                    ? 'text-gray-300 border border-gray-100 cursor-not-allowed' 
                    : 'text-slate-700 hover:bg-gray-100 border border-gray-200 cursor-pointer shadow-xs'
                }`}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
