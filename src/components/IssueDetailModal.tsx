import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  User, 
  Clock, 
  Link as LinkIcon, 
  Edit3, 
  Check, 
  Download, 
  FileText,
  MessageSquare,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Issue, StatusType, PriorityType, FileAttachment, ChatMessage } from '../types';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, PRIORITY_OPTIONS, SECTIONS } from '../data/mockData';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  isAdmin: boolean;
  onStatusChange: (issueId: string, newStatus: StatusType) => void;
  onUpdateIssueDetails: (issueId: string, updates: Partial<Issue>) => void;
  onSendMessage: (issueId: string, message: string, files?: FileAttachment[]) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  isAdmin,
  onStatusChange,
  onUpdateIssueDetails,
  onSendMessage,
  showToast,
}) => {
  if (!issue) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [chatInput, setChatInput] = useState('');
  const [chatFiles, setChatFiles] = useState<FileAttachment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({
    project: issue.project,
    description: issue.description,
    section: issue.section,
    priority: issue.priority,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [issue.chat, activeTab]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?issue=${issue.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => showToast('คัดลอกลิงก์เรียบร้อยแล้ว'),
        () => showToast('ไม่สามารถคัดลอกลิงก์ได้', 'error')
      );
    }
  };

  const handleSaveEdit = () => {
    onUpdateIssueDetails(issue.id, editDraft);
    setIsEditing(false);
    showToast('บันทึกการแก้ไขเรียบร้อย');
  };

  const handleSendChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && chatFiles.length === 0) return;

    onSendMessage(issue.id, chatInput, chatFiles);
    setChatInput('');
    setChatFiles([]);
  };

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files) as File[];
      selected.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
          const result = ev.target?.result as string;
          setChatFiles(prev => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              data: result,
              thumbnail: file.type.startsWith('image/') ? result : undefined,
              url: result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getPriorityBadge = (priority: PriorityType) => {
    const config = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
    let PriorityIcon = Minus;
    if (priority === 'Urgent') PriorityIcon = Flame;
    else if (priority === 'High') PriorityIcon = ArrowUp;
    else if (priority === 'Low') PriorityIcon = ArrowDown;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.bg} ${config.color} ${config.border}`}>
        <PriorityIcon size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  const statusTheme = STATUS_COLORS[issue.status] || STATUS_COLORS['New'];

  return (
    <div className="fixed inset-0 z-50 bg-[#181715]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden fade-scale-in">
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#f5f0e8] border-b border-[#e6dfd8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono-code font-bold text-sm text-[#cc785c]">
              #{issue.id}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusTheme.dot }} />
              {STATUS_LABELS[issue.status] || issue.status}
            </span>
            {getPriorityBadge(issue.priority)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all"
              title="คัดลอกลิงก์ไปยังรายการนี้"
            >
              <LinkIcon size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all"
              title="ปิดหน้าต่าง"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (Details vs Chat) */}
        <div className="flex md:hidden border-b border-[#e6dfd8] bg-[#efe9de]">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${
              activeTab === 'details'
                ? 'bg-[#faf9f5] text-[#141413] border-b-2 border-[#cc785c]'
                : 'text-[#6c6a64]'
            }`}
          >
            รายละเอียด
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#faf9f5] text-[#141413] border-b-2 border-[#cc785c]'
                : 'text-[#6c6a64]'
            }`}
          >
            <MessageSquare size={13} />
            <span>ข้อความโต้ตอบ ({issue.chat?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body: 2 Columns on Desktop, Tabbed on Mobile */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#e6dfd8]">
          {/* Left Column: Ticket Details (3 cols) */}
          <div className={`md:col-span-3 p-4 md:p-6 space-y-4 overflow-y-auto ${
            activeTab === 'details' ? 'block' : 'hidden md:block'
          }`}>
            {/* Admin Status Pill Bar */}
            {isAdmin && (
              <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6c6a64] uppercase tracking-wider">
                    จัดการสถานะงาน (Admin Status)
                  </span>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditDraft({
                        project: issue.project,
                        description: issue.description,
                        section: issue.section,
                        priority: issue.priority,
                      });
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#cc785c] hover:underline"
                  >
                    <Edit3 size={11} />
                    <span>{isEditing ? 'ยกเลิกแก้ไข' : 'แก้ไขข้อมูล'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STATUS_OPTIONS.map(st => (
                    <button
                      key={st}
                      onClick={() => onStatusChange(issue.id, st)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all md3-state-layer ${
                        issue.status === st
                          ? 'bg-[#cc785c] text-white border-[#cc785c] shadow-xs'
                          : 'bg-[#faf9f5] text-[#3d3d3a] border-[#e6dfd8] hover:bg-[#efe9de]'
                      }`}
                    >
                      {STATUS_LABELS[st] || st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Content OR Display Mode */}
            {isEditing ? (
              <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 space-y-3 fade-scale-in">
                <h4 className="font-bold text-xs text-[#141413]">แก้ไขข้อมูลปัญหา</h4>
                <div>
                  <label className="block text-[10px] font-bold text-[#6c6a64] mb-1">หัวข้อ</label>
                  <input
                    type="text"
                    value={editDraft.project}
                    onChange={e => setEditDraft({ ...editDraft, project: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-white text-[#141413] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#6c6a64] mb-1">รายละเอียด</label>
                  <textarea
                    rows={4}
                    value={editDraft.description}
                    onChange={e => setEditDraft({ ...editDraft, description: e.target.value })}
                    className="w-full p-3 text-xs rounded-xl border border-[#e6dfd8] bg-white text-[#141413] outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6c6a64] mb-1">แผนก</label>
                    <select
                      value={editDraft.section}
                      onChange={e => setEditDraft({ ...editDraft, section: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl border border-[#e6dfd8] bg-white text-[#141413]"
                    >
                      {SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6c6a64] mb-1">ความสำคัญ</label>
                    <select
                      value={editDraft.priority}
                      onChange={e => setEditDraft({ ...editDraft, priority: e.target.value as PriorityType })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl border border-[#e6dfd8] bg-white text-[#141413]"
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="w-full py-2 bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check size={14} />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif-claude text-xl font-bold text-[#141413] leading-snug">
                    {issue.project}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#8e8b82] mt-1.5">
                    <Clock size={13} />
                    <span>แจ้งเมื่อ: {issue.timestamp}</span>
                  </div>
                </div>

                <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-[#6c6a64] uppercase tracking-wider block mb-1">
                    คำอธิบายปัญหา
                  </span>
                  <p className="text-xs text-[#3d3d3a] leading-relaxed whitespace-pre-line">
                    {issue.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-[#f5f0e8] border border-[#e6dfd8] p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-[#8e8b82] uppercase tracking-wider block">
                      ผู้แจ้ง
                    </span>
                    <span className="text-xs font-semibold text-[#141413] mt-0.5 block truncate">
                      {issue.reporter}
                    </span>
                  </div>

                  <div className="bg-[#f5f0e8] border border-[#e6dfd8] p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-[#8e8b82] uppercase tracking-wider block">
                      แผนก
                    </span>
                    <span className="text-xs font-semibold text-[#141413] mt-0.5 block truncate">
                      แผนก {issue.section}
                    </span>
                  </div>

                  <div className="bg-[#f5f0e8] border border-[#e6dfd8] p-3 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-[#8e8b82] uppercase tracking-wider block">
                      หมวดหมู่
                    </span>
                    <span className="text-xs font-semibold text-[#141413] mt-0.5 block truncate">
                      {issue.category}
                    </span>
                  </div>
                </div>

                {/* Attachments Section */}
                {issue.files && issue.files.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
                      <Paperclip size={13} className="text-[#cc785c]" />
                      <span>ไฟล์แนบ ({issue.files.length})</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {issue.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#f5f0e8] hover:bg-[#efe9de] border border-[#e6dfd8] flex items-center justify-between gap-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {file.thumbnail ? (
                              <img src={file.thumbnail} alt={file.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#e6dfd8]" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center shrink-0">
                                <FileText size={15} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#141413] truncate group-hover:text-[#cc785c] transition-colors">
                                {file.name}
                              </p>
                              <span className="text-[10px] text-[#8e8b82]">คลิกเพื่อเปิดดู</span>
                            </div>
                          </div>
                          <Download size={13} className="text-[#8e8b82] group-hover:text-[#cc785c] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Chat (2 cols) */}
          <div className={`md:col-span-2 flex flex-col bg-[#faf9f5] h-full ${
            activeTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Chat header */}
            <div className="px-4 py-3 bg-[#f5f0e8] border-b border-[#e6dfd8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[#cc785c]" />
                <span className="text-xs font-bold text-[#141413]">ข้อความโต้ตอบ</span>
              </div>
              <span className="text-[10px] text-[#8e8b82] font-mono-code">
                {issue.chat?.length || 0} messages
              </span>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[250px] max-h-[420px] bg-[#faf9f5]">
              {(!issue.chat || issue.chat.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#8e8b82]">
                  <MessageSquare size={24} className="mb-2 opacity-50" />
                  <p className="text-xs font-semibold">ยังไม่มีข้อความ</p>
                  <p className="text-[11px] mt-0.5">พิมพ์ข้อความด้านล่างเพื่อสนทนากับเจ้าหน้าที่</p>
                </div>
              ) : (
                issue.chat.map((msg, i) => {
                  if (msg.type === 'status') {
                    return (
                      <div key={i} className="flex items-center justify-center my-2">
                        <span className="px-3 py-1 rounded-full bg-[#efe9de] text-[#6c6a64] text-[10px] font-semibold flex items-center gap-1.5 border border-[#e6dfd8]">
                          <span>{msg.message}</span>
                          <span className="text-[#8e8b82]">· {msg.time}</span>
                        </span>
                      </div>
                    );
                  }

                  const isMe = isAdmin ? msg.sender === 'Admin' : msg.sender !== 'Admin';

                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[85%]">
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-[#141413] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {msg.sender.charAt(0)}
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#cc785c] text-white rounded-br-xs shadow-2xs'
                              : 'bg-[#f5f0e8] border border-[#e6dfd8] text-[#141413] rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.message}</p>
                          {msg.files && msg.files.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.files.map((f, fi) => (
                                <a
                                  key={fi}
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-semibold underline ${
                                    isMe ? 'bg-white/15 text-white' : 'bg-[#efe9de] text-[#141413]'
                                  }`}
                                >
                                  <Paperclip size={10} />
                                  <span className="truncate max-w-[140px]">{f.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`text-[9px] text-[#8e8b82] px-2 ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.time} · {msg.sender}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatSubmit} className="p-3 bg-[#f5f0e8] border-t border-[#e6dfd8] space-y-2">
              {chatFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {chatFiles.map((f, fi) => (
                    <span
                      key={fi}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#efe9de] text-[#141413] text-[10px] border border-[#e6dfd8]"
                    >
                      <Paperclip size={10} />
                      <span className="truncate max-w-[100px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setChatFiles(prev => prev.filter((_, idx) => idx !== fi))}
                        className="text-[#8e8b82] hover:text-[#c64545]"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <label className="p-2 rounded-xl text-[#8e8b82] hover:text-[#141413] hover:bg-[#efe9de] cursor-pointer transition-colors shrink-0">
                  <Paperclip size={16} />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleChatFileSelect}
                  />
                </label>

                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() && chatFiles.length === 0}
                  className="p-2 rounded-xl bg-[#cc785c] hover:bg-[#b8674d] text-white disabled:opacity-40 transition-colors shrink-0 md3-state-layer shadow-xs"
                  title="ส่งข้อความ"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
