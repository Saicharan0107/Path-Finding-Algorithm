import React, { useState, useEffect } from 'react';
import './styles.css'; // Import the CSS file

const rows = 20;
const cols = 20;
let grid = [];
let startNode = null;
let endNode = null;

function App() {
  const [storedObstacles, setStoredObstacles] = useState([]);
  const [storedStart, setStoredStart] = useState(null);
  const [storedEnd, setStoredEnd] = useState(null);

  useEffect(() => {
    createGrid();
  }, []);

  // Function to create grid
  function createGrid() {
    grid = [];
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = ''; // Clear existing grid
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const node = {
          row: i,
          col: j,
          isStart: false,
          isEnd: false,
          isWall: false,
          isVisited: false,
          distance: Infinity,
          heuristic: Infinity,
          previousNode: null,
        };
        row.push(node);
        const nodeElement = document.createElement('div');
        nodeElement.classList.add('node');
        nodeElement.id = `node-${i}-${j}`;
        nodeElement.addEventListener('click', () => handleNodeClick(node, nodeElement));
        gridElement.appendChild(nodeElement);
      }
      grid.push(row);
    }
    restorePositions();
  }

  // Handle node clicks
  function handleNodeClick(node, element) {
    if (!startNode) {
      startNode = node;
      node.isStart = true;
      element.classList.add('start');
      setStoredStart({ row: node.row, col: node.col });
    } else if (!endNode) {
      endNode = node;
      node.isEnd = true;
      element.classList.add('end');
      setStoredEnd({ row: node.row, col: node.col });
    } else {
      node.isWall = !node.isWall;
      element.classList.toggle('wall');
      const position = { row: node.row, col: node.col };
      if (node.isWall) {
        setStoredObstacles(prev => [...prev, position]);
      } else {
        setStoredObstacles(prev => prev.filter(p => p.row !== position.row || p.col !== position.col));
      }
    }
  }

  // Clear grid
  function clearGrid() {
    startNode = null;
    endNode = null;
    setStoredStart(null);
    setStoredEnd(null);
    setStoredObstacles([]);
    createGrid();
  }

  function restorePositions() {
    if (storedStart) {
      const { row, col } = storedStart;
      const node = grid[row][col];
      const element = document.getElementById(`node-${row}-${col}`);
      node.isStart = true;
      element.classList.add('start');
    }

    if (storedEnd) {
      const { row, col } = storedEnd;
      const node = grid[row][col];
      const element = document.getElementById(`node-${row}-${col}`);
      node.isEnd = true;
      element.classList.add('end');
    }

    storedObstacles.forEach(({ row, col }) => {
      const node = grid[row][col];
      const element = document.getElementById(`node-${row}-${col}`);
      node.isWall = true;
      element.classList.add('wall');
    });
  }

  // Generate obstacles
  function generateObstacles() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() < 0.3 && !grid[i][j].isStart && !grid[i][j].isEnd) {
          grid[i][j].isWall = true;
          document.getElementById(`node-${i}-${j}`).classList.add('wall');
          setStoredObstacles(prev => [...prev, { row: i, col: j }]);
        }
      }
    }
  }

  // BFS Visualization
  function visualizeBFS() {
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
        animateBFS(visitedNodes, path);
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
  }

  // DFS Visualization
  function visualizeDFS() {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    const visitedNodes = [];
    const path = dfs(startNode, visitedNodes);
    if (path) {
      animateDFS(visitedNodes, path);
    } else {
      alert('No path found');
    }
  }

  function dfs(node, visitedNodes) {
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
  }

  function getNeighbors(node) {
    const { row, col } = node;
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < rows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < cols - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  }

  function getPath(endNode) {
    const path = [];
    let currentNode = endNode;
    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return path;
  }

  function animateBFS(visitedNodes, path) {
    let i = 0;
    function animate() {
      if (i < visitedNodes.length) {
        const node = visitedNodes[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add('visited');
        i++;
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => animatePath(path), 50);
      }
    }
    animate();
  }

  function animateDFS(visitedNodes, path) {
    let i = 0;
    function animate() {
      if (i < visitedNodes.length) {
        const node = visitedNodes[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add('visited');
        i++;
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => animatePath(path), 50);
      }
    }
    animate();
  }

  function animatePath(path) {
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
  }

  function visualizeDijkstra() {
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
          animateDijkstra(visitedNodesInOrder, path);
        }
      } else {
        alert('No path found');
      }
    });
  }

  async function dijkstra(grid, startNode, finishNode) {
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
  }

  function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  }

  function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  }

  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const {col, row} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
  }

  function animateDijkstra(visitedNodesInOrder, path) {
    let i = 0;
    function animate() {
      if (i < visitedNodesInOrder.length) {
        const node = visitedNodesInOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add('visited');
        i++;
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => animatePath(path), 50);
      }
    }
    animate();
  }

  function visualizeAStar() {
    if (!startNode || !endNode) {
      alert('Please set both start and end nodes');
      return;
    }
    const visitedNodesInOrder = [];
    const path = aStar(grid, startNode, endNode, visitedNodesInOrder);
    if (path.length > 0) {
      animateAStar(visitedNodesInOrder, path);
    } else {
      alert('No path found');
    }
  }

  function aStar(grid, startNode, endNode, visitedNodesInOrder) {
    const openSet = [startNode];
    const closedSet = [];
    startNode.distance = 0;
    startNode.heuristic = heuristic(startNode, endNode);

    while (openSet.length) {
      openSet.sort((a, b) => a.distance + a.heuristic - (b.distance + b.heuristic));
      const currentNode = openSet.shift();
      if (currentNode === endNode) return getPath(endNode);
      closedSet.push(currentNode);

      for (const neighbor of getNeighbors(currentNode)) {
        if (!closedSet.includes(neighbor) && !neighbor.isWall) {
          const tentativeDistance = currentNode.distance + 1;
          if (tentativeDistance < neighbor.distance) {
            neighbor.distance = tentativeDistance;
            neighbor.heuristic = heuristic(neighbor, endNode);
            neighbor.previousNode = currentNode;
            if (!openSet.includes(neighbor)) openSet.push(neighbor);
          }
        }
      }

      visitedNodesInOrder.push(currentNode);
    }

    return [];
  }

  function heuristic(node, endNode) {
    return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
  }

  function animateAStar(visitedNodesInOrder, path) {
    let i = 0;
    function animate() {
      if (i < visitedNodesInOrder.length) {
        const node = visitedNodesInOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.classList.add('visited');
        i++;
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => animatePath(path), 50);
      }
    }
    animate();
  }

  return (
    <div>
      <h1>Pathfinding Visualizer</h1>
      <div id="controls">
        <button onClick={visualizeBFS}>Visualize BFS</button>
        <button onClick={visualizeDFS}>Visualize DFS</button>
        <button onClick={visualizeDijkstra}>Visualize Dijkstra's</button>
        <button onClick={visualizeAStar}>Visualize A*</button>
        <button onClick={clearGrid}>Clear Grid</button>
        <button onClick={generateObstacles}>Generate Obstacles</button>
      </div>
      <div id="grid"></div>
    </div>
  );
}

export default App;
