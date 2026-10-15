import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-card animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-200"></div>
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-slate-200 rounded"></div>
            <div className="w-40 h-4 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-slate-100 rounded"></div>
        <div className="w-16 h-5 bg-slate-100 rounded"></div>
        <div className="w-16 h-5 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-container"></div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="h-24 bg-slate-100 rounded-card"></div>
        <div className="h-24 bg-slate-100 rounded-card"></div>
        <div className="h-24 bg-slate-100 rounded-card"></div>
        <div className="h-24 bg-slate-100 rounded-card"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
