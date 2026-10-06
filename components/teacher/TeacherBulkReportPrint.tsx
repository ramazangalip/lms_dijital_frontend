"use client";
import React from 'react';
import { BulkStudentData, formatDuration, getDeptName } from '@/components/types';

interface TeacherBulkReportPrintProps {
  filteredBulkData: BulkStudentData[];
  selectedDepartment: string;
}

export default function TeacherBulkReportPrint({
  filteredBulkData,
  selectedDepartment
}: TeacherBulkReportPrintProps) {
  const chunkSize = 6;
  const pages: BulkStudentData[][] = [];
  for (let i = 0; i < filteredBulkData.length; i += chunkSize) {
    pages.push(filteredBulkData.slice(i, i + chunkSize));
  }

  return (
    <div id="bulk-report-pdf" className="hidden print:block bg-white p-0 text-left">
      {pages.map((pageStudents, pageIdx) => (
        <div 
          key={pageIdx} 
          className="print-page bg-white p-4 text-black text-left flex flex-col justify-between"
          style={{ 
            height: '100vh', 
            maxHeight: '100vh', 
            pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto',
            pageBreakInside: 'avoid',
            boxSizing: 'border-box'
          }}
        >
          <div>
            {/* SAYFA ÜST BİLGİSİ */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-2 text-left">
              <div className="text-left">
                <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">
                  BİNGÖL ÜNİVERSİTESİ DİJİTAL DÖNÜŞÜM DERSİ AKADEMİK PERFORMANS RAPORU
                </h1>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">
                  BÖLÜM: <span className="text-slate-900 font-black">{getDeptName(selectedDepartment)}</span> | TOPLAM ÖĞRENCİ: {filteredBulkData.length}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-slate-400">
                  Sayfa {pageIdx + 1} / {pages.length}
                </span>
                <p className="text-[7px] text-slate-400 mt-0.5">T1: 1. Tur | T2: 2. Tur</p>
              </div>
            </div>

            {/* TABLO */}
            <table className="w-full border-collapse border border-slate-300 text-[6.5px] leading-tight">
              <thead>
                <tr className="bg-[#0f172a] text-white text-center font-black">
                  <th className="border border-slate-400 p-1 text-left w-32">Öğrenci Adı Soyadı</th>
                  {Array.from({ length: 14 }, (_, i) => (
                    <th key={i} className="border border-slate-400 p-0.5 w-[5.5%]">
                      H.{i + 1}
                    </th>
                  ))}
                  <th className="border border-slate-400 p-1 w-20 text-center">GENEL TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student, sIdx) => {
                  const sTime1 = student.total_time_1 !== undefined 
                    ? student.total_time_1 
                    : student.weekly_breakdown.reduce((acc, w) => acc + (w.duration_seconds || 0), 0);
                  const sTime2 = student.total_time_2 !== undefined 
                    ? student.total_time_2 
                    : student.weekly_breakdown.reduce((acc, w) => acc + (w.duration_seconds_2 || 0), 0);
                  const sTotalTime = student.total_time !== undefined 
                    ? student.total_time 
                    : (sTime1 + sTime2);

                  return (
                    <tr key={sIdx} className="border-b border-slate-200">
                      {/* ÖĞRENCİ İSMİ & PUAN */}
                      <td className="border border-slate-300 p-1 font-bold text-slate-800 align-top text-left bg-slate-50/50">
                        <div className="font-black text-[7.5px] text-slate-900 truncate uppercase">
                          {student.full_name}
                        </div>
                        <div className="text-[6px] text-slate-400 font-mono truncate">{student.email}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-black text-[5.5px]">
                            {getDeptName(student.department)}
                          </span>
                        </div>
                      </td>

                      {/* 14 HAFTALIK DÖKÜM */}
                      {student.weekly_breakdown.map((week, wIdx) => {
                        const dur1 = week.duration_seconds || 0;
                        const dur2 = week.duration_seconds_2 || 0;
                        const mats = week.material_details || [];

                        return (
                          <td key={wIdx} className="border border-slate-300 p-1 text-left align-top bg-white">
                            <div className="space-y-1">
                              {/* 1. ÜST KUTU: T1 - İlerleme % ve Doğru/Yanlış ve Tahmin/Skor */}
                              <div className="bg-slate-50 p-1 rounded border border-slate-200/80 space-y-0.5">
                                <div className="flex justify-between items-center text-[6px]">
                                  <span className="font-black text-slate-700">T1</span>
                                  <span className="font-black text-blue-600">%{Math.round(week.progress || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[5.5px] text-slate-500">
                                  <span>{week.correct || 0}D / {week.wrong || 0}Y</span>
                                  <span className="font-semibold text-slate-700">T1: {formatDuration(dur1)}</span>
                                </div>
                                {week.has_quiz && (
                                  <div className="text-[5px] font-bold text-slate-600 pt-0.5 border-t border-slate-200/60 leading-tight">
                                    <span>T:%{week.predicted_1 || 0} G:%{week.score_1 || 0}</span>
                                    <span className={`ml-0.5 font-black ${
                                      (week.diff_1 || 0) > 0 ? 'text-emerald-700' : (week.diff_1 || 0) < 0 ? 'text-amber-700' : 'text-slate-600'
                                    }`}>
                                      (F:{(week.diff_1 || 0) > 0 ? `+${week.diff_1}` : (week.diff_1 || 0)})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 2. MATERYALLER LİSTESİ (T1 | T2 SÜRELERİ) */}
                              <div className="space-y-0.5 text-[5.5px]">
                                <span className="font-black text-slate-400 text-[5px] uppercase tracking-wider block">
                                  MATERYALLER
                                </span>
                                {mats.length > 0 ? (
                                  mats.map((m, mIdx) => {
                                    const mDur1 = m.duration_seconds_1 || 0;
                                    const mDur2 = m.duration_seconds_2 || 0;
                                    return (
                                      <div key={mIdx} className="leading-none pb-0.5">
                                        <p className="font-bold text-slate-800 truncate" title={m.title}>
                                          • {m.title}
                                        </p>
                                        <p className="text-[#ce1212] font-mono text-[5px] pl-1.5 font-bold">
                                          [T1: {formatDuration(mDur1)} | T2: {mDur2 > 0 ? formatDuration(mDur2) : '-'}]
                                        </p>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className="text-slate-300 italic text-[5px]">Yok</span>
                                )}
                              </div>

                              {/* 3. T2 AKTİF İSE ALT KUTU */}
                              {week.is_round_2_started && (
                                <div className="bg-amber-50/80 p-0.5 rounded border border-amber-200 text-[5px] text-amber-800 text-center font-bold">
                                  T2 AKTİF {week.score_2 !== undefined && week.score_2 > 0 && `(G:%${week.score_2})`}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* GENEL TOPLAM SÜRE & PUAN SÜTUNU */}
                      <td className="border border-slate-300 p-1 text-center align-middle bg-slate-50/80 font-black">
                        <div className="space-y-1">
                          <span className="text-blue-700 text-[8px] font-black block">
                            {student.total_points} PUAN
                          </span>
                          <div className="border-t border-slate-200 pt-1 space-y-0.5 text-[5.5px] text-slate-600 text-left pl-1">
                            <p><span className="text-slate-400">T1:</span> {formatDuration(sTime1)}</p>
                            <p className="text-amber-700 font-bold"><span className="text-slate-400">T2:</span> {formatDuration(sTime2)}</p>
                            <p className="text-slate-900 font-black border-t border-slate-200 pt-0.5">
                              TOP: {formatDuration(sTotalTime)}
                            </p>
                            {(student.avg_predicted !== undefined || student.avg_actual !== undefined) && (
                              <div className="pt-0.5 border-t border-slate-200 text-[5px] text-slate-700">
                                <p>Ort. T:%{student.avg_predicted || 0} G:%{student.avg_actual || 0}</p>
                                <p className="font-black text-[#ce1212]">
                                  Fark: {(student.avg_diff || 0) > 0 ? `+${student.avg_diff}` : (student.avg_diff || 0)} Puan
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SAYFA ALTI BİLGİSİ */}
          <div className="border-t border-slate-200 pt-1 flex justify-between items-center text-[7px] text-slate-400">
            <span>Bingöl Üniversitesi LMS Sistemi tarafından otomatik oluşturulmuştur.</span>
            <span>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
