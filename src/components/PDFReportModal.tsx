import React, { useRef, useState } from 'react';
import { X, Printer, Download, FileCheck, CheckCircle } from 'lucide-react';
import { Issue } from '../types';
import { STATUS_LABELS } from '../data/mockData';

interface PDFReportModalProps {
  issues: Issue[];
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  issues,
  onClose,
  showToast,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const total = issues.length;
  const pending = issues.filter(i => ['New', 'Waiting'].includes(i.status)).length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const completed = issues.filter(i => ['Resolved', 'Closed'].includes(i.status)).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    showToast('กำลังเตรียมพิมพ์หรือบันทึกเป็น PDF...');
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181715]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden fade-scale-in">
        {/* Modal Header */}
        <div className="p-4 bg-[#f5f0e8] border-b border-[#e6dfd8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#efe9de] text-[#cc785c] flex items-center justify-center">
              <Printer size={16} />
            </div>
            <div>
              <h3 className="font-serif-claude text-base font-bold text-[#141413]">
                ตัวอย่างรายงานสรุปปัญหา (Issue Report)
              </h3>
              <p className="text-[11px] text-[#6c6a64]">
                รายงานสรุปสถานะงานมาตรฐาน A4 สำหรับการพิมพ์และนำเสนอ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all md3-state-layer"
            >
              <Download size={13} />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] text-[#3d3d3a] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal A4 Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#e6dfd8]/40 flex justify-center">
          <div
            ref={reportRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-[#141413] p-8 md:p-12 rounded-xl shadow-lg border border-[#e6dfd8] flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="border-b-2 border-[#141413] pb-4 mb-6 flex items-start justify-between">
                <div>
                  <h1 className="font-serif-claude text-2xl font-bold text-[#141413] tracking-tight">
                    รายงานสรุปปัญหาและติดตามงาน (Issue Tracking Report)
                  </h1>
                  <p className="text-xs text-[#6c6a64] mt-1">
                    ระบบรับแจ้งและแก้ไขปัญหาออนไลน์ · DAIHEN Helpdesk System
                  </p>
                </div>
                <div className="text-right text-xs text-[#6c6a64]">
                  <div>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div>เวลา: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>
                </div>
              </div>

              {/* KPI Summary Block */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-center">
                  <div className="text-[10px] text-[#64748b] font-bold uppercase">ทั้งหมด</div>
                  <div className="text-xl font-bold text-[#1e4a8c]">{total}</div>
                </div>
                <div className="p-3 bg-[#fef3c7] border border-[#fde68a] rounded-xl text-center">
                  <div className="text-[10px] text-[#92400e] font-bold uppercase">รอดำเนินการ</div>
                  <div className="text-xl font-bold text-[#d97706]">{pending}</div>
                </div>
                <div className="p-3 bg-[#fbeee9] border border-[#f5b8b8] rounded-xl text-center">
                  <div className="text-[10px] text-[#a9583e] font-bold uppercase">กำลังแก้ไข</div>
                  <div className="text-xl font-bold text-[#cc785c]">{inProgress}</div>
                </div>
                <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-center">
                  <div className="text-[10px] text-[#065f46] font-bold uppercase">เสร็จสิ้นแล้ว</div>
                  <div className="text-xl font-bold text-[#10b981]">{completed}</div>
                </div>
              </div>

              {/* Issues Table */}
              <table className="w-full text-left border-collapse text-xs mb-8">
                <thead>
                  <tr className="bg-[#f1f5f9] text-[#475569] font-bold border-y border-[#cbd5e1]">
                    <th className="p-2.5 w-16 text-center">ID</th>
                    <th className="p-2.5 w-24">ความสำคัญ</th>
                    <th className="p-2.5">รายละเอียด / หัวข้อปัญหา</th>
                    <th className="p-2.5 w-24">แผนก/ผู้แจ้ง</th>
                    <th className="p-2.5 w-24">วันที่แจ้ง</th>
                    <th className="p-2.5 w-24 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {issues.map(issue => (
                    <tr key={issue.id}>
                      <td className="p-2.5 text-center font-mono font-bold text-[#1e4a8c]">
                        {issue.id}
                      </td>
                      <td className="p-2.5 font-medium">
                        {issue.priority}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-[#1e293b]">{issue.project}</div>
                        <div className="text-[11px] text-[#64748b] line-clamp-1">{issue.description}</div>
                      </td>
                      <td className="p-2.5 text-[11px]">
                        <div>{issue.section}</div>
                        <div className="text-[#64748b]">{issue.reporter}</div>
                      </td>
                      <td className="p-2.5 text-[11px] text-[#64748b]">
                        {issue.timestamp?.split(',')[0]}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-[11px]">
                        {STATUS_LABELS[issue.status] || issue.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="border-t border-[#cbd5e1] pt-8 grid grid-cols-2 gap-8 text-center text-xs text-[#475569]">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-[#94a3b8] mb-2 h-10" />
                <p className="font-bold text-[#1e293b]">ลงชื่อ ผู้จัดทำรายงาน</p>
                <p className="text-[10px] text-[#64748b]">เจ้าหน้าที่ฝ่ายปฏิบัติการ / Helpdesk</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-[#94a3b8] mb-2 h-10" />
                <p className="font-bold text-[#1e293b]">ลงชื่อ ผู้อนุมัติ / หัวหน้าแผนก</p>
                <p className="text-[10px] text-[#64748b]">ผู้จัดการฝ่ายหรือตัวแทนรับทราบ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
