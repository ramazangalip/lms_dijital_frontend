"use client";
import React from 'react';
import { 
  Video, Headphones, Download, Sparkles, ListChecks, Lock, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Material } from '@/components/types';

interface StudentMaterialListProps {
  materials: Material[];
  activeMaterial: Material | null;
  completedMaterials: string[];
  isQuizLocked: boolean;
  isTemporarilyUnlocked?: boolean;
  onSelectMaterial: (material: Material) => void;
}

export default function StudentMaterialList({
  materials,
  activeMaterial,
  completedMaterials,
  isQuizLocked,
  isTemporarilyUnlocked = false,
  onSelectMaterial
}: StudentMaterialListProps) {
  const getSortedMaterials = (mats: Material[]) => {
    const orderMap = { pdf: 1, video: 2, podcast: 3, form: 4, assignment: 5 };
    return [...mats].sort((a, b) => (orderMap[a.content_type] || 6) - (orderMap[b.content_type] || 6));
  };

  const sortedMaterials = getSortedMaterials(materials);

  return (
    <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-3 text-left">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">
        Eğitim Materyalleri
      </p>
      <div className="flex flex-col gap-2.5">
        {sortedMaterials.map((mat) => {
          let MatIcon = mat.content_type === 'video' ? Video : 
                        mat.content_type === 'podcast' ? Headphones : 
                        mat.content_type === 'pdf' ? Download : 
                        mat.content_type === 'assignment' ? Sparkles : ListChecks;
          
          const isForm = mat.content_type === 'form';
          const isRemediationQuizLocked = isForm && isTemporarilyUnlocked;
          const isLocked = (isForm && isQuizLocked) || isRemediationQuizLocked;
          const isDone = completedMaterials.includes(String(mat.id));
          const isActive = activeMaterial?.id === mat.id;

          // Telafi modunda form kesinlikle çözülemez ve disabled'dır
          const isDisabled = isRemediationQuizLocked || (isLocked && !isDone);

          return (
            <button 
              key={mat.id} 
              type="button"
              onClick={() => onSelectMaterial(mat)} 
              disabled={isDisabled}
              className={`flex items-center gap-4 p-4 rounded-2xl text-[11px] font-black transition-all border-2 text-left group relative overflow-hidden ${
                isActive 
                  ? 'bg-secondary border-secondary text-white shadow-2xl scale-[1.02] z-10' 
                  : isRemediationQuizLocked
                    ? 'bg-amber-50/50 border-amber-200/50 text-amber-900/40 cursor-not-allowed opacity-75'
                    : isLocked 
                      ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : isRemediationQuizLocked 
                    ? 'bg-amber-100/60 text-amber-600'
                    : 'bg-gray-100 text-gray-400 group-hover:text-primary'
              }`}>
                 {isRemediationQuizLocked ? (
                   <Lock size={18} className="text-amber-600" />
                 ) : isDone ? (
                   <CheckCircle2 size={18} className="text-green-500" />
                 ) : isLocked ? (
                   <Lock size={18} />
                 ) : (
                   <MatIcon size={18} />
                 )}
              </div>
              
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                 <span className="uppercase tracking-tight truncate leading-tight">{mat.title}</span>
                 <span className={`text-[8px] font-bold uppercase tracking-widest ${
                   isActive 
                     ? 'text-white/50' 
                     : isRemediationQuizLocked 
                       ? 'text-amber-700 font-extrabold'
                       : 'text-gray-400'
                 }`}>
                   {isRemediationQuizLocked ? "Telafide Kilitli" : mat.content_type}
                 </span>
              </div>

              {isActive && (
                <div className="ml-auto animate-in slide-in-from-left-2">
                  <ChevronRight size={16} className="text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
