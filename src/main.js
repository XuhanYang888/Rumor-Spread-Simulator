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
};

const network = new Network(container, data, options);
