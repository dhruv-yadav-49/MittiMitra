// ============================================================
// MittiMitra AI — Farm Context
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Farm, SoilReading, Portfolio, CropRecommendation, Language, LandUnit } from '../types';
import { DEMO_FARM } from '../data/farms';
import { DEMO_SOIL } from '../data/soil';
import { DEMO_PORTFOLIO, DEMO_RECOMMENDATIONS } from '../data/recommendations';

interface FarmState {
  farm: Farm | null;
  soil: SoilReading | null;
  recommendations: CropRecommendation[];
  portfolio: Portfolio | null;
  analysisRun: boolean;
  language: Language;
  landUnit: LandUnit;
}

interface FarmContextValue extends FarmState {
  loadDemoFarm: () => void;
  setFarm: (farm: Farm) => void;
  setSoil: (soil: SoilReading) => void;
  setRecommendations: (recs: CropRecommendation[]) => void;
  setPortfolio: (p: Portfolio) => void;
  setAnalysisRun: (run: boolean) => void;
  setLanguage: (lang: Language) => void;
  setLandUnit: (unit: LandUnit) => void;
}

const FarmContext = createContext<FarmContextValue | null>(null);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FarmState>({
    farm: null,
    soil: null,
    recommendations: [],
    portfolio: null,
    analysisRun: false,
    language: 'en',
    landUnit: 'acre',
  });

  const setPartial = (partial: Partial<FarmState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const loadDemoFarm = useCallback(() => {
    setPartial({
      farm: DEMO_FARM,
      soil: DEMO_SOIL,
      recommendations: DEMO_RECOMMENDATIONS,
      portfolio: DEMO_PORTFOLIO,
      analysisRun: true,
    });
  }, []);

  return (
    <FarmContext.Provider
      value={{
        ...state,
        loadDemoFarm,
        setFarm: (farm) => setPartial({ farm }),
        setSoil: (soil) => setPartial({ soil }),
        setRecommendations: (recommendations) => setPartial({ recommendations }),
        setPortfolio: (portfolio) => setPartial({ portfolio }),
        setAnalysisRun: (analysisRun) => setPartial({ analysisRun }),
        setLanguage: (language) => setPartial({ language }),
        setLandUnit: (landUnit) => setPartial({ landUnit }),
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarm must be inside FarmProvider');
  return ctx;
}
