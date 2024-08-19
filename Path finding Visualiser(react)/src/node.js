import React from "react";

const Node = ({ node, onClick }) => {
  const { isStart, isEnd, isWall, isVisited, isPath } = node;
  const className = `node ${isStart ? "start" : ""} ${isEnd ? "end" : ""} ${isWall ? "wall" : ""} ${isVisited ? "visited" : ""} ${isPath ? "path" : ""}`;

  return (
    <div
      className={className}
      onClick={onClick}
    />
  );
};

export default Node;
