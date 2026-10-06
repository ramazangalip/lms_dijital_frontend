"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface InactivityTimeoutModalProps {
  /** Hareketsizlik süresi (Varsayılan: 15 dakika = 900,000 ms) */
  idleTimeoutMs?: number;
  /** Modal açıldıktan sonraki geri sayım süresi (Varsayılan: 10 saniye) */
  countdownSeconds?: number;
  /** Manuel çıkış fonksiyonu (opsiyonel) */
  onLogout?: () => void;
}

export default function InactivityTimeoutModal({
  idleTimeoutMs = 15 * 60 * 1000, // 15 dakika
  countdownSeconds = 10,           // 10 saniye
  onLogout
}: InactivityTimeoutModalProps) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const lastActivityRef = useRef<number>(Date.now());
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Çıkış yapma ve oturumu sıfırlama işlemi
  const handleLogoutAction = useCallback(() => {
    if (onLogout) {
      onLogout();
      return;
    }
    // Oturum anahtarlarını temizle ve login sayfasına yönlendir
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }, [onLogout]);

  // Kullanıcı "EVET, AKTİFİM" butonuna bastığında
  const handleStayActive = () => {
    setIsWarningOpen(false);
    setSecondsLeft(countdownSeconds);
    lastActivityRef.current = Date.now();

    // Geri sayım sayacını durdur
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Kullanıcı etkileşimi algılandığında (modal açık değilse süreyi tazele)
  const handleUserActivity = useCallback(() => {
    if (!isWarningOpen) {
      lastActivityRef.current = Date.now();
    }
  }, [isWarningOpen]);

  // 1. Kullanıcı hareketlerini dinle
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Performans için throttled activity listener
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleUserActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000); // Saniyede en fazla bir kez tetikle
      }
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, throttledHandler, { passive: true });
    });

    // Periyodik olarak 15 dk hareketsizlik kontrolü (her 3 saniyede bir kontrol et)
    idleCheckIntervalRef.current = setInterval(() => {
      if (!isWarningOpen) {
        const now = Date.now();
        if (now - lastActivityRef.current >= idleTimeoutMs) {
          setIsWarningOpen(true);
          setSecondsLeft(countdownSeconds);
        }
      }
    }, 3000);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, throttledHandler);
      });
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [handleUserActivity, idleTimeoutMs, countdownSeconds, isWarningOpen]);

  // 2. Modal açıldığında 10 saniyelik geri sayımı başlat
  useEffect(() => {
    if (isWarningOpen) {
      setSecondsLeft(countdownSeconds);

      countdownIntervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Süre bitti!
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            handleLogoutAction();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isWarningOpen, countdownSeconds, handleLogoutAction]);

  if (!isWarningOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / countdownSeconds) * 100));

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-title"
        className="relative bg-white rounded-[2.2rem] md:rounded-[2.8rem] w-full max-w-sm sm:max-w-md p-6 sm:p-8 shadow-2xl overflow-hidden text-center space-y-5 border border-amber-100/80 animate-in zoom-in-95 duration-200"
      >
        {/* ÜST TURUNCU / KIRMIZI GEÇİŞLİ ŞERİT */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600" />

        {/* İKON ALANI */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#fef6e0] border border-amber-200/80 flex items-center justify-center mx-auto text-[#d97706] shadow-xs shrink-0">
          <Clock size={32} className="stroke-[2.2] text-[#d97706]" />
        </div>

        {/* BAŞLIK & AÇIKLAMA */}
        <div className="space-y-1.5 text-center">
          <h3 
            id="inactivity-title"
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Hala Aktif misiniz?
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            10 saniye içerisinde bu bilgi kutusuna cevap vermezseniz oturumunuz otomatik olarak kapatılacaktır.
          </p>
        </div>

        {/* SÜRE VE PROGRESS ALANI */}
        <div className="bg-[#fffdf5] border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[#b45309]">
            <AlertTriangle size={15} className="stroke-[2.5]" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
              KAPANMAYA KALAN SÜRE
            </span>
          </div>

          <div className="flex items-baseline justify-center gap-1 py-0.5">
            <span className="text-3xl sm:text-4xl font-black text-[#dc2626] tracking-tight leading-none">
              {secondsLeft}
            </span>
            <span className="text-xs font-bold text-slate-500">sn</span>
          </div>

          {/* Dinamik İlerleme Çubuğu */}
          <div className="h-2 w-full bg-amber-100/90 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#e51818] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ONAY BUTONU */}
        <button
          type="button"
          onClick={handleStayActive}
          className="w-full bg-[#ce1212] hover:bg-[#b51010] active:scale-[0.98] text-white py-3.5 sm:py-4 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <CheckCircle size={18} className="stroke-[2.5]" />
          <span>EVET, AKTİFİM</span>
        </button>
      </div>
    </div>
  );
}
