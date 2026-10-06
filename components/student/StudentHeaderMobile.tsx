"use client";
import React from 'react';
import { Menu } from 'lucide-react';

interface StudentHeaderMobileProps {
  onOpenSidebar: () => void;
}

export default function StudentHeaderMobile({ onOpenSidebar }: StudentHeaderMobileProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-secondary flex items-center justify-between px-6 z-[60] shadow-md">
      <h2 className="text-white font-black uppercase text-xs tracking-widest text-primary">BÜ-LMS</h2>
      <button 
        type="button"
        onClick={onOpenSidebar} 
        className="text-white p-1.5 bg-gray-800 rounded-lg"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}
