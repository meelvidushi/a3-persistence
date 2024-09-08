document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vehicleForm');
  const tableBody = document.querySelector('#vehicleTable tbody');

  fetchAndUpdateTable();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const mpg = document.getElementById('mpg').value;

    const newVehicle = { model, year, mpg };

    fetch('/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVehicle),
    })
        .then(response => response.json())
        .then(() => {
          fetchAndUpdateTable();
        });
  });

  function fetchAndUpdateTable() {
    fetch('/vehicles').then(response => response.json()).then(data => updateTable(data));
  }

  function updateTable(data) {
    tableBody.innerHTML = '';

    data.forEach(item => {
      const row = document.createElement('tr');

      // Add editable input fields
      const modelCell = createEditableCell(item.model, 'model');
      const yearCell = createEditableCell(item.year, 'year');
      const mpgCell = createEditableCell(item.mpg, 'mpg');

      row.appendChild(modelCell);
      row.appendChild(yearCell);
      row.appendChild(mpgCell);

      // Add save and delete buttons
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', () => {
        const updatedVehicle = {
          model: modelCell.querySelector('input').value,
          year: yearCell.querySelector('input').value,
          mpg: mpgCell.querySelector('input').value
        };
        fetch('/vehicles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldModel: item.model, ...updatedVehicle })
        }).then(() => fetchAndUpdateTable());
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        fetch('/vehicles', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: item.model })
        }).then(response => response.json())
            .then(() => row.remove());
      });

      const actionCell = document.createElement('td');
      actionCell.appendChild(saveButton);
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      tableBody.appendChild(row);
    });
  }

  function createEditableCell(value, field) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.value = value;
    input.type = field === 'year' || field === 'mpg' ? 'number' : 'text';
    cell.appendChild(input);
    return cell;
  }
});
