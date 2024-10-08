import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode, deleteNode, addChild, requestPoints, respondToRequest } from '../store/treeSlice';

function NodeView({ node, treeId }) {
  const dispatch = useDispatch();
  const requests = useSelector(state => state.tree.requests);
  const trees = useSelector(state => state.tree.trees);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editSelf, setEditSelf] = useState(node.self);
  
  const handleSave = () => {
    dispatch(updateNode({ treeId, nodeId: node.id, updates: { name: editName, self: Number(editSelf) } }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(deleteNode({ treeId, nodeId: node.id }));
  };

  const handleAddChild = () => {
    const newNodeName = prompt('Enter name for new child node:');
    if (newNodeName) {
      const newNode = {
        name: newNodeName,
        self: 0,
        total: 0,
      };
      dispatch(addChild({ treeId, parentId: node.id, newNode }));
    }
  };

  const handleRequestPoints = () => {
    const amount = Number(prompt('Enter amount to request:'));
    const toTreeId = Number(prompt('Enter tree ID to request from:'));
    

    const toNodeId = Number(prompt('Enter node ID to request from:'));
    
    const targetTree = trees.find(t => t.id === toTreeId);
    if (!targetTree) {
      alert('Target tree not found.');
      return;
    }
  
    const findNode = (tree, nodeId) => {
      if (tree.id === nodeId) return tree;
      if (tree.children) {
        for (let child of tree.children) {
          const found = findNode(child, nodeId);
          if (found) return found;
        }
      }
      return null;
    };
  
    const targetNode = findNode(targetTree, toNodeId);
  
    if (!targetNode) {
      alert('Target node not found.');
      return;
    }
  
    if (amount && toTreeId && toNodeId) {
      console.log('Requesting Points:', { fromTreeId: treeId, fromNodeId: node.id, toTreeId, toNodeId, amount });
      dispatch(requestPoints({ fromTreeId: treeId, fromNodeId: node.id, toTreeId, toNodeId, amount }));
    }
  };

  const incomingRequests = requests.filter(r => r.toTreeId === treeId && r.toNodeId === node.id && r.status === 'pending');
  const outgoingRequests = requests.filter(r => r.fromTreeId === treeId && r.fromNodeId === node.id);

  return (
    <div className="node-view">
      <div style={{ fontSize: '0.8em', color: 'gray' }}>ID: {node.id}</div>
      
      {isEditing ? (
        <>
          <input value={editName} onChange={e => setEditName(e.target.value)} />
          <input type="number" value={editSelf} onChange={e => setEditSelf(e.target.value)} />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <span>{node.name}</span>
          <span>Self: {node.self}</span>
          <span>Total: {node.total}</span>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </>
      )}
      
      <button onClick={handleAddChild}>Add Child</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleRequestPoints}>Request Points</button>

      {incomingRequests.length > 0 && (
        <div className="requests">
          <h4>Incoming Requests:</h4>
          {incomingRequests.map(request => (
            <div key={request.id}>
              <span>{request.amount} points requested by Tree {request.fromTreeId}, Node {request.fromNodeId}</span>
              <button onClick={() => {
                if (node.self >= request.amount) {
                  dispatch(respondToRequest({ requestId: request.id, accepted: true }));
                } else {
                  alert('Insufficient points to fulfill this request.');
                }
              }}>Accept</button>
              <button onClick={() => {
                const reason = prompt('Enter reason for rejection:');
                dispatch(respondToRequest({ requestId: request.id, accepted: false, reason }));
              }}>Reject</button>
            </div>
          ))}
        </div>
      )}

      {outgoingRequests.length > 0 && (
        <div className="requests">
          <h4>Outgoing Requests:</h4>
          {outgoingRequests.map(request => (
            <div key={request.id}>
              <span>{request.amount} points requested from Tree {request.toTreeId}, Node {request.toNodeId}</span>
              <span> ({request.status})</span>
              {request.status === 'rejected' && <span> Reason: {request.reason}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NodeView;