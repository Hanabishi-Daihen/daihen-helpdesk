import React, { useState, useMemo } from 'react';
import { 
  CalendarRange, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Layers,
  Printer,
  FileCheck
} from 'lucide-react';
import { ScheduleItem, ProcessInfo } from '../types';
import { SCHEDULE_PROCESSES } from '../data/mockData';

interface SchedulesViewProps {
  schedules: ScheduleItem[];
  onImportCsv: (items: ScheduleItem[], mode: 'append' | 'replace') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  onImportCsv,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(['TO', 'TN']);
  const [sortKey, setSortKey] = useState<'start' | 'finish' | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [viewTab, setViewTab] = useState<'table' | 'calendar'>('table');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 8, 1)); // September 2026 default

  const processColorMap: Record<string, string> = {
    TO: '#60a5fa',
    TN: '#34d399',
    T: '#a78bfa',
    D: '#f472b6',
    DYG: '#facc15',
    FA: '#fb923c',
    RCC: '#38bdf8',
    LCC: '#22d3ee',
  };

  const getProcessColor = (code: string) => {
    return processColorMap[code.toUpperCase()] || '#cc785c';
  };

  // Toggle process chip filter
  const toggleProcess = (code: string) => {
    setSelectedProcesses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Filtered and sorted schedules
  const filteredSchedules = useMemo(() => {
    let result = schedules.filter(item => {
      const matchSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customer && item.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.purchaser && item.purchaser.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchProcess =
        selectedProcesses.length === 0 || selectedProcesses.includes(item.process);

      return matchSearch && matchProcess;
    });

    if (sortKey) {
      result.sort((a, b) => {
        const parseDate = (dStr: string) => {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
          }
          return 0;
        };
        const timeA = parseDate(a[sortKey]);
        const timeB = parseDate(b[sortKey]);
        return (timeA - timeB) * sortDir;
      });
    }

    return result;
  }, [schedules, searchTerm, selectedProcesses, sortKey, sortDir]);

  // Download template CSV
  const handleDownloadTemplate = () => {
    const headers = ['ID', 'Title', 'Process', 'Start', 'Finish', 'Purchaser', 'Customer', 'MVA', 'RatingVolt', 'NewDelivery', 'ActualPlanDelivery', 'Notes'];
    const sampleRow = ['ORD-999', 'Transformer 10MVA', 'TO', '01/09/2026', '08/09/2026', 'บมจ. ตัวอย่าง', 'Sample Corp', '10 MVA', '22/3.3 kV', '30/09/2026', '28/09/2026', 'ตัวอย่างบันทึก'];
    const csvContent = headers.join(',') + '\n' + sampleRow.join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์แม่แบบ CSV แล้ว');
  };

  // CSV Import handler
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'append' | 'replace') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        showToast('ไฟล์ CSV ไม่มีข้อมูลแถว', 'error');
        return;
      }

      const newItems: ScheduleItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4) {
          newItems.push({
            id: cols[0] || `ORD-${Date.now() + i}`,
            title: cols[1] || 'Untitled Schedule',
            process: cols[2] || 'TO',
            start: cols[3] || '',
            finish: cols[4] || cols[3] || '',
            purchaser: cols[5] || '',
            customer: cols[6] || '',
            mva: cols[7] || '',
            ratingVolt: cols[8] || '',
            newDelivery: cols[9] || '',
            actualPlanDelivery: cols[10] || '',
            notes: cols[11] || '',
          });
        }
      }

      onImportCsv(newItems, mode);
      showToast(`นำเข้าข้อมูล ${newItems.length} รายการสำเร็จ`);
    };
    reader.readAsText(file);
  };

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
    const totalDays = lastDay.getDate();

    const days: { dateNumber: number; dateStr: string; items: ScheduleItem[] }[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      
      const dayItems = filteredSchedules.filter(item => {
        return item.start === dStr || item.finish === dStr;
      });

      days.push({
        dateNumber: day,
        dateStr: dStr,
        items: dayItems,
      });
    }

    return { days, startOffset, monthName: calendarMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) };
  }, [calendarMonth, filteredSchedules]);

  return (
    <div className="space-y-4 fade-in">
      {/* ── Top Header & KPI Summary ──────────────────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
                <CalendarRange size={16} />
              </div>
              <h2 className="font-serif-claude text-xl font-bold text-[#141413]">
                ตารางงานการผลิต (Production Schedules)
              </h2>
            </div>
            <p className="text-xs text-[#6c6a64]">
              ติดตามลำดับขั้นตอนกระบวนการผลิตหม้อแปลงและงานสั่งทำ
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] text-center min-w-[90px]">
              <span className="text-[10px] text-[#8e8b82] uppercase font-bold block">ทั้งหมด</span>
              <span className="font-serif-claude text-lg font-bold text-[#141413]">{schedules.length}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] text-center min-w-[90px]">
              <span className="text-[10px] text-[#8e8b82] uppercase font-bold block">มีวันที่ระบุ</span>
              <span className="font-serif-claude text-lg font-bold text-[#cc785c]">
                {schedules.filter(s => s.start && s.finish).length}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] text-center min-w-[90px]">
              <span className="text-[10px] text-[#8e8b82] uppercase font-bold block">กระบวนการ</span>
              <span className="font-serif-claude text-lg font-bold text-[#5db872]">
                {new Set(schedules.map(s => s.process)).size}
              </span>
            </div>
          </div>
        </div>

        {/* CSV Import/Export Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#e6dfd8]/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#3d3d3a] font-semibold transition-all md3-state-layer"
            >
              <FileSpreadsheet size={13} className="text-[#5db872]" />
              <span>ดาวน์โหลด Template CSV</span>
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#3d3d3a] font-semibold cursor-pointer transition-all md3-state-layer">
              <Upload size={13} className="text-[#cc785c]" />
              <span>นำเข้า CSV (Append)</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => handleCsvFileChange(e, 'append')}
              />
            </label>
          </div>

          {/* Segmented View Switcher: Table vs Month Calendar */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
            <button
              onClick={() => setViewTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewTab === 'table' ? 'bg-[#faf9f5] text-[#141413] shadow-xs' : 'text-[#6c6a64]'
              }`}
            >
              <Layers size={13} />
              <span>ตารางรายการ</span>
            </button>
            <button
              onClick={() => setViewTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewTab === 'calendar' ? 'bg-[#faf9f5] text-[#141413] shadow-xs' : 'text-[#6c6a64]'
              }`}
            >
              <CalendarIcon size={13} />
              <span>ปฏิทินรายเดือน</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters & Process Chips ───────────────────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-[#8e8b82]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหา Order, Project, ลูกค้า..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedProcesses(SCHEDULE_PROCESSES.map(p => p.code))}
              className="text-[11px] font-semibold text-[#8e8b82] hover:text-[#141413]"
            >
              เลือกทั้งหมด
            </button>
            <span className="text-[#8e8b82]">·</span>
            <button
              onClick={() => setSelectedProcesses([])}
              className="text-[11px] font-semibold text-[#8e8b82] hover:text-[#141413]"
            >
              ล้างตัวเลือก
            </button>
          </div>
        </div>

        {/* Process Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#e6dfd8]/60">
          {SCHEDULE_PROCESSES.map(proc => {
            const isChecked = selectedProcesses.includes(proc.code);
            const color = getProcessColor(proc.code);

            return (
              <button
                key={proc.code}
                onClick={() => toggleProcess(proc.code)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all md3-state-layer ${
                  isChecked
                    ? 'bg-[#181715] text-white border-[#181715] shadow-xs'
                    : 'bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8] hover:bg-[#efe9de]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{proc.code} ({proc.name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── View 1: Schedules Table ───────────────────────────── */}
      {viewTab === 'table' && (
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#efe9de] text-[#6c6a64] font-semibold border-b border-[#e6dfd8]">
                  <th className="p-3.5">ID / Title</th>
                  <th className="p-3.5">กระบวนการ (Process)</th>
                  <th 
                    className="p-3.5 cursor-pointer hover:text-[#141413]"
                    onClick={() => {
                      setSortKey('start');
                      setSortDir(sortKey === 'start' ? (sortDir === 1 ? -1 : 1) : 1);
                    }}
                  >
                    วันเริ่ม (Start) {sortKey === 'start' && (sortDir === 1 ? '▲' : '▼')}
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:text-[#141413]"
                    onClick={() => {
                      setSortKey('finish');
                      setSortDir(sortKey === 'finish' ? (sortDir === 1 ? -1 : 1) : 1);
                    }}
                  >
                    วันเสร็จ (Finish) {sortKey === 'finish' && (sortDir === 1 ? '▲' : '▼')}
                  </th>
                  <th className="p-3.5">ลูกค้า / ผู้สั่งซื้อ</th>
                  <th className="p-3.5">ขนาด MVA / Volt</th>
                  <th className="p-3.5">กำหนดส่งมอบ</th>
                  <th className="p-3.5">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd8]/60">
                {filteredSchedules.map(item => {
                  const pColor = getProcessColor(item.process);
                  const pInfo = SCHEDULE_PROCESSES.find(p => p.code === item.process);

                  return (
                    <tr key={item.id} className="hover:bg-[#efe9de]/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono-code font-bold text-[#cc785c]">{item.id}</div>
                        <div className="font-bold text-[#141413] mt-0.5">{item.title}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#faf9f5] border border-[#e6dfd8] text-[11px] font-semibold text-[#141413]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pColor }} />
                          <span>{item.process} - {pInfo?.name || item.processFull || ''}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-mono-code whitespace-nowrap text-[#3d3d3a]">
                        {item.start}
                      </td>

                      <td className="p-3.5 font-mono-code whitespace-nowrap text-[#3d3d3a]">
                        {item.finish}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#141413]">{item.customer || '-'}</div>
                        <div className="text-[10px] text-[#8e8b82]">{item.purchaser || ''}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#141413]">{item.mva || '-'}</div>
                        <div className="text-[10px] text-[#8e8b82]">{item.ratingVolt || ''}</div>
                      </td>

                      <td className="p-3.5 font-mono-code whitespace-nowrap">
                        <div className="text-[#5db872] font-semibold">{item.newDelivery || '-'}</div>
                        {item.actualPlanDelivery && (
                          <div className="text-[10px] text-[#8e8b82]">Plan: {item.actualPlanDelivery}</div>
                        )}
                      </td>

                      <td className="p-3.5 text-[#6c6a64] max-w-xs truncate">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 2: Month Calendar ────────────────────────────── */}
      {viewTab === 'calendar' && (
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-6 shadow-2xs space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif-claude text-lg font-bold text-[#141413]">
              {calendarDays.monthName}
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                }
                className="p-1.5 rounded-lg bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                }
                className="p-1.5 rounded-lg bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[#8e8b82] pb-2 border-b border-[#e6dfd8]">
            <div>อา.</div>
            <div>จ.</div>
            <div>อ.</div>
            <div>พ.</div>
            <div>พฤ.</div>
            <div>ศ.</div>
            <div>ส.</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: calendarDays.startOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] rounded-xl bg-transparent" />
            ))}

            {/* Day cells */}
            {calendarDays.days.map(day => (
              <div
                key={day.dateStr}
                className="min-h-[90px] rounded-xl bg-[#faf9f5] border border-[#e6dfd8] p-1.5 flex flex-col justify-between text-left"
              >
                <div className="font-mono-code text-[11px] font-bold text-[#141413]">
                  {day.dateNumber}
                </div>

                <div className="space-y-1 my-auto overflow-hidden">
                  {day.items.slice(0, 2).map(it => (
                    <div
                      key={it.id}
                      style={{ borderLeftColor: getProcessColor(it.process) }}
                      className="text-[9px] font-semibold bg-[#efe9de] p-1 rounded-xs border-l-3 truncate text-[#141413]"
                      title={`${it.id} - ${it.title} (${it.process})`}
                    >
                      <span className="font-bold">{it.process}:</span> {it.title}
                    </div>
                  ))}
                  {day.items.length > 2 && (
                    <div className="text-[8px] text-[#8e8b82] font-semibold text-center">
                      +{day.items.length - 2} งานเพิ่มเติม
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e6dfd8]/60 text-[11px]">
            {SCHEDULE_PROCESSES.map(p => (
              <div key={p.code} className="flex items-center gap-1.5 text-[#6c6a64]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getProcessColor(p.code) }} />
                <span>{p.code}: {p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
