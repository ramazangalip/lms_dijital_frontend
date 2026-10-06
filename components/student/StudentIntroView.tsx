"use client";
import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface StudentIntroViewProps {
  title: string;
  url: string;
  description: string;
  isWatched: boolean;
}

export default function StudentIntroView({
  title,
  url,
  description,
  isWatched
}: StudentIntroViewProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-14 space-y-10 text-center leading-none">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 animate-pulse">
          <Zap size={28} />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tighter leading-none">
          {title}
        </h2>
        <div className="bg-gray-50 px-4 py-2.5 rounded-xl border flex items-center gap-3 mx-auto w-fit shadow-sm">
          <ShieldCheck size={16} className={isWatched ? "text-green-500" : "text-primary"} />
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
            {isWatched 
              ? "TANITIM TAMAMLANDI, HAFTALAR ERİŞİME AÇILDI." 
              : url 
                ? "HAFTALARIN AÇILMASI İÇİN VİDEOYU İZLEMELİSİNİZ." 
                : "SİSTEME ERİŞİM İÇİN BU BÖLÜMÜ İNCELEMENİZ YETERLİDİR."}
          </span>
        </div>
      </div>

      {url && (
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50 ring-1 ring-gray-200 bg-secondary">
          <iframe src={url} className="w-full h-full text-center" allowFullScreen title="Tanıtım Videosu"></iframe>
        </div>
      )}

      {description && (
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border-2 border-gray-50 shadow-xl text-left leading-relaxed">
          <p className="text-gray-600 text-sm md:text-base font-medium whitespace-pre-line italic">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
