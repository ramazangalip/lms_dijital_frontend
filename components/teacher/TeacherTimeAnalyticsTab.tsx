"use client";
import React, { useState } from 'react';
import { 
  BarChart3, Filter, Award, ChevronDown, ChevronUp, Users 
} from 'lucide-react';
import { getDeptName, DepartmentItem, DEPARTMENT_MAP } from '@/components/types';

interface TeacherTimeAnalyticsTabProps {
  systemTimeData: any;
  departments?: DepartmentItem[];
  timeDept: string;
  onTimeDeptChange: (dept: string) => void;
  systemTimeLoading: boolean;
}

export default function TeacherTimeAnalyticsTab({
  systemTimeData,
  departments,
  timeDept,
  onTimeDeptChange,
  systemTimeLoading
}: TeacherTimeAnalyticsTabProps) {
  const [currentWeekTab, setCurrentWeekTab] = useState<number>(1);
  const [openWeekAccordion, setOpenWeekAccordion] = useState<number | null>(null);

  const weeklyList = Array.isArray(systemTimeData?.weekly_analysis) ? systemTimeData?.weekly_analysis : [];
  const matchedWeek = weeklyList.find((w: any) => String(w.week_number) === String(currentWeekTab));

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10 text-left leading-normal">
      {/* BAŞLIK & BÖLÜM FİLTRESİ */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="flex items-center gap-4 text-left">
          <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/30">
            <BarChart3 size={24} />
          </div>
          <div className="text-left leading-tight">
            <h2 className="text-lg md:text-xl font-black text-secondary uppercase tracking-tight">
              Sistem Zaman & Etkileşim Analitiği
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Öğrencilerin materyallerde geçirdiği net süreler ve etkinlik dağılımı
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 w-full md:w-auto text-left">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select 
            value={timeDept} 
            onChange={(e) => onTimeDeptChange(e.target.value)}
            className="bg-transparent text-xs font-black uppercase outline-none text-secondary cursor-pointer w-full md:w-auto"
          >
            <option value="all">Tüm Bölümler</option>
            {(departments && departments.length > 0) ? (
              departments.map(d => (
                <option key={d.key} value={d.key}>
                  {d.name}
                </option>
              ))
            ) : (
              Object.entries(DEPARTMENT_MAP).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {systemTimeLoading ? (
        <div className="bg-white p-20 rounded-3xl text-center space-y-4 shadow-xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-[#ce1212] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Analiz Verileri Hesaplanıyor...</p>
        </div>
      ) : (
        <>
          {/* ÖZET KARTLARI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* EN ÇOK VAKİT GEÇİREN */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-8 rounded-3xl border-2 border-green-200/60 shadow-lg relative overflow-hidden flex flex-col justify-between text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-green-500 text-white px-3 py-1 rounded-full shadow-sm">
                  En Yüksek Etkileşim
                </span>
                <Award size={24} className="text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Öğrenci</p>
                <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">
                  {systemTimeData?.max_engagement?.student || "Veri Yok"}
                </h3>
              </div>
              <div className="mt-6 pt-4 border-t border-green-200/40 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase">Toplam Harcanan Süre:</span>
                <span className="text-xl font-black text-green-600 bg-white px-4 py-1.5 rounded-xl border border-green-200 shadow-sm">
                  {systemTimeData?.max_engagement?.time || "0 Saat"}
                </span>
              </div>
            </div>

            {/* EN AZ VAKİT GEÇİREN */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 md:p-8 rounded-3xl border-2 border-red-200/60 shadow-lg relative overflow-hidden flex flex-col justify-between text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#ce1212] text-white px-3 py-1 rounded-full shadow-sm">
                  En Düşük Etkileşim
                </span>
                <Award size={24} className="text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Öğrenci</p>
                <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tight">
                  {systemTimeData?.min_engagement?.student || "Veri Yok"}
                </h3>
              </div>
              <div className="mt-6 pt-4 border-t border-red-200/40 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase">Toplam Harcanan Süre:</span>
                <span className="text-xl font-black text-[#ce1212] bg-white px-4 py-1.5 rounded-xl border border-red-200 shadow-sm">
                  {systemTimeData?.min_engagement?.time || "0 Saat"}
                </span>
              </div>
            </div>
          </div>

          {/* GENEL ETKİNLİK TÜRÜ DAĞILIMI */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-black text-secondary uppercase text-xs tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Genel Etkinlik Türü Dağılımı (Tüm Dönem)
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase">Toplam Süre Payı</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemTimeData?.activity_distribution?.map((act: any, idx: number) => {
                const totalActivityHours = systemTimeData.activity_distribution.reduce((acc: number, curr: any) => acc + curr.hours, 0) || 1;
                const percentage = Math.round((act.hours / totalActivityHours) * 100);
                
                return (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-3">
                    <span className="text-xs font-bold text-gray-600 truncate">{act.type}</span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xl font-black text-secondary">{act.hours} <span className="text-xs font-normal text-gray-400">Saat</span></span>
                        <span className="text-xs font-black text-blue-600">%{percentage}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HAFTALIK DETAYLI DÖKÜM */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <h3 className="font-black text-secondary uppercase text-xs tracking-wider">
                  Haftalık Bazda Akademik Süre Analizleri
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Her haftanın zirve ve taban etkileşimleri
                </p>
              </div>

              {/* Hafta Butonları */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0 custom-scrollbar">
                {Array.from({ length: 14 }, (_, i) => i + 1).map((wNum) => (
                  <button
                    key={wNum}
                    type="button"
                    onClick={() => setCurrentWeekTab(wNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 uppercase ${
                      currentWeekTab === wNum
                        ? 'bg-secondary text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    H.{wNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Seçilen Haftanın Analiz Kartı */}
            {matchedWeek ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6 text-left">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
                  <span className="text-xs font-black text-secondary uppercase tracking-wider">
                    {matchedWeek.week_number}. Hafta Toplam Harcanan Süre:
                  </span>
                  <span className="text-base font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    {matchedWeek.total_hours}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-green-100 space-y-2">
                    <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      Haftanın En Aktifi
                    </span>
                    <div className="flex justify-between items-center pt-1">
                      <p className="text-sm font-black text-secondary">{matchedWeek.max_engagement?.student}</p>
                      <span className="text-xs font-black text-green-600">{matchedWeek.max_engagement?.time}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-red-100 space-y-2">
                    <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      Haftanın En Az Aktifi
                    </span>
                    <div className="flex justify-between items-center pt-1">
                      <p className="text-sm font-black text-secondary">{matchedWeek.min_engagement?.student}</p>
                      <span className="text-xs font-black text-red-600">{matchedWeek.min_engagement?.time}</span>
                    </div>
                  </div>
                </div>

                {/* O Haftanın Etkinlik Dağılımı */}
                {matchedWeek.activity_distribution?.length > 0 && (
                  <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      Haftalık Etkinlik Türü Dağılımı
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {matchedWeek.activity_distribution.map((wAct: any, wIdx: number) => (
                        <div key={wIdx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-xs font-bold">
                          <span className="text-gray-600">{wAct.type}</span>
                          <span className="text-secondary font-black">{wAct.hours} Saat</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider">
                {currentWeekTab}. Hafta için henüz kaydedilmiş bir aktivite süresi bulunmuyor.
              </div>
            )}
          </div>

          {/* HAFTA BAZINDA TÜM ÖĞRENCİLERİN ETKİLEŞİM VE SÜRE SIRALAMASI */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 text-left">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-black text-secondary uppercase text-xs tracking-wider">
                Haftalık Öğrenci Süre Sıralama Analizleri (1 - 14. Hafta)
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                İlgili haftaya tıklayarak öğrencilerin harcadığı süreleri ve derecelerini listeleyin
              </p>
            </div>

            <div className="space-y-3">
              {weeklyList.length > 0 ? (
                weeklyList.map((wItem: any, wIdx: number) => {
                  const isAccordionOpen = openWeekAccordion === wItem.week_number;
                  const sList = Array.isArray(wItem.student_list) ? wItem.student_list : [];

                  return (
                    <div key={wIdx} className="border border-gray-200 rounded-2xl overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => setOpenWeekAccordion(isAccordionOpen ? null : wItem.week_number)}
                        className="w-full p-4 md:p-5 bg-gray-50/80 hover:bg-gray-100 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-secondary text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {wItem.week_number}
                          </span>
                          <div>
                            <h4 className="text-xs md:text-sm font-black text-secondary uppercase">
                              {wItem.week_number}. Hafta Etkileşim Sıralaması
                            </h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                              Toplam Hafta Süresi: <span className="text-blue-600 font-black">{wItem.total_hours}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-gray-400 bg-white px-3 py-1 rounded-lg border border-gray-200 hidden sm:inline-block">
                            {sList.length} Öğrenci
                          </span>
                          {isAccordionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {isAccordionOpen && (
                        <div className="p-4 md:p-6 bg-white border-t border-gray-100 animate-in fade-in duration-200">
                          {sList.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 w-16">Sıra</th>
                                    <th className="pb-3">Öğrenci Adı Soyadı</th>
                                    <th className="pb-3 text-right">Bu Haftaki Süre</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {sList.map((sRow: any, sIdx: number) => (
                                    <tr key={sIdx} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="py-2.5 font-black text-gray-400">
                                        <span className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px] ${
                                          sRow.rank === 1 ? 'bg-amber-100 text-amber-700 font-black' :
                                          sRow.rank === 2 ? 'bg-gray-100 text-gray-700 font-bold' :
                                          sRow.rank === 3 ? 'bg-amber-50 text-amber-800 font-bold' : 'text-gray-400'
                                        }`}>
                                          #{sRow.rank}
                                        </span>
                                      </td>
                                      <td className="py-2.5 font-bold text-secondary uppercase">
                                        {sRow.student}
                                      </td>
                                      <td className="py-2.5 text-right font-black text-blue-600">
                                        {sRow.time}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-center py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Bu hafta için süre kaydı olan öğrenci bulunmamaktadır.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  Henüz haftalık bazda kayıtlı bir analiz verisi bulunamadı.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
