import "vis-network/styles/vis-network.css";
import "../src/style.css";
import { DataSet } from "vis-data";
import { Network } from "vis-network";

const STATES = {
  S: { color: "#888888", name: "Unaware" },
  I: { color: "#d9534f", name: "Excited" },
  R: { color: "#3498db", name: "Forgotten" },
};

const nodes = new DataSet([
  { id: 1, label: "Alice", state: "S", color: STATES.S.color },
  { id: 2, label: "Bob", state: "S", color: STATES.S.color },
  { id: 3, label: "Charlie", state: "S", color: STATES.S.color },
  { id: 4, label: "Diana", state: "S", color: STATES.S.color },
  { id: 5, label: "Eric", state: "S", color: STATES.S.color },
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
      nodeData.state = "S";
      nodeData.color = STATES.S.color;
      callback(nodeData);
    },
  },
};

const network = new Network(container, data, options);
const btnClear = document.getElementById("btn-clear");
const btnGenerate = document.getElementById("btn-generate");

btnClear.addEventListener("click", () => {
  btnPause.click();
  nodes.clear();
  edges.clear();
});

btnGenerate.addEventListener("click", () => {
  btnPause.click();
  nodes.clear();
  edges.clear();

  // change to customizable later
  const numNodes = 25;
  const connectionProbability = 0.12;

  const newNodes = [];
  for (let i = 1; i <= numNodes; i++) {
    newNodes.push({
      id: i,
      label: `Person ${i}`,
      state: "S",
      color: STATES.S.color,
    });
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

network.on("click", function (properties) {
  const clickedNodeIds = properties.nodes;

  if (clickedNodeIds.length > 0) {
    const nodeId = clickedNodeIds[0];
    const node = nodes.get(nodeId);

    if (node.state === "S") {
      nodes.update({ id: nodeId, state: "I", color: STATES.I.color });
    } else if (node.state === "I") {
      nodes.update({ id: nodeId, state: "R", color: STATES.R.color });
    } else {
      nodes.update({ id: nodeId, state: "S", color: STATES.S.color });
    }
  }
});

let simulationInterval = null;
let isPlaying = false;
const TICK_RATE = 500;

const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnReset = document.getElementById("btn-reset");

function simulationTick() {
  // finish this
  console.log("simulation not done yet");
}

btnPlay.addEventListener("click", () => {
  if (!isPlaying) {
    isPlaying = true;
    simulationInterval = setInterval(simulationTick, TICK_RATE);
    console.log("Simulation Started.");
  }
});

btnPause.addEventListener("click", () => {
  if (isPlaying) {
    isPlaying = false;
    clearInterval(simulationInterval);
    console.log("Simulation Paused.");
  }
});

btnReset.addEventListener("click", () => {
  isPlaying = false;
  clearInterval(simulationInterval);

  const allNodes = nodes.get();
  const resetNodes = allNodes.map((node) => {
    return {
      ...node,
      state: "S",
      color: STATES.S.color,
    };
  });

  nodes.update(resetNodes);
  console.log("Simulation Reset. Everyone is unaware again.");
});
