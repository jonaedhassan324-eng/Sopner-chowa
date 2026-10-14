import React from 'react';
import { Wifi, BatteryMedium, Signal, Disc3 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, enabled }) => {
  if (!enabled) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="py-6 px-2 flex justify-center items-center min-h-[calc(100vh-65px)] bg-slate-950/80">
      {/* Android Device Outer Bezel */}
      <div className="relative w-full max-w-[420px] rounded-[48px] bg-slate-900 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1),0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-slate-800">
        
        {/* Device Buttons simulation */}
        <div className="absolute -left-[5px] top-28 w-[5px] h-14 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[5px] top-48 w-[5px] h-14 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-[5px] top-32 w-[5px] h-20 bg-slate-700 rounded-r-md" />

        {/* Screen Bezel & Display Area */}
        <div className="relative bg-slate-950 rounded-[40px] overflow-hidden border border-slate-800/80 flex flex-col h-[850px] shadow-inner">
          
          {/* Android Status Bar */}
          <div className="h-10 bg-slate-950/90 text-slate-300 px-6 flex items-center justify-between text-xs select-none z-30 shrink-0 border-b border-slate-900">
            <span className="font-semibold text-xs tracking-tight text-slate-200">08:15</span>
            
            {/* Center Front Camera Hole Punch */}
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950 ring-1 ring-teal-500/30" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-mono">89%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Android Content Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* Android Navigation Gesture Bar */}
          <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 border-t border-slate-900 select-none">
            <div className="w-32 h-1 bg-slate-600 rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
