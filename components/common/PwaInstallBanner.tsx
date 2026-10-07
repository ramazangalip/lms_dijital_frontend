"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Zaten PWA kurulu/standalone moddaysa gösterme
    if (typeof window !== 'undefined') {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        return;
      }

      // 2. Bu oturumda daha önce kapatıldıysa gösterme
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
      if (isDismissed) {
        return;
      }

      // 3. iOS tespiti
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // 4. Android / Chrome PWA install prompt dinleyicisi
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Mobil cihazlarda veya PWA destekleyen ortamlarda varsayılan olarak göster
      const isMobile = /android|iphone|ipad|ipod/.test(userAgent);
      if (isMobile || isIosDevice) {
        setIsVisible(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      // Tarayıcı desteklemiyorsa veya masaüstündeyse
      alert("Uygulamayı yüklemek için tarayıcınızın adres çubuğundaki 'Yükle' simgesini tıklayabilir veya menüden 'Ana Ekrana Ekle' / 'Uygulama Olarak Yükle' seçeneğini seçebilirsiniz.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* PWA BANNER KARTI */}
      <div className="bg-[#0f1422] text-white rounded-[1.8rem] p-3.5 sm:p-4 shadow-2xl flex items-center justify-between gap-3 border border-slate-800/80">
        
        {/* SOL: LOGO VE İSİM */}
        <div className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-sm overflow-hidden">
            <Image 
              src="/icon-192x192.png" 
              alt="BÜ Dijital LMS" 
              width={40} 
              height={40}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>
          <div className="min-w-0 text-left leading-tight">
            <h4 className="text-white font-black text-sm sm:text-base tracking-tight truncate">
              BÜ Dijital LMS
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
              Hızlı erişim için uygulamayı kur
            </p>
          </div>
        </div>

        {/* SAĞ: BUTONLAR */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1.5 transition-colors cursor-pointer"
          >
            Sonra
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-[#ce1212] hover:bg-[#b00f0f] active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 transition-all cursor-pointer leading-none"
          >
            Yükle
          </button>
        </div>
      </div>

      {/* iOS Safari Rehber Bilgilendirmesi */}
      {showIosGuide && (
        <div className="mt-2 p-3 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-2xl text-left animate-in fade-in">
          <p className="font-bold text-white mb-1">📱 iOS / Safari Kurulumu:</p>
          <p className="leading-snug">
            1. Safari alt çubuğundaki <strong className="text-amber-400">Paylaş (⎙)</strong> simgesine dokunun.<br />
            2. Açılan menüde <strong className="text-amber-400">Ana Ekrana Ekle</strong> seçeneğini seçin.
          </p>
        </div>
      )}
    </div>
  );
}
