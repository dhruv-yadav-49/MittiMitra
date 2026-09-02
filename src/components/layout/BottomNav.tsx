import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, Brain, PieChart, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const BOTTOM_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/field-setup', icon: Sprout, label: 'Farm' },
  { to: '/ai-analysis', icon: Brain, label: 'AI' },
  { to: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { to: '/settings', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E0D8] flex items-stretch">
      {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#2D6A4F]' : 'text-gray-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn('p-1.5 rounded-lg', isActive && 'bg-[#E8F5EE]')}>
                <Icon className="w-4 h-4" />
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
