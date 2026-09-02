import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// App pages
import DashboardPage from './pages/app/DashboardPage';
import FieldSetupPage from './pages/app/FieldSetupPage';
import SoilPage from './pages/app/SoilPage';
import WeatherWaterPage from './pages/app/WeatherWaterPage';
import MarketPage from './pages/app/MarketPage';
import AiAnalysisPage from './pages/app/AiAnalysisPage';
import PortfolioPage from './pages/app/PortfolioPage';
import SimulatorPage from './pages/app/SimulatorPage';
import SeasonPlannerPage from './pages/app/SeasonPlannerPage';
import ActionPlanPage from './pages/app/ActionPlanPage';
import HistoryPage from './pages/app/HistoryPage';
import SettingsPage from './pages/app/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <FarmProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/field-setup" element={<FieldSetupPage />} />
                <Route path="/soil" element={<SoilPage />} />
                <Route path="/weather-water" element={<WeatherWaterPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/ai-analysis" element={<AiAnalysisPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/season-planner" element={<SeasonPlannerPage />} />
                <Route path="/action-plan" element={<ActionPlanPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </AuthProvider>
  );
}

export default App;
