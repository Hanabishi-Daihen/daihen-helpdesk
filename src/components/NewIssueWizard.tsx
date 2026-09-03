import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Trash2, 
  AlertCircle, 
  User, 
  Mail, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  RotateCcw,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Issue, PriorityType, FileAttachment } from '../types';
import { SECTIONS, CATEGORIES, PRIORITY_OPTIONS } from '../data/mockData';

interface NewIssueWizardProps {
  onCancel: () => void;
  onSubmit: (newIssue: Partial<Issue>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const DRAFT_KEY = 'helpdesk_form_draft_claude';

export const NewIssueWizard: React.FC<NewIssueWizardProps> = ({
  onCancel,
  onSubmit,
  showToast,
}) => {
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const FORM_DEFAULTS = {
    project: '',
    description: '',
    reporter: '',
    reporterEmail: '',
    section: 'MF',
    category: 'อุปกรณ์ไม่มีติดตั้ง',
    priority: 'Medium' as PriorityType,
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return { ...FORM_DEFAULTS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return { ...FORM_DEFAULTS };
  });

  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [draftRestored, setDraftRestored] = useState(() => {
    try {
      return !!localStorage.getItem(DRAFT_KEY);
    } catch (e) {
      return false;
    }
  });

  // Auto-save draft
  useEffect(() => {
    const hasContent = formData.project || formData.description || formData.reporter;
    if (hasContent) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch (e) {}
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [formData]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    setFormData({ ...FORM_DEFAULTS });
    setFiles([]);
    setDraftRestored(false);
    showToast('ล้างข้อมูลฟอร์มเรียบร้อย');
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.project.trim()) {
        showToast('กรุณาระบุหัวข้อหรือโปรเจกต์', 'error');
        return false;
      }
      if (!formData.description.trim()) {
        showToast('กรุณาระบุรายละเอียดปัญหา', 'error');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.reporter.trim()) {
        showToast('กรุณาระบุชื่อผู้แจ้ง', 'error');
        return false;
      }
    }
    return true;
  };

  const goToStep = (step: 1 | 2 | 3) => {
    if (step > formStep && !validateStep(formStep)) return;
    setFormStep(step);
  };

  const handleFileSelection = (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > 4) {
      showToast('สามารถแนบไฟล์ได้สูงสุด 4 ไฟล์', 'error');
      return;
    }

    const oversized = selectedFiles.some(f => f.size > 20 * 1024 * 1024);
    if (oversized) {
      showToast('มีไฟล์ขนาดเกิน 20MB กรุณาเลือกไฟล์ที่เล็กกว่านี้', 'error');
      return;
    }

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        setFiles(prev => [
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        ...formData,
        files,
        timestamp: new Date().toLocaleString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        reportedDate: new Date().toISOString().split('T')[0],
      });

      // Clear draft
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#cc785c', '#5db872', '#1e4a8c', '#e8a55a'],
        });
      } catch (e) {}

      setIsSubmitting(false);
    }, 400);
  };

  const STEPS = [
    { id: 1, label: 'รายละเอียดปัญหา', sub: 'Issue & Priority', icon: FileText },
    { id: 2, label: 'ข้อมูลผู้แจ้ง & ไฟล์แนบ', sub: 'Details & Attachments', icon: Paperclip },
    { id: 3, label: 'ตรวจสอบความถูกต้อง', sub: 'Review & Confirm', icon: FileCheck },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all md3-state-layer"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="font-serif-claude text-xl md:text-2xl font-bold text-[#141413]">
              แจ้งปัญหาใหม่
            </h2>
            <p className="text-xs text-[#6c6a64] mt-0.5">
              กรอกข้อมูลเพื่อส่งเรื่องให้ทีมงานฝ่ายที่เกี่ยวข้องดำเนินการ
            </p>
          </div>
        </div>

        {draftRestored && (
          <button
            onClick={clearDraft}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#8e8b82] hover:text-[#c64545] transition-colors"
          >
            <RotateCcw size={12} />
            <span>ล้างฟอร์ม</span>
          </button>
        )}
      </div>

      {/* Step Progress Bar (Material 3 style) */}
      <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-3 flex items-center justify-between gap-1 shadow-2xs">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = formStep === step.id;
          const isDone = formStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => goToStep(step.id as 1 | 2 | 3)}
                className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-[#efe9de] text-[#141413] font-bold shadow-2xs ring-1 ring-[#cc785c]'
                    : isDone
                    ? 'text-[#5db872] font-semibold'
                    : 'text-[#8e8b82] font-medium'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    isActive
                      ? 'bg-[#cc785c] text-white'
                      : isDone
                      ? 'bg-[#5db872] text-white'
                      : 'bg-[#e6dfd8] text-[#6c6a64]'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={13} /> : step.id}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-[11px] truncate leading-tight">{step.label}</div>
                  <div className="text-[9px] text-[#8e8b82] truncate leading-tight">{step.sub}</div>
                </div>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-4 rounded-full shrink-0 ${isDone ? 'bg-[#5db872]' : 'bg-[#e6dfd8]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-6 shadow-2xs space-y-5">
        {/* ── STEP 1: Details & Priority ────────────────────────── */}
        {formStep === 1 && (
          <div className="space-y-4 fade-scale-in">
            {/* Priority Selection */}
            <div>
              <label className="block text-xs font-bold text-[#141413] mb-2">
                ระดับความสำคัญ <span className="text-[#c64545]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map(p => {
                  const isSelected = formData.priority === p.value;
                  let PriorityIcon = Minus;
                  if (p.value === 'Urgent') PriorityIcon = Flame;
                  else if (p.value === 'High') PriorityIcon = ArrowUp;
                  else if (p.value === 'Low') PriorityIcon = ArrowDown;

                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.value as PriorityType })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all md3-state-layer ${
                        isSelected
                          ? `${p.bg} ${p.border} ${p.color} ring-2 ring-offset-1 ring-[#cc785c]/40 shadow-xs scale-102`
                          : 'bg-[#faf9f5] border-[#e6dfd8] text-[#6c6a64] hover:bg-[#efe9de]'
                      }`}
                    >
                      <PriorityIcon size={16} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project / Title */}
            <div>
              <label className="block text-xs font-bold text-[#141413] mb-1.5">
                หัวข้อปัญหา / โปรเจกต์ <span className="text-[#c64545]">*</span>
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                placeholder="เช่น เครื่องพิมพ์บาร์โค้ดสายผลิต 3 ไม่ทำงาน"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#141413] mb-1.5">
                รายละเอียดปัญหา <span className="text-[#c64545]">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายอาการของปัญหา รหัสเครื่องจักร ตำแหน่งที่เกิดเหตุ หรือขั้นตอนที่พบปัญหาโดยละเอียด..."
                className="w-full p-3.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] resize-none transition-colors leading-relaxed"
                required
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Department, Reporter & Attachments ────────── */}
        {formStep === 2 && (
          <div className="space-y-4 fade-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1.5">
                  แผนกที่รับผิดชอบ <span className="text-[#c64545]">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] focus:bg-white focus:border-[#cc785c] outline-none transition-colors"
                >
                  {SECTIONS.map(s => (
                    <option key={s} value={s}>
                      แผนก {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1.5">
                  หมวดหมู่ปัญหา <span className="text-[#c64545]">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] focus:bg-white focus:border-[#cc785c] outline-none transition-colors"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reporter Name */}
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1.5">
                  ชื่อผู้แจ้ง <span className="text-[#c64545]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.reporter}
                    onChange={e => setFormData({ ...formData, reporter: e.target.value })}
                    placeholder="ระบุชื่อ-นามสกุล หรือรหัสพนักงาน"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] transition-colors"
                    required
                  />
                  <User size={14} className="absolute left-3 top-3 text-[#8e8b82]" />
                </div>
              </div>

              {/* Reporter Email */}
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1.5">
                  อีเมลผู้แจ้ง <span className="text-[10px] text-[#8e8b82] font-normal">(รับการแจ้งเตือนสถานะ)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.reporterEmail}
                    onChange={e => setFormData({ ...formData, reporterEmail: e.target.value })}
                    placeholder="your.email@daihen.co.th"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white focus:border-[#cc785c] outline-none text-[#141413] transition-colors"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-[#8e8b82]" />
                </div>
              </div>
            </div>

            {/* File Upload with Drag & Drop */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#141413]">
                  แนบไฟล์ภาพถ่ายหรือเอกสาร
                </label>
                <span className="text-[10px] text-[#8e8b82]">
                  สูงสุด 4 ไฟล์ (ไม่เกิน 20MB/ไฟล์)
                </span>
              </div>

              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-[#cc785c] bg-[#efe9de]'
                    : 'border-[#e6dfd8] bg-[#faf9f5] hover:bg-[#efe9de]/50'
                }`}
                onClick={() => document.getElementById('wizard-file-input')?.click()}
              >
                <input
                  id="wizard-file-input"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) {
                      handleFileSelection(Array.from(e.target.files));
                    }
                  }}
                />
                <UploadCloud size={24} className="mx-auto text-[#cc785c] mb-1.5" />
                <p className="text-xs font-bold text-[#141413]">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[10px] text-[#8e8b82] mt-0.5">
                  รองรับไฟล์รูปภาพ PNG, JPG, JPEG และเอกสาร PDF
                </p>
              </div>

              {/* Uploaded Files Preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#efe9de] border border-[#e6dfd8] text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {file.thumbnail ? (
                          <img src={file.thumbnail} alt={file.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#e6dfd8]" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center shrink-0">
                            <Paperclip size={14} />
                          </div>
                        )}
                        <span className="font-medium text-[#141413] truncate max-w-[150px]">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 text-[#8e8b82] hover:text-[#c64545] transition-colors"
                        title="ลบไฟล์นี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Summary ─────────────────────────── */}
        {formStep === 3 && (
          <div className="space-y-4 fade-scale-in">
            <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6c6a64]">ระดับความสำคัญ:</span>
                <span className="font-bold text-[#cc785c]">
                  {PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
              <div className="border-t border-[#e6dfd8]/60 pt-2">
                <span className="text-[#6c6a64] block mb-0.5">หัวข้อ / โปรเจกต์:</span>
                <span className="font-bold text-[#141413] text-sm">{formData.project}</span>
              </div>
              <div className="border-t border-[#e6dfd8]/60 pt-2">
                <span className="text-[#6c6a64] block mb-0.5">รายละเอียดปัญหา:</span>
                <p className="text-[#3d3d3a] leading-relaxed whitespace-pre-line bg-[#faf9f5] p-2.5 rounded-lg border border-[#e6dfd8]">
                  {formData.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[#e6dfd8]/60 pt-2">
                <div>
                  <span className="text-[#6c6a64] block mb-0.5">แผนก:</span>
                  <span className="font-bold text-[#141413]">แผนก {formData.section}</span>
                </div>
                <div>
                  <span className="text-[#6c6a64] block mb-0.5">หมวดหมู่:</span>
                  <span className="font-bold text-[#141413]">{formData.category}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[#e6dfd8]/60 pt-2">
                <div>
                  <span className="text-[#6c6a64] block mb-0.5">ผู้แจ้ง:</span>
                  <span className="font-bold text-[#141413]">{formData.reporter}</span>
                </div>
                <div>
                  <span className="text-[#6c6a64] block mb-0.5">อีเมล:</span>
                  <span className="font-bold text-[#141413]">{formData.reporterEmail || '-'}</span>
                </div>
              </div>
              <div className="border-t border-[#e6dfd8]/60 pt-2 flex items-center justify-between text-[#6c6a64]">
                <span>ไฟล์แนบ:</span>
                <span className="font-bold text-[#141413]">{files.length} ไฟล์</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8e8b82] text-center">
              โปรดตรวจสอบความถูกต้องของข้อมูลก่อนกดปุ่ม "ยืนยันส่งเรื่องแจ้งปัญหา"
            </p>
          </div>
        )}

        {/* Buttons Nav row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e6dfd8] gap-3">
          {formStep > 1 ? (
            <button
              type="button"
              onClick={() => goToStep((formStep - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#141413] text-xs font-semibold flex items-center gap-1.5 transition-all md3-state-layer"
            >
              <ChevronLeft size={14} />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#6c6a64] hover:text-[#141413] text-xs font-semibold transition-all md3-state-layer"
            >
              ยกเลิก
            </button>
          )}

          {formStep < 3 ? (
            <button
              type="button"
              onClick={() => goToStep((formStep + 1) as 1 | 2 | 3)}
              className="px-5 py-2 rounded-xl bg-[#cc785c] hover:bg-[#b8674d] active:bg-[#a9583e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all md3-state-layer"
            >
              <span>ถัดไป</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#cc785c] hover:bg-[#b8674d] active:bg-[#a9583e] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 md3-state-layer"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันส่งเรื่องแจ้งปัญหา'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
