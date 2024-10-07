import { configureStore } from '@reduxjs/toolkit';
import treeReducer from './treeSlice';
import { loadState, saveState } from '../utils/localStorage';

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    tree: treeReducer,
  },
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveState(store.getState());
});