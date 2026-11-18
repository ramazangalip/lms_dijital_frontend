"use client";
import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function StudentDevelopmentButton() {
  return (
    <Link
      href="/student-development"
      className="bg-white border border-gray-200/80 rounded-xl md:rounded-2xl p-2 md:p-2.5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer group"
      title="Bireysel Gelişim Panelini Görüntüle"
    >
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
        <User size={18} className="stroke-[2.2]" />
      </div>
    </Link>
  );
}
