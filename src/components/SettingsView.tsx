import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  RotateCcw, 
  Check, 
  Sparkles,
  UploadCloud,
  ChevronLeft
} from 'lucide-react';
import { UISettings } from '../types';
import { DEFAULT_UI_SETTINGS } from '../data/mockData';

interface SettingsViewProps {
  settings: UISettings;
  onSaveSettings: (settings: UISettings) => void;
  onResetSettings: () => void;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const PRESET_PRIMARY_COLORS = [
  { name: 'Claude Coral (Default)', value: '#cc785c' },
  { name: 'DAIHEN Navy', value: '#1e4a8c' },
  { name: 'Forest Green', value: '#166534' },
  { name: 'Deep Indigo', value: '#3730a3' },
  { name: 'Deep Purple', value: '#4c1d95' },
  { name: 'Warm Amber', value: '#b45309' },
  { name: 'Dark Slate', value: '#1e293b' },
  { name: 'Teal Green', value: '#0f766e' },
];

const PRESET_ACCENT_COLORS = [
  { name: 'Claude Dark Navy (Default)', value: '#181715' },
  { name: 'DAIHEN Red', value: '#b91c1c' },
  { name: 'Bright Orange', value: '#c2410c' },
  { name: 'Teal Accent', value: '#5db8a6' },
  { name: 'Rose Red', value: '#be123c' },
  { name: 'Emerald', value: '#5db872' },
];

const BG_STYLES: { id: 'canvas' | 'mesh' | 'solid' | 'gradient' | 'dark' | 'custom'; label: string; desc: string }[] = [
  { id: 'canvas', label: 'Claude Cream (Default)', desc: 'โทนสีครีมอุ่นสบายตา สไตล์ Claude' },
  { id: 'mesh', label: 'Mesh Animated Gradient', desc: 'ไล่ระดับสีกึ่งโปร่งแสง มีชีวิตชีวา' },
  { id: 'solid', label: 'Clean Solid Surface', desc: 'สีพื้นเรียบ สะอาด สบายตา' },
  { id: 'dark', label: 'Dark Product Mode', desc: 'โทนสีเข้มพรีเมียม สไตล์ Developer' },
  { id: 'custom', label: 'Custom Color', desc: 'เลือกสีพื้นหลังตามต้องการ' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetSettings,
  onBack,
  showToast,
}) => {
  const [draft, setDraft] = useState<UISettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateDraft = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSaveSettings(draft);
    setHasChanges(false);
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  const handleReset = () => {
    if (confirm('คุณต้องการคืนค่าการตั้งค่าทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      onResetSettings();
      setDraft(DEFAULT_UI_SETTINGS);
      setHasChanges(false);
      showToast('รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นแล้ว');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      showToast('ขนาดไฟล์โลโก้ต้องไม่เกิน 500KB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      updateDraft('logoDataUrl', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all md3-state-layer"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="font-serif-claude text-xl md:text-2xl font-bold text-[#141413]">
              การตั้งค่าระบบ (System Configuration)
            </h2>
            <p className="text-xs text-[#6c6a64] mt-0.5">
              ปรับแต่งรูปลักษณ์ แบรนด์ และเปิด/ปิดฟีเจอร์ของระบบ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-[#e6dfd8] bg-[#f5f0e8] hover:bg-[#efe9de] text-[#6c6a64] text-xs font-semibold transition-all md3-state-layer"
          >
            รีเซ็ต
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all md3-state-layer ${
              hasChanges ? 'bg-[#cc785c] hover:bg-[#b8674d]' : 'bg-[#181715] hover:bg-[#252320]'
            }`}
          >
            <Check size={14} />
            <span>{hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึก'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* ── 1. Logo & Brand Title ─────────────────────────────── */}
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6dfd8]">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <ImageIcon size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-bold text-[#141413]">
              โลโก้และชื่อองค์กร
            </h3>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#faf9f5] border-2 border-dashed border-[#e6dfd8] flex items-center justify-center overflow-hidden shrink-0">
              {draft.logoDataUrl ? (
                <img src={draft.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center text-[#8e8b82]">
                  <UploadCloud size={20} className="mx-auto mb-1 text-[#cc785c]" />
                  <span className="text-[9px] font-bold block">DEFAULT</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <label className="block">
                <span className="font-semibold text-[#141413] block mb-1">อัปโหลดภาพโลโก้</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-[11px] text-[#6c6a64] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#efe9de] file:text-[#141413] hover:file:bg-[#e6dfd8] cursor-pointer"
                />
              </label>
              {draft.logoDataUrl && (
                <button
                  onClick={() => updateDraft('logoDataUrl', '')}
                  className="text-[11px] text-[#c64545] hover:underline"
                >
                  ลบภาพโลโก้
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#6c6a64] mb-1">
                ชื่อบรรทัดที่ 1 (หลัก)
              </label>
              <input
                type="text"
                value={draft.sidebarLabelLine1}
                onChange={e => updateDraft('sidebarLabelLine1', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6c6a64] mb-1">
                ชื่อบรรทัดที่ 2 (รอง)
              </label>
              <input
                type="text"
                value={draft.sidebarLabelLine2}
                onChange={e => updateDraft('sidebarLabelLine2', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Brand Colors Palette ───────────────────────────── */}
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6dfd8]">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <Palette size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-bold text-[#141413]">
              ชุดสีหลักของระบบ (Brand Palette)
            </h3>
          </div>

          {/* Primary color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141413]">สีหลัก (Primary Accent)</span>
              <div className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#6c6a64]">
                <span className="w-4 h-4 rounded-full border border-[#e6dfd8]" style={{ backgroundColor: draft.primaryColor }} />
                <span>{draft.primaryColor}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRIMARY_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => updateDraft('primaryColor', c.value)}
                  className={`w-7 h-7 rounded-lg transition-transform md3-state-layer ${
                    draft.primaryColor === c.value ? 'ring-2 ring-offset-2 ring-[#141413] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="space-y-2 pt-2 border-t border-[#e6dfd8]/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141413]">สีเน้น (Dark Surface / Secondary)</span>
              <div className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#6c6a64]">
                <span className="w-4 h-4 rounded-full border border-[#e6dfd8]" style={{ backgroundColor: draft.accentColor }} />
                <span>{draft.accentColor}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => updateDraft('accentColor', c.value)}
                  className={`w-7 h-7 rounded-lg transition-transform md3-state-layer ${
                    draft.accentColor === c.value ? 'ring-2 ring-offset-2 ring-[#141413] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Background Style ───────────────────────────────── */}
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6dfd8]">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <Sparkles size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-bold text-[#141413]">
              สไตล์พื้นหลัง (Background Tone)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {BG_STYLES.map(bg => (
              <label
                key={bg.id}
                onClick={() => updateDraft('bgStyle', bg.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  draft.bgStyle === bg.id
                    ? 'bg-[#efe9de] border-[#cc785c] font-semibold text-[#141413] shadow-xs'
                    : 'bg-[#faf9f5] border-[#e6dfd8] text-[#3d3d3a] hover:bg-[#efe9de]/50'
                }`}
              >
                <div>
                  <div className="text-xs">{bg.label}</div>
                  <div className="text-[10px] text-[#8e8b82]">{bg.desc}</div>
                </div>
                <input
                  type="radio"
                  name="bgStyle"
                  checked={draft.bgStyle === bg.id}
                  onChange={() => updateDraft('bgStyle', bg.id)}
                  className="accent-[#cc785c]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* ── 4. Typography Scale & Modules ─────────────────────── */}
        <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-2xl p-4 md:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6dfd8]">
            <div className="w-7 h-7 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <Type size={15} />
            </div>
            <h3 className="font-serif-claude text-sm font-bold text-[#141413]">
              ขนาดตัวอักษร &amp; โมดูลเสริม
            </h3>
          </div>

          {/* Font scale */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#141413] block">
              ระดับขนาดฟอนต์ (Font Scale)
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['compact', 'normal', 'large'] as const).map(scale => (
                <button
                  key={scale}
                  onClick={() => updateDraft('fontScale', scale)}
                  className={`py-2 rounded-xl border font-semibold text-center transition-all ${
                    draft.fontScale === scale
                      ? 'bg-[#181715] text-[#faf9f5] border-[#181715] shadow-xs'
                      : 'bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8] hover:bg-[#efe9de]'
                  }`}
                >
                  <span className="block text-sm font-bold">Aa</span>
                  <span className="text-[10px] capitalize">{scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Module Toggles */}
          <div className="space-y-2 pt-3 border-t border-[#e6dfd8]/60">
            <span className="text-xs font-semibold text-[#141413] block">
              เปิดใช้งานโมดูลเสริม (Modules)
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f5] border border-[#e6dfd8]">
              <div>
                <span className="text-xs font-bold text-[#141413] block">ตารางงานการผลิต (Schedules)</span>
                <span className="text-[10px] text-[#8e8b82]">แสดงเมนูและบอร์ดตารางงานการผลิต</span>
              </div>
              <input
                type="checkbox"
                checked={draft.modulesEnabled?.schedules ?? true}
                onChange={e =>
                  updateDraft('modulesEnabled', {
                    ...draft.modulesEnabled,
                    schedules: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded accent-[#cc785c] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
