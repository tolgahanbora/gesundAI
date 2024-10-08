import React from 'react';
import { useDispatch } from 'react-redux';
import NodeView from './NodeView';
import { deleteTree } from '../store/treeSlice';

function TreeView({ tree }) {
  const dispatch = useDispatch();

  const handleDeleteTree = () => {
    if (window.confirm(`Are you sure you want to delete the tree "${tree.name}"?`)) {
      dispatch(deleteTree({ treeId: tree.id }));
    }
  };

  const renderNode = (node) => (
    <li key={node.id}>
      <NodeView node={node} treeId={tree.id} />
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(renderNode)}
        </ul>
      )}
    </li>
  );

  return (
    <div className="tree-view">
      <h2>{tree.name} (ID: {tree.id})</h2>
      <button onClick={handleDeleteTree}>Delete Tree</button>
      <ul>
        {renderNode(tree)}
      </ul>
    </div>
  );
}

export default TreeView;