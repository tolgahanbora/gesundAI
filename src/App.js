import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TreeView from './components/TreeView';
import { addTree } from './store/treeSlice';

function App() {
  const trees = useSelector(state => state.tree.trees);
  const dispatch = useDispatch();

  const handleAddTree = () => {
    const treeName = prompt('Enter tree name:');
    if (treeName) {
      dispatch(addTree({ name: treeName }));
    }
  };

  return (
    <div className="App">
      <h1>Tree Management Application</h1>
      <button onClick={handleAddTree}>Add New Tree</button>
      {trees.map(tree => (
        <TreeView key={tree.id} tree={tree} />
      ))}
    </div>
  );
}

export default App;