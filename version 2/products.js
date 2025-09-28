document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#productsTable tbody');
  const units     = ['nos', 'kg', 'l', 'm'];

	function addRow(data = {}) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td><input type="text" class="prod-name" value="${data.name || ''}"></td>
			<td><input type="number" step="0.01" class="prod-cost" value="${data.cost || ''}"></td>
			<td><input type="number" step="0.01" class="prod-profit" value="${data.profit || ''}"></td>
			<td>
				<select class="prod-unit">
				${units.map(u => `<option${data.unit === u ? ' selected' : ''}>${u}</option>`).join('')}
				</select>
			</td>
			<td><input type="number" step="0.01" class="prod-co2" value="${data.co2 || ''}"></td>
			<td>
				<button class="remove-btn" title="Remove row">❌</button>
			</td>
		`;
		tr.querySelector('.remove-btn').addEventListener('click', () => {
		tr.remove();
		});
		tableBody.appendChild(tr);
	}


  function getProductsData() {
    return [...tableBody.children].map(row => ({
      name:   row.querySelector('.prod-name').value.trim(),
      cost:   parseFloat(row.querySelector('.prod-cost').value)   || 0,
      profit: parseFloat(row.querySelector('.prod-profit').value) || 0,
      unit:   row.querySelector('.prod-unit').value,
      co2:    parseFloat(row.querySelector('.prod-co2').value)    || 0
    }));
  }

  function saveToXML(items) {
    let xml = '<products>';
    items.forEach(i => {
      xml += '<item>';
      xml += `<name>${i.name}</name>`;
      xml += `<cost>${i.cost}</cost>`;
      xml += `<profit>${i.profit}</profit>`;
      xml += `<unit>${i.unit}</unit>`;
      xml += `<co2>${i.co2}</co2>`;
      xml += '</item>';
    });
    xml += '</products>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'products.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFromXML(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const doc   = new DOMParser().parseFromString(reader.result, 'application/xml');
      const items = [...doc.querySelectorAll('item')].map(node => ({
        name:   node.querySelector('name').textContent,
        cost:   parseFloat(node.querySelector('cost').textContent),
        profit: parseFloat(node.querySelector('profit').textContent),
        unit:   node.querySelector('unit').textContent,
        co2:    parseFloat(node.querySelector('co2').textContent)
      }));
      tableBody.innerHTML = '';
      items.forEach(addRow);
    };
    reader.readAsText(file);
  }

  document.getElementById('add-product-btn').addEventListener('click', addRow);
  document.getElementById('save-products-btn').addEventListener('click', () =>
    saveToXML(getProductsData())
  );
  document.getElementById('load-products-file').addEventListener('change', e =>
    loadFromXML(e.target.files[0])
  );

  document.getElementById('back-to-inventory-btn').addEventListener('click', () => {
    window.location.href = 'inventory.html';
  });

  document.getElementById('next-to-parameters-btn').addEventListener('click', () => {
    localStorage.setItem('products', JSON.stringify(getProductsData()));
    window.location.href = 'parameters.html';
  });

  addRow();
});