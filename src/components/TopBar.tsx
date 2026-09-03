import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Shield, 
  LogOut, 
  Sparkles,
  MessageSquare,
  AlertCircle,
  Cloud
} from 'lucide-react';
import { Issue, UISettings } from '../types';

interface TopBarProps {
  view: string;
  setView: (view: string) => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogoutClick: () => void;
  onOpenCommandPalette: () => void;
  onOpenGasDeploy?: () => void;
  uiSettings: UISettings;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  view,
  setView,
  isAdmin,
  onAdminClick,
  onLogoutClick,
  onOpenCommandPalette,
  onOpenGasDeploy,
  uiSettings,
  issues,
  onSelectIssue,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Compute unread messages or new issues for notification bell
  const notifications = React.useMemo(() => {
    const list: { id: string; title: string; subtitle: string; type: 'new' | 'chat'; issue: Issue }[] = [];
    
    issues.forEach(issue => {
      // New issues alert for admin
      if (isAdmin && issue.status === 'New') {
        list.push({
          id: `new-${issue.id}`,
          title: `งานใหม่ #${issue.id}`,
          subtitle: issue.project,
          type: 'new',
          issue,
        });
      }
      
      // Unread chat messages
      const unreadChats = (issue.chat || []).filter(msg => {
        if (isAdmin) {
          return msg.sender !== 'Admin' && msg.sender !== 'System' && !msg.read;
        } else {
          return (msg.sender === 'Admin' || msg.sender === 'System') && !msg.read;
        }
      });

      if (unreadChats.length > 0) {
        list.push({
          id: `chat-${issue.id}`,
          title: `มี ${unreadChats.length} ข้อความใหม่ #${issue.id}`,
          subtitle: issue.project,
          type: 'chat',
          issue,
        });
      }
    });

    return list;
  }, [issues, isAdmin]);

  // Click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = () => {
    switch (view) {
      case 'dashboard':
        return 'แดชบอร์ดติดตามงาน';
      case 'form':
        return 'แจ้งปัญหาใหม่';
      case 'schedules':
        return 'ตารางการผลิต (Schedules)';
      case 'settings':
        return 'การตั้งค่าระบบ';
      case 'detail':
        return 'รายละเอียดรายการ';
      default:
        return 'แดชบอร์ด';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e6dfd8] px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Brand or View Indicator */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2.5 text-left md:hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#181715] flex items-center justify-center text-[#faf9f5] shadow-xs">
              {uiSettings.logoDataUrl ? (
                <img src={uiSettings.logoDataUrl} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
                  <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-serif-claude text-base font-semibold leading-tight text-[#141413]">
                {uiSettings.sidebarLabelLine1 || 'DAIHEN'}
              </div>
              <div className="text-[10px] text-[#6c6a64] tracking-wide uppercase font-medium">
                {isAdmin ? 'Admin Mode' : 'Helpdesk'}
              </div>
            </div>
          </button>

          {/* Desktop Breadcrumb / Title */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8b82]">
              {uiSettings.sidebarLabelLine1 || 'DAIHEN'}
            </span>
            <span className="text-[#8e8b82] text-xs">/</span>
            <h1 className="font-serif-claude text-lg text-[#141413] font-medium tracking-tight">
              {getViewTitle()}
            </h1>
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#181715] text-[#faf9f5]">
                <Shield size={10} className="text-[#cc785c]" />
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Search Button (Command Palette trigger) */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#f5f0e8] hover:bg-[#efe9de] text-[#6c6a64] hover:text-[#141413] text-xs font-medium transition-all shadow-2xs md3-state-layer"
            title="ค้นหาหรือเปิดคำสั่งด่วน (Ctrl+K)"
          >
            <Search size={14} className="text-[#6c6a64]" />
            <span className="hidden sm:inline">ค้นหา...</span>
            <kbd className="hidden sm:inline-block font-mono-code text-[10px] px-1.5 py-0.5 rounded bg-[#e6dfd8] text-[#3d3d3a]">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg border border-[#e6dfd8] bg-[#f5f0e8] hover:bg-[#efe9de] text-[#3d3d3a] transition-all md3-state-layer"
              title="การแจ้งเตือน"
              aria-label="การแจ้งเตือน"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c64545] text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-pulse shadow-xs">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-xl z-50 overflow-hidden fade-scale-in">
                <div className="px-4 py-3 bg-[#f5f0e8] border-b border-[#e6dfd8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#cc785c]" />
                    <span className="text-xs font-bold text-[#141413]">การแจ้งเตือน</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#6c6a64]">
                    {notifications.length} รายการ
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#e6dfd8]/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8e8b82]">
                      ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                    </div>
                  ) : (
                    notifications.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectIssue(item.issue);
                          setNotifOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#f5f0e8] transition-colors flex items-start gap-2.5"
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          item.type === 'new' ? 'bg-[#fcebeb] text-[#c64545]' : 'bg-[#eef2f9] text-[#1e4a8c]'
                        }`}>
                          {item.type === 'new' ? <AlertCircle size={13} /> : <MessageSquare size={13} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#141413] truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#6c6a64] truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* New Issue Primary Action (Desktop) */}
          {view !== 'form' && (
            <button
              onClick={() => setView('form')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#cc785c] hover:bg-[#b8674d] active:bg-[#a9583e] text-white text-xs font-semibold rounded-lg shadow-xs transition-all md3-state-layer"
            >
              <Plus size={14} />
              <span>แจ้งปัญหา</span>
            </button>
          )}

          {/* GAS Deploy Guide Action */}
          {onOpenGasDeploy && (
            <button
              onClick={onOpenGasDeploy}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#cc785c]/30 bg-[#cc785c]/10 hover:bg-[#cc785c]/20 text-[#cc785c] text-xs font-semibold transition-all shadow-2xs md3-state-layer"
              title="เปิดศูนย์นำ Code ไปติดตั้งบน Google Apps Script"
            >
              <Cloud size={14} />
              <span className="hidden sm:inline">ติดตั้ง GAS</span>
            </button>
          )}

          {/* Admin Switch / Profile */}
          {isAdmin ? (
            <button
              onClick={onLogoutClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#f5f0e8] hover:bg-[#efe9de] text-[#a9583e] text-xs font-medium transition-all md3-state-layer"
              title="ออกจากโหมด Admin"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">ออกระบบ</span>
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#3d3d3a] hover:text-[#141413] text-xs font-medium transition-all md3-state-layer"
              title="เข้าสู่ระบบผู้ดูแล (Admin)"
            >
              <Shield size={13} className="text-[#cc785c]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
