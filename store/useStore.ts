import { create } from 'zustand';
import { LifeItem, AssetType, SelectionState } from '../types';

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
}

interface AppState {
  // Island Selection
  selectedIslandId: string | null;
  selectIsland: (id: string | null) => void;

  // Selection
  selection: SelectionState | null;
  setSelection: (selection: SelectionState | null) => void;

  // Modal Management
  modalState: ModalState;
  selectedItem: LifeItem | null; // For editing/viewing specific items
  selectedAssetType: AssetType | null; // For creating new items of a specific type

  openCreateModal: (assetType?: AssetType) => void;
  openEditModal: (item: LifeItem) => void;
  openViewModal: (item: LifeItem) => void;
  closeModal: () => void;
  // Connection Creation
  connectionMode: 'idle' | 'selecting-source' | 'selecting-target';
  connectionSource: SelectionState | null;
  selectedDependencyId: string | null;

  startConnection: (source?: SelectionState) => void;
  setConnectionTarget: (target: SelectionState) => void;
  cancelConnection: () => void;
  selectDependency: (id: string | null) => void;

  // UI Toggles
  showConnections: boolean;
  toggleConnections: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedIslandId: null,
  selectIsland: (id) => set({ selectedIslandId: id }),

  // Selection
  selection: null,
  setSelection: (selection) => set({ selection, selectedDependencyId: null }),

  modalState: { isOpen: false, mode: 'view' },
  selectedItem: null,
  selectedAssetType: null,

  openCreateModal: (assetType) => set({
    modalState: { isOpen: true, mode: 'create' },
    selectedAssetType: assetType || 'default',
    selectedItem: null,
  }),

  openEditModal: (item) => set({
    modalState: { isOpen: true, mode: 'edit' },
    selectedItem: item,
    selectedAssetType: item.assetType || 'default',
  }),

  openViewModal: (item) => set({
    modalState: { isOpen: true, mode: 'view' },
    selectedItem: item,
    selectedAssetType: item.assetType || 'default',
  }),

  closeModal: () => set({
    modalState: { isOpen: false, mode: 'view' },
    selectedItem: null,
    selectedAssetType: null,
  }),
  // Connections
  connectionMode: 'idle',
  connectionSource: null,
  selectedDependencyId: null,

  startConnection: (source) => set((state) => ({
    connectionMode: source ? 'selecting-target' : 'selecting-source',
    connectionSource: source || null,
  })),

  setConnectionTarget: (target) => set({
    // Logic usually handled in UI/App, but state is stored here
    connectionMode: 'idle',
    connectionSource: null,
  }),

  cancelConnection: () => set({
    connectionMode: 'idle',
    connectionSource: null,
  }),

  selectDependency: (id) => set({ selectedDependencyId: id, selection: null }),

  // UI Toggles
  showConnections: true,
  toggleConnections: () => set((state) => ({ showConnections: !state.showConnections })),
}));
