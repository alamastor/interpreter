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

const visitTree = (root: ViewNode, callback: ViewNode => void) => {
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
    key = node.data.name;
  } else {
    const parent = node.parent;
    if (Array.isArray(parent.children)) {
      const siblings = parent.children;
      const twins = siblings.filter(
        sibling => sibling.data.name === node.data.name,
      );
      const twinNumber = twins.findIndex(sibling => sibling === node);
      key = viewNodeKey(parent) + ":" + node.data.name + "." + twinNumber;
    } else {
      throw new Error("Parent must have children");
    }
  }
  return key;
};

const findViewNode = (root: ViewNode, key: string) => {
  if (viewNodeKey(root) === key) {
    return root;
  }
  if (Array.isArray(root.children)) {
    return root.children
      .map(child => findViewNode(child, key))
      .find(x => x !== undefined);
  }
};
