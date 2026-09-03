import { Issue, ScheduleItem, ProcessInfo, UISettings } from '../types';

export const SECTIONS = ['MF', 'QC', 'Design'];
export const CATEGORIES = ['อุปกรณ์ไม่มีติดตั้ง', 'ปรับปรุง', 'แก้ไขวายริ่ง', 'NC', 'อื่นๆ'];

export const STATUS_OPTIONS: ('New' | 'Waiting' | 'In Progress' | 'Resolved' | 'Closed')[] = [
  'New',
  'Waiting',
  'In Progress',
  'Resolved',
  'Closed',
];

export const STATUS_LABELS: Record<string, string> = {
  New: 'ใหม่',
  Waiting: 'รอดำเนินการ',
  'In Progress': 'กำลังแก้ไข',
  Resolved: 'แก้ไขแล้ว',
  Closed: 'ปิดงาน',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  New: { bg: 'bg-[#eef2f9]', text: 'text-[#1e4a8c]', border: 'border-[#aec1e1]', dot: '#3a64a8' },
  Waiting: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-[#fde68a]', dot: '#d97706' },
  'In Progress': { bg: 'bg-[#f5f0e8]', text: 'text-[#a9583e]', border: 'border-[#e6dfd8]', dot: '#cc785c' },
  Resolved: { bg: 'bg-[#ecfdf5]', text: 'text-[#065f46]', border: 'border-[#a7f3d0]', dot: '#10b981' },
  Closed: { bg: 'bg-[#f3f4f6]', text: 'text-[#4b5563]', border: 'border-[#e5e7eb]', dot: '#6b7280' },
};

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'ต่ำ (Low)', color: 'text-[#5db872]', bg: 'bg-[#eaf6ec]', border: 'border-[#bfe3c8]' },
  { value: 'Medium', label: 'กลาง (Medium)', color: 'text-[#1e4a8c]', bg: 'bg-[#eef2f9]', border: 'border-[#aec1e1]' },
  { value: 'High', label: 'สูง (High)', color: 'text-[#e8a55a]', bg: 'bg-[#fdf3e7]', border: 'border-[#f7d9b5]' },
  { value: 'Urgent', label: 'ด่วนมาก (Urgent)', color: 'text-[#c64545]', bg: 'bg-[#fcebeb]', border: 'border-[#f5b8b8]' },
];

export const PRIORITY_RANK: Record<string, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const DEFAULT_UI_SETTINGS: UISettings = {
  primaryColor: '#cc785c', // Claude warm coral
  accentColor: '#181715',  // Claude dark navy surface
  bgStyle: 'canvas',
  customBg: '#faf9f5',
  fontScale: 'normal',
  logoDataUrl: '',
  sidebarLabelLine1: 'DAIHEN',
  sidebarLabelLine2: 'Helpdesk & Issues',
  modulesEnabled: {
    schedules: true,
  },
};

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'ISS-2026001',
    project: 'เครื่องพิมพ์บาร์โค้ดสายการผลิต MF-3 ไม่พิมพ์ฉลาก',
    description: 'เครื่องพิมพ์ Zebra ZT410 ที่จุดประกอบ Sub-assembly 3 หยุดทำงานหลังไฟดับช่วงเช้า ไฟสถานะกระพริบสีแดง ตรวจสอบสาย LAN แล้วเบื้องต้นยังเชื่อมต่อ IP ไม่ได้',
    reporter: 'สมศักดิ์ สายตรวจ',
    reporterEmail: 'somsak.s@daihen.co.th',
    section: 'MF',
    category: 'อุปกรณ์ไม่มีติดตั้ง',
    priority: 'Urgent',
    status: 'In Progress',
    timestamp: '02/09/2026, 08:30:15',
    reportedDate: '2026-09-02',
    files: [
      {
        name: 'zebra_printer_error.jpg',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60',
        thumbnail: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=60',
      }
    ],
    chat: [
      {
        id: 'c1',
        sender: 'สมศักดิ์ สายตรวจ',
        message: 'ตอนนี้สายการผลิตต้องหยุดชั่วคราว รบกวนช่างไอทีเข้าตรวจสอบด่วนครับ',
        time: '08:31',
        read: true,
      },
      {
        id: 'c2',
        sender: 'Admin',
        message: 'รับทราบครับ กำลังให้ทีมงานนำเครื่องสำรองไปสลับเพื่อไม่ให้ไลน์สะดุด พร้อมตรวจสอบสวิตช์ฮับตู้ที่ 3',
        time: '08:35',
        read: true,
      },
      {
        id: 'c3',
        sender: 'System',
        message: 'สถานะเปลี่ยนเป็น กำลังแก้ไข (In Progress)',
        time: '08:36',
        type: 'status',
        newStatus: 'In Progress',
      }
    ]
  },
  {
    id: 'ISS-2026002',
    project: 'พบจุดต่อสาย Wiring ตู้คอนโทรลหม้อแปลงไม่ตรง Drawing (Lot B4)',
    description: 'จากการตรวจสอบสุ่มตรวจ QC ประจำวัน พบว่าเทอร์มินอลบล็อก TB-12 หมายเลขสาย 104 และ 105 ต่อสลับเฟสในตู้ควบคุมรุ่น TX-1200 ขอให้ทาง Design ช่วยยืนยันแบบ Rev.C',
    reporter: 'วิภาดา ตรวจการ',
    reporterEmail: 'wiphada.q@daihen.co.th',
    section: 'QC',
    category: 'แก้ไขวายริ่ง',
    priority: 'High',
    status: 'Waiting',
    timestamp: '02/09/2026, 10:15:00',
    reportedDate: '2026-09-02',
    files: [
      {
        name: 'wiring_diagram_check.pdf',
        type: 'application/pdf',
        url: '#',
      }
    ],
    chat: [
      {
        id: 'c4',
        sender: 'วิภาดา ตรวจการ',
        message: 'แนบภาพถ่ายหน้างานและแบบที่ใช้ปัจจุบันให้แล้วค่ะ รอทาง Engineering ยืนยัน',
        time: '10:18',
        read: true,
      },
      {
        id: 'c5',
        sender: 'Admin',
        message: 'ประสานงานกับคุณกิตติศักดิ์ ทีม Design แล้ว กำลังตรวจสอบ revision drawing ครับ',
        time: '10:45',
        read: false,
      }
    ]
  },
  {
    id: 'ISS-2026003',
    project: 'ขอปรับปรุงระบบแจ้งเตือนก๊าซรั่วในห้องทดสอบ High Voltage',
    description: 'ต้องการเพิ่มเสียงกริ่งเตือนภายนอกห้องทดสอบ และส่งสัญญาณเตือนผ่านระบบ SCADA เมื่อเซนเซอร์ตรวจจับค่าก๊าซ SF6 เกิน 50 ppm',
    reporter: 'อนุชา ช่างชำนาญ',
    reporterEmail: 'anucha.d@daihen.co.th',
    section: 'Design',
    category: 'ปรับปรุง',
    priority: 'Medium',
    status: 'New',
    timestamp: '02/09/2026, 11:20:00',
    reportedDate: '2026-09-02',
    files: [],
    chat: []
  },
  {
    id: 'ISS-2026004',
    project: 'พบรอยขูดขีดบนสีเคลือบถังหม้อแปลงก่อนส่งมอบ (NC-2609)',
    description: 'พบรอยถลอกบริเวณหูยกด้านซ้าย ความยาวประมาณ 8 ซม. ลึกถึงชั้นเหล็กรองพื้น ต้องทำสีใหม่ตามมาตรฐาน ASTM D3359',
    reporter: 'ธนวัฒน์ พิทักษ์',
    reporterEmail: 'thanawat.p@daihen.co.th',
    section: 'QC',
    category: 'NC',
    priority: 'High',
    status: 'Resolved',
    timestamp: '01/09/2026, 14:00:22',
    reportedDate: '2026-09-01',
    files: [
      {
        name: 'tank_surface_defect.jpg',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=60',
      }
    ],
    chat: [
      {
        id: 'c6',
        sender: 'ธนวัฒน์ พิทักษ์',
        message: 'เปิดใบ NC แล้วครับ กำหนดให้แผนกพ่นสีแก้ไขภายในบ่ายนี้',
        time: '14:05',
        read: true,
      },
      {
        id: 'c7',
        sender: 'Admin',
        message: 'แผนกสีดำเนินการขัดและพ่นสีเก็บงานเรียบร้อย ผ่านการทดสอบ DFT 120 micron',
        time: '17:30',
        read: true,
      },
      {
        id: 'c8',
        sender: 'System',
        message: 'สถานะเปลี่ยนเป็น แก้ไขแล้ว (Resolved)',
        time: '17:31',
        type: 'status',
        newStatus: 'Resolved',
      }
    ]
  },
  {
    id: 'ISS-2026005',
    project: 'เครื่องตัดเลเซอร์ Fiber Laser หัวตัด Nozzle สึกหรอ',
    description: 'หัว Nozzle ทองแดงเบอร์ 1.5 มีรอยสะเก็ดเหล็กติดแน่น ทำให้การตัดเหล็กแผ่นหนา 6mm เกิดเสี้ยน (Burr) เกินมาตรฐาน',
    reporter: 'มานพ งานละเอียด',
    reporterEmail: 'manop.m@daihen.co.th',
    section: 'MF',
    category: 'อุปกรณ์ไม่มีติดตั้ง',
    priority: 'Low',
    status: 'Closed',
    timestamp: '30/08/2026, 09:12:40',
    reportedDate: '2026-08-30',
    files: [],
    chat: [
      {
        id: 'c9',
        sender: 'Admin',
        message: 'เบิกหัวตัดสำรองจากสโตร์และทำการเปลี่ยนเรียบร้อย ค่า Beam alignment ปกติ',
        time: '10:00',
        read: true,
      },
      {
        id: 'c10',
        sender: 'System',
        message: 'สถานะเปลี่ยนเป็น ปิดงาน (Closed)',
        time: '10:05',
        type: 'status',
        newStatus: 'Closed',
      }
    ]
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'ORD-701',
    title: 'Transformer 50MVA / EGAT Bangpakong',
    process: 'TO',
    processFull: 'Tank Assembly & Oil Filling',
    start: '01/09/2026',
    finish: '08/09/2026',
    purchaser: 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย',
    customer: 'EGAT',
    mva: '50 MVA',
    ratingVolt: '115/22 kV',
    newDelivery: '25/09/2026',
    actualPlanDelivery: '24/09/2026',
    notes: 'รอผลเทสความชื้นน้ำมันฉนวน'
  },
  {
    id: 'ORD-702',
    title: 'Distribution Unit 2.5MVA / Smart Grid Chonburi',
    process: 'TN',
    processFull: 'Testing & Non-destructive Check',
    start: '03/09/2026',
    finish: '10/09/2026',
    purchaser: 'บมจ. อมตะ คอร์ปอเรชัน',
    customer: 'Amata City',
    mva: '2.5 MVA',
    ratingVolt: '22 kV / 400 V',
    newDelivery: '18/09/2026',
    actualPlanDelivery: '17/09/2026',
    notes: 'ผ่านการทดสอบ Insulation Resistance'
  },
  {
    id: 'ORD-703',
    title: 'Special Dry-Type Transformer 1000kVA',
    process: 'D',
    processFull: 'Drying Oven & Vacuum Chamber',
    start: '05/09/2026',
    finish: '12/09/2026',
    purchaser: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์',
    customer: 'Siriraj Hospital',
    mva: '1.0 MVA',
    ratingVolt: '24 kV / 416 V',
    newDelivery: '30/09/2026',
    actualPlanDelivery: '28/09/2026',
    notes: 'Low-noise specification required'
  },
  {
    id: 'ORD-704',
    title: 'Rectifier Transformer / Siam Cement Group',
    process: 'DYG',
    processFull: 'Drying & Degassing',
    start: '08/09/2026',
    finish: '15/09/2026',
    purchaser: 'SCG Chemicals',
    customer: 'SCG',
    mva: '12.5 MVA',
    ratingVolt: '33/6.6 kV',
    newDelivery: '05/10/2026',
    actualPlanDelivery: '02/10/2026',
    notes: 'Heavy duty harmonic filtration'
  },
  {
    id: 'ORD-705',
    title: 'Substation Core Assembly / Rayong Plant 2',
    process: 'FA',
    processFull: 'Final Assembly & Packaging',
    start: '12/09/2026',
    finish: '20/09/2026',
    purchaser: 'PTT Global Chemical',
    customer: 'PTTGC',
    mva: '25 MVA',
    ratingVolt: '69/11 kV',
    newDelivery: '15/10/2026',
    actualPlanDelivery: '12/10/2026',
    notes: 'Sea freight packaging standards'
  }
];

export const SCHEDULE_PROCESSES: ProcessInfo[] = [
  { code: 'TO', name: 'Tank & Oil Filling', color: '#60a5fa' },
  { code: 'TN', name: 'Testing & Verification', color: '#34d399' },
  { code: 'T', name: 'Terminal Assembly', color: '#a78bfa' },
  { code: 'D', name: 'Drying Oven', color: '#f472b6' },
  { code: 'DYG', name: 'Degassing Chamber', color: '#facc15' },
  { code: 'FA', name: 'Final Assembly', color: '#fb923c' },
  { code: 'RCC', name: 'Radiator Core Check', color: '#38bdf8' },
  { code: 'LCC', name: 'Load Coil Core', color: '#22d3ee' },
];

const STORAGE_KEY_ISSUES = 'daihen_helpdesk_issues_v2';
const STORAGE_KEY_SETTINGS = 'daihen_helpdesk_ui_settings_v2';
const STORAGE_KEY_SCHEDULES = 'daihen_helpdesk_schedules_v2';

export function getStoredIssues(): Issue[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ISSUES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load issues from localStorage', e);
  }
  return INITIAL_ISSUES;
}

export function saveStoredIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.warn('Failed to save issues to localStorage', e);
  }
}

export function getStoredSettings(): UISettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return { ...DEFAULT_UI_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e);
  }
  return DEFAULT_UI_SETTINGS;
}

export function saveStoredSettings(settings: UISettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

export function getStoredSchedules(): ScheduleItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load schedules from localStorage', e);
  }
  return INITIAL_SCHEDULES;
}

export function saveStoredSchedules(items: ScheduleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save schedules to localStorage', e);
  }
}
