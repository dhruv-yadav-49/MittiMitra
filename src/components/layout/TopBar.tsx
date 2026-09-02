import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { farmer } = useAuth();
  const { farm } = useFarm();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E0D8] md:px-6">
      {/* Mobile menu */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Farm info */}
      <div className="hidden md:flex flex-col">
        <span className="text-xs text-[#6B7280]">Active Farm</span>
        <span className="text-sm font-semibold text-[#1A1A2E]">
          {farm ? `${farm.name} — ${farm.totalLand} ${farm.landUnit}s` : 'No farm selected'}
        </span>
      </div>

      <div className="md:hidden text-sm font-semibold text-[#1A1A2E]">
        {farm?.name ?? 'MittiMitra AI'}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4A017] rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#2D6A4F] font-bold text-sm">
          {farmer?.name.charAt(0).toUpperCase() ?? 'F'}
        </div>
      </div>
    </header>
  );
}
