import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Bookmark, 
  X, 
  List, 
  Kanban, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { SavedFilterView } from '../types';
import { STATUS_OPTIONS, STATUS_LABELS, SECTIONS, PRIORITY_OPTIONS } from '../data/mockData';

interface IssueFilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterSection: string;
  setFilterSection: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  dashMode: 'list' | 'kanban';
  setDashMode: (mode: 'list' | 'kanban') => void;
  savedViews: SavedFilterView[];
  onSaveCurrentView: () => void;
  onApplyView: (view: SavedFilterView) => void;
  onRemoveView: (id: number) => void;
  onOpenReportModal: () => void;
  totalFilteredCount: number;
}

export const IssueFilterBar: React.FC<IssueFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterSection,
  setFilterSection,
  filterPriority,
  setFilterPriority,
  sortBy,
  setSortBy,
  dashMode,
  setDashMode,
  savedViews,
  onSaveCurrentView,
  onApplyView,
  onRemoveView,
  onOpenReportModal,
  totalFilteredCount,
}) => {
  const isFiltering = searchTerm || filterStatus !== 'All' || filterSection !== 'All' || filterPriority !== 'All';

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterSection('All');
    setFilterPriority('All');
  };

  return (
    <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-3 md:p-4 space-y-3 shadow-2xs">
      {/* Top Row: Title + Segmented View Switch + Report PDF Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
            <Filter size={14} />
          </div>
          <span className="font-serif-claude text-base font-semibold text-[#141413]">
            ตัวกรอง &amp; มุมมอง
          </span>
          {isFiltering && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#cc785c]/15 text-[#a9583e] font-bold">
              กำลังกรอง ({totalFilteredCount} รายการ)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Control: List vs Kanban */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
            <button
              onClick={() => setDashMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all md3-state-layer ${
                dashMode === 'list'
                  ? 'bg-[#faf9f5] text-[#141413] shadow-xs'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <List size={13} />
              <span>ตาราง</span>
            </button>
            <button
              onClick={() => setDashMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all md3-state-layer ${
                dashMode === 'kanban'
                  ? 'bg-[#faf9f5] text-[#141413] shadow-xs'
                  : 'text-[#6c6a64] hover:text-[#141413]'
              }`}
            >
              <Kanban size={13} />
              <span>คัมบังบอร์ด</span>
            </button>
          </div>

          {/* PDF Report Export Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de] text-[#3d3d3a] text-xs font-semibold transition-all shadow-2xs md3-state-layer"
            title="ออกรายงานเอกสาร PDF (Issue Tracking Report)"
          >
            <FileText size={14} className="text-[#cc785c]" />
            <span className="hidden sm:inline">ออกรายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหา ID, ปัญหา, ผู้แจ้ง..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] placeholder-[#8e8b82] transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#8e8b82]" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-[#8e8b82] hover:text-[#141413]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Select */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#3d3d3a] focus:bg-white focus:border-[#cc785c] outline-none transition-colors"
        >
          <option value="All">ทุกสถานะ (Status)</option>
          <option value="New,Waiting">รอดำเนินการ (New + Waiting)</option>
          <option value="Resolved,Closed">เสร็จสิ้น (Resolved + Closed)</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>
              {STATUS_LABELS[status] || status}
            </option>
          ))}
        </select>

        {/* Section Select */}
        <select
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#3d3d3a] focus:bg-white focus:border-[#cc785c] outline-none transition-colors"
        >
          <option value="All">ทุกแผนก (Section)</option>
          {SECTIONS.map(sec => (
            <option key={sec} value={sec}>
              แผนก {sec}
            </option>
          ))}
        </select>

        {/* Priority Select */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#3d3d3a] focus:bg-white focus:border-[#cc785c] outline-none transition-colors"
        >
          <option value="All">ทุกระดับความสำคัญ (Priority)</option>
          {PRIORITY_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#3d3d3a] focus:bg-white focus:border-[#cc785c] outline-none transition-colors appearance-none font-medium"
          >
            <option value="date_desc">วันที่: ล่าสุดก่อน</option>
            <option value="date_asc">วันที่: เก่าก่อน</option>
            <option value="priority_desc">ความสำคัญ: สูงสุดก่อน</option>
            <option value="priority_asc">ความสำคัญ: ต่ำสุดก่อน</option>
          </select>
          <ArrowUpDown size={13} className="absolute left-2.5 top-2.5 text-[#8e8b82] pointer-events-none" />
        </div>
      </div>

      {/* Bottom Row: Saved Views & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e6dfd8]/60 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-[#8e8b82] font-semibold uppercase tracking-wider">
            ตัวกรองที่บันทึกไว้:
          </span>
          {savedViews.length === 0 ? (
            <span className="text-[10px] text-[#8e8b82] italic">ไม่มีตัวกรองที่บันทึก</span>
          ) : (
            savedViews.map(view => (
              <span
                key={view.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#efe9de] text-[#3d3d3a] hover:bg-[#e6dfd8] text-[10px] font-medium transition-colors"
              >
                <button onClick={() => onApplyView(view)} className="hover:underline">
                  {view.label}
                </button>
                <button
                  onClick={() => onRemoveView(view.id)}
                  className="p-0.5 text-[#8e8b82] hover:text-[#c64545]"
                  title="ลบตัวกรองนี้"
                >
                  <X size={10} />
                </button>
              </span>
            ))
          )}

          {/* Bookmark Button */}
          {isFiltering && (
            <button
              onClick={onSaveCurrentView}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-[#cc785c] text-[#cc785c] hover:bg-[#cc785c]/10 text-[10px] font-bold transition-colors"
            >
              <Bookmark size={10} />
              <span>บันทึกตัวกรองนี้</span>
            </button>
          )}
        </div>

        {isFiltering && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8e8b82] hover:text-[#cc785c] transition-colors"
          >
            <RotateCcw size={11} />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
      </div>
    </div>
  );
};
