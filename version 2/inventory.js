document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#inventoryTable tbody');
  const units     = ['nos', 'kg', 'l', 'm'];

	function addRow(data = {}) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td><input type="text" class="inv-name" value="${data.name || ''}"></td>
			<td><input type="number" class="inv-qty" value="${data.quantity || ''}"></td>
			<td>
			<select class="inv-unit">
				${units.map(u => `<option${data.unit === u ? ' selected' : ''}>${u}</option>`).join('')}
			</select>
			</td>
			<td><input type="number" step="0.01" class="inv-cost" value="${data.cost || ''}"></td>
			<td><input type="number" step="0.01" class="inv-co2" value="${data.co2 || ''}"></td>
			<td>
			<button class="remove-btn" title="Remove row">❌</button>
			</td>
		`;	
		tr.querySelector('.remove-btn').addEventListener('click', () => {
			tr.remove();
		});
		tableBody.appendChild(tr);
	}


  function getInventoryData() {
    return [...tableBody.children].map(row => ({
      name:     row.querySelector('.inv-name').value.trim(),
      quantity: parseFloat(row.querySelector('.inv-qty').value) || 0,
      unit:     row.querySelector('.inv-unit').value,
      cost:     parseFloat(row.querySelector('.inv-cost').value) || 0,
      co2:      parseFloat(row.querySelector('.inv-co2').value)  || 0
    }));
  }

  function saveToXML(items) {
    let xml = '<inventory>';
    items.forEach(i => {
      xml += '<item>';
      xml += `<name>${i.name}</name>`;
      xml += `<quantity>${i.quantity}</quantity>`;
      xml += `<unit>${i.unit}</unit>`;
      xml += `<cost>${i.cost}</cost>`;
      xml += `<co2>${i.co2}</co2>`;
      xml += '</item>';
    });
    xml += '</inventory>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'inventory.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFromXML(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const doc   = new DOMParser().parseFromString(reader.result, 'application/xml');
      const items = [...doc.querySelectorAll('item')].map(node => ({
        name:     node.querySelector('name').textContent,
        quantity: parseFloat(node.querySelector('quantity').textContent),
        unit:     node.querySelector('unit').textContent,
        cost:     parseFloat(node.querySelector('cost').textContent),
        co2:      parseFloat(node.querySelector('co2').textContent)
      }));
      tableBody.innerHTML = '';
      items.forEach(addRow);
    };
    reader.readAsText(file);
  }

  document.getElementById('add-inventory-btn').addEventListener('click', () => addRow());
  document.getElementById('save-inventory-btn').addEventListener('click', () =>
    saveToXML(getInventoryData())
  );
  document.getElementById('load-inventory-file').addEventListener('change', e =>
    loadFromXML(e.target.files[0])
  );

  document.getElementById('next-to-products-btn').addEventListener('click', () => {
    localStorage.setItem('inventory', JSON.stringify(getInventoryData()));
    window.location.href = 'products.html';
  });

  addRow();
});