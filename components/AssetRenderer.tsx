import React from 'react';
import { AssetType } from '../types';
import { PeopleAsset } from './assets/PeopleAsset';
import { HouseAsset } from './assets/HouseAsset';
import { TechAsset } from './assets/TechAsset';
import { SportAsset } from './assets/SportAsset';
import { TravelAsset } from './assets/TravelAsset';
import { FinanceStackAsset } from './assets/FinanceStackAsset';
import { TreeAsset } from './assets/TreeAsset';
import { HealthAsset } from './assets/HealthAsset';
import { GenericAsset } from './assets/GenericAsset';

interface AssetRendererProps {
  type: AssetType;
  color: string;
}

export const AssetRenderer: React.FC<AssetRendererProps> = ({ type, color }) => {
  switch (type) {
    case 'people': return <PeopleAsset color={color} />;
    case 'home': return <HouseAsset color={color} />;
    case 'tech': return <TechAsset color={color} />;
    case 'sport': return <SportAsset color={color} />;
    case 'travel': return <TravelAsset color={color} />;
    case 'finance': return <FinanceStackAsset color={color} height={1} value="Preview" status="ok" showLabel={false} />;
    case 'nature': return <TreeAsset color={color} />;
    case 'health': return <HealthAsset color={color} />;
    case 'default':
    default:
      return <GenericAsset color={color} />;
  }
};
