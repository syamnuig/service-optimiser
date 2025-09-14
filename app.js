
const root = document.getElementById('app-root');

// --- PRODUCT OPTIMISER: dynamic inventory and products ---
function renderProductOptimiser() {
  // Initial state
  let inventory = [
    { name: "Inventory 1", stock: 100 }
  ];
  let products = [
    { name: "Product A", profit: 20, resourceMap: [{ resourceIdx: 0, amount: 1 }] }
  ];

  function rerender() {
    // Set CSS variable for dynamic grid columns
    document.documentElement.style.setProperty('--resource-count', inventory.length);
    root.innerHTML = `
      <div class="material-card">
        <div class="app-content-title">Product Optimiser</div>
        <form id="product-optimiser-form">
          <div class="form-section-title">Inventory</div>
          <div class="resource-input-grid" id="inventory-list"></div>
          <button id="add-inventory-btn" type="button" ${inventory.length === 5 ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}>Add Inventory</button>
          <div class="divider"></div>
          <div class="form-section-title">Products</div>
          <div class="product-input-grid" id="products-list"></div>
          <button id="add-product-btn" type="button">Add Product</button>
          <div class="divider"></div>
          <button class="calc-btn" type="submit">Optimise Mix</button>
        </form>
        <div class="tool-usage-note">
          <strong>How to use this tool:</strong>
          <ul>
            <li>Define inventory (e.g., machines, workers, materials) and their stock (max 5 inventory items).</li>
            <li>For each product, enter profit per unit and specify, for each inventory item, how much is required per unit delivered.</li>
            <li>Click "Optimise Mix" to calculate the optimal product quantities for maximum profit without exceeding any inventory stock.</li>
          </ul>
          <strong>Note:</strong> All values should be non-negative. At least one inventory item and one product are required. Results are computed using linear programming.
        </div>
        <div id="product-optimiser-result" class="result-block"></div>
      </div>
    `;
    // Render inventory
    renderInventory();
    // Render products
    renderProducts();
    // Add inventory
    root.querySelector("#add-inventory-btn").onclick = function() {
      if (inventory.length < 5) {
        inventory.push({ name: `Inventory ${inventory.length + 1}`, stock: 0 });
        // For every product, add a new inventory entry to resourceMap
        products.forEach(prod => prod.resourceMap.push({ resourceIdx: inventory.length - 1, amount: 0 }));
        rerender();
      }
    };
    // Add product
    root.querySelector("#add-product-btn").onclick = function() {
      let newResourceMap = inventory.map((r, i) => ({ resourceIdx: i, amount: 0 }));
      products.push({ name: `Product ${String.fromCharCode(65 + products.length)}`, profit: 0, resourceMap: newResourceMap });
      rerender();
    };
    // Handle optimisation
    root.querySelector("#product-optimiser-form").onsubmit = function(e) {
      e.preventDefault();
      // Build model
      let model = { optimize: "profit", opType: "max", constraints: {}, variables: {} };
      // Constraints: for each inventory item
      inventory.forEach((item, rIdx) => {
        model.constraints[item.name] = { max: parseFloat(item.stock) || 0 };
      });
      // Variables: for each product
      products.forEach((prod, pIdx) => {
        let prodVars = { profit: parseFloat(prod.profit) || 0 };
        prod.resourceMap.forEach((rm) => {
          let rname = inventory[rm.resourceIdx]?.name || `I${rm.resourceIdx+1}`;
          prodVars[rname] = parseFloat(rm.amount) || 0;
        });
        model.variables[prod.name] = prodVars;
      });
      // Solve
      let result;
      try {
        result = solver.Solve(model);
      } catch {
        result = null;
      }
      if (!result || !result.feasible) {
        root.querySelector("#product-optimiser-result").innerHTML = `
          <div>No feasible solution found.</div>
        `;
        return;
      }
      let output = `<strong>Optimal Product Mix:</strong><br>`;
      products.forEach(prod => {
        output += `${prod.name}: <strong>${result[prod.name] ? result[prod.name].toFixed(2) : 0}</strong> units<br>`;
      });
      output += `<br><strong>Total Profit:</strong> €${result.result.toFixed(2)}`;
      root.querySelector("#product-optimiser-result").innerHTML = output;
    };
  }

  // PATCH: Only rerender product headers when inventory name edit is finished (not on every keystroke)
  function renderInventory() {
    const container = root.querySelector("#inventory-list");
    container.innerHTML = inventory.map((item, idx) => `
      <div class="resource-input-row">
        <input type="text" value="${item.name}" placeholder="Inventory Name" />
        <input type="number" min="0" step="any" value="${item.stock}" placeholder="Stock" />
        <button class="remove-btn material-icons" ${inventory.length <= 1 ? 'disabled' : ''}>close</button>
      </div>
    `).join("");
    Array.from(container.querySelectorAll('.resource-input-row')).forEach((row, idx) => {
      const nameInput = row.querySelectorAll('input')[0];
      nameInput.oninput = e => { inventory[idx].name = e.target.value; /* Do NOT rerender here! */ };
      nameInput.onblur = () => { rerender(); };
      nameInput.onkeydown = (ev) => { if (ev.key === "Enter") { nameInput.blur(); } };
      row.querySelectorAll('input')[1].oninput = e => inventory[idx].stock = parseFloat(e.target.value) || 0;
      row.querySelector('.remove-btn').onclick = function() {
        if (inventory.length > 1) {
          inventory.splice(idx, 1);
          products.forEach(prod => prod.resourceMap.splice(idx, 1));
          rerender();
        }
      };
    });
  }

  function renderProducts() {
    const container = root.querySelector("#products-list");
    container.innerHTML = products.map((prod, pIdx) => `
      <div class="product-input-row">
        <input type="text" value="${prod.name}" placeholder="Product Name" />
        <input type="number" min="0" step="any" value="${prod.profit}" placeholder="Profit per unit (€)" />
        ${ inventory.map((item, rIdx) => {
          return `<input type="number" min="0" step="any" value="${prod.resourceMap[rIdx]?.amount || 0}" placeholder="${item.name} / unit" />`;
        }).join("") }
        <button class="remove-btn material-icons" ${products.length <= 1 ? 'disabled' : ''}>close</button>
      </div>
    `).join("");
    Array.from(container.querySelectorAll('.product-input-row')).forEach((row, pIdx) => {
      row.querySelectorAll('input')[0].oninput = e => products[pIdx].name = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => products[pIdx].profit = parseFloat(e.target.value) || 0;
      // Inventory per unit
      for (let rIdx = 0; rIdx < inventory.length; ++rIdx) {
        row.querySelectorAll('input')[2 + rIdx].oninput = e => {
          products[pIdx].resourceMap[rIdx].amount = parseFloat(e.target.value) || 0;
        };
      }
      row.querySelector('.remove-btn').onclick = function() {
        if (products.length > 1) {
          products.splice(pIdx, 1);
          rerender();
        }
      };
    });
  }

  rerender();
}

// Initialise Product Optimiser on page load
renderProductOptimiser();
