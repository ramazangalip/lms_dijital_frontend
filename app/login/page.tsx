"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';
import { Eye, EyeOff, Info, X } from 'lucide-react';
import PwaInstallBanner from '@/components/common/PwaInstallBanner';

interface CustomTokenPayload {
  is_teacher: boolean;
  is_staff: boolean;
  is_student: boolean;
  full_name: string;
  email: string;
  user_id: number;
  exp?: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const infoRef = useRef<HTMLDivElement>(null);

  // Oturum kontrolü: Eğer geçerli token varsa doğrudan yönlendir
  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<CustomTokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          if (decoded.is_teacher) {
            router.replace('/teacher-dashboard');
          } else {
            router.replace('/dashboard');
          }
          return;
        } else {
          // Süresi bitmişse temizle
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('remember_me');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        }
      } catch (e) {
        console.error("Token geçersiz:", e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
      }
    }
    setCheckingAuth(false);
  }, [router]);

  // Dışarı tıklandığında bilgi penceresini kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/users/login/', { email, password });
      const { access, refresh } = res.data;

      if (rememberMe) {
        // Beni hatırla seçildiyse: 30 gün boyunca localStorage'da saklanır
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('remember_me', 'true');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
      } else {
        // Beni hatırla seçilmediyse: Tarayıcı kapatılınca sıfırlanan sessionStorage'da saklanır
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('refresh_token', refresh);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
      }

      const decoded = jwtDecode<CustomTokenPayload>(access);
      console.log("Giriş Yapan Kullanıcı:", decoded.full_name);

      if (decoded.is_teacher) {
        router.push('/teacher-dashboard');
      } else {
        router.push('/dashboard');
      }
      
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      alert(error.response?.data?.detail || "Giriş başarısız! Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4 text-left">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary text-xs font-bold tracking-wider animate-pulse uppercase">Oturum Kontrol Ediliyor...</p>
      </div>
    );
  }

  // Standart Şifre Formatı İçeriği
  const passwordInfoContent = (
    <>
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
        <Info className="w-4 h-4 flex-shrink-0 text-amber-400 stroke-[2.2]" />
        <span>Standart Şifre Formatı</span>
      </div>

      <p className="text-gray-300 text-xs mt-1.5 leading-snug">
        Sistem şifreniz aşağıdaki şablona göre oluşturulmuştur:
      </p>

      {/* Şablon Kutusu */}
      <div className="my-2 bg-[#0d131f] border border-emerald-500/40 rounded-lg py-2 px-2.5 text-center text-emerald-400 font-mono text-xs font-semibold tracking-wide">
        [İsim İlk Harf] + [Öğrenci No Son 4 Hane] + ! + [Bölüm Kodu]
      </div>

      {/* Örnek Kutusu */}
      <div className="bg-[#242b3d] border border-slate-700/80 rounded-lg p-2 text-xs text-gray-200 space-y-0.5 mb-2">
        <p>📌 <strong className="text-white">Örnek:</strong> Mustafa (No: ...1016, Matematik.)</p>
        <p>➔ <strong>Şifre:</strong> <span className="text-amber-400 font-bold tracking-wider">M1016!mt</span></p>
      </div>

      {/* Bölüm Kodları */}
      <div className="text-[11px]">
        <div className="font-bold text-white mb-1 tracking-wide">
          BÖLÜM KODLARI (KÜÇÜK HARF):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5 text-gray-300">
          <div>• Türk Dili Ve Edebiyatı: <span className="text-emerald-400 font-bold">td</span></div>
          <div>• Siyaset Bilimi ve K.Y.: <span className="text-emerald-400 font-bold">sb</span></div>
          <div>• Matematik: <span className="text-emerald-400 font-bold">mt</span></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm space-y-8 rounded-xl border border-gray-100 p-6 sm:p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="logo-text text-4xl text-primary font-bold">BİNGÖL</h2>
          <h3 className="logo-text text-2xl text-gray-800 font-bold uppercase">Üniversitesi</h3>
          <p className="mt-4 font-roboto text-gray-600 font-medium">LMS Giriş Sistemi</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="E-posta adresi" 
              required 
              value={email}
              className="w-full rounded-lg border border-gray-300 p-3 text-black bg-white focus:ring-2 focus:ring-primary outline-none"
              onChange={e => setEmail(e.target.value)} 
            />
            
            <div className="relative" ref={infoRef}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Şifre" 
                required 
                value={password}
                className="w-full rounded-lg border border-gray-300 p-3 pr-20 text-black bg-white focus:ring-2 focus:ring-primary outline-none"
                onChange={e => setPassword(e.target.value)} 
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {/* Şifre Formatı Butonu */}
                <div 
                  className="relative flex items-center"
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                >
                  <button
                    type="button"
                    onClick={() => setShowInfo(prev => !prev)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center focus:outline-none"
                    aria-label="Şifre formatı bilgisi"
                  >
                    <Info className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Şifre Göster / Gizle Butonu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center focus:outline-none"
                  aria-label={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* MASAÜSTÜ POPOVER TOOLTIP (sm ve üzeri ekranlar) */}
              {showInfo && (
                <div 
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="hidden sm:block absolute right-0 bottom-full mb-2.5 w-[340px] bg-[#181e2b] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                >
                  {passwordInfoContent}
                  {/* Oku / Beak (Doğrudan 'i' butonunun üzerine işaret eder) */}
                  <div className="absolute -bottom-1.5 right-[46px] w-3 h-3 bg-[#181e2b] rotate-45 border-r border-b border-slate-700/80"></div>
                </div>
              )}
            </div>

            {/* MOBİL MODAL OVERLAY (Ekran dışına taşmayı ve kırılmayı önler) */}
            {showInfo && (
              <div 
                className="fixed inset-0 z-50 flex sm:hidden items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
                onClick={() => setShowInfo(false)}
              >
                <div 
                  className="w-full max-w-xs bg-[#181e2b] text-white p-5 rounded-2xl shadow-2xl border border-slate-700/80 relative animate-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    type="button" 
                    onClick={() => setShowInfo(false)}
                    className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                    aria-label="Kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {passwordInfoContent}
                </div>
              </div>
            )}

            {/* Beni Hatırla Seçeneği */}
            <div className="flex items-center pt-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm text-gray-700 select-none cursor-pointer font-medium">
                Beni Hatırla
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-lg bg-primary py-3 font-bold text-white transition-all hover:opacity-90 disabled:bg-gray-400"
          >
            {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
          </button>
        </form>

        <div className="text-center text-xs sm:text-sm pt-4 leading-relaxed">
          <p className="text-gray-600">
            Yardım mı Almak İstiyorsunuz?{" "}
            <Link href="/guide" className="font-bold text-primary hover:underline inline">
              Site ve Mobil Uygulama Hakkında Yardım Almak için tıklayınız
            </Link>
          </p>
        </div>
      </div>

      {/* PWA MOBİL UYGULAMA İNDİRME BANNERI (GİRİŞ EKRANININ HEMEN ALTINDA) */}
      <PwaInstallBanner />
    </div>
  );
}