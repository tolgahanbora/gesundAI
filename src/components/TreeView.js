import React from 'react';
import NodeView from './NodeView';

function TreeView({ tree }) {
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
      <ul>
        {renderNode(tree)}
      </ul>
    </div>
  );
}

export default TreeView;