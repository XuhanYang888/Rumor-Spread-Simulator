import "vis-network/styles/vis-network.css";
import "../src/style.css";
import Chart from "chart.js/auto";
import { DataSet } from "vis-data";
import { Network } from "vis-network";

const rootStyles = getComputedStyle(document.documentElement);
const STATES = {
  S: {
    color: rootStyles.getPropertyValue("--color-susceptible").trim(),
    name: "Clueless",
  },
  I: {
    color: rootStyles.getPropertyValue("--color-infected").trim(),
    name: "Gossiping",
  },
  R: {
    color: rootStyles.getPropertyValue("--color-recovered").trim(),
    name: "Over It",
  },
};

const nodes = new DataSet([]);
const edges = new DataSet([]);

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
    hover: true,
    zoomView: true,
    zoomSpeed: 0.67,
  },
  physics: {
    barnesHut: {
      gravitationalConstant: -3000,
      centralGravity: 0.1,
      springConstant: 0.03,
      springLength: 100,
      damping: 0.15,
    },
  },
  manipulation: {
    enabled: true,
    initiallyActive: true,
    addNode: function (nodeData, callback) {
      nodeData.label = "Friend";
      nodeData.state = "S";
      nodeData.color = STATES.S.color;
      callback(nodeData);
    },
  },
};

const network = new Network(container, data, options);

const btnClear = document.getElementById("btn-clear");
const btnGenerate = document.getElementById("btn-generate");
const btnGenerateHub = document.getElementById("btn-generate-hub");
const nodeSlider = document.getElementById("node-count");
const nodeLabel = document.querySelector('label[for="node-count"]');

const btnPlayPause = document.getElementById("btn-play-pause");
const btnRandomOutbreak = document.getElementById("btn-random-outbreak");
const btnReset = document.getElementById("btn-reset");

const spreadSlider = document.getElementById("spread-rate");
const spreadLabel = document.querySelector('label[for="spread-rate"]');
const forgetSlider = document.getElementById("forget-rate");
const forgetLabel = document.querySelector('label[for="forget-rate"]');
const speedSlider = document.getElementById("sim-speed");
const speedLabel = document.querySelector('label[for="sim-speed"]');

const statS = document.getElementById("stat-s");
const statI = document.getElementById("stat-i");
const statR = document.getElementById("stat-r");

let simulationInterval = null;
let isPlaying = false;
let hasStarted = false;
let currentTick = 0;
let TICK_RATE = 500;
let lastGraphType = "random";

nodeSlider.addEventListener("input", (e) => {
  nodeLabel.innerText = `Total Friends: ${e.target.value}`;
});

nodeSlider.addEventListener("change", (e) => {
  const numNodes = parseInt(e.target.value);
  if (lastGraphType === "hub") {
    generateHubGraph(numNodes);
  } else {
    generateRandomGraph(numNodes);
  }
  resetSimulationState();
});

function countStates() {
  const counts = { S: 0, I: 0, R: 0 };
  nodes.get().forEach((n) => counts[n.state]++);
  return counts;
}

function updateStatsDisplay(counts) {
  statS.textContent = counts.S;
  statI.textContent = counts.I;
  statR.textContent = counts.R;
}

function syncStatsAndChart() {
  const counts = countStates();
  updateStatsDisplay(counts);

  if (!hasStarted) {
    rumorChart.data.labels[0] = 0;
    rumorChart.data.datasets[0].data[0] = counts.S;
    rumorChart.data.datasets[1].data[0] = counts.I;
    rumorChart.data.datasets[2].data[0] = counts.R;
    rumorChart.update();
  }
}

function generateRandomGraph(numNodes) {
  nodes.clear();
  edges.clear();

  const newNodes = [];
  for (let i = 1; i <= numNodes; i++) {
    newNodes.push({
      id: i,
      label: `Friend ${i}`,
      state: "S",
      color: STATES.S.color,
    });
  }
  nodes.add(newNodes);

  const newEdges = [];
  const addedEdges = new Set();
  const connectionProbability = 2.5 / numNodes;

  for (let i = 2; i <= numNodes; i++) {
    const randomPreviousNode = Math.floor(Math.random() * (i - 1)) + 1;
    newEdges.push({ from: i, to: randomPreviousNode });
    addedEdges.add(`${randomPreviousNode}-${i}`);
  }

  for (let i = 1; i <= numNodes; i++) {
    for (let j = i + 1; j <= numNodes; j++) {
      if (
        !addedEdges.has(`${i}-${j}`) &&
        Math.random() < connectionProbability
      ) {
        newEdges.push({ from: i, to: j });
      }
    }
  }
  edges.add(newEdges);

  lastGraphType = "random";
}

function generateHubGraph(numNodes) {
  nodes.clear();
  edges.clear();

  const newNodes = [];
  for (let i = 1; i <= numNodes; i++) {
    newNodes.push({
      id: i,
      label: `Friend ${i}`,
      state: "S",
      color: STATES.S.color,
    });
  }
  nodes.add(newNodes);

  const newEdges = [];
  const hat = [];

  newEdges.push({ from: 1, to: 2 });
  hat.push(1, 2);

  for (let i = 3; i <= numNodes; i++) {
    const connectionsToMake = numNodes < 15 ? 1 : 2;
    const friendsChosen = new Set();

    while (friendsChosen.size < connectionsToMake) {
      const randomIndex = Math.floor(Math.random() * hat.length);
      const chosenFriend = hat[randomIndex];

      if (chosenFriend !== i) {
        friendsChosen.add(chosenFriend);
      }
    }

    friendsChosen.forEach((friend) => {
      newEdges.push({ from: i, to: friend });
      hat.push(i, friend);
    });
  }

  edges.add(newEdges);

  lastGraphType = "hub";
}

function resetSimulationState() {
  pauseSimulation();
  currentTick = 0;
  hasStarted = false;

  rumorChart.data.labels = [];
  rumorChart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });

  const totalPeople = nodes.length;
  rumorChart.options.scales.y.max = totalPeople > 0 ? totalPeople : 10;

  syncStatsAndChart();
}

btnClear.addEventListener("click", () => {
  nodes.clear();
  edges.clear();
  resetSimulationState();
});

btnGenerate.addEventListener("click", () => {
  const numNodes = parseInt(nodeSlider.value);
  generateRandomGraph(numNodes);
  resetSimulationState();
});

btnGenerateHub.addEventListener("click", () => {
  const numNodes = parseInt(nodeSlider.value);
  generateHubGraph(numNodes);
  resetSimulationState();
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

    syncStatsAndChart();
  }
});

network.on("hoverNode", function () {
  container.classList.add("node-hover");
});

network.on("blurNode", function () {
  container.classList.remove("node-hover");
});

function simulationTick() {
  const spreadProbability = document.getElementById("spread-rate").value / 100;
  const infectedNodes = nodes.get({ filter: (n) => n.state === "I" });
  const nodesToInfect = new Set();

  infectedNodes.forEach((infectedNode) => {
    const connectedNodeIds = network.getConnectedNodes(infectedNode.id);

    connectedNodeIds.forEach((neighborId) => {
      const neighbor = nodes.get(neighborId);
      if (neighbor.state === "S" && Math.random() < spreadProbability) {
        nodesToInfect.add(neighborId);
      }
    });
  });

  if (nodesToInfect.size > 0) {
    nodes.update(
      [...nodesToInfect].map((id) => ({
        id,
        state: "I",
        color: STATES.I.color,
      })),
    );
  }

  const forgetProbability = document.getElementById("forget-rate").value / 100;
  const modelType = document.getElementById("model-type").value;
  const nodesToRecover = infectedNodes.filter(
    () => Math.random() < forgetProbability,
  );

  if (nodesToRecover.length > 0) {
    const recoveryUpdates = nodesToRecover.map((n) => {
      return modelType === "SIR"
        ? { id: n.id, state: "R", color: STATES.R.color }
        : { id: n.id, state: "S", color: STATES.S.color };
    });
    nodes.update(recoveryUpdates);
  }

  const counts = countStates();
  updateStatsDisplay(counts);

  rumorChart.data.labels.push(currentTick);
  rumorChart.data.datasets[0].data.push(counts.S);
  rumorChart.data.datasets[1].data.push(counts.I);
  rumorChart.data.datasets[2].data.push(counts.R);
  rumorChart.update();

  currentTick++;
}

function startSimulation() {
  if (isPlaying) return;

  if (currentTick === 0) {
    currentTick = 1;
  }
  hasStarted = true;

  isPlaying = true;
  simulationInterval = setInterval(simulationTick, TICK_RATE);
  btnPlayPause.textContent = "⏸ Pause";
  btnPlayPause.classList.add("is-playing");
  console.log("Simulation Started. Drama incoming!");
}

function pauseSimulation() {
  if (!isPlaying) return;

  isPlaying = false;
  clearInterval(simulationInterval);
  btnPlayPause.textContent = "▶ Play";
  btnPlayPause.classList.remove("is-playing");
  console.log("Simulation Paused. Shhhh.");
}

btnPlayPause.addEventListener("click", () => {
  if (isPlaying) {
    pauseSimulation();
  } else {
    startSimulation();
  }
});

btnRandomOutbreak.addEventListener("click", () => {
  const susceptibleNodes = nodes.get({ filter: (n) => n.state === "S" });
  if (susceptibleNodes.length === 0) return;

  const randomNode =
    susceptibleNodes[Math.floor(Math.random() * susceptibleNodes.length)];
  nodes.update({ id: randomNode.id, state: "I", color: STATES.I.color });

  syncStatsAndChart();
});

btnReset.addEventListener("click", () => {
  const allNodes = nodes.get();
  const resetNodes = allNodes.map((node) => {
    return {
      ...node,
      state: "S",
      color: STATES.S.color,
    };
  });

  nodes.update(resetNodes);
  console.log("Simulation Reset. Everyone is clueless again.");
  resetSimulationState();
});

spreadSlider.addEventListener("input", (e) => {
  spreadLabel.innerText = `Juiciness (Spread Rate): ${e.target.value}%`;
});
spreadLabel.innerText = `Juiciness (Spread Rate): ${spreadSlider.value}%`;

forgetSlider.addEventListener("input", (e) => {
  forgetLabel.innerText = `Attention Span (Forget Rate): ${e.target.value}%`;
});
forgetLabel.innerText = `Attention Span (Forget Rate): ${forgetSlider.value}%`;

speedSlider.addEventListener("input", (e) => {
  const speedValue = parseInt(e.target.value);

  TICK_RATE = 1100 - speedValue * 100;

  speedLabel.innerText = `Gossip Speed: ${speedValue}x`;

  if (isPlaying) {
    clearInterval(simulationInterval);
    simulationInterval = setInterval(simulationTick, TICK_RATE);
  }
});

const ctx = document.getElementById("rumor-chart").getContext("2d");

const chartData = {
  labels: [],
  datasets: [
    {
      label: STATES.S.name,
      data: [],
      borderColor: STATES.S.color,
      backgroundColor: STATES.S.color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    },
    {
      label: STATES.I.name,
      data: [],
      borderColor: STATES.I.color,
      backgroundColor: STATES.I.color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    },
    {
      label: STATES.R.name,
      data: [],
      borderColor: STATES.R.color,
      backgroundColor: STATES.R.color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    },
  ],
};

const rumorChart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        title: { display: true, text: "Time (Ticks)", color: "#888" },
        ticks: { color: "#888" },
        grid: { color: "#333" },
      },
      y: {
        title: { display: true, text: "Population", color: "#888" },
        ticks: { color: "#888" },
        grid: { color: "#333" },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
    },
  },
});

const btnInfo = document.getElementById("btn-info");
const infoModal = document.getElementById("info-modal");
const closeModal = document.getElementById("close-modal");

btnInfo.addEventListener("click", () => {
  infoModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  infoModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    infoModal.classList.add("hidden");
  }
});

generateRandomGraph(25);
resetSimulationState();
