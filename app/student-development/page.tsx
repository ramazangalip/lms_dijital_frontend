"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  StudentDevelopmentResponse, 
  BadgeItem 
} from '@/components/types';
import { 
  ArrowLeft, 
  LayoutGrid, 
  User, 
  GraduationCap, 
  Activity, 
  Target, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Check, 
  Lock, 
  X, 
  Compass, 
  Zap, 
  Trophy, 
  Star, 
  Flame, 
  Shield, 
  RefreshCw 
} from 'lucide-react';
import InactivityTimeoutModal from '@/components/common/InactivityTimeoutModal';

export default function StudentDevelopmentPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentDevelopmentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const fetchDevelopmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<StudentDevelopmentResponse>('/contents/student-development/');
      setData(res.data);
    } catch (err: any) {
      console.error("Gelişim paneli verileri yüklenirken hata:", err);
      setError(err?.response?.data?.error || "Gelişim verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDevelopmentData();
  }, [router]);

  // Dinamik Lucide İkon Eşleme
  const renderBadgeIcon = (iconName: string, isEarned: boolean, size = 22) => {
    const iconClass = isEarned ? "text-red-500 stroke-[2.2]" : "text-gray-400 stroke-[2.2]";
    switch (iconName?.toLowerCase()) {
      case 'compass':
        return <Compass size={size} className={iconClass} />;
      case 'zap':
        return <Zap size={size} className={iconClass} />;
      case 'trophy':
        return <Trophy size={size} className={iconClass} />;
      case 'star':
        return <Star size={size} className={iconClass} />;
      case 'flame':
        return <Flame size={size} className={iconClass} />;
      case 'shield':
        return <Shield size={size} className={iconClass} />;
      default:
        return <Award size={size} className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={32} className="text-red-600 animate-spin" />
        <p className="text-slate-600 font-bold text-xs tracking-wide">
          Bireysel gelişim verileriniz yükleniyor...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-red-200 rounded-2xl p-6 max-w-sm w-full shadow-lg">
          <p className="text-red-500 font-bold text-xs mb-3">{error || "Veriler alınırken bir sorun oluştu."}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Ders Paneline Dön
            </button>
            <button
              onClick={fetchDevelopmentData}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 selection:bg-red-500 selection:text-white text-left">
      
      {/* ================= ÜST NAVİGASYON ŞERİDİ ================= */}
      <header className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        {/* DERS PANELİNE DÖN BUTONU */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} className="stroke-[2.5]" />
          <span>DERS PANELİNE DÖN</span>
        </button>

        {/* BAŞLIK & LOGO */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ce1212] w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shadow-red-600/30 shrink-0">
            <LayoutGrid size={17} className="stroke-[2.5]" />
          </div>
          <div className="text-left leading-tight">
            <h1 className="text-slate-900 font-black tracking-tight text-xs md:text-sm uppercase leading-tight">
              BİREYSEL GELİŞİM PANELİ
            </h1>
            <p className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none">
              DÖNEMLİK İLERLEME & KİŞİSEL BAŞARI ANALİZİ
            </p>
          </div>
        </div>
      </header>

      {/* ================= ANA İÇERİK ALANI (KOMPAKT & ORANTILI) ================= */}
      <main className="max-w-5xl mx-auto px-4 space-y-4">
        
        {/* ================= 1. HERO KARTI (ÖĞRENCİ BİLGİLERİ & 3 METRİK) ================= */}
        <div className="bg-[#0f0f0f] border-b-[3px] border-red-600 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          
          {/* Sol Kısım: Öğrenci Profil Bilgisi */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-[#ce1212] w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
              <User size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase leading-tight">
                {data.student_info.full_name}
              </h2>
              <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0c1527] border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-wide">
                <GraduationCap size={12} className="shrink-0" />
                <span>{data.student_info.department_display}</span>
              </div>
            </div>
          </div>

          {/* Sağ Kısım: 3 Adet Metrik Kutusu */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            
            {/* Metrik 1: Genel İlerleme */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 px-3 min-w-[85px] md:min-w-[105px] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-red-500">
                <Activity size={11} className="stroke-[2.5]" />
                <span className="text-[8px] font-black uppercase tracking-wider">
                  GENEL İLERLEME
                </span>
              </div>
              <p className="text-base md:text-xl font-black text-white mt-0.5">
                %{data.summary_metrics.overall_progress}
              </p>
            </div>

            {/* Metrik 2: Son Başarı */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 px-3 min-w-[85px] md:min-w-[105px] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                <Target size={11} className="stroke-[2.5]" />
                <span className="text-[8px] font-black uppercase tracking-wider">
                  SON BAŞARI
                </span>
              </div>
              <p className="text-base md:text-xl font-black text-white mt-0.5">
                %{data.summary_metrics.latest_score}
              </p>
            </div>

            {/* Metrik 3: Ustalık Rozetleri */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 px-3 min-w-[85px] md:min-w-[105px] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                <Award size={11} className="stroke-[2.5]" />
                <span className="text-[8px] font-black uppercase tracking-wider">
                  USTALIK ROZETLERİ
                </span>
              </div>
              <p className="text-base md:text-xl font-black text-white mt-0.5">
                {data.summary_metrics.badges_earned_count}
                <span className="text-slate-500 text-sm font-bold ml-1">
                  / {data.summary_metrics.total_badges_count}
                </span>
              </p>
            </div>

          </div>
        </div>

        {/* ================= 2. ORTA BÖLÜM: YAN YANA İKİ KART ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          
          {/* SOL KART: HAFTALIK BİREYSEL GELİŞİM */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Başlık Şeridi */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-black text-white w-6 h-6 rounded-lg flex items-center justify-center">
                    <TrendingUp size={13} />
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">
                    HAFTALIK BİREYSEL GELİŞİM
                  </h3>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  KİŞİSEL ANALİZ
                </span>
              </div>

              {/* Hafta Listesi */}
              <div className="space-y-2.5">
                {data.weekly_progress_list.map((week) => (
                  <div key={week.week_id} className="flex items-center gap-2.5">
                    {/* Siyah Yuvarlak Numara */}
                    <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {week.week_number}
                    </div>

                    {/* Hafta Başlığı */}
                    <div className="w-36 sm:w-48 shrink-0 truncate text-[11px] font-bold text-slate-800" title={week.title}>
                      {week.title}
                    </div>

                    {/* İlerleme Çubuğu */}
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          week.progress_percentage === 100 
                            ? 'bg-emerald-500' 
                            : week.progress_percentage >= 50 
                              ? 'bg-amber-500' 
                              : week.progress_percentage > 0 
                                ? 'bg-red-500' 
                                : 'bg-transparent'
                        }`}
                        style={{ width: `${week.progress_percentage}%` }}
                      />
                    </div>

                    {/* Yüzdelik Değer */}
                    <div className="w-9 text-right text-[11px] font-black text-slate-800 shrink-0">
                      %{week.progress_percentage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt Bilgilendirme: Bireysel Geri Bildirim */}
            <div className="bg-gradient-to-r from-red-600 via-red-950 to-black rounded-xl p-3 text-white mt-4 shadow flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
                <Sparkles size={13} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-300">
                  BİREYSEL GERİ BİLDİRİM
                </p>
                <p className="text-[11px] font-bold leading-snug text-slate-100 mt-0.5">
                  {data.feedback_message}
                </p>
              </div>
            </div>

          </div>

          {/* SAĞ KART: KAZANIM USTALIK DÜZEYLERİ */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              {/* Başlık Şeridi */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-lg flex items-center justify-center">
                    <ShieldCheck size={13} />
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">
                    KAZANIM USTALIK DÜZEYLERİ
                  </h3>
                </div>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HAFTALIK KONULAR
                </span>
              </div>

              {/* Ustalık Seviyesi Listesi */}
              <div className="space-y-3">
                {data.weekly_mastery_list.map((item) => (
                  <div key={item.week_id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-[11px] font-bold text-slate-800" title={item.title}>
                        <span className="text-slate-900">{item.week_number}. Hafta:</span> {item.title}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Durum Rozeti */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          item.status_type === 'mastered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status_type === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {item.status}
                        </span>

                        {/* Yüzde */}
                        <span className="text-[11px] font-black text-slate-900 w-8 text-right">
                          %{item.mastery_percentage}
                        </span>
                      </div>
                    </div>

                    {/* İnce İlerleme Çizgisi */}
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.mastery_percentage === 100 
                            ? 'bg-emerald-500' 
                            : item.mastery_percentage > 0 
                              ? 'bg-blue-500' 
                              : 'bg-transparent'
                        }`}
                        style={{ width: `${item.mastery_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt Bilgilendirme Kutusu */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mt-4 flex items-start gap-2.5">
              <BookOpen size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-slate-600 leading-snug">
                Kazanım ustalık düzeylerin, materyal okumaları ve haftalık bilgi testlerinden elde ettiğin başarı puanlarına göre dinamik olarak güncellenir.
              </p>
            </div>

          </div>

        </div>

        {/* ================= 3. ALT BÖLÜM: BAŞARI ROZETLERİM ================= */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm space-y-4">
          
          {/* Rozetler Başlık Şeridi */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shadow-red-600/30">
                <Award size={15} />
              </div>
              <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">
                BAŞARI ROZETLERİM
              </h3>
            </div>
            
            <span className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
              {data.summary_metrics.badges_earned_count} / {data.summary_metrics.total_badges_count} KAZANILDI
            </span>
          </div>

          {/* Rozet Kartları Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {data.badges.map((badge) => {
              const isEarned = badge.is_earned;

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`relative rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center text-center select-none ${
                    isEarned
                      ? 'bg-white border-2 border-red-500 shadow-sm hover:shadow-md'
                      : 'bg-white/60 border border-gray-200 opacity-70 hover:opacity-100 hover:shadow-sm'
                  }`}
                >
                  {/* Kazanıldıysa Sağ Üst Köşedeki Kırmızı Tik Rozeti */}
                  {isEarned && (
                    <div className="absolute top-2.5 right-2.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  )}

                  {/* Rozet İkon Kutusu */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 shadow-inner transition-transform group-hover:scale-105 ${
                    isEarned ? 'bg-red-50 border border-red-100' : 'bg-gray-100 border border-gray-200'
                  }`}>
                    {renderBadgeIcon(badge.icon_name, isEarned, 22)}
                  </div>

                  {/* Rozet Adı */}
                  <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${
                    isEarned ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {badge.name}
                  </h4>

                  {/* Rozet Açıklaması */}
                  <p className={`text-[10px] line-clamp-2 leading-relaxed mb-3 ${
                    isEarned ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {badge.description}
                  </p>

                  {/* Durum Butonu */}
                  <div className="mt-auto">
                    {isEarned ? (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-sm">
                        <Check size={10} className="stroke-[3]" />
                        <span>KAZANILDI</span>
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full text-[9px] font-black inline-flex items-center gap-1">
                        <Lock size={9} />
                        <span>KİLİTLİ (DETAY İÇİN TIKLA)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </main>

      {/* ================= 4. ROZET DETAY MODALI (POPOVER) ================= */}
      {selectedBadge && (
        <div 
          onClick={() => setSelectedBadge(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-150 text-center text-left"
          >
            {/* Kapatma Butonu */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Büyük İkon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner ${
              selectedBadge.is_earned 
                ? 'bg-red-50 border border-red-100' 
                : 'bg-gray-100 border border-gray-200'
            }`}>
              {renderBadgeIcon(selectedBadge.icon_name, selectedBadge.is_earned, 30)}
            </div>

            {/* Rozet Başlığı */}
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight text-center">
              {selectedBadge.name}
            </h3>

            {/* Rozet Durum Hapı */}
            <div className="flex justify-center mt-1 mb-4">
              {selectedBadge.is_earned ? (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1">
                  <Check size={11} className="stroke-[3]" />
                  <span>KAZANILDI {selectedBadge.earned_at ? `(${selectedBadge.earned_at})` : ''}</span>
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 border border-gray-200 px-3 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1">
                  <Lock size={11} />
                  <span>HENÜZ KAZANILMADI</span>
                </span>
              )}
            </div>

            {/* Kutu 1: Rozet Açıklaması */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left mb-2.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                ROZET AÇIKLAMASI
              </span>
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            {/* Kutu 2: Kazanma Şartı */}
            <div className="bg-red-50/40 border border-red-100 rounded-xl p-3 text-left mb-4">
              <span className="text-[8px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                <Target size={11} />
                <span>KAZANMA ŞARTI</span>
              </span>
              <p className="text-[11px] font-bold text-slate-800 leading-relaxed">
                {selectedBadge.requirement_text}
              </p>
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full bg-black hover:bg-slate-900 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow"
            >
              KAPAT
            </button>
          </div>
        </div>
      )}

      {/* Hareketsizlik Zaman Aşımı Modalı */}
      <InactivityTimeoutModal />

    </div>
  );
}
