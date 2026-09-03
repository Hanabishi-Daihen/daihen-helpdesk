import React, { useState } from 'react';
import { 
  Paperclip, 
  Clock, 
  User, 
  ChevronDown, 
  Check, 
  ArrowRight,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Issue, StatusType, PriorityType } from '../types';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, PRIORITY_OPTIONS } from '../data/mockData';

interface KanbanBoardProps {
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: StatusType) => void;
  onSelectIssue: (issue: Issue) => void;
  isAdmin: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  issues,
  onStatusChange,
  onSelectIssue,
  isAdmin,
}) => {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [activeQuickMoveId, setActiveQuickMoveId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedIssueId(id);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    if (dragOverCol !== colStatus) {
      setDragOverCol(colStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: StatusType) => {
    e.preventDefault();
    setDragOverCol(null);
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      onStatusChange(issueId, newStatus);
    }
    setDraggedIssueId(null);
  };

  const getPriorityBadge = (priority: PriorityType) => {
    const config = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
    let PriorityIcon = Minus;
    if (priority === 'Urgent') PriorityIcon = Flame;
    else if (priority === 'High') PriorityIcon = ArrowUp;
    else if (priority === 'Low') PriorityIcon = ArrowDown;

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${config.bg} ${config.color} ${config.border}`}>
        <PriorityIcon size={9} />
        <span>{config.label.split(' ')[0]}</span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto pb-4 pt-1 kanban-scroll">
      <div className="flex gap-3 min-w-[1050px]">
        {STATUS_OPTIONS.map(status => {
          const colIssues = issues.filter(i => i.status === status);
          const theme = STATUS_COLORS[status];
          const isOver = dragOverCol === status;

          return (
            <div
              key={status}
              onDragOver={e => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, status)}
              className={`flex-1 min-w-[210px] max-w-[270px] rounded-2xl p-3 border transition-all flex flex-col ${
                isOver
                  ? 'bg-[#efe9de] border-[#cc785c] ring-2 ring-[#cc785c]/30 shadow-md'
                  : 'bg-[#f5f0e8] border-[#e6dfd8] shadow-2xs'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.dot }} />
                  <h3 className="font-serif-claude text-sm font-semibold text-[#141413]">
                    {STATUS_LABELS[status]}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-[10px] font-mono-code font-bold text-[#6c6a64]">
                  {colIssues.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 min-h-[220px]">
                {colIssues.map(issue => {
                  const unread = (issue.chat || []).filter(msg => {
                    if (isAdmin) return msg.sender !== 'Admin' && msg.sender !== 'System' && !msg.read;
                    return (msg.sender === 'Admin' || msg.sender === 'System') && !msg.read;
                  }).length;

                  const isDragging = draggedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      draggable={true}
                      onDragStart={e => handleDragStart(e, issue.id)}
                      onDragEnd={() => setDraggedIssueId(null)}
                      onClick={() => onSelectIssue(issue)}
                      className={`p-3 rounded-xl border bg-[#faf9f5] hover:bg-white hover:border-[#cc785c]/50 transition-all shadow-2xs cursor-grab active:cursor-grabbing relative group ${
                        isDragging ? 'opacity-40 scale-95 border-dashed border-[#cc785c]' : 'border-[#e6dfd8]'
                      }`}
                    >
                      {/* Unread Message Badge */}
                      {unread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#c64545] text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-pulse shadow-xs">
                          {unread}
                        </span>
                      )}

                      {/* Card Top: ID + Priority */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono-code text-[11px] font-bold text-[#141413]">
                          #{issue.id}
                        </span>
                        {getPriorityBadge(issue.priority)}
                      </div>

                      {/* Project title */}
                      <h4 className="text-xs font-bold text-[#141413] line-clamp-2 leading-snug mb-1 group-hover:text-[#cc785c] transition-colors">
                        {issue.project}
                      </h4>

                      {/* Description excerpt */}
                      <p className="text-[11px] text-[#6c6a64] line-clamp-2 leading-relaxed mb-2.5">
                        {issue.description}
                      </p>

                      {/* Footer: Section, Reporter, Attachments & Quick Move */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd8]/60 text-[10px] text-[#8e8b82]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-[#3d3d3a] bg-[#efe9de] px-1.5 py-0.5 rounded">
                            {issue.section}
                          </span>
                          <span className="truncate">{issue.reporter}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {issue.files && issue.files.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-[#8e8b82]">
                              <Paperclip size={9} />
                              <span>{issue.files.length}</span>
                            </span>
                          )}

                          {/* Quick move status menu button (great for mobile/touch or quick click) */}
                          <div className="relative" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveQuickMoveId(activeQuickMoveId === issue.id ? null : issue.id)}
                              className="p-1 rounded hover:bg-[#efe9de] text-[#8e8b82] hover:text-[#141413] transition-colors"
                              title="ย้ายสถานะทันที"
                            >
                              <ChevronDown size={11} />
                            </button>

                            {activeQuickMoveId === issue.id && (
                              <div className="absolute right-0 bottom-full mb-1 w-32 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl shadow-lg p-1 z-30 fade-scale-in">
                                <div className="text-[9px] font-bold text-[#8e8b82] px-2 py-1 uppercase tracking-wider">
                                  ย้ายไปยัง:
                                </div>
                                {STATUS_OPTIONS.map(st => (
                                  <button
                                    key={st}
                                    onClick={() => {
                                      onStatusChange(issue.id, st);
                                      setActiveQuickMoveId(null);
                                    }}
                                    disabled={st === issue.status}
                                    className={`w-full text-left px-2 py-1 rounded text-[10px] flex items-center justify-between ${
                                      st === issue.status
                                        ? 'bg-[#efe9de] font-bold text-[#141413]'
                                        : 'hover:bg-[#f5f0e8] text-[#3d3d3a]'
                                    }`}
                                  >
                                    <span>{STATUS_LABELS[st]}</span>
                                    {st === issue.status && <Check size={10} />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colIssues.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-[#e6dfd8] rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-[#8e8b82]">
                    ลากการ์ดมาวางที่นี่
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
