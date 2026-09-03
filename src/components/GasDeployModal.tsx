import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Cloud, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { isGAS } from '../services/gasService';

interface GasDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const GasDeployModal: React.FC<GasDeployModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'html' | 'gs' | 'deeplink'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedGsFile, setSelectedGsFile] = useState<string>('Code.gs');
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);

  if (!isOpen) return null;

  const connectedToGAS = isGAS();

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`คัดลอก ${label} เรียบร้อยแล้ว`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadIndexHtml = () => {
    setIsLoadingHtml(true);
    fetch('/index.html')
      .then(res => res.text())
      .then(content => {
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('ดาวน์โหลด index.html เรียบร้อย');
      })
      .catch(() => {
        showToast('ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง', 'error');
      })
      .finally(() => {
        setIsLoadingHtml(false);
      });
  };

  const gsFilesList = [
    { name: 'Code.gs', desc: 'ฟังก์ชันหลัก doGet, getIssues, saveIssue, updateStatus, addChat' },
    { name: 'EmailService.gs', desc: 'ระบบส่งอีเมลแจ้งเตือนอัตโนมัติ (MailApp)' },
    { name: 'FileService.gs', desc: 'อัปโหลดไฟล์/รูปภาพ Base64 ไปยัง Google Drive' },
    { name: 'ScheduleService.gs', desc: 'ระบบแผนการผลิต ดึงและอัปเดตชีต Q_SchedulesForUpdate' },
    { name: 'Settings.gs', desc: 'จัดการธีม (PropertiesService) และข้อมูลระบบ' },
    { name: 'Triggers.gs', desc: 'Trigger ตรวจสอบงานค้างรับเรื่องเกิน 24 ชม. อัตโนมัติ' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#181715]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#e6dfd8] bg-[#f5f0e8]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cc785c]/10 text-[#cc785c] flex items-center justify-center border border-[#cc785c]/20 shrink-0">
              <Cloud size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif-claude font-bold text-[#141413]">
                  Google Apps Script (GAS) Deploy Center
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  connectedToGAS 
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]' 
                    : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connectedToGAS ? 'bg-[#10b981]' : 'bg-[#d97706]'}`}></span>
                  {connectedToGAS ? 'Live on GAS' : 'Ready to Deploy'}
                </span>
              </div>
              <p className="text-xs text-[#6c6a64] mt-0.5">
                ศูนย์กลางส่งออกโค้ดและวิธีนำไปใช้งานบน Google Apps Script แบบครบวงจร
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6c6a64] hover:text-[#141413] hover:bg-[#e6dfd8] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-[#cc785c] text-[#cc785c]'
                : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>1. ขั้นตอนติดตั้ง (4 Steps)</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'html'
                ? 'border-[#cc785c] text-[#cc785c]'
                : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
            }`}
          >
            <Layers size={15} />
            <span>2. ไฟล์ index.html</span>
          </button>
          <button
            onClick={() => setActiveTab('gs')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'gs'
                ? 'border-[#cc785c] text-[#cc785c]'
                : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
            }`}
          >
            <FileCode size={15} />
            <span>3. ไฟล์สคริปต์ (.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('deeplink')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'deeplink'
                ? 'border-[#cc785c] text-[#cc785c]'
                : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
            }`}
          >
            <Terminal size={15} />
            <span>4. ลิงก์ตรง (Deep Link)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: 4 STEPS GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-[#f5f0e8] border border-[#e6dfd8] rounded-xl p-4 text-xs sm:text-sm text-[#42403d] leading-relaxed">
                🎉 โค้ดทั้งหมดได้รับการปรับปรุงให้ทำงานร่วมกันอย่างสมบูรณ์แบบทั้ง <b>Google Apps Script</b> และ <b>Web App UI</b> รองรับการอัปโหลดไฟล์เข้า Google Drive, ส่งอีเมลแจ้งเตือนอัตโนมัติ และซิงค์ Google Sheets ทันที
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#181715] text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="text-sm font-bold text-[#141413]">เปิดโปรเจกต์ Google Apps Script</h3>
                  </div>
                  <p className="text-xs text-[#6c6a64]">
                    เปิดชีตของคุณ แล้วไปที่เมนู <b>Extensions &gt; Apps Script</b> หรือเข้าที่ <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-[#cc785c] underline font-medium inline-flex items-center gap-0.5">script.google.com <ExternalLink size={10} /></a>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#181715] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="text-sm font-bold text-[#141413]">วางไฟล์ .gs ทั้ง 6 ไฟล์</h3>
                  </div>
                  <p className="text-xs text-[#6c6a64]">
                    สร้างไฟล์สคริปต์ตามแท็บ <b>"3. ไฟล์สคริปต์ (.gs)"</b> ได้แก่ Code, EmailService, FileService, ScheduleService, Settings, Triggers
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#181715] text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h3 className="text-sm font-bold text-[#141413]">สร้างไฟล์ index.html ใน GAS</h3>
                  </div>
                  <p className="text-xs text-[#6c6a64]">
                    ใน Apps Script กด <b>+ &gt; HTML</b> ตั้งชื่อ <code>index</code> แล้วคัดลอกโค้ดจากแท็บ <b>"2. ไฟล์ index.html"</b> ไปวาง
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#cc785c] text-white text-xs font-bold flex items-center justify-center">4</span>
                    <h3 className="text-sm font-bold text-[#141413]">Deploy เป็น Web App</h3>
                  </div>
                  <p className="text-xs text-[#6c6a64]">
                    กด <b>Deploy &gt; New deployment &gt; Web app</b>:<br />
                    • <b>Execute as:</b> Me (ฉัน)<br />
                    • <b>Who has access:</b> Anyone (ทุกคน)
                  </p>
                </div>
              </div>

              {/* Tips & Safety */}
              <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-start gap-3 text-xs text-[#065f46]">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 text-[#10b981]" />
                <div>
                  <div className="font-bold text-sm mb-0.5">ทำงานได้ทันทีโดยไม่ต้องตั้งค่า CORS หรือ Server เพิ่มเติม</div>
                  ระบบใช้สถาปัตยกรรม <code>google.script.run</code> ร่วมกับ <code>LockService</code> จึงปลอดภัยจากข้อมูลชนกัน และรองรับการใช้งานพร้อมกันจากอุปกรณ์มือถือและแท็บเล็ตได้ราบรื่น
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDEX.HTML SINGLE-FILE */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#e6dfd8]">
                <div>
                  <h3 className="text-sm font-bold text-[#141413] flex items-center gap-2">
                    <Layers size={16} className="text-[#cc785c]" />
                    ไฟล์ index.html สำหรับ Google Apps Script
                  </h3>
                  <p className="text-xs text-[#6c6a64] mt-0.5">
                    ไฟล์นี้รวมทั้ง HTML, CSS (Tailwind), JavaScript, ไอคอน Lucide และฟอนต์ไว้ในไฟล์เดียว (Single-file) พร้อมนำไปวางใน Apps Script ได้ทันที
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadIndexHtml}
                    disabled={isLoadingHtml}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#f5f0e8] hover:bg-[#efe9de] text-[#141413] text-xs font-semibold rounded-lg border border-[#e6dfd8] transition-all"
                  >
                    <Download size={14} />
                    <span>{isLoadingHtml ? 'กำลังโหลด...' : 'ดาวน์โหลด index.html'}</span>
                  </button>
                  <button
                    onClick={() => {
                      fetch('/index.html')
                        .then(r => r.text())
                        .then(code => handleCopy(code, 'html-bundle', 'โค้ด index.html'));
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
                  >
                    {copiedKey === 'html-bundle' ? <Check size={14} /> : <Copy size={14} />}
                    <span>คัดลอกโค้ด index.html</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f5f0e8] border border-[#e6dfd8] text-xs text-[#42403d] space-y-2">
                <div className="font-semibold text-sm text-[#141413]">📌 วิธีนำไปใส่ใน Apps Script:</div>
                <ol className="list-decimal list-inside space-y-1 text-[#6c6a64]">
                  <li>ใน Apps Script เมนูด้านซ้าย กดปุ่มเครื่องหมายบวก <b>(+)</b> ข้างคำว่า Files</li>
                  <li>เลือก <b>HTML</b> แล้วตั้งชื่อไฟล์ว่า <code>index</code> (ไม่ต้องพิมพ์ .html)</li>
                  <li>ลบโค้ดเดิมทั้งหมดในไฟล์ index แล้ววางโค้ดที่คัดลอกจากปุ่มด้านบนลงไป</li>
                  <li>กดปุ่ม <b>บันทึก (Ctrl+S)</b></li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: GS FILES */}
          {activeTab === 'gs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gsFilesList.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedGsFile(f.name)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedGsFile === f.name
                        ? 'bg-[#181715] text-[#faf9f5] border-[#181715] shadow-xs'
                        : 'bg-white text-[#141413] border-[#e6dfd8] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono truncate">{f.name}</div>
                    <div className={`text-[10px] truncate ${selectedGsFile === f.name ? 'text-[#8e8b82]' : 'text-[#6c6a64]'}`}>
                      {f.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* GS Code Box */}
              <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#141413]">{selectedGsFile}</span>
                    <span className="text-xs text-[#6c6a64] ml-2">
                      (จัดเก็บไว้ในโฟลเดอร์ <code>/gas/{selectedGsFile}</code> ในโปรเจกต์)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      fetch(`/gas/${selectedGsFile}`)
                        .then(r => r.text())
                        .then(code => handleCopy(code, selectedGsFile, selectedGsFile));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f0e8] hover:bg-[#efe9de] text-[#141413] text-xs font-semibold rounded-lg border border-[#e6dfd8] transition-all"
                  >
                    {copiedKey === selectedGsFile ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                    <span>คัดลอกไฟล์นี้</span>
                  </button>
                </div>

                <div className="bg-[#181715] text-[#e6dfd8] p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-64 leading-relaxed">
                  <pre>{`// โค้ดสำหรับไฟล์ ${selectedGsFile}
// สามารถดูไฟล์ต้นฉบับได้ที่ /gas/${selectedGsFile} ในโครงการ
// กดปุ่ม "คัดลอกไฟล์นี้" ด้านบนเพื่อนำโค้ดไปวางใน Google Apps Script`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEEP LINK TESTER */}
          {activeTab === 'deeplink' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-[#e6dfd8] space-y-3">
                <h3 className="text-sm font-bold text-[#141413]">
                  ทดสอบระบบเปิดเคสตรงผ่าน URL (Deep Linking)
                </h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  คุณสามารถสร้างลิงก์ที่เปิดไปยังหน้ารายละเอียดของเคสได้ทันที เช่น ส่งในอีเมลหรือแชท LINE:
                </p>
                
                <div className="p-3 bg-[#f5f0e8] rounded-lg border border-[#e6dfd8] font-mono text-xs text-[#141413] break-all flex items-center justify-between gap-2">
                  <span>{window.location.origin}/?issue=ISS-2026001</span>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/?issue=ISS-2026001`, 'deeplink-demo', 'ลิงก์ตัวอย่าง')}
                    className="shrink-0 p-1.5 rounded hover:bg-[#e6dfd8] transition-colors"
                    title="คัดลอกลิงก์"
                  >
                    {copiedKey === 'deeplink-demo' ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="text-xs text-[#6c6a64] space-y-1">
                  <div>• เมื่อใช้งานบน Web App ของ Google Apps Script ลิงก์จะเป็นรูปแบบ:</div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-[#e6dfd8] text-[#181715]">
                    https://script.google.com/macros/s/AKfycb.../exec?issue=ISS-2026001
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 border-t border-[#e6dfd8] bg-[#f5f0e8]/50 flex items-center justify-between">
          <div className="text-xs text-[#6c6a64]">
            💡 ไฟล์ .gs และ README ถูกบันทึกไว้ในโฟลเดอร์ <code>/gas</code> แล้ว
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#181715] hover:bg-[#2d2c29] text-white text-xs font-semibold rounded-lg transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
