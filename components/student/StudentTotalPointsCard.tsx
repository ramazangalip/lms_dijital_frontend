"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Trophy, ChevronDown, Calendar, Award } from 'lucide-react';

interface StudentTotalPointsCardProps {
  points: number;
  pointsBefore?: number;
  pointsAfter?: number;
}

export default function StudentTotalPointsCard({ 
  points, 
  pointsBefore = 0, 
  pointsAfter = 0 
}: StudentTotalPointsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Kart dışına tıklandığında açılır menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={cardRef} className="relative inline-block text-left">
      {/* TIKLANABİLİR PUAN KARTI */}
      <div 
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-white border rounded-xl md:rounded-2xl py-2 px-3 md:py-2.5 md:px-3.5 shadow-sm flex items-center gap-2.5 shrink-0 transition-all cursor-pointer select-none ${
          isOpen 
            ? 'border-amber-400 ring-2 ring-amber-100 shadow-md' 
            : 'border-gray-200/80 hover:border-amber-300 hover:shadow-md'
        }`}
        title="Vize öncesi ve sonrası puan detayları için tıklayın"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
          <Trophy size={16} className="stroke-[2.2]" />
        </div>

        <div className="text-left leading-tight">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            TOPLAM PUAN
          </p>
          <div className="flex items-baseline">
            <span className="text-sm md:text-base font-black text-secondary tracking-tight">
              {points}
            </span>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 ml-1">
              Puan
            </span>
          </div>
        </div>

        {/* AÇILIR MENÜ OKU (CHEVRON) */}
        <div className="text-slate-400 ml-1 flex items-center justify-center">
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} 
          />
        </div>
      </div>

      {/* AŞAĞI DOĞRU AÇILAN PUAN DETAY POPOVERI */}
      {isOpen && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
              PUAN DAĞILIMI
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Detay
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Vizeden Önce Puan */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar size={12} className="stroke-[2.5]" />
                </div>
                <span className="font-bold text-slate-700 text-[11px]">
                  Vizeden Önce
                </span>
              </div>
              <span className="font-black text-emerald-600 text-xs">
                {pointsBefore} Puan
              </span>
            </div>

            {/* Vizeden Sonra Puan */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 border border-purple-100/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Award size={12} className="stroke-[2.5]" />
                </div>
                <span className="font-bold text-slate-700 text-[11px]">
                  Vizeden Sonra
                </span>
              </div>
              <span className="font-black text-purple-600 text-xs">
                {pointsAfter} Puan
              </span>
            </div>

            {/* Toplam Puan Satırı */}
            <div className="pt-1.5 mt-1 border-t border-gray-100 flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-slate-500 uppercase">
                Toplam
              </span>
              <span className="text-sm font-black text-amber-600">
                {points} Puan
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
