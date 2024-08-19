import React, { useState, useEffect } from 'react';
import Node from './Node';

const rows = 20;
const cols = 20;
const createGrid = () => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const node = {
        row: i,
        col: j,
        isStart: i === 0 && j === 0,
        isEnd: i === 19 && j === 19,
        isWall: false,
        isVisited: false,
        distance: Infinity,
        heuristic: Infinity,
        previousNode: null,
      };
      row.push(node);
    }
    grid.push(row);
  }
  return grid;
};

const Grid = ({ action }) => {
  const [grid, setGrid] = useState(createGrid());
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  useEffect(() => {
    if (action === 'clear') {
      clearGrid();
    } else if (action === 'generate') {
      generateObstacles();
    } else if (action === 'bfs') {
      visualizeBFS();
    } else if (action === 'dfs') {
      visualizeDFS();
    } else if (action === 'dijkstra') {
      visualizeDijkstra();
    } else if (action === 'astar') {
      visualizeAStar();
    }
  }, [action]);

  const handleNodeClick = (row, col) => {
    const node = grid[row][col];
    if (!startNode) {
      setStartNode(node);
    } else if (!endNode) {
      setEndNode(node);
    } else {
      const newGrid = grid.map((r, i) =>
        r.map((n, j) => {
          if (i === row && j === col) {
            return {
              ...n,
              isWall: !n.isWall,
            };
          }
          return n;
        })
      );
      setGrid(newGrid);
    }
  };

  const clearGrid = () => {
    setGrid(createGrid());
    setStartNode(null);
    setEndNode(null);
  };

  const generateObstacles = () => {
    const newGrid = grid.map(row =>
      row.map(node => {
        if (Math.random() < 0.3 && !node.isStart && !node.isEnd) {
          return { ...node, isWall: true };
        }
        return node;
      })
    );
    setGrid(newGrid);
  };

  const getNeighbors = (node) => {
    const { row, col } = node;
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < rows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < cols - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  };

  const getPath = (endNode) => {
    const path = [];
    let currentNode = endNode;
    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return path;
  };

  const animateNodes = (nodes, className) => {
    let i = 0;
    function animate() {
      if (i < nodes.length) {
        const node = nodes[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add(className);
        i++;
        requestAnimationFrame(animate);
      }
    }
    animate();
  };

  const animatePath = (path) => {
    let i = 0;
    function animate() {
      if (i < path.length) {
        const node = path[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add('path');
        i++;
        setTimeout(animate, 100);
      }
    }
    animate();
  };

  const visualizeBFS = () => {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    const queue = [startNode];
    const visitedNodes = [];
    startNode.isVisited = true;

    while (queue.length) {
      const node = queue.shift();
      visitedNodes.push(node);

      if (node === endNode) {
        const path = getPath(node);
        animateNodes(visitedNodes, 'visited');
        setTimeout(() => animatePath(path), 50);
        return;
      }

      for (const neighbor of getNeighbors(node)) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.isVisited = true;
          neighbor.previousNode = node;
          queue.push(neighbor);
        }
      }
    }

    alert('No path found');
  };

  const visualizeDFS = () => {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    const visitedNodes = [];
    const path = dfs(startNode, visitedNodes);
    if (path) {
      animateNodes(visitedNodes, 'visited');
      setTimeout(() => animatePath(path), 50);
    } else {
      alert('No path found');
    }
  };

  const dfs = (node, visitedNodes) => {
    if (node === endNode) return [node];
    node.isVisited = true;
    visitedNodes.push(node);

    for (const neighbor of getNeighbors(node)) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.previousNode = node;
        const path = dfs(neighbor, visitedNodes);
        if (path) {
          path.unshift(node);
          return path;
        }
      }
    }

    return null;
  };

  const visualizeDijkstra = () => {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    dijkstra(grid, startNode, endNode).then(visitedNodesInOrder => {
      if (visitedNodesInOrder.length > 0) {
        const path = getPath(endNode);
        if (path.length === 0 || path[0] !== startNode) {
          alert('No path found');
        } else {
          animateNodes(visitedNodesInOrder, 'visited');
          setTimeout(() => animatePath(path), 50);
        }
      } else {
        alert('No path found');
      }
    });
  };

  const dijkstra = async (grid, startNode, finishNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();
      if (!closestNode.isWall) {
        if (closestNode.distance === Infinity) return visitedNodesInOrder; // No path found
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        if (closestNode === finishNode) return visitedNodesInOrder;
        updateUnvisitedNeighbors(closestNode, grid);
      }
    }

    return visitedNodesInOrder; // Ensure it returns the visited nodes if no path is found
  };

  const getAllNodes = (grid) => {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  };

  const sortNodesByDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  };

  const updateUnvisitedNeighbors = (node, grid) => {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  const getUnvisitedNeighbors = (node, grid) => {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
  };

  const visualizeAStar = () => {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    AStar(grid, startNode, endNode).then(visitedNodesInOrder => {
      if (visitedNodesInOrder.length > 0) {
        const path = getPath(endNode);
        if (path.length === 0 || path[0] !== startNode) {
          alert('No path found');
        } else {
          animateNodes(visitedNodesInOrder, 'visited');
          setTimeout(() => animatePath(path), 50);
        }
      } else {
        alert('No path found');
      }
    });
  };

  const AStar = async (grid, startNode, finishNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    startNode.heuristic = calculateHeuristic(startNode, finishNode);
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByAStar(unvisitedNodes);
      const currentNode = unvisitedNodes.shift();
      if (!currentNode.isWall) {
        if (currentNode.distance === Infinity) return visitedNodesInOrder; // No path found
        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        if (currentNode === finishNode) return visitedNodesInOrder;
        updateUnvisitedNeighborsAStar(currentNode, grid, finishNode);
      }
    }

    return visitedNodesInOrder; // Ensure it returns the visited nodes if no path is found
  };

  const sortNodesByAStar = (unvisitedNodes) => {
    unvisitedNodes.sort((nodeA, nodeB) => (nodeA.distance + nodeA.heuristic) - (nodeB.distance + nodeB.heuristic));
  };

  const updateUnvisitedNeighborsAStar = (node, grid, finishNode) => {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      const newDistance = node.distance + 1;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.heuristic = calculateHeuristic(neighbor, finishNode);
        neighbor.previousNode = node;
      }
    }
  };

  const calculateHeuristic = (node, finishNode) => {
    return Math.abs(node.row - finishNode.row) + Math.abs(node.col - finishNode.col);
  };

  return (
    <div id="grid" className="grid">
      {grid.map((row, rowIndex) =>
        row.map((node, colIndex) => (
          <Node
            key={`${rowIndex}-${colIndex}`}
            node={node}
            onClick={() => handleNodeClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
