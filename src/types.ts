export type StatusType = 'New' | 'Waiting' | 'In Progress' | 'Resolved' | 'Closed';
export type PriorityType = 'Low' | 'Medium' | 'High' | 'Urgent';
export type SectionType = 'MF' | 'QC' | 'Design' | string;
export type CategoryType = 'อุปกรณ์ไม่มีติดตั้ง' | 'ปรับปรุง' | 'แก้ไขวายริ่ง' | 'NC' | 'อื่นๆ' | string;

export interface FileAttachment {
  name: string;
  type?: string;
  url?: string;
  data?: string; // base64 or object URL
  size?: number;
  thumbnail?: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'Admin' | 'User' | 'System' | string;
  message: string;
  time: string;
  read?: boolean;
  type?: 'text' | 'status';
  newStatus?: StatusType;
  files?: FileAttachment[];
}

export interface Issue {
  id: string;
  project: string;
  description: string;
  reporter: string;
  reporterEmail?: string;
  section: SectionType;
  category: CategoryType;
  priority: PriorityType;
  status: StatusType;
  timestamp: string;
  reportedDate?: string;
  files?: FileAttachment[];
  chat?: ChatMessage[];
}

export interface SavedFilterView {
  id: number;
  label: string;
  filterStatus: string;
  filterSection: string;
  searchTerm: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  process: string;
  processFull?: string;
  start: string; // dd/mm/yyyy
  finish: string; // dd/mm/yyyy
  purchaser?: string;
  customer?: string;
  mva?: string;
  ratingVolt?: string;
  newDelivery?: string;
  actualPlanDelivery?: string;
  notes?: string;
}

export interface ProcessInfo {
  code: string;
  name: string;
  color?: string;
}

export interface UISettings {
  primaryColor: string;
  accentColor: string;
  bgStyle: 'canvas' | 'mesh' | 'solid' | 'gradient' | 'dark' | 'custom';
  customBg?: string;
  fontScale: 'compact' | 'normal' | 'large';
  logoDataUrl?: string;
  sidebarLabelLine1: string;
  sidebarLabelLine2: string;
  modulesEnabled?: {
    schedules?: boolean;
    [key: string]: boolean | undefined;
  };
}
