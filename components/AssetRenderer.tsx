import React from 'react';
import { AssetType } from '../types';
import { isGlbAsset } from '../utils/assetMapping';

// Unified GLB Asset
import { GlbAsset } from './assets/GlbAsset';

// Procedural Assets (kept separate)
import { TechAsset } from './assets/TechAsset';
import { SportAsset } from './assets/SportAsset';
import { FinanceStackAsset } from './assets/FinanceStackAsset';
import { TreeAsset } from './assets/TreeAsset';
import { HealthAsset } from './assets/HealthAsset';
import { GenericAsset } from './assets/GenericAsset';
import { CardAsset } from './assets/CardAsset';
import { SafeAsset } from './assets/SafeAsset';
import { GraphAsset } from './assets/GraphAsset';
import { DebtAsset } from './assets/DebtAsset';
import { BriefcaseAsset } from './assets/BriefcaseAsset';
import { ShieldAsset } from './assets/ShieldAsset';
import { PeopleAsset } from './assets/PeopleAsset';

interface AssetRendererProps {
  type: AssetType;
  color: string;
}

export const AssetRenderer: React.FC<AssetRendererProps> = ({ type, color }) => {
  // Use unified GlbAsset for all GLB-based models
  if (isGlbAsset(type)) {
    return <GlbAsset assetType={type} color={color} />;
  }

  // Procedural assets - individual components
  switch (type) {
    // --- SPORT ---
    case 'sport':
      return <SportAsset color={color} />;

    // --- TECH / WORK ---
    case 'tech':
    case 'job':
      return <TechAsset color={color} />;
    case 'freelance':
      return <BriefcaseAsset color={color} />;

    // --- HEALTH ---
    case 'health':
    case 'medical':
      return <HealthAsset color={color} />;
    case 'insurance':
      return <ShieldAsset color={color} />;

    // --- NATURE ---
    case 'nature':
      return <TreeAsset color={color} />;

    // --- FINANCE ---
    case 'finance':
      return <FinanceStackAsset color={color} height={1} value="Preview" status="ok" showLabel={false} />;
    case 'current_account':
      return <CardAsset color={color} />;
    case 'savings':
      return <SafeAsset color={color} />;
    case 'investments':
      return <GraphAsset color={color} />;
    case 'debt':
      return <DebtAsset color={color} />;

    // --- PEOPLE ---
    case 'people':
      return <PeopleAsset color={color} />;

    default:
      return <GenericAsset color={color} />;
  }
};

