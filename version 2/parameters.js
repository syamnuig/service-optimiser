document.addEventListener('DOMContentLoaded', () => {
  const tbody    = document.querySelector('#constraintsTable tbody');
  const products = JSON.parse(sessionStorage.getItem('products') || '[]');

   // Render product rows
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td><input type="number" class="min-units" value="0" min="0"></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('back-to-products-btn').addEventListener('click', () => {
    window.location.href = 'products.html';
  });
  
  // Store parameters on button click
  document.getElementById('apply-parameters-btn').addEventListener('click', () => {
    const weights = {
      profit:    parseFloat(document.getElementById('weight-profit').value)    || 0,
      inventory: parseFloat(document.getElementById('weight-inventory').value) || 0,
      carbon:    parseFloat(document.getElementById('weight-carbon').value)    || 0
    };
    const minUnits = [...document.querySelectorAll('.min-units')].map(i => parseFloat(i.value) || 0);
    sessionStorage.setItem('parameters', JSON.stringify({ weights, minUnits }));
    window.location.href = 'results.html';
  });

	const savedParams = JSON.parse(sessionStorage.getItem('parameters') || '{}');
	const savedWeights = savedParams.weights || {};

	// Set default slider values from sessionStorage
	if (savedWeights.profit !== undefined) {
		document.getElementById('weight-profit').value = savedWeights.profit;
		document.getElementById('label-profit').textContent = `${savedWeights.profit}%`;
	}

	if (savedWeights.inventory !== undefined) {
		document.getElementById('weight-inventory').value = savedWeights.inventory;
		document.getElementById('label-inventory').textContent = `${savedWeights.inventory}%`;
	}

	if (savedWeights.carbon !== undefined) {
		document.getElementById('weight-carbon').value = savedWeights.carbon;
		document.getElementById('label-carbon').textContent = `${savedWeights.carbon}%`;
	}
  
});

  function updateLabel(type) {
    const val = document.getElementById(`weight-${type}`).value;
    document.getElementById(`label-${type}`).textContent = `${val}%`;
  }
