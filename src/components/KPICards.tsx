import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface KPICardsProps {
  stats: {
    total: number;
    status: Record<string, number>;
  };
  filterStatus: string;
  onFilterChange: (status: string) => void;
  urgentCount: number;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = display;
    const duration = 600;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + (value - startValue) * ease));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{display}</span>;
};

export const KPICards: React.FC<KPICardsProps> = ({
  stats,
  filterStatus,
  onFilterChange,
  urgentCount,
}) => {
  const newCount = stats.status['New'] || 0;
  const waitingCount = stats.status['Waiting'] || 0;
  const inProgressCount = stats.status['In Progress'] || 0;
  const resolvedCount = (stats.status['Resolved'] || 0) + (stats.status['Closed'] || 0);

  const cards = [
    {
      id: 'All',
      title: 'งานทั้งหมด',
      sub: 'Total Tickets',
      value: stats.total,
      icon: FolderOpen,
      color: '#141413',
      bgColor: '#f5f0e8',
      activeBorder: 'border-[#141413]',
      activeBg: 'bg-[#efe9de]',
    },
    {
      id: 'New,Waiting',
      title: 'รอดำเนินการ',
      sub: 'New & Waiting',
      value: newCount + waitingCount,
      icon: Clock,
      color: '#d97706',
      bgColor: '#fdf8e6',
      activeBorder: 'border-[#d97706]',
      activeBg: 'bg-[#fef3c7]/60',
    },
    {
      id: 'In Progress',
      title: 'กำลังแก้ไข',
      sub: 'In Progress',
      value: inProgressCount,
      icon: Flame,
      color: '#cc785c',
      bgColor: '#fbeee9',
      activeBorder: 'border-[#cc785c]',
      activeBg: 'bg-[#fbeee9]',
    },
    {
      id: 'Resolved,Closed',
      title: 'เสร็จสิ้นแล้ว',
      sub: 'Resolved / Closed',
      value: resolvedCount,
      icon: CheckCircle2,
      color: '#5db872',
      bgColor: '#eaf6ec',
      activeBorder: 'border-[#5db872]',
      activeBg: 'bg-[#eaf6ec]',
    },
    {
      id: 'urgent',
      title: 'ด่วนมาก',
      sub: 'Urgent Priority',
      value: urgentCount,
      icon: AlertTriangle,
      color: '#c64545',
      bgColor: '#fcebeb',
      activeBorder: 'border-[#c64545]',
      activeBg: 'bg-[#fcebeb]',
      filterType: 'urgent',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3.5">
      {cards.map(card => {
        const Icon = card.icon;
        const isActive = filterStatus === card.id;

        return (
          <button
            key={card.id}
            onClick={() => {
              if (card.id === 'urgent') {
                // If already filtered, reset or toggle
                onFilterChange(filterStatus === 'Urgent' ? 'All' : 'Urgent');
              } else {
                onFilterChange(card.id === filterStatus ? 'All' : card.id);
              }
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden md3-state-layer group shadow-2xs ${
              isActive
                ? `${card.activeBorder} ${card.activeBg} ring-2 ring-offset-1 ring-[#cc785c]/30 shadow-xs`
                : 'border-[#e6dfd8] bg-[#f5f0e8] hover:bg-[#efe9de] hover:border-[#d5cdc2]'
            }`}
          >
            {/* Top row: Icon + Indicator */}
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: card.bgColor, color: card.color }}
              >
                <Icon size={16} />
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
              )}
            </div>

            {/* Metric number in Copernicus / Serif display */}
            <div className="font-serif-claude text-2xl md:text-3xl font-normal text-[#141413] tracking-tight leading-none mb-1">
              <AnimatedNumber value={card.value} />
            </div>

            {/* Label */}
            <div className="text-xs font-bold text-[#3d3d3a] truncate">
              {card.title}
            </div>
            <div className="text-[10px] text-[#8e8b82] font-medium truncate">
              {card.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
};
