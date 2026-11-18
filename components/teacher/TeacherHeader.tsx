"use client";
import React from 'react';
import { 
  BookOpen, BarChart3, Clock, MessageSquare, LogOut, LayoutGrid, HelpCircle, Award
} from 'lucide-react';

export type TeacherActiveTab = 'content' | 'analytics' | 'time_analytics' | 'chatbot_analytics' | 'pretest_analytics' | 'd2_points';

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
  const navItems: { key: TeacherActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'content', label: 'İÇERİK YÖNETİMİ', icon: <BookOpen size={14} className="shrink-0" /> },
    { key: 'analytics', label: 'ÖĞRENCİ ANALİZLERİ', icon: <BarChart3 size={14} className="shrink-0" /> },
    { key: 'time_analytics', label: 'ZAMAN ANALİTİĞİ', icon: <Clock size={14} className="shrink-0" /> },
    { key: 'chatbot_analytics', label: 'CHATBOT ANALİZİ', icon: <MessageSquare size={14} className="shrink-0" /> },
    { key: 'pretest_analytics', label: 'PEKİŞTİRME TESTİ', icon: <HelpCircle size={14} className="shrink-0" /> },
    { key: 'd2_points', label: 'D2 MATERYAL PUANLARI', icon: <Award size={14} className="shrink-0" /> },
  ];

  return (
    <header className="bg-[#161616] px-3 py-2.5 md:px-6 md:py-3 shadow-2xl sticky top-0 z-50 print:hidden text-left border-b border-white/5 backdrop-blur-md bg-opacity-95">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2 lg:gap-4">
        
        {/* LOGO & BAŞLIK */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-[#ce1212] w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
            <LayoutGrid size={20} className="stroke-[2.5]" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <h1 className="text-white font-black tracking-tight text-sm md:text-base uppercase leading-tight whitespace-nowrap">
              AKADEMİSYEN PANELİ
            </h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">
              AKADEMİK YÖNETİM
            </p>
          </div>
        </div>

        {/* MENÜ BUTONLARI (TABS) - TEK SATIRDA KUSURSUZ YERLEŞİM */}
        <nav 
          className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/5 overflow-x-auto max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] xl:text-[11px] font-black uppercase tracking-tight transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#ce1212] text-white shadow-lg shadow-red-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ÇIKIŞ BUTONU */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-[#ce1212] text-gray-300 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0"
          title="Oturumu Kapat"
        >
          <LogOut size={14} className="shrink-0" />
          <span className="hidden md:inline">ÇIKIŞ</span>
        </button>

      </div>
    </header>
  );
}
