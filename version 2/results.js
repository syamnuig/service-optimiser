document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resultsContainer');
  const inventory = JSON.parse(sessionStorage.getItem('inventory') || '[]');
  const products = JSON.parse(sessionStorage.getItem('products') || '[]');
  const params = JSON.parse(sessionStorage.getItem('parameters') || '{}');
  const weights = params.weights || { profit: 100, inventory: 0, carbon: 0 };
  const minUnits = params.minUnits || [];

  // Ensure weights are numbers
  weights.profit = parseFloat(weights.profit) || 0;
  weights.inventory = parseFloat(weights.inventory) || 0;
  weights.carbon = parseFloat(weights.carbon) || 0;

  // Validate input
  if (!inventory.length || !products.length || !params.weights) {
    container.innerHTML += `<p style="color: red;">Missing input data. Please complete all steps before calculating.</p>`;
    return;
  }

  // Build LP model
  const model = {
    optimize: 'composite',
    opType: 'max',
    constraints: {},
    variables: {}
  };

  // Inventory constraints
  inventory.forEach(inv => {
    model.constraints[inv.name] = { '<=': inv.quantity };
  });

  // Product variables
  products.forEach((p, i) => {
    const varDef = {};

    // Composite score calculation
    const profitScore = weights.profit * p.profit;
    const invUseScore = weights.inventory * inventory.reduce((sum, inv) => sum + (p[inv.name] || 0), 0);
    const carbonScore = weights.carbon * p.co2;

    // Scale composite score to avoid unbounded growth
    varDef.composite = Math.max(0.01, (profitScore - invUseScore - carbonScore) / 100);
    varDef.integer = true;

    // Inventory usage
    inventory.forEach(inv => {
      varDef[inv.name] = p[inv.name] || 0;
    });

    // Minimum production constraint
    if (minUnits[i] > 0) {
      model.constraints[`min_${p.name}`] = { '>=': minUnits[i] };
      varDef[`min_${p.name}`] = 1;
    }

    // Dynamic production cap based on inventory
    const maxUnits = Math.min(
      ...inventory.map(inv => {
        const usage = p[inv.name] || 0;
        return usage > 0 ? Math.floor(inv.quantity / usage) : Infinity;
      })
    );



    model.variables[p.name] = varDef;
  });


  // Solve
  const results = solver.Solve(model);
  console.log('Solver Results:', results);
  console.table(products.map(p => ({
	Product: p.name,
	Quantity: results[p.name] || 0,
	Profit: p.profit,
	CO2: p.co2
  })));

  // Calculate totals
  let totalProfit = 0;
  let totalCO2 = 0;

  products.forEach(p => {
    const qty = results[p.name] || 0;
    totalProfit += qty * p.profit;
    totalCO2 += qty * p.co2;
  });

  // Render results
  let html = `<p><strong>Objective Weights:</strong></p>
  <ul>
    <li>💰 Profit: ${weights.profit}%</li>
    <li>📦 Inventory: ${weights.inventory}%</li>
    <li>🌱 Carbon: ${weights.carbon}%</li>
  </ul>`;

  html += '<table><thead><tr><th>Product</th><th>Quantity</th></tr></thead><tbody>';
  products.forEach(p => {
    html += `<tr><td>${p.name}</td><td>${results[p.name] || 0}</td></tr>`;
  });
  html += '</tbody></table>';

  html += `<p><strong>Total Profit:</strong> ${totalProfit.toFixed(2)}</p>`;
  html += `<p><strong>Total CO₂e:</strong> ${totalCO2.toFixed(2)}</p>`;

  container.innerHTML = html;
});

// Navigation
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-to-parameters-btn').addEventListener('click', () => {
    window.location.href = 'parameters.html';
  });
});