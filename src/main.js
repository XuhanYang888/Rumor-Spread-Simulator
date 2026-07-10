import "vis-network/styles/vis-network.css";
import "../src/style.css";
import { DataSet } from "vis-data";
import { Network } from "vis-network";

const nodes = new DataSet([
  { id: 1, label: "Alice" },
  { id: 2, label: "Bob" },
  { id: 3, label: "Charlie" },
  { id: 4, label: "Diana" },
  { id: 5, label: "Eric" },
]);

const edges = new DataSet([
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 4, to: 5 },
]);

const container = document.getElementById("network-canvas");
const data = {
  nodes: nodes,
  edges: edges,
};

const options = {
  nodes: {
    shape: "dot",
    size: 20,
    font: {
      color: "#ffffff",
      size: 14,
    },
    color: {
      background: "#888888",
      border: "#ffffff",
      highlight: {
        background: "#aaaaaa",
        border: "#ffffff",
      },
    },
  },
  edges: {
    width: 2,
    color: { color: "#555555" },
    smooth: {
      type: "continuous",
    },
  },
  interaction: {
    zoomView: true,
    zoomSpeed: 0.67,
  },
  physics: {
    barnesHut: {
      gravitationalConstant: -2000,
      springConstant: 0.04,
      springLength: 95,
    },
  },
  manipulation: {
    enabled: true,
    initiallyActive: true,
    addNode: function (nodeData, callback) {
      nodeData.label = "Person";
      callback(nodeData);
    },
  },
};

const network = new Network(container, data, options);
const btnClear = document.getElementById("btn-clear");
const btnGenerate = document.getElementById("btn-generate");

btnClear.addEventListener("click", () => {
  nodes.clear();
  edges.clear();
});

btnGenerate.addEventListener("click", () => {
  nodes.clear();
  edges.clear();

  // change to customizable later
  const numNodes = 25;
  const connectionProbability = 0.12;

  const newNodes = [];
  for (let i = 1; i <= numNodes; i++) {
    newNodes.push({ id: i, label: `Person ${i}` });
  }
  nodes.add(newNodes);

  // make sure no disconnected node later
  const newEdges = [];
  for (let i = 1; i <= numNodes; i++) {
    for (let j = i + 1; j <= numNodes; j++) {
      if (Math.random() < connectionProbability) {
        newEdges.push({ from: i, to: j });
      }
    }
  }
  edges.add(newEdges);
});
