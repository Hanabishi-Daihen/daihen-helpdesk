import React, { useState, useEffect, useMemo } from 'react';
import { 
  Issue, 
  ScheduleItem, 
  SavedFilterView, 
  UISettings, 
  StatusType, 
  PriorityType, 
  FileAttachment 
} from './types';
import { 
  getStoredIssues, 
  saveStoredIssues, 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredSchedules, 
  saveStoredSchedules,
  STATUS_LABELS,
  PRIORITY_RANK
} from './data/mockData';

// Components
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { KPICards } from './components/KPICards';
import { ChartsSection } from './components/ChartsSection';
import { IssueFilterBar } from './components/IssueFilterBar';
import { IssueTable } from './components/IssueTable';
import { KanbanBoard } from './components/KanbanBoard';
import { NewIssueWizard } from './components/NewIssueWizard';
import { IssueDetailModal } from './components/IssueDetailModal';
import { PDFReportModal } from './components/PDFReportModal';
import { CommandPalette } from './components/CommandPalette';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SchedulesView } from './components/SchedulesView';
import { SettingsView } from './components/SettingsView';
import { Toast } from './components/Toast';
import { GasDeployModal } from './components/GasDeployModal';
import { gasService } from './services/gasService';

export default function App() {
  // Main view state
  const [view, setView] = useState<'dashboard' | 'form' | 'schedules' | 'settings'>('dashboard');
  const [dashMode, setDashMode] = useState<'list' | 'kanban'>('list');

  // Issues and Schedules data state
  const [issues, setIssues] = useState<Issue[]>(() => getStoredIssues());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getStoredSchedules());
  const [uiSettings, setUiSettings] = useState<UISettings>(() => getStoredSettings());

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showGasDeploy, setShowGasDeploy] = useState(false);

  // Selected Issue for Detail & Chat Modal
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [savedViews, setSavedViews] = useState<SavedFilterView[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('daihen_saved_views_v2') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Table selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<StatusType>('In Progress');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Palette
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // Load live data from Google Apps Script if connected, else fallback to localStorage
  useEffect(() => {
    const initGasData = async () => {
      try {
        const issuesRes = await gasService.getIssues(1, 150);
        if (issuesRes && issuesRes.data && issuesRes.data.length > 0) {
          setIssues(issuesRes.data);
        }
        const schedRes = await gasService.getSchedules();
        if (schedRes && schedRes.length > 0) {
          setSchedules(schedRes);
        }
        const uiRes = await gasService.getUISettings();
        if (uiRes && uiRes.primaryColor) {
          setUiSettings(uiRes);
        }
      } catch (err) {
        console.warn('Initial GAS load fallback to local storage:', err);
      }
    };

    initGasData();
  }, []);

  // Deep Link Handling (?issue=ISS-XXXX or <?= deepLinkIssueId ?>)
  useEffect(() => {
    const deepLinkId = gasService.getDeepLinkIssueId();
    if (deepLinkId && issues.length > 0) {
      const match = issues.find(i => i.id.toLowerCase() === deepLinkId.toLowerCase());
      if (match) {
        setSelectedIssue(match);
      } else {
        showToast(`ไม่พบรายการ #${deepLinkId}`, 'error');
      }
    }
  }, [issues]);

  // Sync font size scale & background styles to documentElement
  useEffect(() => {
    const root = document.documentElement;
    const fontScaleMap = {
      compact: '14px',
      normal: '16px',
      large: '18px',
    };
    root.style.fontSize = fontScaleMap[uiSettings.fontScale] || '16px';
  }, [uiSettings.fontScale]);

  // Save changes to localStorage
  const updateIssuesState = (newIssues: Issue[]) => {
    setIssues(newIssues);
    saveStoredIssues(newIssues);
  };

  // Stats computation
  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    issues.forEach(i => {
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });
    return {
      total: issues.length,
      status: statusCounts,
    };
  }, [issues]);

  const urgentCount = useMemo(() => {
    return issues.filter(i => i.priority === 'Urgent').length;
  }, [issues]);

  // Filtered and Sorted Issues
  const filteredAndSortedIssues = useMemo(() => {
    let result = issues.filter(issue => {
      // Search term
      const matchesSearch =
        !searchTerm ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reporter.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      let matchesStatus = true;
      if (filterStatus === 'New,Waiting') {
        matchesStatus = issue.status === 'New' || issue.status === 'Waiting';
      } else if (filterStatus === 'Resolved,Closed') {
        matchesStatus = issue.status === 'Resolved' || issue.status === 'Closed';
      } else if (filterStatus !== 'All') {
        matchesStatus = issue.status === filterStatus;
      }

      // Section
      const matchesSection = filterSection === 'All' || issue.section === filterSection;

      // Priority
      const matchesPriority = filterPriority === 'All' || issue.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesSection && matchesPriority;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.reportedDate || a.timestamp).getTime() - new Date(b.reportedDate || b.timestamp).getTime();
        case 'priority_desc':
          return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
        case 'priority_asc':
          return (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
        case 'date_desc':
        default:
          return new Date(b.reportedDate || b.timestamp).getTime() - new Date(a.reportedDate || a.timestamp).getTime();
      }
    });

    return result;
  }, [issues, searchTerm, filterStatus, filterSection, filterPriority, sortBy]);

  // Paginated issues
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedIssues.slice(start, start + pageSize);
  }, [filteredAndSortedIssues, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedIssues.length / pageSize));

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterSection, filterPriority, sortBy]);

  // Issue handlers
  const handleCreateIssue = async (issueData: Partial<Issue>) => {
    try {
      const res = await gasService.saveIssue(issueData);
      const updated = await gasService.getIssues();
      if (updated && updated.data) {
        updateIssuesState(updated.data);
      }
      setView('dashboard');
      showToast(`ส่งเรื่องแจ้งปัญหา #${res.id || 'สำเร็จ'} เรียบร้อย`);
    } catch (e) {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: StatusType) => {
    const updated = issues.map(item => {
      if (item.id === issueId) {
        const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const newChat: Issue['chat'] = [
          ...(item.chat || []),
          {
            id: `sys-${Date.now()}`,
            sender: 'System',
            message: `สถานะเปลี่ยนเป็น "${STATUS_LABELS[newStatus] || newStatus}"`,
            time: timeStr,
            type: 'status',
            newStatus,
          },
        ];
        return {
          ...item,
          status: newStatus,
          chat: newChat,
        };
      }
      return item;
    });

    updateIssuesState(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(updated.find(i => i.id === issueId) || null);
    }
    showToast(`อัปเดตสถานะเป็น "${STATUS_LABELS[newStatus]}" เรียบร้อย`);

    try {
      await gasService.updateStatus(issueId, newStatus);
    } catch (err) {
      console.warn('Sync status to GAS error:', err);
    }
  };

  const handleUpdateIssueDetails = async (issueId: string, updates: Partial<Issue>) => {
    const updated = issues.map(item => {
      if (item.id === issueId) {
        return { ...item, ...updates };
      }
      return item;
    });
    updateIssuesState(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue({ ...selectedIssue, ...updates });
    }
    try {
      await gasService.updateIssueDetails(issueId, updates);
    } catch (err) {
      console.warn('Sync issue details to GAS error:', err);
    }
  };

  const handleSendMessage = async (issueId: string, text: string, attachedFiles?: FileAttachment[]) => {
    const senderName = isAdmin ? 'Admin' : (selectedIssue?.reporter || 'User');
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderName,
      message: text,
      time: timeStr,
      read: true,
      files: attachedFiles && attachedFiles.length > 0 ? attachedFiles : undefined,
    };

    const updated = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          chat: [...(item.chat || []), newMsg],
        };
      }
      return item;
    });

    updateIssuesState(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(updated.find(i => i.id === issueId) || null);
    }

    try {
      await gasService.addChat(issueId, {
        sender: senderName,
        message: text,
        time: timeStr,
        files: attachedFiles,
      });
    } catch (err) {
      console.warn('Sync chat to GAS error:', err);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(prev => {
      if (prev.size === filteredAndSortedIssues.length) {
        return new Set();
      }
      return new Set(filteredAndSortedIssues.map(i => i.id));
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkUpdate = () => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);

    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const updated = issues.map(item => {
        if (selectedIds.has(item.id)) {
          return {
            ...item,
            status: bulkStatus,
            chat: [
              ...(item.chat || []),
              {
                id: `bulk-${Date.now()}`,
                sender: 'System',
                message: `อัปเดตสถานะกลุ่มเป็น "${STATUS_LABELS[bulkStatus]}"`,
                time: timeStr,
                type: 'status' as const,
                newStatus: bulkStatus,
              },
            ],
          };
        }
        return item;
      });

      updateIssuesState(updated);
      setIsBulkUpdating(false);
      const count = selectedIds.size;
      handleClearSelection();
      showToast(`อัปเดตสถานะ ${count} รายการ สำเร็จ`);
    }, 400);
  };

  // Saved Views
  const handleSaveCurrentView = () => {
    if (filterStatus === 'All' && filterSection === 'All' && filterPriority === 'All' && !searchTerm) {
      showToast('ยังไม่มีเงื่อนไขตัวกรองที่จะบันทึก', 'error');
      return;
    }

    const labelParts = [];
    if (filterSection !== 'All') labelParts.push(`แผนก ${filterSection}`);
    if (filterStatus !== 'All') labelParts.push(STATUS_LABELS[filterStatus] || filterStatus);
    if (filterPriority !== 'All') labelParts.push(filterPriority);
    if (searchTerm) labelParts.push(`"${searchTerm}"`);

    const label = labelParts.join(' · ');
    const newView: SavedFilterView = {
      id: Date.now(),
      label,
      filterStatus,
      filterSection,
      searchTerm,
    };

    const nextViews = [...savedViews, newView].slice(-6); // Max 6
    setSavedViews(nextViews);
    localStorage.setItem('daihen_saved_views_v2', JSON.stringify(nextViews));
    showToast('บันทึกตัวกรองเรียบร้อย');
  };

  const handleApplyView = (v: SavedFilterView) => {
    setFilterStatus(v.filterStatus);
    setFilterSection(v.filterSection);
    setSearchTerm(v.searchTerm);
  };

  const handleRemoveView = (id: number) => {
    const nextViews = savedViews.filter(v => v.id !== id);
    setSavedViews(nextViews);
    localStorage.setItem('daihen_saved_views_v2', JSON.stringify(nextViews));
  };

  // Schedules CSV Import
  const handleImportSchedules = async (items: ScheduleItem[], mode: 'append' | 'replace') => {
    const next = mode === 'replace' ? items : [...schedules, ...items];
    setSchedules(next);
    saveStoredSchedules(next);
    showToast(`นำเข้าข้อมูลแผนงาน ${items.length} รายการสำเร็จ`);
    try {
      await gasService.importToScheduleSheet(items, mode);
    } catch (err) {
      console.warn('Sync schedules to GAS error:', err);
    }
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings: UISettings) => {
    setUiSettings(newSettings);
    saveStoredSettings(newSettings);
    showToast('บันทึกการตั้งค่าเรียบร้อย');
    try {
      await gasService.saveUISettings(newSettings);
    } catch (err) {
      console.warn('Sync settings to GAS error:', err);
    }
  };

  const handleResetSettings = () => {
    setUiSettings(getStoredSettings());
  };

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row transition-colors relative ${
        uiSettings.bgStyle === 'dark' 
          ? 'bg-[#181715] text-[#faf9f5]' 
          : uiSettings.bgStyle === 'mesh'
          ? 'bg-gradient-to-br from-[#faf9f5] via-[#f5f0e8] to-[#e8e0d2]'
          : 'bg-[#faf9f5] text-[#141413]'
      }`}
    >
      {/* Sidebar Navigation (Desktop) & Bottom Nav (Mobile) */}
      <Navigation
        view={view}
        setView={v => setView(v as any)}
        isAdmin={isAdmin}
        onAdminClick={() => setShowAdminLogin(true)}
        onLogoutClick={() => {
          setIsAdmin(false);
          showToast('ออกจากโหมด Admin เรียบร้อย');
        }}
        uiSettings={uiSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Top Bar Header */}
        <TopBar
          view={view}
          setView={v => setView(v as any)}
          isAdmin={isAdmin}
          onAdminClick={() => setShowAdminLogin(true)}
          onLogoutClick={() => {
            setIsAdmin(false);
            showToast('ออกจากโหมด Admin เรียบร้อย');
          }}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenGasDeploy={() => setShowGasDeploy(true)}
          uiSettings={uiSettings}
          issues={issues}
          onSelectIssue={setSelectedIssue}
        />

        {/* Content View Router */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl w-full mx-auto space-y-4 md:space-y-6">
          {/* ── 1. DASHBOARD VIEW ───────────────────────────────── */}
          {view === 'dashboard' && (
            <div className="space-y-4 md:space-y-5 fade-in">
              {/* KPI Cards Row */}
              <KPICards
                stats={stats}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                urgentCount={urgentCount}
              />

              {/* Charts & Activity Row */}
              <ChartsSection
                issues={issues}
                onSelectIssue={setSelectedIssue}
                onFilterStatus={setFilterStatus}
                onFilterSection={setFilterSection}
              />

              {/* Filter & View Control Bar */}
              <IssueFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterSection={filterSection}
                setFilterSection={setFilterSection}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                sortBy={sortBy}
                setSortBy={setSortBy}
                dashMode={dashMode}
                setDashMode={setDashMode}
                savedViews={savedViews}
                onSaveCurrentView={handleSaveCurrentView}
                onApplyView={handleApplyView}
                onRemoveView={handleRemoveView}
                onOpenReportModal={() => setShowReportModal(true)}
                totalFilteredCount={filteredAndSortedIssues.length}
              />

              {/* Content Mode: Table vs Kanban Board */}
              {dashMode === 'kanban' ? (
                <KanbanBoard
                  issues={filteredAndSortedIssues}
                  onStatusChange={handleStatusChange}
                  onSelectIssue={setSelectedIssue}
                  isAdmin={isAdmin}
                />
              ) : (
                <IssueTable
                  issues={paginatedIssues}
                  onSelectIssue={setSelectedIssue}
                  isAdmin={isAdmin}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onClearSelection={handleClearSelection}
                  bulkStatus={bulkStatus}
                  setBulkStatus={setBulkStatus}
                  onBulkUpdate={handleBulkUpdate}
                  isBulkUpdating={isBulkUpdating}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={filteredAndSortedIssues.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}

          {/* ── 2. NEW ISSUE WIZARD VIEW ────────────────────────── */}
          {view === 'form' && (
            <NewIssueWizard
              onCancel={() => setView('dashboard')}
              onSubmit={handleCreateIssue}
              showToast={showToast}
            />
          )}

          {/* ── 3. SCHEDULES MODULE VIEW ────────────────────────── */}
          {view === 'schedules' && (
            <SchedulesView
              schedules={schedules}
              onImportCsv={handleImportSchedules}
              showToast={showToast}
            />
          )}

          {/* ── 4. SETTINGS VIEW (ADMIN ONLY) ───────────────────── */}
          {view === 'settings' && (
            <SettingsView
              settings={uiSettings}
              onSaveSettings={handleSaveSettings}
              onResetSettings={handleResetSettings}
              onBack={() => setView('dashboard')}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ── Modals & Drawers ──────────────────────────────────── */}
      {/* Issue Detail & Chat Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          isAdmin={isAdmin}
          onStatusChange={handleStatusChange}
          onUpdateIssueDetails={handleUpdateIssueDetails}
          onSendMessage={handleSendMessage}
          showToast={showToast}
        />
      )}

      {/* PDF Report Preview & Download Modal */}
      {showReportModal && (
        <PDFReportModal
          issues={filteredAndSortedIssues}
          onClose={() => setShowReportModal(false)}
          showToast={showToast}
        />
      )}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        setView={v => setView(v as any)}
        setDashMode={setDashMode}
        isAdmin={isAdmin}
        onAdminClick={() => setShowAdminLogin(true)}
        onLogoutClick={() => {
          setIsAdmin(false);
          showToast('ออกจากโหมด Admin เรียบร้อย');
        }}
        issues={issues}
        onSelectIssue={setSelectedIssue}
      />

      {/* Admin Password Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
        }}
        showToast={showToast}
      />

      {/* GAS Deploy Guide & Export Modal */}
      <GasDeployModal
        isOpen={showGasDeploy}
        onClose={() => setShowGasDeploy(false)}
        showToast={showToast}
      />

      {/* Floating Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
