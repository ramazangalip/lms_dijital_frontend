"use client";
import React from 'react';
import { Award } from 'lucide-react';

interface StudentPointsBadgeProps {
  show: boolean;
  amount: number;
}

export default function StudentPointsBadge({ show, amount }: StudentPointsBadgeProps) {
  if (!show) return null;

  return (
    <div className="fixed top-6 right-6 z-[1000] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-green-500/10 backdrop-blur-md border border-green-500/20 text-green-700 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-500/30">
          <Award size={20} />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[10px] font-bold uppercase opacity-70">Tebrikler!</p>
          <p className="text-sm font-black">+{amount} Puan Kazandınız!</p>
        </div>
      </div>
    </div>
  );
}
