# Rumor Spread Simulator

**[DEMO LINK](https://rumor-spread-simulator.vercel.app/)**

## Project Description

An interactive rumor spread simulator built on a friendship graph. It lets you generate two different types of networks: completely random vs influencer (a popular friend). The simulator lets you watch how the rumor moves through the network over time.

## Features

- Random friend groups and influencer-style hub networks
- Click-to-toggle node states for clueless, gossiping, and over-it friends
- Adjustable spread rate, forget rate, and simulation speed
- SIR and SIS rumor models for different boredom behaviors
- Live network visualization and drama tracking chart

## Requirements

- Node.js 18+ and `npm`

## Installation

Install the dependencies with:

```bash
npm install
```

## Run the App

Start the development server with:

```bash
npm run dev
```

Then open the app in your browser at the local URL printed by Vite.

From the UI you can:

- generate a random friend group or an influencer network
- start, pause, and reset the rumor simulation
- tune how quickly the rumor spreads and fades out
- switch between SIR and SIS-style behavior

