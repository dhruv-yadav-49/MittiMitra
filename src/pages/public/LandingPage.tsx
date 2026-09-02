import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, ChevronRight, TestTube2, CloudSun, TrendingUp,
  Brain, PieChart, Sliders, CheckCircle2, AlertTriangle, Zap, Shield, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';

const FEATURES = [
  { icon: TestTube2, title: 'Soil Intelligence', desc: 'Multi-parameter soil analysis with health scoring and crop compatibility mapping' },
  { icon: CloudSun, title: 'Weather & Water', desc: 'Season weather data, rainfall analysis and water stress modeling for crop selection' },
  { icon: TrendingUp, title: 'Market Intelligence', desc: 'Mandi price tracking, trend analysis and revenue projections for informed decisions' },
  { icon: Brain, title: 'AI Decision Engine', desc: 'Multi-source data fusion to rank crops by suitability, yield, profitability and risk' },
  { icon: PieChart, title: 'Portfolio Optimizer', desc: 'Optimize land allocation across multiple crops to balance profit and risk' },
  { icon: Sliders, title: 'What-If Simulator', desc: 'Model the impact of rainfall, price or water changes on your crop decisions' },
];

const TECH_STACK = [
  { label: 'Soil Sensing', items: ['ESP32', 'IoT Sensors', 'Offline Sync'] },
  { label: 'Data Sources', items: ['IMD Weather', 'Agmarknet', 'Soil Health Card'] },
  { label: 'AI Engine', items: ['XGBoost', 'Random Forest', 'FastAPI'] },
  { label: 'Platform', items: ['React', 'PostgreSQL', 'Supabase'] },
];

export default function LandingPage() {
  const { loginAsDemo } = useAuth();
  const { loadDemoFarm } = useFarm();
  const navigate = useNavigate();

  const handleDemo = () => {
    loginAsDemo();
    loadDemoFarm();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1A1A2E]">MittiMitra AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDemo} className="text-sm font-medium text-[#2D6A4F] hover:underline">
              Try Demo
            </button>
            <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F8F5F0] via-white to-[#E8F5EE]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#52B788]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D4A017]/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5EE] rounded-full text-[#2D6A4F] text-xs font-semibold mb-6">
                <Zap className="w-3 h-3" />
                AI-Powered Farm Decision Support — MVP Demo
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#1A1A2E] leading-tight mb-6">
                From Soil Intelligence to{' '}
                <span className="text-[#2D6A4F]">Profitable</span>{' '}
                Farm Planning
              </h1>
              <p className="text-lg text-[#4B5563] leading-relaxed mb-8 max-w-xl">
                AI-powered crop planning that combines soil, weather, water and market intelligence
                to help farmers make risk-aware decisions — not just crop recommendations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Start Farm Analysis <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={handleDemo} className="btn-secondary text-base px-6 py-3">
                  Explore Demo Farm
                </button>
              </div>
              <p className="mt-4 text-xs text-[#6B7280]">No hardware required · Works completely in demo mode · Free for hackathon evaluation</p>
            </div>

            {/* Pipeline Visual */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xl p-6">
                <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
                  MittiMitra AI Pipeline
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Data Inputs', items: ['Soil', 'Weather', 'Water', 'Market', 'Crop History'], color: 'bg-blue-50 border-blue-200' },
                    { label: 'AI Decision Engine', items: ['Suitability', 'Yield', 'Profit', 'Risk'], color: 'bg-[#E8F5EE] border-[#52B788]' },
                    { label: 'Optimization', items: ['Portfolio', 'What-If', '3-Season'], color: 'bg-amber-50 border-amber-200' },
                    { label: 'Farmer Output', items: ['Action Plan', 'Alerts', 'History'], color: 'bg-emerald-50 border-emerald-300' },
                  ].map((layer, i) => (
                    <div key={i}>
                      <div className={`rounded-xl border p-3 ${layer.color}`}>
                        <div className="text-xs font-semibold text-[#1A1A2E] mb-2">{layer.label}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {layer.items.map((item) => (
                            <span key={item} className="px-2 py-0.5 bg-white rounded-md text-xs font-medium text-[#4B5563] border border-gray-100 shadow-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      {i < 3 && (
                        <div className="flex justify-center my-1">
                          <ChevronRight className="w-4 h-4 text-[#2D6A4F] rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#E5E0D8] text-center">
                  <span className="text-xs text-[#6B7280]">Demo mode — no external APIs required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-[#F8F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">The Problem</h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">
              Farmers face complex decisions with fragmented, incomplete and often inaccurate information.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: 'Fragmented Data', desc: 'Soil, weather, market and water information exist in isolation. No system connects them for the farmer.' },
              { icon: AlertTriangle, title: 'Single-Crop Thinking', desc: 'Existing tools recommend one crop. Farms with 5-20 acres need multi-crop portfolio decisions.' },
              { icon: AlertTriangle, title: 'No Risk Awareness', desc: 'Recommendations ignore weather risk, price volatility and water stress — leading to poor outcomes.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="card border-l-4 border-l-[#E76F51]">
                <Icon className="w-5 h-5 text-[#E76F51] mb-3" />
                <h3 className="font-semibold text-[#1A1A2E] mb-2">{title}</h3>
                <p className="text-sm text-[#6B7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Differentiator */}
      <section className="py-20 bg-[#2D6A4F] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Core Principle</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-red-300 font-semibold text-sm mb-3 uppercase tracking-wider">What Others Do</div>
              <div className="text-xl font-bold">Soil Input → Single Crop Recommendation</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-6 border border-[#52B788]">
              <div className="text-[#74C69D] font-semibold text-sm mb-3 uppercase tracking-wider">What MittiMitra Does</div>
              <div className="text-xl font-bold">Farm Data → Multi-Source Intelligence → AI Engine → Profit + Risk → Multi-Crop Portfolio → Action Plan</div>
            </div>
          </div>
          <p className="mt-8 text-lg text-[#B7E4C7] italic font-medium">
            "We don't just recommend a crop. We optimize the farm."
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Key Features</h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">
              A complete decision support system designed for modern farmers and agricultural advisors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#2D6A4F] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[#1A1A2E] mb-2">{title}</h3>
                <p className="text-sm text-[#6B7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-[#F8F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">How MittiMitra Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Setup Your Farm', desc: 'Enter farm details, soil data and crop history', icon: TestTube2 },
              { step: '02', title: 'AI Analysis', desc: 'Our engine fuses soil, weather, water and market data', icon: Brain },
              { step: '03', title: 'Crop Portfolio', desc: 'Get optimized land allocation across multiple crops', icon: PieChart },
              { step: '04', title: 'Take Action', desc: 'Follow your customized farm action plan', icon: CheckCircle2 },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 right-0 w-full h-0.5 bg-[#E5E0D8] translate-x-1/2" />
                )}
                <div className="card text-center relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#2D6A4F] flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-[#52B788] mb-1">STEP {step}</div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-2">{title}</h3>
                  <p className="text-sm text-[#6B7280]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Technology Stack</h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto">
              Built for production-readiness with future integrations pre-architected.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {TECH_STACK.map(({ label, items }, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded bg-[#E8F5EE] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] text-sm">{label}</h3>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#1B4332] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Who Benefits</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: 'Small & Medium Farmers', desc: 'Make data-informed crop decisions without needing an agriculture expert on call' },
              { icon: Shield, title: 'FPOs & Cooperatives', desc: 'Help member farmers plan collectively and access market intelligence at scale' },
              { icon: BarChart3, title: 'KVK & Extension Workers', desc: 'Use as a demonstration and advisory tool in farmer training programs' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <Icon className="w-8 h-8 text-[#74C69D] mb-4" />
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-[#B7E4C7] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Farm?</h2>
          <p className="text-[#B7E4C7] mb-8 max-w-xl mx-auto">
            Try the complete demo — no registration required. Experience the full AI analysis flow in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-accent text-base px-8 py-3">
              Start Farm Analysis <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={handleDemo} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-8 py-3 font-semibold text-base transition-all">
              Explore Demo Farm
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">MittiMitra AI</span>
          </div>
          <div className="text-sm text-gray-400 text-center">
            MVP Demo — Hackathon Build · All values are model simulations · Not financial advice
          </div>
          <div className="text-xs text-gray-500">© 2024 MittiMitra AI</div>
        </div>
      </footer>
    </div>
  );
}
