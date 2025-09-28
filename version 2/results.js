document.addEventListener('DOMContentLoaded', () => {
  const container  = document.getElementById('resultsContainer');
  const inventory  = JSON.parse(localStorage.getItem('inventory') || '[]');
  const products   = JSON.parse(localStorage.getItem('products')  || '[]');
  const params     = JSON.parse(localStorage.getItem('parameters')|| '{}');
  const objMap     = {
    maxProfit:    'Maximum profit',
    minInventory: 'Minimum inventory use',
    maxInventory: 'Maximum inventory use',
    minCarbon:    'Minimum carbon footprint'
  };

  // Build LP model
  const model = { optimize: 'profit', opType: 'max', constraints: {}, variables: {} };
  inventory.forEach(inv => {
    model.constraints[inv.name] = { '<=': inv.quantity };
  });

  products.forEach((p, i) => {
    const varDef = { profit: p.profit };
    inventory.forEach(inv => {
      varDef[inv.name] = p[inv.name] || 0;
    });
    if (params.minUnits?.[i] > 0) {
      model.constraints[`min_${p.name}`] = { '>=': params.minUnits[i] };
      varDef[`min_${p.name}`] = 1;
    }
    model.variables[p.name] = varDef;
  });

  // Adjust objective
  if (params.objective === 'minCarbon') {
    model.optimize = 'carbon';
    model.opType   = 'min';
    products.forEach((p) => {
      model.variables[p.name].carbon = p.co2;
    });
  }
  if (params.objective === 'minInventory') {
    model.optimize = 'invUse';
    model.opType   = 'min';
    products.forEach((p) => {
      inventory.forEach(inv => {
        model.variables[p.name].invUse = p[inv.name] || 0;
      });
    });
  }
  if (params.objective === 'maxInventory') {
    model.optimize = 'invUse';
    model.opType   = 'max';
    products.forEach((p) => {
      inventory.forEach(inv => {
        model.variables[p.name].invUse = p[inv.name] || 0;
      });
    });
  }

  // Solve and render
  const results = solver.Solve(model);
  let html = `<p><strong>Objective:</strong> ${objMap[params.objective] || ''}</p>`;
  html += '<table><thead><tr><th>Product</th><th>Quantity</th></tr></thead><tbody>';
  products.forEach(p => {
    html += `<tr><td>${p.name}</td><td>${results[p.name] || 0}</td></tr>`;
  });
  html += `</tbody></table><p><strong>Total Profit:</strong> ${results.result || 0}</p>`;
  html += `<p><strong>Total CO₂e:</strong> ${results.carbon || 0}</p>`;
  container.innerHTML = html;

  document.getElementById('back-to-parameters-btn').addEventListener('click', () => {
    window.location.href = 'parameters.html';
  });
});