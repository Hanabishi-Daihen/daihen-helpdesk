import { Issue, ScheduleItem, UISettings, StatusType, FileAttachment } from '../types';
import { 
  getStoredIssues, 
  saveStoredIssues, 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredSchedules, 
  saveStoredSchedules 
} from '../data/mockData';

// Declare Google Apps Script window interface
declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (onSuccess: (result: any) => void) => {
            withFailureHandler: (onFailure: (error: any) => void) => any;
          };
          withFailureHandler: (onFailure: (error: any) => void) => {
            withSuccessHandler: (onSuccess: (result: any) => void) => any;
          };
          getDashboardStats: () => void;
          getIssues: (page: number, pageSize: number, search: string, statusFilter: string, sectionFilter: string) => void;
          saveIssue: (formData: any) => void;
          updateStatus: (issueId: string, newStatus: string) => void;
          addChat: (issueId: string, messageObj: any) => void;
          updateIssueDetails: (issueId: string, updates: any) => void;
          markAsRead: (issueId: string, readerType: string) => void;
          checkAlerts: (readerType: string) => void;
          getSchedules: (filters: any) => void;
          importToScheduleSheet: (data: any, mode: string) => void;
          getUISettings: () => void;
          saveUISettings: (settingsObj: any) => void;
          resetUISettings: () => void;
          getSettings: () => void;
          saveSettings: (settingsObj: any) => void;
        };
      };
    };
    GAS_DEEP_LINK_ISSUE_ID?: string;
  }
}

/** Check if running inside Google Apps Script iframe/environment */
export const isGAS = (): boolean => {
  return typeof window !== 'undefined' && !!(window.google && window.google.script && window.google.script.run);
};

/** Get deep-linked Issue ID passed from Google Apps Script or URL param */
export const getDeepLinkIssueId = (): string => {
  if (typeof window === 'undefined') return '';

  // Check GAS template variable if available
  if (window.GAS_DEEP_LINK_ISSUE_ID && !window.GAS_DEEP_LINK_ISSUE_ID.startsWith('<?')) {
    return window.GAS_DEEP_LINK_ISSUE_ID.trim();
  }

  // Check standard query param
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('issue')?.trim() || '';
  } catch (e) {
    return '';
  }
};

/**
 * Execute GAS server function with Promise wrapper
 */
function callGAS<T>(methodName: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!isGAS()) {
      reject(new Error('Not running inside Google Apps Script'));
      return;
    }

    try {
      const runner = window.google!.script.run
        .withSuccessHandler((res: T) => resolve(res))
        .withFailureHandler((err: any) => {
          console.error(`[GAS ${methodName} Error]`, err);
          reject(err);
        });

      const fn = (runner as any)[methodName];
      if (typeof fn === 'function') {
        fn.apply(runner, args);
      } else {
        reject(new Error(`Method "${methodName}" not found on google.script.run`));
      }
    } catch (e) {
      reject(e);
    }
  });
}

// ==========================================
// 🚀 Exported API Methods with Fallback
// ==========================================

export const gasService = {
  isGAS,
  getDeepLinkIssueId,

  /**
   * Fetch issues list
   */
  async getIssues(
    page = 1,
    pageSize = 100,
    search = '',
    statusFilter = 'All',
    sectionFilter = 'All'
  ): Promise<{ data: Issue[]; total: number; totalPages: number; page: number }> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ data: Issue[]; total: number; totalPages: number; page: number }>(
          'getIssues',
          page,
          pageSize,
          search,
          statusFilter,
          sectionFilter
        );
        return res;
      } catch (err) {
        console.warn('GAS getIssues failed, falling back to local storage', err);
      }
    }

    // Fallback: local storage
    const all = getStoredIssues();
    return {
      data: all,
      total: all.length,
      totalPages: Math.ceil(all.length / pageSize),
      page: 1,
    };
  },

  /**
   * Create new issue with attached files
   */
  async saveIssue(formData: Partial<Issue>): Promise<{ success: boolean; id?: string }> {
    if (isGAS()) {
      try {
        // Ensure files have { name, type, data } format for Drive upload
        const filesPayload = (formData.files || []).map(f => ({
          name: f.name,
          type: f.type || 'application/octet-stream',
          data: f.data || f.url || '',
        }));

        const payload = {
          project: formData.project || '',
          description: formData.description || '',
          reporter: formData.reporter || '',
          reporterEmail: formData.reporterEmail || '',
          section: formData.section || 'MF',
          category: formData.category || 'อุปกรณ์ไม่มีติดตั้ง',
          priority: formData.priority || 'Medium',
          files: filesPayload,
          timestamp: formData.timestamp || new Date().toLocaleString('th-TH'),
        };

        const res = await callGAS<{ success: boolean; id?: string }>('saveIssue', payload);
        return res;
      } catch (err) {
        console.warn('GAS saveIssue failed, falling back to local storage', err);
      }
    }

    // Fallback: local storage
    const current = getStoredIssues();
    const newId = `ISS-2026${String(current.length + 1).padStart(3, '0')}`;
    const newIssue: Issue = {
      id: newId,
      project: formData.project || 'Untitled',
      description: formData.description || '',
      reporter: formData.reporter || 'Anonymous',
      reporterEmail: formData.reporterEmail || '',
      section: formData.section || 'MF',
      category: formData.category || 'อุปกรณ์ไม่มีติดตั้ง',
      priority: formData.priority || 'Medium',
      status: 'New',
      timestamp: formData.timestamp || new Date().toLocaleString('th-TH'),
      reportedDate: formData.reportedDate || new Date().toISOString().split('T')[0],
      files: formData.files || [],
      chat: [
        {
          id: `c-${Date.now()}`,
          sender: 'System',
          message: 'เปิดเรื่องแจ้งปัญหาเข้าสู่ระบบเรียบร้อย',
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          type: 'status',
          newStatus: 'New',
        },
      ],
    };

    saveStoredIssues([newIssue, ...current]);
    return { success: true, id: newId };
  },

  /**
   * Update issue status
   */
  async updateStatus(issueId: string, newStatus: StatusType): Promise<{ success: boolean; chat?: any[] }> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ success: boolean; chat?: any[] }>('updateStatus', issueId, newStatus);
        return res;
      } catch (err) {
        console.warn('GAS updateStatus failed, falling back to local storage', err);
      }
    }

    // Fallback
    const issues = getStoredIssues();
    const target = issues.find(i => i.id === issueId);
    if (target) {
      target.status = newStatus;
      target.chat = target.chat || [];
      target.chat.push({
        id: `sys-${Date.now()}`,
        sender: 'System',
        message: `สถานะเปลี่ยนเป็น "${newStatus}"`,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        type: 'status',
        newStatus,
      });
      saveStoredIssues(issues);
      return { success: true, chat: target.chat };
    }
    return { success: false };
  },

  /**
   * Send message or reply in issue chat
   */
  async addChat(
    issueId: string,
    messageObj: {
      sender: string;
      message: string;
      time: string;
      files?: FileAttachment[];
    }
  ): Promise<{ success: boolean; chat?: any[] }> {
    if (isGAS()) {
      try {
        const filesPayload = (messageObj.files || []).map(f => ({
          name: f.name,
          type: f.type || 'application/octet-stream',
          data: f.data || f.url || '',
        }));

        const res = await callGAS<{ success: boolean; chat?: any[] }>('addChat', issueId, {
          sender: messageObj.sender,
          message: messageObj.message,
          time: messageObj.time,
          files: filesPayload,
        });
        return res;
      } catch (err) {
        console.warn('GAS addChat failed, falling back to local storage', err);
      }
    }

    // Fallback
    const issues = getStoredIssues();
    const target = issues.find(i => i.id === issueId);
    if (target) {
      target.chat = target.chat || [];
      target.chat.push({
        id: `c-${Date.now()}`,
        sender: messageObj.sender,
        message: messageObj.message,
        time: messageObj.time,
        files: messageObj.files,
      });
      saveStoredIssues(issues);
      return { success: true, chat: target.chat };
    }
    return { success: false };
  },

  /**
   * Update issue editable fields (Admin)
   */
  async updateIssueDetails(
    issueId: string,
    updates: Partial<Issue>
  ): Promise<{ success: boolean; chat?: any[]; changedFields?: string[] }> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ success: boolean; chat?: any[]; changedFields?: string[] }>(
          'updateIssueDetails',
          issueId,
          updates
        );
        return res;
      } catch (err) {
        console.warn('GAS updateIssueDetails failed, falling back to local storage', err);
      }
    }

    // Fallback
    const issues = getStoredIssues();
    const idx = issues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      issues[idx] = { ...issues[idx], ...updates };
      saveStoredIssues(issues);
      return { success: true, chat: issues[idx].chat };
    }
    return { success: false };
  },

  /**
   * Mark chat messages as read
   */
  async markAsRead(issueId: string, readerType: 'Admin' | 'User'): Promise<{ success: boolean }> {
    if (isGAS()) {
      try {
        return await callGAS<{ success: boolean }>('markAsRead', issueId, readerType);
      } catch (err) {
        console.warn('GAS markAsRead failed', err);
      }
    }
    return { success: true };
  },

  /**
   * Fetch schedules from ScheduleService
   */
  async getSchedules(filters?: any): Promise<ScheduleItem[]> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ headers: string[]; items: ScheduleItem[]; processes: any[] }>(
          'getSchedules',
          filters
        );
        if (res && Array.isArray(res.items)) {
          return res.items;
        }
      } catch (err) {
        console.warn('GAS getSchedules failed, falling back to local storage', err);
      }
    }

    // Fallback
    return getStoredSchedules();
  },

  /**
   * Import schedules to Google Sheet
   */
  async importToScheduleSheet(items: ScheduleItem[], mode: 'append' | 'replace'): Promise<{ ok: boolean }> {
    if (isGAS()) {
      try {
        const headers = [
          'ID', 'Title', 'Process', 'Start', 'Finish', 'Purchaser',
          'Customer', 'MVA', 'RatingVolt', 'NewDelivery', 'ActualPlanDelivery', 'Notes'
        ];
        const rows = items.map(item => [
          item.id,
          item.title,
          item.process,
          item.start,
          item.finish,
          item.purchaser || '',
          item.customer || '',
          item.mva || '',
          item.ratingVolt || '',
          item.newDelivery || '',
          item.actualPlanDelivery || '',
          item.notes || ''
        ]);

        const res = await callGAS<{ ok: boolean }>('importToScheduleSheet', { headers, rows }, mode);
        return res;
      } catch (err) {
        console.warn('GAS importToScheduleSheet failed, falling back to local storage', err);
      }
    }

    // Fallback
    const current = getStoredSchedules();
    const next = mode === 'replace' ? items : [...current, ...items];
    saveStoredSchedules(next);
    return { ok: true };
  },

  /**
   * Fetch UI Settings (PropertiesService)
   */
  async getUISettings(): Promise<UISettings> {
    if (isGAS()) {
      try {
        const res = await callGAS<UISettings>('getUISettings');
        if (res && res.primaryColor) {
          return res;
        }
      } catch (err) {
        console.warn('GAS getUISettings failed, falling back to local storage', err);
      }
    }

    return getStoredSettings();
  },

  /**
   * Save UI Settings (PropertiesService)
   */
  async saveUISettings(settings: UISettings): Promise<{ success: boolean }> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ success: boolean }>('saveUISettings', settings);
        return res;
      } catch (err) {
        console.warn('GAS saveUISettings failed, falling back to local storage', err);
      }
    }

    saveStoredSettings(settings);
    return { success: true };
  },

  /**
   * Reset UI Settings (PropertiesService)
   */
  async resetUISettings(): Promise<{ success: boolean }> {
    if (isGAS()) {
      try {
        const res = await callGAS<{ success: boolean }>('resetUISettings');
        return res;
      } catch (err) {
        console.warn('GAS resetUISettings failed', err);
      }
    }
    return { success: true };
  },

  /**
   * Fetch Operational/Email Settings from Settings sheet
   */
  async getSettings(): Promise<Record<string, string>> {
    if (isGAS()) {
      try {
        return await callGAS<Record<string, string>>('getSettings');
      } catch (err) {
        console.warn('GAS getSettings failed', err);
      }
    }
    return {
      AdminEmails: 'premwit@daihen.co.th,Thutchanon@daihen.co.th',
      CcEmails: '',
      DefaultUserEmail: 'premwit@daihen.co.th',
      ReminderDays: '7',
    };
  },

  /**
   * Save Operational/Email Settings to Settings sheet
   */
  async saveSettings(settingsObj: Record<string, string>): Promise<{ success: boolean }> {
    if (isGAS()) {
      try {
        return await callGAS<{ success: boolean }>('saveSettings', settingsObj);
      } catch (err) {
        console.warn('GAS saveSettings failed', err);
      }
    }
    return { success: true };
  }
};
