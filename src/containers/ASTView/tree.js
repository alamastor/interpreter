/* @flow */
import type { Node } from "./Stratifier";
export type ViewNode = {
  children?: Array<ViewNode>,
  x?: number,
  y?: number,
  parent: ?ViewNode,
  data: Node,
};

export const getNodeX = (node: ViewNode): number => node.x || 0;
export const getNodeY = (node: ViewNode): number => node.y || 0;
export const getNodeParentX = (node: ViewNode): number =>
  node.parent ? getNodeX(node.parent) : getNodeX(node);
export const getNodeParentY = (node: ViewNode): number =>
  node.parent ? getNodeY(node.parent) : getNodeY(node);

export const reduceTree = <T>(
  root: ViewNode,
  callback: (T, ViewNode) => T,
  initialValue: T,
): T => {
  let accumulator = initialValue;
  accumulator = callback(accumulator, root);
  if (root.children) {
    root.children.forEach(child => {
      accumulator = reduceTree(child, callback, accumulator);
    });
  }
  return accumulator;
};

const treeMinX = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevX: number, node: ViewNode) => {
      if (typeof node.x === "number" && node.x < prevX) {
        return node.x;
      } else {
        return prevX;
      }
    },
    Infinity,
  );

export const treeMaxX = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevX: number, node: ViewNode) => {
      if (typeof node.x === "number" && node.x > prevX) {
        return node.x;
      } else {
        return prevX;
      }
    },
    -Infinity,
  );

const treeMinY = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevY: number, node: ViewNode) => {
      if (typeof node.y === "number" && node.y < prevY) {
        return node.y;
      } else {
        return prevY;
      }
    },
    Infinity,
  );

export const treeMaxY = (tree: ViewNode) =>
  reduceTree(
    tree,
    (prevY: number, node: ViewNode) => {
      if (typeof node.y === "number" && node.y > prevY) {
        return node.y;
      } else {
        return prevY;
      }
    },
    0,
  );

export const visitTree = (root: ViewNode, callback: ViewNode => void) => {
  callback(root);
  if (root.children) {
    root.children.forEach(child => {
      visitTree(child, callback);
    });
  }
};

export const mapTreeToNewCoords = (tree: ViewNode) => {
  const minX = treeMinX(tree);
  const minY = treeMinY(tree);
  visitTree(tree, (node: ViewNode) => {
    const oldX = node.x;
    const oldY = node.y;
    if (typeof oldX === "number" && typeof oldY === "number") {
      node.x = oldY - minY;
      node.y = oldX - minX;
    }
  });
};

export const viewNodeKey = (node: ViewNode): string => {
  let key: string;
  if (!node.parent) {
    key = "root";
  } else {
    const parent = node.parent;
    if (Array.isArray(parent.children)) {
      const siblings = parent.children;
      const twins = siblings.filter(
        sibling => sibling.data.type === node.data.type,
      );
      const twinNumber = twins.findIndex(sibling => sibling === node);
      key = viewNodeKey(parent) + ":" + node.data.type + "." + twinNumber;
    } else {
      throw new Error("Parent must have children");
    }
  }
  return key;
};

export const findNode = (root: ViewNode, node: ViewNode): ?ViewNode => {
  if (viewNodeKey(root) === viewNodeKey(node)) {
    return root;
  } else if (Array.isArray(root.children)) {
    return root.children
      .map(child => findNode(child, node))
      .find(x => x !== undefined);
  }
};

export const replaceNodeInTree = (
  root: Node,
  origNode: Node,
  newNode: Node,
) => {
  if (root === origNode) {
    return newNode;
  }
  if (!root.children) {
    return root;
  }
  const oldChildren = root.children;
  const oldChildIndex = oldChildren.indexOf(origNode);
  if (oldChildIndex !== -1) {
    const newChildren = [
      ...oldChildren.slice(0, oldChildIndex),
      newNode,
      ...oldChildren.slice(oldChildIndex + 1),
    ];
    return Object.assign({}, root, {
      children: newChildren,
    });
  }
  return Object.assign({}, root, {
    children: oldChildren.map(child =>
      replaceNodeInTree(child, origNode, newNode),
    ),
  });
};

export const getYoungestExistingParent = (
  node: ViewNode,
  exitingNodes: Set<ViewNode>,
): ViewNode => {
  if (!exitingNodes.has(node)) {
    return node;
  } else {
    if (node.parent) {
      return getYoungestExistingParent(node.parent, exitingNodes);
    } else {
      return node;
    }
  }
};
