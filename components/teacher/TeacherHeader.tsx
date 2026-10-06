"use client";
import React from 'react';
import { 
  BookOpen, BarChart3, Clock, MessageSquare, LogOut, LayoutGrid 
} from 'lucide-react';

export type TeacherActiveTab = 'content' | 'analytics' | 'time_analytics' | 'chatbot_analytics';

interface TeacherHeaderProps {
  activeTab: TeacherActiveTab;
  onSelectTab: (tab: TeacherActiveTab) => void;
  onLogout: () => void;
}

export default function TeacherHeader({
  activeTab,
  onSelectTab,
  onLogout
}: TeacherHeaderProps) {
  return (
    <header className="bg-[#1a1a1a] px-4 py-3 md:px-6 md:py-3.5 shadow-xl sticky top-0 z-50 print:hidden text-left border-b border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        
        {/* LOGO & BAŞLIK */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="bg-[#ce1212] w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
              <LayoutGrid size={22} className="stroke-[2.5]" />
            </div>
            <div className="text-left leading-tight">
              <h1 className="text-white font-black tracking-tight text-base md:text-lg uppercase leading-tight">
                AKADEMİSYEN PANELİ
              </h1>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5 leading-none">
                AKADEMİK YÖNETİM
              </p>
            </div>
          </div>
        </div>

        {/* MENÜ BUTONLARI (TABS) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto text-left">
          <button
            type="button"
            onClick={() => onSelectTab('content')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'content'
                ? 'bg-[#ce1212] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={14} /> İÇERİK YÖNETİMİ
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#ce1212] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 size={14} /> ÖĞRENCİ ANALİZLERİ
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('time_analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'time_analytics'
                ? 'bg-[#ce1212] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={14} /> SİSTEM ZAMAN ANALİTİĞİ
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('chatbot_analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'chatbot_analytics'
                ? 'bg-[#ce1212] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={14} /> CHATBOT ANALİZİ
          </button>
        </div>

        {/* ÇIKIŞ BUTONU */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 bg-white/5 hover:bg-[#ce1212] text-gray-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto justify-center"
        >
          <LogOut size={14} /> ÇIKIŞ
        </button>
      </div>
    </header>
  );
}
