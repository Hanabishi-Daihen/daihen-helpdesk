import React from 'react';
import { 
  Paperclip, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  User, 
  Check, 
  X,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  SearchX
} from 'lucide-react';
import { Issue, PriorityType, StatusType } from '../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../data/mockData';

interface IssueTableProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  isAdmin: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  bulkStatus: StatusType;
  setBulkStatus: (status: StatusType) => void;
  onBulkUpdate: () => void;
  isBulkUpdating: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const IssueTable: React.FC<IssueTableProps> = ({
  issues,
  onSelectIssue,
  isAdmin,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  bulkStatus,
  setBulkStatus,
  onBulkUpdate,
  isBulkUpdating,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const getPriorityBadge = (priority: PriorityType) => {
    const config = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
    let PriorityIcon = Minus;
    if (priority === 'Urgent') PriorityIcon = Flame;
    else if (priority === 'High') PriorityIcon = ArrowUp;
    else if (priority === 'Low') PriorityIcon = ArrowDown;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.color} ${config.border}`}>
        <PriorityIcon size={10} />
        <span>{config.label.split(' ')[0]}</span>
      </span>
    );
  };

  const getStatusBadge = (status: StatusType) => {
    const theme = STATUS_COLORS[status] || STATUS_COLORS['New'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${theme.bg} ${theme.text} ${theme.border}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.dot }} />
        <span>{STATUS_LABELS[status] || status}</span>
      </span>
    );
  };

  const getUnreadCount = (issue: Issue) => {
    if (!issue.chat || !Array.isArray(issue.chat)) return 0;
    return issue.chat.filter(msg => {
      if (isAdmin) return msg.sender !== 'Admin' && msg.sender !== 'System' && !msg.read;
      return (msg.sender === 'Admin' || msg.sender === 'System') && !msg.read;
    }).length;
  };

  if (issues.length === 0) {
    return (
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#efe9de] text-[#8e8b82] flex items-center justify-center mx-auto mb-3">
          <SearchX size={26} />
        </div>
        <h3 className="font-serif-claude text-base font-semibold text-[#141413]">
          ไม่พบรายการแจ้งปัญหา
        </h3>
        <p className="text-xs text-[#6c6a64] mt-1 max-w-sm mx-auto">
          ลองเปลี่ยนคำค้นหา ปรับสถานะ หรือตัวกรองแผนกเพื่อค้นหาข้อมูลอีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Desktop View Table ─────────────────────────────────── */}
      <div className="hidden md:block bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#efe9de] text-[#6c6a64] font-semibold border-b border-[#e6dfd8]">
                {isAdmin && (
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={issues.length > 0 && selectedIds.size === issues.length}
                      onChange={onToggleSelectAll}
                      className="rounded accent-[#cc785c] cursor-pointer w-3.5 h-3.5"
                    />
                  </th>
                )}
                <th className="p-3.5">ความสำคัญ</th>
                <th className="p-3.5">ID / วันที่</th>
                <th className="p-3.5 w-2/5">หัวข้อ / รายละเอียด</th>
                <th className="p-3.5">แผนก</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5">สถานะ</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6dfd8]/60">
              {issues.map(issue => {
                const unread = getUnreadCount(issue);
                const isSelected = selectedIds.has(issue.id);

                return (
                  <tr
                    key={issue.id}
                    className={`transition-colors hover:bg-[#efe9de]/70 ${
                      isSelected ? 'bg-[#efe9de]' : ''
                    }`}
                  >
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(issue.id)}
                          className="rounded accent-[#cc785c] cursor-pointer w-3.5 h-3.5"
                        />
                      </td>
                    )}

                    {/* Priority */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getPriorityBadge(issue.priority)}
                    </td>

                    {/* ID & Date */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono-code font-bold text-[#141413]">
                        #{issue.id}
                      </div>
                      <div className="text-[10px] text-[#8e8b82] mt-0.5">
                        {issue.timestamp}
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#141413] hover:text-[#cc785c] cursor-pointer line-clamp-1" onClick={() => onSelectIssue(issue)}>
                          {issue.project}
                        </span>
                        {issue.files && issue.files.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#efe9de] text-[#6c6a64] text-[10px] font-medium shrink-0" title={`มีไฟล์แนบ ${issue.files.length} ไฟล์`}>
                            <Paperclip size={10} />
                            <span>{issue.files.length}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6c6a64] line-clamp-1 mt-0.5">
                        {issue.description}
                      </p>
                    </td>

                    {/* Department & Reporter */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#141413]">
                        แผนก {issue.section}
                      </div>
                      <div className="text-[10px] text-[#8e8b82] flex items-center gap-1 mt-0.5">
                        <User size={10} />
                        <span className="truncate max-w-[100px]">{issue.reporter}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#efe9de] text-[#3d3d3a] text-[10px] font-medium">
                        {issue.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(issue.status)}
                    </td>

                    {/* Action button */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSelectIssue(issue)}
                        className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] hover:bg-[#efe9de] border border-[#e6dfd8] text-[#141413] text-xs font-semibold rounded-lg shadow-2xs transition-all md3-state-layer"
                      >
                        <Eye size={13} className="text-[#cc785c]" />
                        <span>เปิดดู</span>
                        {unread > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#c64545] text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-pulse shadow-xs">
                            {unread}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile View Cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-2.5">
        {issues.map(issue => {
          const unread = getUnreadCount(issue);

          return (
            <div
              key={`mobile-${issue.id}`}
              onClick={() => onSelectIssue(issue)}
              className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-3.5 shadow-2xs active:bg-[#efe9de] transition-colors relative"
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-code text-xs font-bold text-[#cc785c]">
                    #{issue.id}
                  </span>
                  {getPriorityBadge(issue.priority)}
                </div>
                {getStatusBadge(issue.status)}
              </div>

              {/* Title & info */}
              <h4 className="text-xs font-bold text-[#141413] line-clamp-1 mb-1">
                {issue.project}
              </h4>
              <p className="text-[11px] text-[#6c6a64] line-clamp-2 leading-relaxed mb-3">
                {issue.description}
              </p>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd8]/60 text-[11px] text-[#6c6a64]">
                <div className="flex items-center gap-1">
                  <User size={11} className="text-[#8e8b82]" />
                  <span>{issue.reporter} ({issue.section})</span>
                </div>

                <div className="flex items-center gap-2">
                  {issue.files && issue.files.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-[#8e8b82]">
                      <Paperclip size={11} />
                      <span>{issue.files.length}</span>
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#c64545] text-white text-[9px] font-bold badge-pulse">
                      {unread} ข้อความใหม่
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination & Summary ───────────────────────────────── */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#6c6a64]">
        <div className="font-medium">
          แสดง <span className="font-bold text-[#141413]">{issues.length}</span> จากทั้งหมด <span className="font-bold text-[#141413]">{totalCount}</span> รายการ (หน้า {currentPage} / {totalPages || 1})
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg font-semibold text-[#141413] hover:bg-[#efe9de] disabled:opacity-40 disabled:cursor-not-allowed transition-all md3-state-layer flex items-center gap-1"
          >
            <ChevronLeft size={13} />
            <span>ก่อนหน้า</span>
          </button>
          <span className="px-2 text-xs font-mono-code font-bold text-[#141413]">
            {currentPage}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg font-semibold text-[#141413] hover:bg-[#efe9de] disabled:opacity-40 disabled:cursor-not-allowed transition-all md3-state-layer flex items-center gap-1"
          >
            <span>ถัดไป</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Admin Bulk Action Floating Bar ─────────────────────── */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#181715] text-[#faf9f5] border border-[#252320] rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 fade-scale-in max-w-[95vw]">
          <span className="text-xs font-bold whitespace-nowrap">
            เลือก <span className="text-[#cc785c]">{selectedIds.size}</span> รายการ
          </span>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#a09d96] hidden sm:inline">เปลี่ยนเป็น:</span>
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value as StatusType)}
              className="bg-[#252320] text-[#faf9f5] text-xs font-medium rounded-lg px-2.5 py-1.5 border border-white/10 outline-none"
            >
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st] || st}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onBulkUpdate}
            disabled={isBulkUpdating}
            className="px-3 py-1.5 bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isBulkUpdating ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={13} />
            )}
            <span>อัปเดต</span>
          </button>
          <button
            onClick={onClearSelection}
            className="p-1 rounded-lg text-[#a09d96] hover:text-white"
            title="ยกเลิกการเลือก"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
