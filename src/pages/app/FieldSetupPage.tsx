import { useNavigate } from 'react-router-dom';
import { Sprout, Edit2, MapPin, Droplets, Layers } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { PageHeader, DemoBadge, InfoNote, EmptyState } from '../../components/shared';

export default function FieldSetupPage() {
  const { farm, soil } = useFarm();
  const navigate = useNavigate();

  if (!farm) {
    return (
      <EmptyState
        icon={<Sprout className="w-16 h-16" />}
        title="No farm profile found"
        description="Create your farm profile to start using MittiMitra AI."
        action={<button onClick={() => navigate('/register')} className="btn-primary">Create Farm Profile</button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Setup"
        subtitle="Manage your farm and field information"
        badge={<DemoBadge />}
        actions={
          <button className="btn-secondary text-sm flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Edit Farm
          </button>
        }
      />

      {/* Farm Info */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A2E] text-lg">{farm.name}</h2>
              <p className="text-sm text-[#6B7280]">Farm ID: {farm.id}</p>
            </div>
          </div>
          {farm.isDemo && <DemoBadge label="Demo Farm" />}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Land', value: `${farm.totalLand} ${farm.landUnit}s`, icon: Layers },
            { label: 'Soil Type', value: farm.soilType, icon: Layers },
            { label: 'Irrigation', value: farm.irrigationAvailability.charAt(0).toUpperCase() + farm.irrigationAvailability.slice(1), icon: Droplets },
            { label: 'Water Source', value: farm.waterSource || 'Not specified', icon: Droplets },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#F8F5F0] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280] font-medium">{label}</span>
              </div>
              <div className="font-semibold text-[#1A1A2E] text-sm">{value}</div>
            </div>
          ))}
        </div>

        {farm.location && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#6B7280]">
            <MapPin className="w-3.5 h-3.5" />
            Location: {farm.location.lat.toFixed(4)}°N, {farm.location.lng.toFixed(4)}°E
          </div>
        )}
      </div>

      {/* Soil Summary */}
      {soil && (
        <div className="card">
          <h3 className="font-semibold text-[#1A1A2E] mb-4">Soil Profile Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'pH', value: soil.pH.toFixed(1), unit: '' },
              { label: 'Nitrogen', value: soil.nitrogen, unit: 'kg/ha' },
              { label: 'Phosphorus', value: soil.phosphorus, unit: 'kg/ha' },
              { label: 'Potassium', value: soil.potassium, unit: 'kg/ha' },
              { label: 'EC', value: soil.ec.toFixed(1), unit: 'dS/m' },
              { label: 'Moisture', value: `${soil.moisture}`, unit: '%' },
              { label: 'Org. Carbon', value: soil.organicCarbon.toFixed(2), unit: '%' },
              { label: 'Temperature', value: soil.temperature, unit: '°C' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-[#2D6A4F]">{value}<span className="text-xs font-normal text-[#6B7280] ml-0.5">{unit}</span></div>
                <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <InfoNote variant="warning" >
            {soil.source === 'demo'
              ? 'Demo soil data — validate against Soil Health Card or laboratory measurement before making sowing decisions.'
              : 'Indicative sensor reading — validate against laboratory measurement for accuracy.'}
          </InfoNote>
        </div>
      )}

      {/* Crop History */}
      <div className="card">
        <h3 className="font-semibold text-[#1A1A2E] mb-4">Crop History</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Previous Crop', value: 'Soybean' },
            { label: 'Previous Season', value: 'Kharif 2024' },
            { label: 'Approx. Yield', value: '8 quintal/acre' },
            { label: 'Crop Rotation', value: 'Soybean → Wheat → Chickpea' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-[#6B7280] font-medium">{label}</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
