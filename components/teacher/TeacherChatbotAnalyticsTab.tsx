"use client";
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Filter, Printer, Bot, ChevronDown, ChevronUp, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { ChatbotAnalyticsResponse, getDeptName, DepartmentItem, DEPARTMENT_MAP } from '@/components/types';

interface TeacherChatbotAnalyticsTabProps {
  chatbotData: ChatbotAnalyticsResponse | null;
  departments?: DepartmentItem[];
  chatbotDept: string;
  onChatbotDeptChange: (dept: string) => void;
  chatbotLoading: boolean;
  onExportChatbotPDF: () => void;
  pdfLoading: boolean;
}

export default function TeacherChatbotAnalyticsTab({
  chatbotData,
  departments,
  chatbotDept,
  onChatbotDeptChange,
  chatbotLoading,
  onExportChatbotPDF,
  pdfLoading
}: TeacherChatbotAnalyticsTabProps) {
  const [openChatbotAccordion, setOpenChatbotAccordion] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 3;

  const studentsList = chatbotData?.students || [];
  const totalPages = Math.ceil(studentsList.length / pageSize) || 1;
  const paginatedStudents = studentsList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bölüm değiştiğinde sayfayı 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
    setOpenChatbotAccordion(null);
  }, [chatbotDept]);

  return (
    <div className="animate-in slide-in-from-bottom-3 duration-300 space-y-6 text-left leading-normal">
      {/* ÜST İSTATİSTİK VE FİLTRE KARTI */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="flex flex-wrap items-center gap-6 leading-none text-left">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50/80 p-3 rounded-2xl text-blue-600 flex items-center justify-center leading-none text-left border border-blue-100/60 shadow-xs">
              <MessageSquare size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                TOPLAM AI SORUSU
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {chatbotData?.total_questions || 0}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="bg-green-50/80 p-3 rounded-2xl text-green-600 flex items-center justify-center leading-none text-left border border-green-100/60 shadow-xs">
              <Users size={22} className="stroke-[2.2]" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">
                AKTİF / TOPLAM ÖĞRENCİ
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {chatbotData?.active_users_count || 0} <span className="text-xs font-bold text-slate-400">/ {chatbotData?.total_users_count || 0}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-left">
          {/* BÖLÜM SEÇİCİ */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select 
              value={chatbotDept} 
              onChange={(e) => onChatbotDeptChange(e.target.value)}
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

          {/* CHATBOT PDF RAPORU AL BUTONU */}
          <button 
            type="button"
            onClick={onExportChatbotPDF} 
            disabled={pdfLoading || chatbotLoading}
            className="flex items-center gap-2 bg-[#ce1212] hover:bg-[#b51010] active:scale-95 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-60"
          >
            <Printer size={15} /> 
            {pdfLoading ? "HAZIRLANIYOR..." : `${(chatbotDept === 'all' ? 'TÜM BÖLÜMLER' : getDeptName(chatbotDept)).toUpperCase()} CHATBOT RAPORU AL`}
          </button>
        </div>
      </div>

      {/* ÖĞRENCİ BAZLI SORU & CEVAP DÖKÜMÜ */}
      {chatbotLoading ? (
        <div className="bg-white p-20 rounded-3xl text-center space-y-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-[#ce1212] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chatbot Etkileşimleri Alınıyor...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-4 text-left">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-xs md:text-sm tracking-tight">
                ÖĞRENCİ BAZLI CHATBOT ETKİLEŞİM DÖKÜMÜ (SAYFA {currentPage})
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                Öğrencinin chatbota sorduğu soruları ve chatbotun verdiği cevapları hafta bazında inceleyin
              </p>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 bg-gray-100 px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {studentsList.length} Öğrenci
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {paginatedStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                Bu bölüme ait chatbot sorusu bulunamadı.
              </div>
            ) : (
              paginatedStudents.map((st) => {
                const isOpen = openChatbotAccordion === st.id;
                const initials = `${st.first_name?.[0] || ''}${st.last_name?.[0] || ''}`.toUpperCase();

                return (
                  <div key={st.id} className="border border-gray-200/90 rounded-2xl overflow-hidden transition-all text-left shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setOpenChatbotAccordion(isOpen ? null : st.id)}
                      className="w-full p-4 bg-gray-50/80 hover:bg-gray-100/90 flex items-center justify-between transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 uppercase">
                          {initials}
                        </div>
                        <div className="text-left leading-tight">
                          <p className="font-black text-slate-900 uppercase text-xs md:text-sm tracking-tight">
                            {st.first_name} {st.last_name}
                          </p>
                          <span className="text-[9px] md:text-[10px] font-black text-[#ce1212] uppercase tracking-wider mt-0.5 block">
                            {getDeptName(st.department)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border shadow-2xs ${
                          st.question_count > 0 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-gray-100 text-slate-400 border-gray-200'
                        }`}>
                          {st.question_count} Soru
                        </span>
                        {isOpen ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 md:p-6 bg-white border-t border-gray-100 space-y-4 animate-in fade-in duration-200 text-left">
                        {st.questions.length === 0 ? (
                          <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Bu öğrenci henüz yapay zekaya herhangi bir soru sormadı.
                          </p>
                        ) : (
                          <div className="space-y-3.5">
                            {st.questions.map((q) => (
                              <div key={q.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3 text-left shadow-2xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#ce1212] text-white text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                                      {q.week_number}. Hafta
                                    </span>
                                    {q.week_title && (
                                      <span className="text-xs font-black text-slate-900 uppercase">
                                        {q.week_title}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    {q.created_at}
                                  </span>
                                </div>

                                <div className="space-y-2 text-left">
                                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-left shadow-2xs">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-blue-600 mb-1">Öğrencinin Sorusu:</p>
                                    <p className="font-semibold text-slate-800 italic">&ldquo;{q.question_text}&rdquo;</p>
                                  </div>

                                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-left shadow-2xs">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                                      <Bot size={13} className="text-blue-600" /> Chatbot Yanıtı:
                                    </p>
                                    <p className="font-medium text-slate-700 whitespace-pre-line leading-relaxed">{q.response_text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* SAYFALAMA ALTI (PAGINATION) */}
          {studentsList.length > 0 && (
            <div className="p-4 md:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TOPLAM {studentsList.length} ÖĞRENCİDEN {paginatedStudents.length} TANESİ GÖSTERİLİYOR
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
      )}
    </div>
  );
}
