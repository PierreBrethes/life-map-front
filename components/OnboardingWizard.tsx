
import React, { useState } from 'react';
import { Wallet, Heart, Home, Users, Plane, Check, Plus, Minus, Sparkles } from 'lucide-react';
import { Category, LifeItem } from '../types';

interface OnboardingWizardProps {
  onFinish: (data: Category[]) => void;
}

interface AreaConfig {
  id: string;
  label: string;
  icon: any;
  color: string;
  count: number;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
  const [areas, setAreas] = useState<AreaConfig[]>([
    { id: 'finance', label: 'Comptes & Épargne', icon: Wallet, color: '#6366f1', count: 2 },
    { id: 'realestate', label: 'Biens Immobiliers', icon: Home, color: '#14b8a6', count: 1 },
    { id: 'health', label: 'Santé & Bien-être', icon: Heart, color: '#10b981', count: 1 },
    { id: 'family', label: 'Famille & Amis', icon: Users, color: '#f59e0b', count: 0 },
    { id: 'travel', label: 'Projets Voyage', icon: Plane, color: '#3b82f6', count: 0 },
  ]);

  const updateCount = (id: string, delta: number) => {
    setAreas(prev => prev.map(area => {
      if (area.id === id) {
        return { ...area, count: Math.max(0, area.count + delta) };
      }
      return area;
    }));
  };

  const handleGenerate = () => {
    const categories: Category[] = [];
    
    // Helper to generate ID
    const genId = () => Math.random().toString(36).substr(2, 9);

    // 1. Finances Category
    const financeConfig = areas.find(a => a.id === 'finance');
    if ((financeConfig?.count || 0) > 0) {
        const items: LifeItem[] = [];
        for(let i=0; i < (financeConfig?.count || 0); i++) {
            items.push({ 
                id: genId(), 
                name: i === 0 ? 'Compte Courant' : `Épargne ${i}`, 
                value: i === 0 ? '2500' : '10000', 
                type: 'currency', 
                status: 'ok', 
                assetType: 'finance'
            });
        }
        categories.push({ category: 'Finances', color: '#6366f1', icon: 'Wallet', items });
    }

    // 2. Real Estate
    const homeConfig = areas.find(a => a.id === 'realestate');
    if ((homeConfig?.count || 0) > 0) {
        const items: LifeItem[] = [];
        for(let i=0; i < (homeConfig?.count || 0); i++) {
            items.push({ 
                id: genId(), 
                name: i === 0 ? 'Résidence Principale' : `Appartement ${i+1}`, 
                value: 'Paris', 
                type: 'text', 
                status: 'ok', 
                assetType: 'home' 
            });
        }
        categories.push({ category: 'Immobilier', color: '#14b8a6', icon: 'Home', items });
    }

    // 3. Health
    const healthConfig = areas.find(a => a.id === 'health');
    if ((healthConfig?.count || 0) > 0) {
        const items: LifeItem[] = [];
         for(let i=0; i < (healthConfig?.count || 0); i++) {
            items.push({ 
                id: genId(), 
                name: i===0 ? 'Mutuelle' : `Suivi Médical ${i+1}`, 
                value: 'Actif', 
                type: 'text', 
                status: 'ok', 
                assetType: 'health' 
            });
        }
        categories.push({ category: 'Santé', color: '#10b981', icon: 'Activity', items });
    }

    // 4. Family
    const famConfig = areas.find(a => a.id === 'family');
    if ((famConfig?.count || 0) > 0) {
        const items: LifeItem[] = [];
        for(let i=0; i < (famConfig?.count || 0); i++) {
            items.push({ 
                id: genId(), 
                name: `Membre ${i+1}`, 
                value: 'Famille', 
                type: 'text', 
                status: 'ok', 
                assetType: 'people' 
            });
        }
        categories.push({ category: 'Famille', color: '#f59e0b', icon: 'Users', items });
    }

    // 5. Travel
    const travelConfig = areas.find(a => a.id === 'travel');
    if ((travelConfig?.count || 0) > 0) {
        const items: LifeItem[] = [];
        for(let i=0; i < (travelConfig?.count || 0); i++) {
            items.push({ 
                id: genId(), 
                name: `Voyage ${i+1}`, 
                value: 'Destination', 
                type: 'text', 
                status: 'ok', 
                assetType: 'travel' 
            });
        }
        // Check if Loisirs exists or create it
        categories.push({ category: 'Loisirs', color: '#3b82f6', icon: 'Plane', items });
    }

    onFinish(categories);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl p-8 m-4 border border-white/20 ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={32} />
                </div>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
                Bienvenue sur LifeMap
            </h1>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                Configurons ensemble votre point de départ. Sélectionnez les éléments que vous souhaitez voir apparaître dans votre univers 3D.
            </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl transition-colors" style={{ backgroundColor: `${area.color}20`, color: area.color }}>
                            <area.icon size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{area.label}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">
                                {area.count === 0 ? 'Non inclus' : `${area.count} élément(s)`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border dark:border-slate-700">
                        <button 
                            onClick={() => updateCount(area.id, -1)}
                            disabled={area.count === 0}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 disabled:opacity-30 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 dark:text-white text-sm">{area.count}</span>
                        <button 
                            onClick={() => updateCount(area.id, 1)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-indigo-600 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={handleGenerate}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 transform active:scale-[0.99] transition-all flex items-center justify-center gap-3"
        >
            <Check size={20} />
            <span>Générer mon Univers</span>
        </button>

      </div>
    </div>
  );
};

export default OnboardingWizard;
