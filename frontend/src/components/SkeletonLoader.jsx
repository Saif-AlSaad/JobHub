import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#E7E5E4]"></div>
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-[#E7E5E4] rounded"></div>
            <div className="w-40 h-4 bg-[#E7E5E4] rounded"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-[#F3EFEA] border border-[#E7E5E4] rounded-full"></div>
      </div>
      <div className="w-3/4 h-3 bg-[#F3EFEA] rounded"></div>
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-[#F3EFEA] rounded-full"></div>
        <div className="w-16 h-5 bg-[#F3EFEA] rounded-full"></div>
        <div className="w-16 h-5 bg-[#F3EFEA] rounded-full"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-[#F3EFEA] rounded-[12px] border border-[#E7E5E4]"></div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="h-24 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)]"></div>
        <div className="h-24 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)]"></div>
        <div className="h-24 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)]"></div>
        <div className="h-24 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)]"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
