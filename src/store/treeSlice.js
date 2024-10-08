import { createSlice } from '@reduxjs/toolkit';
import { loadState } from '../utils/localStorage';

const persistedState = loadState();

let nextGlobalId = 1;

// Function to find the highest ID in the entire state
const findHighestId = (state) => {
  let highestId = 0;
  
  const traverse = (node) => {
    if (node.id > highestId) highestId = node.id;
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  state.trees.forEach(traverse);
  state.requests.forEach(request => {
    if (request.id > highestId) highestId = request.id;
  });

  return highestId;
};

// Initialize the state
const initialState = persistedState?.tree || {
  trees: [],
  requests: [],
};

// Set the nextGlobalId based on the highest existing ID
nextGlobalId = findHighestId(initialState) + 1;

const findNode = (tree, nodeId) => {
  if (!tree || !nodeId) return null;
  if (tree.id === nodeId) return tree;
  if (tree.children) {
    for (let child of tree.children) {
      const found = findNode(child, nodeId);
      if (found) return found;
    }
  }
  return null;
};

const recalculateTotal = (node) => {
  if (node.children) {
    node.total = node.self + node.children.reduce((sum, child) => sum + recalculateTotal(child), 0);
  } else {
    node.total = node.self;
  }
  return node.total;
};

export const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    addTree: (state, action) => {
      const newTree = {
        ...action.payload,
        id: nextGlobalId++,
        self: 100,
        total: 100,
        children: [],
      };
      state.trees.push(newTree);
    },
    updateNode: (state, action) => {
      const { treeId, nodeId, updates } = action.payload;
      const tree = state.trees.find(t => t.id === treeId);
      if (tree) {
        const node = findNode(tree, nodeId);
        if (node) {
          Object.assign(node, updates);
          recalculateTotal(tree);
        }
      }
    },
    addChild: (state, action) => {
      const { treeId, parentId, newNode } = action.payload;
      const tree = state.trees.find(t => t.id === treeId);
      if (tree) {
        const parent = findNode(tree, parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          const childNode = {
            ...newNode,
            id: nextGlobalId++,
            self: 0,
            total: 0,
            children: [],
          };
          parent.children.push(childNode);
          recalculateTotal(tree);
        }
      }
    },
    deleteNode: (state, action) => {
      const { treeId, nodeId } = action.payload;
      const tree = state.trees.find(t => t.id === treeId);
      if (tree) {
        const deleteNodeRecursive = (node) => {
          if (node.children) {
            node.children = node.children.filter(child => {
              if (child.id === nodeId) return false;
              return deleteNodeRecursive(child);
            });
          }
          return true;
        };
        deleteNodeRecursive(tree);
        recalculateTotal(tree);
      }
    },
    deleteTree: (state, action) => {
      const { treeId } = action.payload;
      state.trees = state.trees.filter(tree => tree.id !== treeId);
      // Also delete all requests associated with this tree
      state.requests = state.requests.filter(request => 
        request.fromTreeId !== treeId && request.toTreeId !== treeId
      );
    },
    requestPoints: (state, action) => {
      const { fromTreeId, fromNodeId, toTreeId, toNodeId, amount } = action.payload;
      
      const fromTree = state.trees.find(t => t.id === fromTreeId);
      const toTree = state.trees.find(t => t.id === toTreeId);

      if (!fromTree || !toTree) {
        console.error('Either the fromTree or toTree was not found.');
        return;
      }

      const fromNode = findNode(fromTree, fromNodeId);
      const toNode = findNode(toTree, toNodeId);
    
      if (!fromNode || !toNode) {
        console.error("Invalid nodes for point request");
        return;
      }
    
      if (toNode.self < amount) {
        console.error("Insufficient points for request");
        return;
      }
    
      const request = {
        id: nextGlobalId++,
        fromTreeId,
        fromNodeId,
        toTreeId,
        toNodeId,
        amount,
        status: 'pending',
      };
      state.requests.push(request);
    },
    respondToRequest: (state, action) => {
      const { requestId, accepted, reason } = action.payload;
      const request = state.requests.find(r => r.id === requestId);
      if (request) {
        request.status = accepted ? 'accepted' : 'rejected';
        request.reason = reason;
        if (accepted) {
          const fromTree = state.trees.find(t => t.id === request.fromTreeId);
          const toTree = state.trees.find(t => t.id === request.toTreeId);
          if (fromTree && toTree) {
            const fromNode = findNode(fromTree, request.fromNodeId);
            const toNode = findNode(toTree, request.toNodeId);
            if (fromNode && toNode && toNode.self >= request.amount) {
              fromNode.self += request.amount;
              toNode.self -= request.amount;
              recalculateTotal(fromTree);
              recalculateTotal(toTree);
            } else {
              console.error('Error in point transfer: Invalid nodes or insufficient points');
              request.status = 'failed';
              request.reason = 'Error in point transfer';
            }
          } else {
            console.error('Error in point transfer: Trees not found');
            request.status = 'failed';
            request.reason = 'Error in point transfer';
          }
        }
      }
    },
  },
});

export const { addTree, updateNode, addChild, deleteNode, deleteTree, requestPoints, respondToRequest } = treeSlice.actions;

export default treeSlice.reducer;