document.addEventListener('DOMContentLoaded', () => {
  const tbody    = document.querySelector('#constraintsTable tbody');
  const products = JSON.parse(localStorage.getItem('products') || '[]');

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

  document.getElementById('apply-parameters-btn').addEventListener('click', () => {
    const objective = document.getElementById('objective').value;
    const minUnits  = [...tbody.querySelectorAll('.min-units')].map(i => parseFloat(i.value) || 0);
    localStorage.setItem('parameters', JSON.stringify({ objective, minUnits }));
    window.location.href = 'results.html';
  });
});