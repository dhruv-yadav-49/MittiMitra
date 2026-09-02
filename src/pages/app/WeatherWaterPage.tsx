import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { CloudSun, Droplets, Thermometer, Wind, CloudRain, Sun, Cloud } from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, ScoreBar, InfoNote, SectionLabel } from '../../components/shared';
import { DEMO_WEATHER, DEMO_WATER, RAINFALL_TREND, TEMP_TREND, CROP_WATER_COMPARISON } from '../../data/weather';
import { getDayOfWeek } from '../../lib/utils';

const weatherIcons: Record<string, React.ElementType> = {
  sunny: Sun, partly_cloudy: Cloud, cloudy: Cloud, rainy: CloudRain, stormy: CloudRain,
};

export default function WeatherWaterPage() {
  const { currentTemp, currentHumidity, currentRainfall, rainfallForecast, weatherRisk, forecast } = DEMO_WEATHER;
  const { availability, stressScore, recommendation, source: waterSource } = DEMO_WATER;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weather & Water"
        subtitle="Current conditions, 7-day forecast, and irrigation guidance"
        badge={<DemoBadge label="Mock Weather Data" />}
      />

      {/* Current Conditions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Temperature', value: `${currentTemp}°C`, icon: Thermometer, color: 'text-orange-500 bg-orange-50' },
          { label: 'Humidity', value: `${currentHumidity}%`, icon: Wind, color: 'text-blue-500 bg-blue-50' },
          { label: 'Rainfall (today)', value: `${currentRainfall}mm`, icon: CloudRain, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'Rain Probability', value: `${rainfallForecast}%`, icon: CloudSun, color: 'text-[#2D6A4F] bg-[#E8F5EE]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6B7280]">{label}</div>
            <div className="text-xl font-bold text-[#1A1A2E] mt-0.5">{value}</div>
          </div>
        ))}
      </div>

      {/* Weather Risk */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <CloudSun className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <div className="font-semibold text-[#1A1A2E] text-sm">Weather Risk Assessment</div>
          <div className="text-xs text-[#6B7280]">Based on forecast conditions and seasonal patterns</div>
        </div>
        <div className="ml-auto"><RiskBadge risk={weatherRisk} /></div>
      </div>

      {/* 7-Day Forecast */}
      <div className="card">
        <SectionLabel>7-Day Forecast</SectionLabel>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day, i) => {
            const Icon = weatherIcons[day.weatherCondition] ?? CloudSun;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F8F5F0] text-center">
                <div className="text-xs font-medium text-[#6B7280]">{i === 0 ? 'Today' : getDayOfWeek(day.date)}</div>
                <Icon className="w-5 h-5 text-blue-400" />
                <div className="text-xs font-bold text-[#1A1A2E]">{day.maxTemp}°</div>
                <div className="text-xs text-[#6B7280]">{day.minTemp}°</div>
                {day.rainfall > 0 && (
                  <div className="text-[10px] text-blue-500 font-medium">{day.rainfall}mm</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rainfall Trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Seasonal Rainfall Trend</SectionLabel>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={RAINFALL_TREND}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="actual" name="Actual (mm)" fill="#52B788" radius={[4, 4, 0, 0]} />
            <Bar dataKey="average" name="Avg (mm)" fill="#D4A017" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Temp Trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Temperature Trend</SectionLabel>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={TEMP_TREND}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="max" name="Max °C" stroke="#E76F51" strokeWidth={2} dot={false} />
            <Line dataKey="min" name="Min °C" stroke="#52B788" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Water Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <SectionLabel>Water Availability</SectionLabel>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-xl">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#2D6A4F]" />
                <span className="text-sm font-medium text-[#1A1A2E]">Availability</span>
              </div>
              <span className="font-bold text-amber-600 capitalize">{availability}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-xl">
              <span className="text-sm font-medium text-[#1A1A2E]">Water Source</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">{waterSource}</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#1A1A2E]">Water Stress Score</span>
                <span className="font-bold text-amber-600">{stressScore}/100</span>
              </div>
              <ScoreBar value={stressScore} max={100} color={stressScore < 30 ? '#52B788' : stressScore < 60 ? '#D4A017' : '#D62828'} height={10} />
              <div className="text-xs text-[#6B7280] mt-1">0 = No stress, 100 = Extreme stress</div>
            </div>
            <div className="p-3 bg-[#E8F5EE] rounded-xl text-sm text-[#2D6A4F]">
              💧 {recommendation}
            </div>
          </div>
        </div>

        <div className="card">
          <SectionLabel>Estimated Crop Water Need vs. Available</SectionLabel>
          <div className="space-y-3">
            {CROP_WATER_COMPARISON.map(({ crop, required, available, stress }) => (
              <div key={crop}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#1A1A2E]">{crop}</span>
                  <span className={stress > 30 ? 'text-red-500 font-bold' : stress > 10 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                    {stress > 0 ? `${stress}% stress` : 'No stress'}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="flex-1 progress-track" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, (available / required) * 100)}%`, background: stress > 30 ? '#D62828' : stress > 10 ? '#D4A017' : '#52B788' }} />
                  </div>
                  <span className="text-[10px] text-[#6B7280] w-16 text-right">{required}mm req.</span>
                </div>
              </div>
            ))}
          </div>
          <InfoNote variant="info">
            Available water estimated from irrigation source and rainfall forecast. Actual values depend on field conditions.
          </InfoNote>
        </div>
      </div>
    </div>
  );
}
