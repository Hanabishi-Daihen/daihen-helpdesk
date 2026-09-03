import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  PlusCircle, 
  CalendarRange, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Kanban, 
  List, 
  Ticket,
  CornerDownLeft,
  X
} from 'lucide-react';
import { Issue } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: string) => void;
  setDashMode: (mode: 'list' | 'kanban') => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogoutClick: () => void;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setView,
  setDashMode,
  isAdmin,
  onAdminClick,
  onLogoutClick,
  issues,
  onSelectIssue,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape or shortcut toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query and selected index on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered commands & tickets
  const items = useMemo(() => {
    const q = query.toLowerCase().trim();

    const baseCommands = [
      {
        id: 'cmd-dash',
        title: 'ไปยังหน้าแดชบอร์ด (Dashboard)',
        sub: 'ภาพรวมงานและรายการทั้งหมด',
        icon: LayoutDashboard,
        action: () => setView('dashboard'),
      },
      {
        id: 'cmd-form',
        title: 'แจ้งปัญหาใหม่ (Create Issue)',
        sub: 'เปิดฟอร์มแจ้งปัญหาพร้อมแนบไฟล์',
        icon: PlusCircle,
        action: () => setView('form'),
      },
      {
        id: 'cmd-sched',
        title: 'ตารางการผลิต (Schedules Gantt/Calendar)',
        sub: 'ดูตารางกระบวนการผลิตและปฏิทินงาน',
        icon: CalendarRange,
        action: () => setView('schedules'),
      },
      {
        id: 'cmd-kanban',
        title: 'มุมมองคัมบังบอร์ด (Kanban View)',
        sub: 'สลับไปยังมุมมองคัมบังบอร์ด',
        icon: Kanban,
        action: () => {
          setView('dashboard');
          setDashMode('kanban');
        },
      },
      {
        id: 'cmd-list',
        title: 'มุมมองตารางรายการ (List View)',
        sub: 'สลับไปยังมุมมองตารางรายการ',
        icon: List,
        action: () => {
          setView('dashboard');
          setDashMode('list');
        },
      },
      ...(isAdmin
        ? [
            {
              id: 'cmd-settings',
              title: 'การตั้งค่าระบบ (Settings)',
              sub: 'ปรับแต่งโลโก้ สี และสไตล์ระบบ',
              icon: Settings,
              action: () => setView('settings'),
            },
            {
              id: 'cmd-logout',
              title: 'ออกจากระบบ Admin',
              sub: 'สลับกลับสู่โหมดผู้ใช้งานทั่วไป',
              icon: LogOut,
              action: onLogoutClick,
            },
          ]
        : [
            {
              id: 'cmd-login',
              title: 'เข้าสู่ระบบ Admin',
              sub: 'ยืนยันรหัสผ่านเพื่อจัดการระบบขั้นสูง',
              icon: ShieldCheck,
              action: onAdminClick,
            },
          ]),
    ];

    const matchedCommands = q
      ? baseCommands.filter(c => (c.title + ' ' + c.sub).toLowerCase().includes(q))
      : baseCommands;

    const matchedIssues = q.length > 0
      ? issues
          .filter(
            i =>
              i.id.toLowerCase().includes(q) ||
              i.project.toLowerCase().includes(q) ||
              i.reporter.toLowerCase().includes(q) ||
              i.section.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map(i => ({
            id: `issue-${i.id}`,
            title: `#${i.id} · ${i.project}`,
            sub: `${i.status} · แผนก ${i.section} · ผู้แจ้ง: ${i.reporter}`,
            icon: Ticket,
            action: () => onSelectIssue(i),
          }))
      : [];

    return [...matchedCommands, ...matchedIssues];
  }, [query, isAdmin, issues, onAdminClick, onLogoutClick, onSelectIssue, setDashMode, setView]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#181715]/60 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 p-4">
      <div 
        className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden fade-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative border-b border-[#e6dfd8] p-3">
          <Search size={18} className="absolute left-4 top-4 text-[#8e8b82]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNav}
            placeholder="ค้นหาคำสั่ง หน้าเพจ หรือรหัสปัญหา (พิมพ์เพื่อค้นหา)..."
            className="w-full pl-10 pr-10 py-1.5 text-sm bg-transparent outline-none text-[#141413] placeholder-[#8e8b82]"
          />
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 text-[#8e8b82] hover:text-[#141413]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#e6dfd8]/30">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8e8b82]">
              ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา
            </div>
          ) : (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-[#efe9de] text-[#141413]' : 'text-[#3d3d3a] hover:bg-[#f5f0e8]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#cc785c] text-white' : 'bg-[#e6dfd8] text-[#6c6a64]'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#141413] truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[#6c6a64] truncate">
                        {item.sub}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft size={13} className="text-[#8e8b82] shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 bg-[#f5f0e8] border-t border-[#e6dfd8] flex items-center justify-between text-[10px] text-[#8e8b82] font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-[#e6dfd8] text-[#3d3d3a]">↵</kbd> เลือก</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[#e6dfd8] text-[#3d3d3a]">↑↓</kbd> เลื่อน</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[#e6dfd8] text-[#3d3d3a]">ESC</kbd> ปิด</span>
          </div>
          <span className="font-mono-code font-semibold">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
