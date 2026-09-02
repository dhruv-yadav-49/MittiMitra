import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, TestTube2, CloudSun, TrendingUp,
  Brain, PieChart, Sliders, CalendarDays, ClipboardList,
  History, Settings, LogOut, Leaf, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/field-setup', icon: Sprout, label: 'Field Setup' },
  { to: '/soil', icon: TestTube2, label: 'Soil Intelligence' },
  { to: '/weather-water', icon: CloudSun, label: 'Weather & Water' },
  { to: '/market', icon: TrendingUp, label: 'Market Intelligence' },
  { to: '/ai-analysis', icon: Brain, label: 'AI Crop Analysis' },
  { to: '/portfolio', icon: PieChart, label: 'Crop Portfolio' },
  { to: '/simulator', icon: Sliders, label: 'What-If Simulator' },
  { to: '/season-planner', icon: CalendarDays, label: '3-Season Planner' },
  { to: '/action-plan', icon: ClipboardList, label: 'Action Plan' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout, farmer } = useAuth();
  const { language } = useFarm();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-[#E5E0D8]">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1A1A2E] leading-tight">
              {language === 'hi' ? 'मिट्टीमित्र AI' : 'MittiMitra AI'}
            </div>
            <div className="text-[10px] text-[#6B7280] leading-tight">Farm Intelligence</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Farmer Info */}
      {farmer && (
        <div className="px-4 py-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#2D6A4F] font-bold text-sm">
              {farmer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A2E]">{farmer.name}</div>
              <div className="text-xs text-[#6B7280]">{farmer.district}, {farmer.state}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[#E5E0D8]">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
