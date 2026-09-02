import { useState } from 'react';
import { User, Sprout, Globe, Ruler, Bell, LogOut, Database, Cpu, Server, TrendingUp } from 'lucide-react';
import { PageHeader, DemoBadge, InfoNote, SectionLabel } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { cn } from '../../lib/utils';

export default function SettingsPage() {
  const { farmer, logout } = useAuth();
  const { language, setLanguage, landUnit, setLandUnit, farm } = useFarm();
  const [notifications, setNotifications] = useState({ market: true, weather: true, reminders: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings & Profile" subtitle="Manage your account, preferences and notifications" />

      {/* Farmer Profile */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <User className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <SectionLabel>Farmer Profile</SectionLabel>
        </div>
        {farmer && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: farmer.name },
              { label: 'Phone', value: farmer.phone || 'Not set' },
              { label: 'State', value: farmer.state || 'Not set' },
              { label: 'District', value: farmer.district || 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[#F8F5F0] rounded-xl">
                <div className="text-xs text-[#6B7280]">{label}</div>
                <div className="font-semibold text-[#1A1A2E] mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Farm Profile */}
      {farm && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <SectionLabel>Farm Profile</SectionLabel>
            {farm.isDemo && <DemoBadge />}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Farm Name', value: farm.name },
              { label: 'Total Land', value: `${farm.totalLand} ${farm.landUnit}s` },
              { label: 'Soil Type', value: farm.soilType },
              { label: 'Irrigation', value: farm.irrigationAvailability },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[#F8F5F0] rounded-xl">
                <div className="text-xs text-[#6B7280]">{label}</div>
                <div className="font-semibold text-[#1A1A2E] capitalize mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <SectionLabel>Language</SectionLabel>
        </div>
        <div className="flex gap-3">
          {[
            { value: 'en', label: 'English', sublabel: 'English' },
            { value: 'hi', label: 'हिंदी', sublabel: 'Hindi' },
          ].map(({ value, label, sublabel }) => (
            <button
              key={value}
              onClick={() => setLanguage(value as 'en' | 'hi')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 text-left transition-all',
                language === value ? 'border-[#2D6A4F] bg-[#E8F5EE]' : 'border-[#E5E0D8] hover:border-[#52B788]'
              )}
            >
              <div className="font-bold text-[#1A1A2E] text-lg">{label}</div>
              <div className="text-xs text-[#6B7280]">{sublabel}</div>
              {language === value && <div className="text-xs text-[#2D6A4F] font-semibold mt-1">✓ Active</div>}
            </button>
          ))}
        </div>
        {language === 'hi' && (
          <InfoNote variant="info">
            Hindi translation is partially implemented in this MVP. Navigation and key labels are translated. Some detailed content remains in English.
          </InfoNote>
        )}
      </div>

      {/* Units */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <Ruler className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <SectionLabel>Land Unit</SectionLabel>
        </div>
        <div className="flex gap-3">
          {[
            { value: 'acre', label: 'Acre', sublabel: '1 acre = 0.405 hectare' },
            { value: 'hectare', label: 'Hectare', sublabel: '1 hectare = 2.47 acres' },
          ].map(({ value, label, sublabel }) => (
            <button
              key={value}
              onClick={() => setLandUnit(value as 'acre' | 'hectare')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 text-left transition-all',
                landUnit === value ? 'border-[#2D6A4F] bg-[#E8F5EE]' : 'border-[#E5E0D8] hover:border-[#52B788]'
              )}
            >
              <div className="font-bold text-[#1A1A2E]">{label}</div>
              <div className="text-xs text-[#6B7280]">{sublabel}</div>
              {landUnit === value && <div className="text-xs text-[#2D6A4F] font-semibold mt-1">✓ Active</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <SectionLabel>Notifications</SectionLabel>
        </div>
        <div className="space-y-3">
          {[
            { key: 'market', label: 'Market Price Alerts', desc: 'Notify when mandi prices change significantly' },
            { key: 'weather', label: 'Weather Alerts', desc: 'Notify about extreme weather conditions' },
            { key: 'reminders', label: 'Sowing Reminders', desc: 'Remind about optimal sowing windows' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-xl">
              <div>
                <div className="text-sm font-medium text-[#1A1A2E]">{label}</div>
                <div className="text-xs text-[#6B7280]">{desc}</div>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={cn('rounded-full transition-colors relative flex-shrink-0', notifications[key as keyof typeof notifications] ? 'bg-[#2D6A4F]' : 'bg-gray-300')}
                style={{ width: 40, height: 22 }}
              >
                <div className={cn('absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform', notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-[3px]')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <Database className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <SectionLabel>Data & Intelligence Sources</SectionLabel>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Cpu, title: 'Soil Sensors', desc: 'ESP32 + IoT sensors (future integration)', status: 'Demo' },
            { icon: Database, title: 'Soil Health Card', desc: 'Lab-validated soil measurements', status: 'Manual' },
            { icon: Server, title: 'IMD Weather', desc: 'Indian Meteorological Department', status: 'Mock' },
            { icon: TrendingUp, title: 'Agmarknet', desc: 'Mandi prices and market arrivals', status: 'Mock' },
          ].map(({ icon: Icon, title, desc, status }) => (
            <div key={title} className="p-3 border border-[#E5E0D8] rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="text-sm font-semibold text-[#1A1A2E]">{title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{status}</span>
              </div>
              <div className="text-xs text-[#6B7280]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
