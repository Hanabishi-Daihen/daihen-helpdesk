import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CalendarRange, 
  Settings, 
  ShieldCheck, 
  LogOut,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { UISettings } from '../types';

interface NavigationProps {
  view: string;
  setView: (view: string) => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogoutClick: () => void;
  uiSettings: UISettings;
}

export const Navigation: React.FC<NavigationProps> = ({
  view,
  setView,
  isAdmin,
  onAdminClick,
  onLogoutClick,
  uiSettings,
}) => {
  const line1 = uiSettings.sidebarLabelLine1 || 'DAIHEN';
  const line2 = uiSettings.sidebarLabelLine2 || 'Helpdesk & Issues';
  const schedulesEnabled = uiSettings.modulesEnabled?.schedules ?? true;

  const navItems = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ด',
      sublabel: 'Overview & Tasks',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'form',
      label: 'แจ้งปัญหาใหม่',
      sublabel: 'Create Ticket',
      icon: PlusCircle,
      show: true,
    },
    {
      id: 'schedules',
      label: 'ตารางการผลิต',
      sublabel: 'Production Gantt',
      icon: CalendarRange,
      show: schedulesEnabled,
    },
    {
      id: 'settings',
      label: 'ตั้งค่าระบบ',
      sublabel: 'System Config',
      icon: Settings,
      show: isAdmin,
    },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#f5f0e8] border-r border-[#e6dfd8] h-screen sticky top-0 z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#e6dfd8] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181715] flex items-center justify-center text-[#faf9f5] shrink-0 shadow-sm">
            {uiSettings.logoDataUrl ? (
              <img src={uiSettings.logoDataUrl} alt="Logo" className="w-7 h-7 object-contain" />
            ) : (
              /* Anthropic radial-spike inspired glyph */
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif-claude text-base font-semibold tracking-tight text-[#141413] truncate leading-tight">
              {line1}
            </h2>
            <p className="text-[10px] text-[#6c6a64] tracking-wider uppercase font-medium truncate">
              {line2}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => item.show)
            .map(item => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all md3-state-layer ${
                    isActive
                      ? 'bg-[#efe9de] text-[#141413] shadow-2xs font-semibold'
                      : 'text-[#6c6a64] hover:bg-[#efe9de]/60 hover:text-[#141413] font-medium'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#cc785c] text-white' : 'bg-[#e6dfd8]/60 text-[#6c6a64]'
                    }`}
                  >
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs leading-tight">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-[#8e8b82] font-normal leading-tight mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c]" />
                  )}
                </button>
              );
            })}
        </nav>

        {/* Footer Admin Status Box */}
        <div className="p-3 border-t border-[#e6dfd8] bg-[#f5f0e8]">
          {isAdmin ? (
            <div className="bg-[#efe9de] p-3 rounded-xl border border-[#e6dfd8] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#181715] text-[#faf9f5] flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="text-[#cc785c]" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold text-[#141413] truncate">ผู้ดูแลระบบ</div>
                  <div className="text-[9px] text-[#5db872] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5db872] inline-block" />
                    Admin Active
                  </div>
                </div>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-1.5 rounded-lg text-[#a9583e] hover:bg-[#e6dfd8] transition-colors"
                title="ออกจากระบบ Admin"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#6c6a64] hover:text-[#141413] text-xs font-medium transition-all md3-state-layer"
            >
              <ShieldCheck size={14} className="text-[#cc785c]" />
              <span>เข้าสู่ระบบ Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (Material Design 3 Style) ──── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf9f5]/95 backdrop-blur-lg border-t border-[#e6dfd8] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-lg"
      >
        <div className="flex items-center justify-around relative max-w-md mx-auto">
          {/* Dashboard Tab */}
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all md3-state-layer ${
              view === 'dashboard' ? 'text-[#cc785c]' : 'text-[#6c6a64]'
            }`}
          >
            <div className={`px-4 py-1 rounded-full transition-all ${
              view === 'dashboard' ? 'bg-[#cc785c]/15 text-[#cc785c]' : ''
            }`}>
              <LayoutDashboard size={19} />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">แดชบอร์ด</span>
          </button>

          {/* Floating Action Button for Create Issue (Center) */}
          <div className="relative -top-5">
            <button
              onClick={() => setView('form')}
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                view === 'form'
                  ? 'bg-[#181715] text-[#faf9f5] ring-3 ring-[#cc785c]'
                  : 'bg-[#cc785c] text-white ring-3 ring-[#faf9f5]'
              }`}
              title="แจ้งปัญหาใหม่"
              aria-label="แจ้งปัญหาใหม่"
            >
              <PlusCircle size={26} />
            </button>
          </div>

          {/* Schedules Tab (or Settings if Admin) */}
          {schedulesEnabled ? (
            <button
              onClick={() => setView('schedules')}
              className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all md3-state-layer ${
                view === 'schedules' ? 'text-[#cc785c]' : 'text-[#6c6a64]'
              }`}
            >
              <div className={`px-4 py-1 rounded-full transition-all ${
                view === 'schedules' ? 'bg-[#cc785c]/15 text-[#cc785c]' : ''
              }`}>
                <CalendarRange size={19} />
              </div>
              <span className="text-[10px] font-semibold tracking-tight">ตารางงาน</span>
            </button>
          ) : (
            <button
              onClick={() => isAdmin ? setView('settings') : onAdminClick()}
              className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all md3-state-layer ${
                view === 'settings' ? 'text-[#cc785c]' : 'text-[#6c6a64]'
              }`}
            >
              <div className={`px-4 py-1 rounded-full transition-all ${
                view === 'settings' ? 'bg-[#cc785c]/15 text-[#cc785c]' : ''
              }`}>
                <SlidersHorizontal size={19} />
              </div>
              <span className="text-[10px] font-semibold tracking-tight">ตั้งค่า</span>
            </button>
          )}

          {/* Admin / Settings Tab */}
          <button
            onClick={() => {
              if (isAdmin) {
                setView('settings');
              } else {
                onAdminClick();
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all md3-state-layer ${
              view === 'settings' ? 'text-[#cc785c]' : 'text-[#6c6a64]'
            }`}
          >
            <div className={`px-4 py-1 rounded-full transition-all ${
              view === 'settings' ? 'bg-[#cc785c]/15 text-[#cc785c]' : ''
            }`}>
              {isAdmin ? <Settings size={19} /> : <ShieldCheck size={19} />}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              {isAdmin ? 'ตั้งค่า' : 'แอดมิน'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
