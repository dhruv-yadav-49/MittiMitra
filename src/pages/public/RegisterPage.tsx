import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ChevronRight, ChevronLeft, CheckCircle2, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { DEMO_SOIL } from '../../data/soil';
import { DEMO_FARM } from '../../data/farms';
import type { Farm, SoilReading } from '../../types';

const STEPS = ['Farmer Info', 'Farm Details', 'Crop History', 'Soil Data', 'Complete'];

export default function RegisterPage() {
  const { register } = useAuth();
  const { setFarm, setSoil, loadDemoFarm } = useFarm();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', phone: '', language: 'en', state: '', district: '',
    farmName: '', land: '10', landUnit: 'acre', soilType: 'Sandy Loam', irrigation: 'moderate', waterSource: '',
    prevCrop: '', prevSeason: '', prevYield: '', cropRotation: '',
    pH: '', nitrogen: '', phosphorus: '', potassium: '', ec: '', moisture: '', organicCarbon: '', temperature: '',
  });

  const set = (k: string, v: string) => setData((prev) => ({ ...prev, [k]: v }));

  const handleComplete = async () => {
    await register({ name: data.name, phone: data.phone, preferredLanguage: data.language as 'en' | 'hi', state: data.state, district: data.district });
    const farm: Farm = {
      id: `farm-${Date.now()}`,
      farmerId: 'user-1',
      name: data.farmName || 'My Farm',
      totalLand: parseFloat(data.land) || 10,
      landUnit: data.landUnit as 'acre' | 'hectare',
      soilType: data.soilType,
      irrigationAvailability: data.irrigation as Farm['irrigationAvailability'],
      waterSource: data.waterSource,
      isDemo: false,
    };
    setFarm(farm);
    if (data.pH) {
      const soil: SoilReading = {
        farmId: farm.id, timestamp: new Date().toISOString(),
        pH: parseFloat(data.pH), nitrogen: parseFloat(data.nitrogen), phosphorus: parseFloat(data.phosphorus),
        potassium: parseFloat(data.potassium), ec: parseFloat(data.ec), moisture: parseFloat(data.moisture),
        organicCarbon: parseFloat(data.organicCarbon), temperature: parseFloat(data.temperature),
        source: 'demo', isValidated: false,
      };
      setSoil(soil);
    }
    navigate('/dashboard');
  };

  const useDemoData = () => {
    setData((p) => ({ ...p,
      pH: String(DEMO_SOIL.pH), nitrogen: String(DEMO_SOIL.nitrogen),
      phosphorus: String(DEMO_SOIL.phosphorus), potassium: String(DEMO_SOIL.potassium),
      ec: String(DEMO_SOIL.ec), moisture: String(DEMO_SOIL.moisture),
      organicCarbon: String(DEMO_SOIL.organicCarbon), temperature: String(DEMO_SOIL.temperature),
    }));
  };

  const handleDemoFarm = () => { loadDemoFarm(); navigate('/dashboard'); };

  const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1.5">{label}</label>
      <input type={type} value={data[field as keyof typeof data]} onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]" />
    </div>
  );

  const Select = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1.5">{label}</label>
      <select value={data[field as keyof typeof data]} onChange={(e) => set(field, e.target.value)}
        className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788] bg-white">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1A1A2E]">MittiMitra AI</span>
          </Link>
          <button onClick={handleDemoFarm} className="block mx-auto text-xs text-[#2D6A4F] font-semibold hover:underline">
            Skip → Try Demo Farm
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i < step ? 'bg-[#2D6A4F] text-white' : i === step ? 'bg-[#2D6A4F] text-white ring-4 ring-[#D1FAE5]' : 'bg-[#E5E0D8] text-[#6B7280]'}`}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-[#2D6A4F]' : 'bg-[#E5E0D8]'}`} />}
            </div>
          ))}
        </div>
        <div className="text-center mb-5">
          <span className="text-xs text-[#6B7280] font-medium">{STEPS[step]}</span>
        </div>

        <div className="card">
          {/* Step 0: Farmer Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[#1A1A2E] text-lg">Farmer Information</h2>
              <Input label="Full Name" field="name" placeholder="Dhruv Patel" />
              <Input label="Phone Number" field="phone" type="tel" placeholder="+91 98765 43210" />
              <Select label="Preferred Language" field="language" options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी (Hindi)' }]} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" field="state" placeholder="Rajasthan" />
                <Input label="District" field="district" placeholder="Jaipur" />
              </div>
            </div>
          )}

          {/* Step 1: Farm */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[#1A1A2E] text-lg">Farm Information</h2>
              <Input label="Farm Name" field="farmName" placeholder="My Farm" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Total Land" field="land" type="number" placeholder="10" />
                <Select label="Unit" field="landUnit" options={[{ value: 'acre', label: 'Acres' }, { value: 'hectare', label: 'Hectares' }]} />
              </div>
              <Select label="Soil Type" field="soilType" options={[
                { value: 'Sandy Loam', label: 'Sandy Loam' }, { value: 'Clay Loam', label: 'Clay Loam' },
                { value: 'Silty Loam', label: 'Silty Loam' }, { value: 'Clay', label: 'Clay' }, { value: 'Sandy', label: 'Sandy' },
              ]} />
              <Select label="Irrigation Availability" field="irrigation" options={[
                { value: 'high', label: 'High (assured irrigation)' }, { value: 'moderate', label: 'Moderate (partial irrigation)' },
                { value: 'low', label: 'Low (limited irrigation)' }, { value: 'rainfed', label: 'Rainfed only' },
              ]} />
              <Input label="Water Source" field="waterSource" placeholder="Borewell, Canal, etc." />
            </div>
          )}

          {/* Step 2: Crop History */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[#1A1A2E] text-lg">Crop History</h2>
              <Input label="Previous Crop" field="prevCrop" placeholder="Soybean" />
              <Select label="Previous Season" field="prevSeason" options={[
                { value: 'Kharif 2024', label: 'Kharif 2024' }, { value: 'Rabi 2023-24', label: 'Rabi 2023-24' },
                { value: 'Kharif 2023', label: 'Kharif 2023' }, { value: 'Rabi 2022-23', label: 'Rabi 2022-23' },
              ]} />
              <Input label="Approximate Yield (quintal/acre)" field="prevYield" type="number" placeholder="8" />
              <Input label="Crop Rotation Pattern" field="cropRotation" placeholder="Soybean → Wheat → Chickpea" />
            </div>
          )}

          {/* Step 3: Soil Data */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1A1A2E] text-lg">Soil Information</h2>
                <button onClick={useDemoData} className="text-xs text-[#2D6A4F] font-semibold bg-[#E8F5EE] px-2.5 py-1 rounded-lg hover:bg-[#D1FAE5] flex items-center gap-1">
                  <Sprout className="w-3 h-3" /> Use Demo Data
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="pH" field="pH" type="number" placeholder="6.8" />
                <Input label="Nitrogen (kg/ha)" field="nitrogen" type="number" placeholder="240" />
                <Input label="Phosphorus (kg/ha)" field="phosphorus" type="number" placeholder="32" />
                <Input label="Potassium (kg/ha)" field="potassium" type="number" placeholder="210" />
                <Input label="EC (dS/m)" field="ec" type="number" placeholder="0.8" />
                <Input label="Moisture (%)" field="moisture" type="number" placeholder="42" />
                <Input label="Organic Carbon (%)" field="organicCarbon" type="number" placeholder="0.72" />
                <Input label="Temperature (°C)" field="temperature" type="number" placeholder="24" />
              </div>
              <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ⚠ Indicative values — validate against Soil Health Card or laboratory measurement for accurate recommendations.
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#2D6A4F]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Your farm profile is ready!</h2>
              <p className="text-sm text-[#6B7280] mb-6">
                Run the AI Farm Analysis to get your crop portfolio recommendation.
              </p>
              <button onClick={handleComplete} className="btn-primary text-base px-8 py-3 justify-center w-full">
                Run AI Farm Analysis
              </button>
            </div>
          )}

          {/* Nav buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-6 pt-4 border-t border-[#E5E0D8]">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : null}
                className={`flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] ${step === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn-primary py-2"
              >
                {step === 3 ? 'Complete' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2D6A4F] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
