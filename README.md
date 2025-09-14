
# Service Optimiser

A modern, open source web application for interactive service planning and optimization.

## Features
- Beautiful, responsive Material-inspired UI
- Dynamic forms for defining services and resources
- Add/remove resources and services with a single click
- Linear programming solver integration (via [javascript-lp-solver](https://github.com/JWally/jsLPSolver))
- Clear input validation and usage notes

## Quick Start
1. **Clone or download this repository**
2. **Open `index.html` in any modern browser** (no build step required!)

## File Structure
```text
.
├── index.html         # App HTML entry point
├── style.css          # Global Material-inspired styles and layout
├── app.js             # Interactive logic for Service Optimiser
└── README.md          # This file
```

## How to Use
- Define up to 5 resources (e.g. machines, labor types, raw materials) and specify their available stock.
- Add services. For each service:
  - Enter name and profit per unit (in **euros**)
  - Specify how much of each resource is used per unit
- Click **Optimize Mix**. The tool calculates the optimal service quantities for maximum profit, subject to all constraints.

## License
GNU General Public License V3
