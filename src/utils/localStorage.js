export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('treeState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('treeState', serializedState);
  } catch {
    console.error("Failed to save state to localStorage");
  }
};