"use client";
import React from 'react';
import { Trophy } from 'lucide-react';

interface StudentTotalPointsCardProps {
  points: number;
}

export default function StudentTotalPointsCard({ points }: StudentTotalPointsCardProps) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl md:rounded-2xl py-2 px-3 md:py-2.5 md:px-3.5 shadow-sm flex items-center gap-2.5 shrink-0 transition-all hover:shadow-md text-left">
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
    </div>
  );
}
