document.addEventListener('DOMContentLoaded', () => {
  const container  = document.getElementById('resultsContainer');
  const inventory  = JSON.parse(localStorage.getItem('inventory') || '[]');
  const products   = JSON.parse(localStorage.getItem('products')  || '[]');
  const params     = JSON.parse(localStorage.getItem('parameters')|| '{}');
  const weights = params.weights || { profit: 100, inventory: 0, carbon: 0 };


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

	// Product variables with weighted composite score
	products.forEach((p, i) => {
		const varDef = {};

		// Weighted profit
		const profitScore = weights.profit * p.profit;

		// Weighted inventory usage (sum of all inventory used by this product)
		const invUseScore = weights.inventory * inventory.reduce((sum, inv) => {
			return sum + (p[inv.name] || 0);
		}, 0);

		// Weighted carbon footprint
		const carbonScore = weights.carbon * p.co2;

		varDef.composite = profitScore - invUseScore - carbonScore;

		// Add inventory usage to constraints
		inventory.forEach(inv => {
			varDef[inv.name] = p[inv.name] || 0;
		});

		// Add minimum production constraint if specified
		if (params.minUnits?.[i] > 0) {
			model.constraints[`min_${p.name}`] = { '>=': params.minUnits[i] };
			varDef[`min_${p.name}`] = 1;
		}

		model.variables[p.name] = varDef;
	});


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

});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-to-parameters-btn').addEventListener('click', () => {
    window.location.href = 'parameters.html';
  });
});
