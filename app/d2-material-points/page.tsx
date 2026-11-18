"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowLeft, LogOut, Award } from 'lucide-react';
import TeacherD2MaterialPointsTab from '@/components/teacher/TeacherD2MaterialPointsTab';
import InactivityTimeoutModal from '@/components/common/InactivityTimeoutModal';

export default function D2MaterialPointsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isTeacher = localStorage.getItem('is_teacher') === 'true';
    const isStaff = localStorage.getItem('is_staff') === 'true';

    if (!token) {
      router.push('/login');
      return;
    }

    if (!isTeacher && !isStaff) {
      router.push('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-slate-400 text-sm">
        Yetki kontrol ediliyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white print:bg-white print:text-black print:min-h-0">
      {/* ÜST BAŞLIK & NAVİGASYON BARI */}
      <header className="bg-[#1a1a1a] px-4 py-3 md:px-6 md:py-3.5 shadow-xl sticky top-0 z-50 print:hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo ve Başlık */}
          <div className="flex items-center gap-3">
            <div className="bg-[#ce1212] w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
              <Award size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight text-sm md:text-base uppercase leading-tight">
                D2 MATERYAL PUAN ANALİZİ
              </h1>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5 leading-none">
                VİZE ÖNCESİ & SONRASI KARŞILAŞTIRMA
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/teacher-dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 text-xs font-bold transition-all"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Akademisyen Paneline Dön</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl border border-red-500/20 text-xs font-bold transition-all"
              title="Çıkış Yap"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>

        </div>
      </header>

      {/* İÇERİK ALANI */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
        <TeacherD2MaterialPointsTab />
      </main>

      <InactivityTimeoutModal />
    </div>
  );
}
