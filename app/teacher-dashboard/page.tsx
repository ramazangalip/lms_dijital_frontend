"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

import { 
  Material, 
  Flashcard, 
  StudentAnalytics, 
  BulkStudentData, 
  ChatbotAnalyticsResponse,
  DepartmentItem,
  DepartmentSchedule 
} from '@/components/types';

import TeacherHeader, { TeacherActiveTab } from '@/components/teacher/TeacherHeader';
import TeacherContentTab from '@/components/teacher/TeacherContentTab';
import TeacherStudentAnalyticsTab from '@/components/teacher/TeacherStudentAnalyticsTab';
import TeacherTimeAnalyticsTab from '@/components/teacher/TeacherTimeAnalyticsTab';
import TeacherChatbotAnalyticsTab from '@/components/teacher/TeacherChatbotAnalyticsTab';
import TeacherBulkReportPrint from '@/components/teacher/TeacherBulkReportPrint';
import TeacherKarneModal from '@/components/teacher/TeacherKarneModal';
import InactivityTimeoutModal from '@/components/common/InactivityTimeoutModal';

export default function TeacherDashboard() {
  // --- STATE YÖNETİMİ ---
  const [activeTab, setActiveTab] = useState<TeacherActiveTab>('content');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingKarneStudentId, setLoadingKarneStudentId] = useState<string | number | null>(null);
  const [fetchingWeek, setFetchingWeek] = useState(false);
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [bulkData, setBulkData] = useState<BulkStudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ilahiyat');  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 3;
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(''); 
  const [deactivationDate, setDeactivationDate] = useState('');
  const [departmentSchedules, setDepartmentSchedules] = useState<DepartmentSchedule[]>([]); 
  
  const [introTitle, setIntroTitle] = useState('Genel Tanıtım ve Oryantasyon');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [introDescription, setIntroDescription] = useState('');
  
  const [materials, setMaterials] = useState<Material[]>([{ content_type: 'video', embed_url: '', title: '', point_value: 1, duration_seconds: 120 }]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [systemTimeData, setSystemTimeData] = useState<any>(null);
  const [systemTimeLoading, setSystemTimeLoading] = useState<boolean>(true);

  // Chatbot Analitiği State'leri
  const [chatbotData, setChatbotData] = useState<ChatbotAnalyticsResponse | null>(null);
  const [chatbotLoading, setChatbotLoading] = useState<boolean>(false);
  const [chatbotPdfLoading, setChatbotPdfLoading] = useState<boolean>(false);

  // --- DİNAMİK BÖLÜMLERİ ÇEKME ---
  useEffect(() => {
    api.get('/contents/departments/')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDepartments(res.data);
          // Eğer mevcut seçili bölüm listede yoksa ilk bölümü seç
          if (!res.data.some((d: DepartmentItem) => d.key === selectedDepartment)) {
            setSelectedDepartment(res.data[0].key);
          }
        }
      })
      .catch(err => {
        console.error("Bölümler yüklenirken hata:", err);
      });
  }, []);

  // --- CHATBOT VERİLERİNİ ÇEKME ---
  useEffect(() => {
    if (activeTab !== 'chatbot_analytics') return;

    setChatbotLoading(true);
    let url = '/contents/chatbot-analytics/';
    if (selectedDepartment) {
      url += `?department=${selectedDepartment}`;
    }

    api.get(url)
      .then(res => {
        setChatbotData(res.data);
        setChatbotLoading(false);
      })
      .catch(err => {
        console.error("Chatbot analitiği yüklenirken hata:", err);
        setChatbotLoading(false);
      });
  }, [selectedDepartment, activeTab]);

  // --- ZAMAN ANALİTİĞİ VERİLERİNİ ÇEKME ---
  useEffect(() => {
    if (activeTab !== 'time_analytics') return;

    setSystemTimeLoading(true);
    let url = '/contents/system-time-analytics/';
    if (selectedDepartment && selectedDepartment !== 'all') {
      url += `?department=${selectedDepartment}`;
    }

    api.get(url)
      .then(res => {
        if (!res.data || Object.keys(res.data).length === 0 || !res.data.raw_student_list) {
          setSystemTimeData({
            max_engagement: { student: "Veri Yok", time: "0 Saat" },
            min_engagement: { student: "Veri Yok", time: "0 Saat" },
            activity_distribution: [
              { type: "Video İzleme", hours: 0 },
              { type: "Ders Notu Okuma (PDF)", hours: 0 },
              { type: "Bilgi Testi (Quiz)", hours: 0 },
              { type: "Podcast Dinleme", hours: 0 },
              { type: "Ödev Çözme", hours: 0 }
            ],
            raw_student_list: []
          });
        } else {
          setSystemTimeData(res.data);
        }
        setSystemTimeLoading(false);
      })
      .catch(err => {
        console.error("Zaman analitiği yüklenirken hata:", err);
        setSystemTimeLoading(false);
      });
  }, [selectedDepartment, activeTab]);

// ISO DateTime formatını <input type="datetime-local"> formatına (YYYY-MM-DDTHH:mm) dönüştürür
const formatToDatetimeLocal = (isoString?: string | null): string => {
  if (!isoString) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(isoString)) {
    return isoString;
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

// <input type="datetime-local"> değerini ISO string'e dönüştürür
const formatToISO = (val?: string | null): string | null => {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
};

  // --- HAFTA DETAYI ÇEKME ---
  const fetchWeekDetail = useCallback(async (week: number) => {
    setFetchingWeek(true);
    try {
      const res = await api.get(`/contents/list/?week_number=${week}`);
      const data = res.data;
      setIntroDescription(data.intro_description || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      
      setReleaseDate(formatToDatetimeLocal(data.release_date));
      setDeactivationDate(formatToDatetimeLocal(data.deactivation_date));

      if (data.department_schedules && data.department_schedules.length > 0) {
        setDepartmentSchedules(data.department_schedules.map((s: any) => ({
          department: s.department,
          department_name: s.department_name,
          release_date: formatToDatetimeLocal(s.release_date),
          deactivation_date: formatToDatetimeLocal(s.deactivation_date)
        })));
      } else {
        setDepartmentSchedules(departments.map(d => ({
          department: d.key,
          department_name: d.name,
          release_date: '',
          deactivation_date: ''
        })));
      }
      
      if (data.intro_video_url !== undefined) {
        setIntroVideoUrl(data.intro_video_url || '');
        setIntroTitle(data.intro_title || 'Genel Tanıtım ve Oryantasyon');
      }
      
      if (data.materials && data.materials.length > 0) {
        setMaterials(data.materials.map((m: Material) => ({
          ...m,
          duration_seconds: m.duration_seconds ?? 120
        })));
      } else {
        setMaterials([{ content_type: 'video', embed_url: '', title: '', point_value: 1, duration_seconds: 120 }]);
      }
      
      setFlashcards(data.flashcards || []);
      
    } catch (err) {
      setTitle('');
      setDescription('');
      setReleaseDate('');
      setDeactivationDate('');
      setDepartmentSchedules(departments.map(d => ({
        department: d.key,
        department_name: d.name,
        release_date: '',
        deactivation_date: ''
      })));
      setMaterials([{ content_type: 'video', embed_url: '', title: '', point_value: 1, duration_seconds: 120 }]);
      setFlashcards([]);
    } finally {
      setFetchingWeek(false);
    }
  }, [departments]);

  useEffect(() => {
    if (activeTab === 'content') {
      fetchWeekDetail(weekNumber);
    }
  }, [weekNumber, activeTab, fetchWeekDetail]);

  // --- ANALİZ VERİLERİNİ ÇEKME ---
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/contents/analytics/';
      if (selectedDepartment) {
        url += `?department=${selectedDepartment}`;
      }
      const res = await api.get(url);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analiz verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  // --- FİLTRELEME ---
  const filteredAnalytics = useMemo(() => {
    if (!analytics || analytics.length === 0) return [];
    return analytics.filter(s => !selectedDepartment || selectedDepartment === 'all' || s.department === selectedDepartment);
  }, [analytics, selectedDepartment]);

  const filteredBulkData = useMemo(() => {
    if (!bulkData || bulkData.length === 0) return [];
    return bulkData.filter(s => !selectedDepartment || selectedDepartment === 'all' || s.department === selectedDepartment);
  }, [bulkData, selectedDepartment]);

  // --- MATERYAL YÖNETİMİ ---
  const addMaterialRow = () => {
    setMaterials([...materials, { content_type: 'video', embed_url: '', title: '', point_value: 1, duration_seconds: 120 }]);
  };

  const removeMaterialRow = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    const updated = [...materials];
    if (field === 'content_type' && value === 'form') {
      updated[index] = {
        ...updated[index],
        content_type: 'form',
        point_value: updated[index].point_value || 1,
        quiz: {
          title: updated[index].title || `${weekNumber}. Hafta Sınavı`,
          description: '',
          questions: [
            {
              question_text: '',
              options: [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false }
              ]
            }
          ]
        }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setMaterials(updated);
  };

  const addQuestion = (materialIndex: number) => {
    const updated = [...materials];
    const quiz = updated[materialIndex].quiz;
    if (quiz) {
      quiz.questions.push({
        question_text: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      });
      setMaterials(updated);
    }
  };

  const updateQuestionText = (mIndex: number, qIndex: number, text: string) => {
    const updated = [...materials];
    if (updated[mIndex].quiz) {
      updated[mIndex].quiz!.questions[qIndex].question_text = text;
      setMaterials(updated);
    }
  };

  const setCorrectOption = (mIndex: number, qIndex: number, oIndex: number) => {
    const updated = [...materials];
    if (updated[mIndex].quiz) {
      updated[mIndex].quiz!.questions[qIndex].options.forEach((opt, idx) => {
        opt.is_correct = idx === oIndex;
      });
      setMaterials(updated);
    }
  };

  const updateOption = (mIndex: number, qIndex: number, oIndex: number, text: string) => {
    const updated = [...materials];
    if (updated[mIndex].quiz) {
      updated[mIndex].quiz!.questions[qIndex].options[oIndex].option_text = text;
      setMaterials(updated);
    }
  };

  const updateFlashcard = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...flashcards];
    updated[index] = { ...updated[index], [field]: value };
    setFlashcards(updated);
  };

  const handleUpdateDepartmentSchedule = (deptKey: string, field: 'release_date' | 'deactivation_date', val: string) => {
    setDepartmentSchedules(prev => {
      const existingIndex = prev.findIndex(s => s.department === deptKey);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          [field]: val || null
        };
        return copy;
      } else {
        const deptObj = departments.find(d => d.key === deptKey);
        return [
          ...prev,
          {
            department: deptKey,
            department_name: deptObj?.name || deptKey,
            release_date: field === 'release_date' ? (val || null) : null,
            deactivation_date: field === 'deactivation_date' ? (val || null) : null,
          }
        ];
      }
    });
  };

  const handleApplyDatesToAllDepartments = (sourceRelDate?: string, sourceDeactDate?: string) => {
    const rel = sourceRelDate !== undefined ? sourceRelDate : releaseDate;
    const deact = sourceDeactDate !== undefined ? sourceDeactDate : deactivationDate;
    if (!rel && !deact) {
      alert("Lütfen önce 'Erişim Tarihi (Aktif)' veya 'Kapanış Tarihi (Pasif)' alanlarından en az birini doldurunuz.");
      return;
    }
    setDepartmentSchedules(prev => {
      const baseList = departments.length > 0 ? departments : prev.map(p => ({ key: p.department, name: p.department_name || p.department }));
      return baseList.map(d => ({
        department: d.key,
        department_name: d.name,
        release_date: rel || null,
        deactivation_date: deact || null
      }));
    });
    alert("Seçilen tarihler tüm bölümlere başarıyla uygulandı.");
  };

  // --- FORMU KAYDETME ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      week_number: Number(weekNumber),
      title,
      description,
      release_date: formatToISO(releaseDate),
      deactivation_date: formatToISO(deactivationDate),
      department_schedules: departmentSchedules.map(s => ({
        department: s.department,
        release_date: formatToISO(s.release_date),
        deactivation_date: formatToISO(s.deactivation_date)
      })),
      materials: materials.map(m => {
        const matPayload: any = {
          content_type: m.content_type,
          title: m.title,
          embed_url: m.embed_url || "https://example.com",
          point_value: Number(m.point_value) !== undefined && !isNaN(Number(m.point_value)) ? Number(m.point_value) : 1,
          duration_seconds: (m.content_type === 'video' || m.content_type === 'podcast')
            ? (m.duration_seconds !== undefined && !isNaN(Number(m.duration_seconds)) ? Number(m.duration_seconds) : 120)
            : null
        };
        if (m.id) {
          matPayload.id = m.id;
        }
        if (m.content_type === 'form' && m.quiz) {
          matPayload.quiz = m.quiz;
        }
        return matPayload;
      }),
      flashcards: flashcards.filter(f => f.question && f.answer).map((f, idx) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        order: f.order ?? idx
      }))
    };

    if (Number(weekNumber) === 1) {
      payload.intro_title = introTitle;
      payload.intro_video_url = introVideoUrl;
      payload.intro_description = introDescription;
    }

    try {
      await api.post('/contents/list/', payload);
      alert(`${weekNumber}. Hafta Başarıyla Kaydedildi!`);
      fetchWeekDetail(weekNumber);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      alert(`Hata: ${error.response?.data?.detail || "Kayıt sırasında bir hata oluştu."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // --- AKADEMİK PDF RAPORU ALMA ---
  const exportBulkPDF = async () => {
    if (!selectedDepartment || selectedDepartment === 'all') {
      alert("Lütfen önce bir bölüm seçiniz.");
      return;
    }

    setPdfLoading(true);
    setBulkData([]);
    try {
      const res = await api.get(`/contents/bulk-academic-report/?department=${selectedDepartment}`);
      setBulkData(res.data);
    } catch (err) {
      alert("Rapor verileri çekilirken hata oluştu.");
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (bulkData.length > 0 && pdfLoading) {
      const timer = setTimeout(() => {
        window.print();
        setPdfLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [bulkData, pdfLoading]);

  // --- CHATBOT PDF RAPORU OLUŞTURMA ---
  const exportChatbotReportPDF = async () => {
    if (!chatbotData) return;
    setChatbotPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      const fixTR = (str: string) => !str ? "" : str
        .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
        .replace(/İ/g, "I").replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C").replace(/Ö/g, "O").replace(/Ü/g, "U");

      const deptName = selectedDepartment || 'Tüm Bölümler';
      
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(206, 18, 18);
      doc.rect(0, 0, 297, 24, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(fixTR(`${deptName.toUpperCase()} - CHATBOT SORU VE YANIT ANALIZ RAPORU`), 15, 11);
      
      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.text(fixTR(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}  |  Toplam Soru: ${chatbotData.total_questions}  |  Aktif Kullanici: ${chatbotData.active_users_count} / ${chatbotData.total_users_count}`), 15, 18);

      const pdfRows: any[] = [];
      let rowNum = 1;

      chatbotData.students.forEach(student => {
        if (student.questions && student.questions.length > 0) {
          student.questions.forEach(q => {
            pdfRows.push([
              rowNum++,
              fixTR(`${student.first_name} ${student.last_name}`.toUpperCase()),
              fixTR(`${q.week_number}. Hafta`),
              fixTR(q.created_at || "-"),
              fixTR(q.question_text || ""),
              fixTR(q.response_text || "Henuz yanit kaydedilmemis.")
            ]);
          });
        }
      });

      if (pdfRows.length === 0) {
        pdfRows.push(["-", "-", "-", "-", fixTR("Bu bolume ait henuz chatbot soru etkilesimi bulunmamaktadir."), "-"]);
      }

      autoTable(doc, {
        startY: 30,
        head: [[
          fixTR('Sıra'),
          fixTR('Öğrenci Adı Soyadı'),
          fixTR('Hafta'),
          fixTR('Tarih / Saat'),
          fixTR('Öğrencinin Sorusu'),
          fixTR('Chatbot Yanıtı')
        ]],
        body: pdfRows,
        styles: { 
          font: 'Helvetica', 
          fontSize: 8, 
          cellPadding: 3, 
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [26, 26, 26], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold', 
          halign: 'center' 
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 42 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 32, halign: 'center' },
          4: { cellWidth: 85 },
          5: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { top: 30, left: 12, right: 12, bottom: 15 }
      });

      doc.save(`Chatbot_Raporu_${fixTR(deptName).replace(/\s+/g, '_')}_${new Date().toLocaleDateString('tr-TR')}.pdf`);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("PDF raporu oluşturulurken bir hata meydana geldi.");
    } finally {
      setChatbotPdfLoading(false);
    }
  };

  const handleOpenKarne = async (studentId: number | string) => {
    setLoadingKarneStudentId(studentId);
    try {
      const res = await api.get(`/contents/analytics/?student_id=${studentId}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert("Karne verileri yüklenemedi.");
    } finally {
      setLoadingKarneStudentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12 text-left">
      {/* 1. GİZLİ PDF YAZDIRMA TABLOSU */}
      <TeacherBulkReportPrint
        filteredBulkData={filteredBulkData}
        selectedDepartment={selectedDepartment}
      />

      {/* 2. HEADER MENÜ */}
      <TeacherHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 3. ANA İÇERİK SEKMELERİ */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-8 print:hidden text-left">
        {activeTab === 'content' && (
          <TeacherContentTab
            weekNumber={weekNumber}
            onWeekNumberChange={setWeekNumber}
            title={title}
            onTitleChange={setTitle}
            releaseDate={releaseDate}
            onReleaseDateChange={setReleaseDate}
            deactivationDate={deactivationDate}
            onDeactivationDateChange={setDeactivationDate}
            departments={departments}
            departmentSchedules={departmentSchedules}
            onUpdateDepartmentSchedule={handleUpdateDepartmentSchedule}
            onApplyToAllDepartments={handleApplyDatesToAllDepartments}
            introTitle={introTitle}
            onIntroTitleChange={setIntroTitle}
            introVideoUrl={introVideoUrl}
            onIntroVideoUrlChange={setIntroVideoUrl}
            introDescription={introDescription}
            onIntroDescriptionChange={setIntroDescription}
            materials={materials}
            onAddMaterialRow={addMaterialRow}
            onUpdateMaterial={updateMaterial}
            onRemoveMaterialRow={removeMaterialRow}
            onAddQuestion={addQuestion}
            onUpdateQuestionText={updateQuestionText}
            onSetCorrectOption={setCorrectOption}
            onUpdateOption={updateOption}
            flashcards={flashcards}
            onSetFlashcards={setFlashcards}
            onUpdateFlashcard={updateFlashcard}
            description={description}
            onDescriptionChange={setDescription}
            onSubmit={handleSubmit}
            loading={loading}
            fetchingWeek={fetchingWeek}
          />
        )}

        {activeTab === 'analytics' && (
          <TeacherStudentAnalyticsTab
            filteredAnalytics={filteredAnalytics}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            onExportBulkPDF={exportBulkPDF}
            pdfLoading={pdfLoading}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            loadingKarneStudentId={loadingKarneStudentId}
            onOpenKarne={handleOpenKarne}
          />
        )}

        {activeTab === 'time_analytics' && (
          <TeacherTimeAnalyticsTab
            systemTimeData={systemTimeData}
            departments={departments}
            timeDept={selectedDepartment}
            onTimeDeptChange={setSelectedDepartment}
            systemTimeLoading={systemTimeLoading}
          />
        )}

        {activeTab === 'chatbot_analytics' && (
          <TeacherChatbotAnalyticsTab
            chatbotData={chatbotData}
            departments={departments}
            chatbotDept={selectedDepartment}
            onChatbotDeptChange={setSelectedDepartment}
            chatbotLoading={chatbotLoading}
            onExportChatbotPDF={exportChatbotReportPDF}
            pdfLoading={chatbotPdfLoading}
          />
        )}
      </main>

      {/* 4. HAFTALIK PERFORMANS KARNESİ MODALI */}
      <TeacherKarneModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* 5. HAREKETSİZLİK ZAMAN AŞIMI MODALI (15 DK İŞLEMSİZLİK & 10 SN GERİ SAYIM) */}
      <InactivityTimeoutModal />
    </div>
  );
}