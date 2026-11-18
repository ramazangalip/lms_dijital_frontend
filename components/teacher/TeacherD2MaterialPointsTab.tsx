"use client";
import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { 
  D2MaterialPointsResponse, 
  D2DepartmentPointsData, 
  D2StudentPointData 
} from '@/components/types';
import { 
  Users, 
  Award, 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Video, 
  Headphones, 
  CheckCircle2, 
  Printer, 
  Layers, 
  RefreshCw 
} from 'lucide-react';

export default function TeacherD2MaterialPointsTab() {
  const [data, setData] = useState<D2MaterialPointsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedStudentIds, setExpandedStudentIds] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<D2MaterialPointsResponse>('/contents/d2-material-points/');
      setData(res.data);
      // İlk bölümü varsayılan olarak seç
      if (res.data?.departments && res.data.departments.length > 0) {
        setSelectedDeptKey(res.data.departments[0].department_key);
      }
    } catch (err: any) {
      console.error("D2 Materyal Puanları yüklenirken hata:", err);
      setError(err?.response?.data?.error || "Veriler yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (studentId: number) => {
    setExpandedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!currentDepartment) return;
    const allIds = new Set<number>();
    currentDepartment.students.forEach(s => allIds.add(s.id));
    setExpandedStudentIds(allIds);
  };

  const collapseAll = () => {
    setExpandedStudentIds(new Set());
  };

  // Şu an seçili olan bölüm
  const currentDepartment = useMemo(() => {
    if (!data?.departments) return null;
    return data.departments.find(d => d.department_key === selectedDeptKey) || data.departments[0] || null;
  }, [data, selectedDeptKey]);

  // Arama filtresine göre öğrencileri filtrele
  const filteredStudents = useMemo(() => {
    if (!currentDepartment) return [];
    if (!searchQuery.trim()) return currentDepartment.students;

    const query = searchQuery.toLowerCase().trim();
    return currentDepartment.students.filter(s => 
      s.full_name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  }, [currentDepartment, searchQuery]);

  // Seçili bölümün özet istatistikleri
  const deptSummary = useMemo(() => {
    if (!filteredStudents) return { count: 0, before: 0, after: 0, total: 0 };
    const count = filteredStudents.length;
    const before = filteredStudents.reduce((acc, s) => acc + s.points_before, 0);
    const after = filteredStudents.reduce((acc, s) => acc + s.points_after, 0);
    return {
      count,
      before,
      after,
      total: before + after
    };
  }, [filteredStudents]);

  const handlePrint = () => {
    window.print();
  };

  const renderContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={13} className="text-red-400 shrink-0" />;
      case 'podcast':
        return <Headphones size={13} className="text-purple-400 shrink-0" />;
      case 'pdf':
        return <FileText size={13} className="text-amber-400 shrink-0" />;
      default:
        return <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw size={36} className="text-red-500 animate-spin" />
        <p className="text-slate-300 font-bold text-sm tracking-wide">
          D2 kategorisindeki öğrencilerin vize öncesi ve sonrası puan verileri hesaplanıyor...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-950/40 border border-red-500/30 rounded-2xl text-center max-w-xl mx-auto my-12">
        <p className="text-red-400 font-bold mb-4">{error || "Veriler alınamadı."}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none print:pb-0">
      
      {/* GLOBAL PRINT STILLERI */}
      <style jsx global>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
        }
      `}</style>

      {/* ================= PRINT-ONLY RAPOR BAŞLIĞI ================= */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-800 pb-4 text-left">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-black tracking-tight uppercase">
              BİNGÖL ÜNİVERSİTESİ - LMS DİJİTAL SINIF
            </h1>
            <h2 className="text-base font-bold text-slate-800 mt-1">
              D2 KATEGORİSİ MATERYAL PUAN RAPORU (VİZE ÖNCESİ & SONRASI)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Bölüm: <strong className="text-black">{currentDepartment?.department_name}</strong> | Sınav Referansı: <strong>06.11.2026 (Vize)</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-1 font-semibold text-slate-700">Kategori: D2 (Yapay Zeka Destekli)</p>
          </div>
        </div>

        {/* Print Özet Şeridi */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-300 text-xs">
          <div className="p-2 bg-slate-100 rounded border border-slate-300">
            <span className="text-slate-600 font-semibold block text-[10px]">Öğrenci Sayısı:</span>
            <strong className="text-sm text-black">{deptSummary.count} Öğrenci</strong>
          </div>
          <div className="p-2 bg-slate-100 rounded border border-slate-300">
            <span className="text-slate-600 font-semibold block text-[10px]">Vizeden Önce Puan:</span>
            <strong className="text-sm text-emerald-800">{deptSummary.before} Puan</strong>
          </div>
          <div className="p-2 bg-slate-100 rounded border border-slate-300">
            <span className="text-slate-600 font-semibold block text-[10px]">Vizeden Sonra Puan:</span>
            <strong className="text-sm text-purple-800">{deptSummary.after} Puan</strong>
          </div>
          <div className="p-2 bg-slate-100 rounded border border-slate-300">
            <span className="text-slate-600 font-semibold block text-[10px]">Toplam Puan:</span>
            <strong className="text-sm text-red-800">{deptSummary.total} Puan</strong>
          </div>
        </div>
      </div>

      {/* ================= EKRAN İÇİN BAŞLIK VE BİLGİ BANNERI ================= */}
      <div className="bg-gradient-to-r from-[#1e1e1e] via-[#241717] to-[#1e1e1e] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-black tracking-wider uppercase mb-2">
              <Calendar size={13} /> D2 KATEGORİSİ MATERYAL PUANLARI
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              VİZE ÖNCESİ VE SONRASI MATERYAL PUAN RAPORU
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-3xl">
              Öğrencilerin materyalleri tamamlama tarihlerine göre <strong className="text-white">Vizeden Önce</strong> ve <strong className="text-white">Vizeden Sonra</strong> kazandıkları 
              puanlar bölüm bölüm ayrılarak aşağıda listelenmiştir.
            </p>
          </div>

          {/* PDF YAZDIR BUTONU */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-700/30 text-xs font-black uppercase tracking-wider transition-all"
              title="Raporu PDF olarak yazdır veya kaydet"
            >
              <Printer size={15} />
              <span>PDF Olarak Yazdır / Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= EKRAN İÇİN METRİK KARTLARI ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 print:hidden">
        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
              {currentDepartment?.department_name} Öğrenci
            </p>
            <p className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
              {deptSummary.count}
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Vizeden Önce Puan</p>
            <p className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
              {deptSummary.before}
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Vizeden Sonra Puan</p>
            <p className="text-xl md:text-2xl font-black text-purple-400 tracking-tight mt-0.5">
              {deptSummary.after}
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#ce1212]/10 border border-[#ce1212]/30 text-red-400 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Bölüm Toplam Puanı</p>
            <p className="text-xl md:text-2xl font-black text-red-500 tracking-tight mt-0.5">
              {deptSummary.total}
            </p>
          </div>
        </div>
      </div>

      {/* ================= BÖLÜM SEÇİMİ VE ARAMA ================= */}
      <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        {/* SADECE BÖLÜMLER LİSTELENİYOR */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {data.departments.map(dept => {
            const isSelected = dept.department_key === selectedDeptKey;
            return (
              <button
                key={dept.department_key}
                onClick={() => {
                  setSelectedDeptKey(dept.department_key);
                  setSearchQuery('');
                  setExpandedStudentIds(new Set());
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  isSelected
                    ? 'bg-[#ce1212] text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {dept.department_name} ({dept.student_count})
              </button>
            );
          })}
        </div>

        {/* Arama Çubuğu & Detay Aç/Kapat */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci veya e-posta ara..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            onClick={expandedStudentIds.size > 0 ? collapseAll : expandAll}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-white/5"
            title="Tüm detayları aç veya kapat"
          >
            {expandedStudentIds.size > 0 ? "Tümünü Daralt" : "Tümünü Genişlet"}
          </button>
        </div>
      </div>

      {/* ================= SEÇİLİ BÖLÜMÜN TABLOSU ================= */}
      {currentDepartment && (
        <div className="bg-[#1c1c1c] rounded-3xl border border-white/5 shadow-xl overflow-hidden print:bg-white print:border print:border-slate-300 print:shadow-none print:rounded-none">
          
          {/* Bölüm Başlığı & Bölüm İstatistik Şeridi */}
          <div className="bg-[#222222] px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-slate-50 print:border-b print:border-slate-300 print:px-4 print:py-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-red-600 rounded-full print:bg-slate-800 print:w-2 print:h-6"></div>
              <div>
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight print:text-black print:text-sm">
                  {currentDepartment.department_name}
                </h3>
                <p className="text-slate-400 text-[11px] font-semibold print:text-slate-600">
                  Kategori: D2 | Toplam {filteredStudents.length} Öğrenci
                </p>
              </div>
            </div>

            {/* Bölüm Toplamları Rozeti */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 print:bg-slate-100 print:text-emerald-900 print:border-slate-300">
                Vizeden Önce: <strong className="text-white print:text-black ml-1">{deptSummary.before}</strong> Puan
              </span>
              <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 print:bg-slate-100 print:text-purple-900 print:border-slate-300">
                Vizeden Sonra: <strong className="text-white print:text-black ml-1">{deptSummary.after}</strong> Puan
              </span>
              <span className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/30 print:bg-slate-200 print:text-black print:border-slate-400">
                Bölüm Toplamı: <strong className="text-white print:text-black ml-1">{deptSummary.total}</strong> Puan
              </span>
            </div>
          </div>

          {/* Öğrenci Tablosu */}
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs border-collapse print:text-[11px]">
              <thead>
                <tr className="bg-black/30 text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider font-bold print:bg-slate-100 print:text-slate-700 print:border-b-2 print:border-slate-400">
                  <th className="py-3 px-4 w-12 text-center print:border-r print:border-slate-300 print:py-2">#</th>
                  <th className="py-3 px-4 print:border-r print:border-slate-300 print:py-2">Öğrenci Adı Soyadı</th>
                  <th className="py-3 px-4 print:border-r print:border-slate-300 print:py-2">E-Posta / No</th>
                  <th className="py-3 px-4 text-center print:border-r print:border-slate-300 print:py-2">
                    <span className="inline-block px-2 py-0.5 bg-emerald-950/60 text-emerald-400 rounded border border-emerald-500/30 print:bg-transparent print:border-0 print:text-emerald-800 print:font-bold">
                      Vizeden Önce Puan
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center print:border-r print:border-slate-300 print:py-2">
                    <span className="inline-block px-2 py-0.5 bg-purple-950/60 text-purple-400 rounded border border-purple-500/30 print:bg-transparent print:border-0 print:text-purple-800 print:font-bold">
                      Vizeden Sonra Puan
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center print:py-2">
                    <span className="inline-block px-2 py-0.5 bg-red-950/60 text-red-400 rounded border border-red-500/30 print:bg-transparent print:border-0 print:text-black print:font-black">
                      Toplam Puan
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center w-24 print:hidden">Materyal Detayı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-y print:divide-slate-300">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Bu bölüme ait öğrenci bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const isExpanded = expandedStudentIds.has(student.id);

                    return (
                      <React.Fragment key={student.id}>
                        <tr 
                          className={`hover:bg-white/[0.02] transition-colors print:text-black print:hover:bg-transparent ${
                            isExpanded ? 'bg-white/[0.03]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px] print:text-slate-600 print:border-r print:border-slate-200 print:py-2">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white print:text-black print:border-r print:border-slate-200 print:py-2">
                            {student.full_name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] print:text-slate-700 print:border-r print:border-slate-200 print:py-2">
                            {student.email}
                          </td>
                          
                          {/* Vizeden Önce Puan */}
                          <td className="py-3.5 px-4 text-center print:border-r print:border-slate-200 print:py-2">
                            <div className="inline-flex flex-col items-center">
                              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-xs print:bg-transparent print:border-0 print:text-emerald-800 print:p-0 print:text-xs">
                                {student.points_before} Puan
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 print:text-slate-500">
                                ({student.materials_before_count} materyal)
                              </span>
                            </div>
                          </td>

                          {/* Vizeden Sonra Puan */}
                          <td className="py-3.5 px-4 text-center print:border-r print:border-slate-200 print:py-2">
                            <div className="inline-flex flex-col items-center">
                              <span className={`px-3 py-1 rounded-lg font-black text-xs print:bg-transparent print:border-0 print:p-0 print:text-xs ${
                                student.points_after > 0 
                                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 print:text-purple-800'
                                  : 'bg-white/5 border border-white/5 text-slate-400 print:text-slate-500'
                              }`}>
                                {student.points_after} Puan
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 print:text-slate-500">
                                ({student.materials_after_count} materyal)
                              </span>
                            </div>
                          </td>

                          {/* Toplam Puan */}
                          <td className="py-3.5 px-4 text-center print:py-2">
                            <span className="px-3 py-1 rounded-lg bg-red-600 text-white font-black text-xs shadow-md shadow-red-700/30 print:bg-slate-200 print:border print:border-slate-400 print:text-black print:shadow-none">
                              {student.total_points} Puan
                            </span>
                          </td>

                          {/* Detay Aç/Kapa Butonu (Print'te Gizli) */}
                          <td className="py-3.5 px-4 text-center print:hidden">
                            <button
                              onClick={() => toggleExpand(student.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all inline-flex items-center gap-1 text-[11px] font-semibold"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Kapat</span>
                                  <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  <span>İncele</span>
                                  <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* DETAY SATIRI (ACCORDION - SADECE EKRANDA AÇIKSA GÖSTERİLİR) */}
                        {isExpanded && (
                          <tr className="bg-black/40 print:hidden">
                            <td colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* VİZEDEN ÖNCE TAMAMLANAN MATERYALLER */}
                                <div className="bg-[#181818] rounded-2xl p-4 border border-emerald-500/20">
                                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                                    <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                                      <CheckCircle2 size={14} /> Vizeden Önce Tamamlananlar ({student.materials_before_count})
                                    </h4>
                                    <span className="text-xs font-black text-emerald-400">
                                      {student.points_before} Puan
                                    </span>
                                  </div>
                                  {student.materials_before.length === 0 ? (
                                    <p className="text-slate-500 text-[11px]">Vizeden önce tamamlanmış materyal kaydı yok.</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                      {student.materials_before.map((m, mIdx) => (
                                        <div 
                                          key={mIdx}
                                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] text-[11px]"
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            {renderContentTypeIcon(m.content_type)}
                                            <span className="text-slate-300 truncate" title={m.title}>
                                              {m.week_number ? `${m.week_number}. Hafta - ` : ''}{m.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                              {new Date(m.completed_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">
                                              +{m.points}p
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* VİZEDEN SONRA TAMAMLANAN MATERYALLER */}
                                <div className="bg-[#181818] rounded-2xl p-4 border border-purple-500/20">
                                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                                    <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase">
                                      <Award size={14} /> Vizeden Sonra Tamamlananlar ({student.materials_after_count})
                                    </h4>
                                    <span className="text-xs font-black text-purple-400">
                                      {student.points_after} Puan
                                    </span>
                                  </div>
                                  {student.materials_after.length === 0 ? (
                                    <p className="text-slate-500 text-[11px]">Vizeden sonra tamamlanmış materyal kaydı yok.</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                      {student.materials_after.map((m, mIdx) => (
                                        <div 
                                          key={mIdx}
                                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] text-[11px]"
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            {renderContentTypeIcon(m.content_type)}
                                            <span className="text-slate-300 truncate" title={m.title}>
                                              {m.week_number ? `${m.week_number}. Hafta - ` : ''}{m.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                              {new Date(m.completed_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-black text-[10px]">
                                              +{m.points}p
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
