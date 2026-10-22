import React from 'react';
import { Home, Layers, Video, Mic, BarChart2, Stethoscope } from 'lucide-react';

export type TabType = 'home' | 'exercises' | 'videos' | 'recording' | 'progress' | 'therapist';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: TabType; labelAr: string; icon: React.ReactNode }[] = [
    { id: 'home', labelAr: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'exercises', labelAr: 'التمارين', icon: <Layers className="w-5 h-5" /> },
    { id: 'videos', labelAr: 'الفيديوهات', icon: <Video className="w-5 h-5" /> },
    { id: 'recording', labelAr: 'التسجيل', icon: <Mic className="w-5 h-5" /> },
    { id: 'progress', labelAr: 'التقدم', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'therapist', labelAr: 'المعالج', icon: <Stethoscope className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-teal-100/90 shadow-2xl py-2 px-3">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-2xl transition-all duration-200 min-w-[50px] cursor-pointer ${
                isActive
                  ? 'text-[#0B4F71] font-black'
                  : 'text-slate-400 hover:text-teal-700 font-bold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-tr from-teal-100/90 via-cyan-50 to-teal-50 text-[#0B4F71] shadow-xs border border-teal-200/70 scale-110'
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon}
              </div>
              <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive ? 'font-black text-[#0B4F71]' : 'font-medium'}`}>
                {tab.labelAr}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
