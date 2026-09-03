import React, { useState } from 'react';
import { PieChart, BarChart3, Clock, ArrowUpRight } from 'lucide-react';
import { Issue, StatusType } from '../types';
import { STATUS_LABELS, SECTIONS } from '../data/mockData';

interface ChartsSectionProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onFilterStatus: (status: string) => void;
  onFilterSection: (section: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  issues,
  onSelectIssue,
  onFilterStatus,
  onFilterSection,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Status breakdown
  const statusConfig: { key: StatusType; label: string; color: string }[] = [
    { key: 'New', label: 'ใหม่', color: '#1e4a8c' },
    { key: 'Waiting', label: 'รอดำเนินการ', color: '#d97706' },
    { key: 'In Progress', label: 'กำลังแก้ไข', color: '#cc785c' },
    { key: 'Resolved', label: 'แก้ไขแล้ว', color: '#5db872' },
    { key: 'Closed', label: 'ปิดงาน', color: '#6c6a64' },
  ];

  const statusCounts = statusConfig.map(c => ({
    ...c,
    count: issues.filter(i => i.status === c.key).length,
  }));
  const totalStatus = statusCounts.reduce((acc, curr) => acc + curr.count, 0) || 1;

  // Section breakdown
  const sectionCounts = SECTIONS.map(sec => ({
    name: sec,
    count: issues.filter(i => i.section === sec).length,
  }));
  const maxSectionCount = Math.max(...sectionCounts.map(s => s.count), 1);

  // Recent 5 issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.reportedDate || b.timestamp).getTime() - new Date(a.reportedDate || a.timestamp).getTime())
    .slice(0, 5);

  // SVG Doughnut calculation
  let cumulativeAngle = 0;
  const radius = 50;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {/* ── 1. Status Doughnut Chart Card ────────────────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <PieChart size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-semibold text-[#141413]">
              สัดส่วนสถานะงาน
            </h3>
          </div>
          <span className="text-[10px] text-[#8e8b82] font-medium font-mono-code">
            {issues.length} รายการ
          </span>
        </div>

        <div className="flex items-center justify-center py-2 relative">
          <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            {statusCounts.map((item, index) => {
              const strokeDasharray = `${(item.count / totalStatus) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeAngle;
              cumulativeAngle += (item.count / totalStatus) * circumference;

              const isHovered = hoveredSlice === item.key;

              return (
                <circle
                  key={item.key}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(item.key)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => onFilterStatus(item.key)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-serif-claude text-2xl font-bold text-[#141413] leading-none">
              {hoveredSlice 
                ? statusCounts.find(s => s.key === hoveredSlice)?.count 
                : issues.length}
            </span>
            <span className="text-[9px] text-[#6c6a64] font-medium mt-0.5">
              {hoveredSlice ? STATUS_LABELS[hoveredSlice] : 'ทั้งหมด'}
            </span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 pt-2 border-t border-[#e6dfd8]/60">
          {statusCounts.map(item => (
            <button
              key={item.key}
              onClick={() => onFilterStatus(item.key)}
              onMouseEnter={() => setHoveredSlice(item.key)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                hoveredSlice === item.key ? 'bg-[#efe9de] text-[#141413]' : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
              <span className="font-mono-code text-[9px] text-[#8e8b82]">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Department Workload Bar Chart Card ───────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#1e4a8c] flex items-center justify-center">
              <BarChart3 size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-semibold text-[#141413]">
              จำนวนงานแยกตามแผนก
            </h3>
          </div>
          <span className="text-[10px] text-[#8e8b82] font-medium font-mono-code">
            3 แผนก
          </span>
        </div>

        <div className="space-y-3 my-auto py-2">
          {sectionCounts.map(sec => {
            const percentage = Math.round((sec.count / maxSectionCount) * 100);
            const isHovered = hoveredBar === sec.name;

            return (
              <div 
                key={sec.name}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredBar(sec.name)}
                onMouseLeave={() => setHoveredBar(null)}
                onClick={() => onFilterSection(sec.name)}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#3d3d3a] group-hover:text-[#cc785c] transition-colors">
                    แผนก {sec.name}
                  </span>
                  <span className="font-mono-code text-[#6c6a64] text-[11px]">
                    {sec.count} งาน
                  </span>
                </div>
                <div className="w-full h-3 bg-[#e6dfd8] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sec.name === 'MF' 
                        ? 'bg-[#1e4a8c]' 
                        : sec.name === 'QC' 
                        ? 'bg-[#cc785c]' 
                        : 'bg-[#5db8a6]'
                    } ${isHovered ? 'brightness-110 shadow-xs' : ''}`}
                    style={{ width: `${Math.max(percentage, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-[#8e8b82] text-center pt-2 border-t border-[#e6dfd8]/60">
          คลิกที่แถบแผนกเพื่อกรองรายการในตารางด้านล่าง
        </div>
      </div>

      {/* ── 3. Recent Activity Card ─────────────────────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#5db872] flex items-center justify-center">
              <Clock size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-semibold text-[#141413]">
              กิจกรรมล่าสุด
            </h3>
          </div>
          <span className="text-[10px] text-[#8e8b82] font-medium font-mono-code">
            Recent Feed
          </span>
        </div>

        <div className="divide-y divide-[#e6dfd8]/60 -mx-1 flex-1">
          {recentIssues.length === 0 ? (
            <p className="text-xs text-[#8e8b82] text-center py-6">ยังไม่มีกิจกรรม</p>
          ) : (
            recentIssues.map(issue => (
              <button
                key={`recent-${issue.id}`}
                onClick={() => onSelectIssue(issue)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#efe9de] transition-colors text-left group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#cc785c] font-mono-code">
                      #{issue.id}
                    </span>
                    <span className="text-[10px] text-[#8e8b82] font-medium">
                      ({issue.section})
                    </span>
                  </div>
                  <p className="text-xs text-[#3d3d3a] font-medium truncate group-hover:text-[#141413] transition-colors">
                    {issue.project}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#efe9de] text-[#3d3d3a] border border-[#e6dfd8]">
                    {STATUS_LABELS[issue.status] || issue.status}
                  </span>
                  <ArrowUpRight size={13} className="text-[#8e8b82] group-hover:text-[#141413] transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="text-[10px] text-[#8e8b82] text-center pt-2 border-t border-[#e6dfd8]/60">
          อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
        </div>
      </div>
    </div>
  );
};
