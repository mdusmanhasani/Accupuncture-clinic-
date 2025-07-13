
document.getElementById('newPatientForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const date = document.getElementById('date').value;
  const symptoms = document.getElementById('symptoms').value.trim();
  const fee = document.getElementById('fee').value;

  let patients = JSON.parse(localStorage.getItem('patients') || '[]');
  if (patients.find(p => p.name === name && p.phone === phone)) {
    alert('This patient already exists under that phone number. Please search instead.');
    return;
  }

  patients.push({ name, phone, address, treatments: [{ date, symptoms, fee }] });
  localStorage.setItem('patients', JSON.stringify(patients));
  alert('Patient added!');
  this.reset();
});

function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
}

function searchPatients() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');

  patients.forEach((p, index) => {
    if (p.name.toLowerCase().includes(query) || p.phone.includes(query)) {
      const div = document.createElement('div');
      div.className = 'result-entry';
      div.innerHTML = `
        <strong>${p.name}</strong> (${p.phone})<br>
        Address: ${p.address}<br>
        <div class="treatment-list">${p.treatments.map(t => `<div>🗓 ${t.date} | 🤒 ${t.symptoms} | 💰 ${t.fee}</div>`).join('')}</div>
        <div class="treatment-form">
          <input type="date" placeholder="Date" id="tdate-${index}"><br>
          <input type="text" placeholder="Symptoms" id="tsymptoms-${index}"><br>
          <input type="number" placeholder="Fee" id="tfee-${index}"><br>
          <button onclick="addTreatment(${index})">➕ Add Treatment</button>
        </div>
        <div class="result-buttons">
          <button class="icon-btn" onclick="deletePatient(${index})">🗑️</button>
        </div>
      `;
      resultsDiv.appendChild(div);
    }
  });
}

function deletePatient(index) {
  let patients = JSON.parse(localStorage.getItem('patients') || '[]');
  if (confirm('Delete this patient?')) {
    patients.splice(index, 1);
    localStorage.setItem('patients', JSON.stringify(patients));
    searchPatients();
  }
}

function addTreatment(index) {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  const date = document.getElementById('tdate-' + index).value;
  const symptoms = document.getElementById('tsymptoms-' + index).value.trim();
  const fee = document.getElementById('tfee-' + index).value;
  if (!date || !fee) return alert('Date and Fee required');

  patients[index].treatments.push({ date, symptoms, fee });
  localStorage.setItem('patients', JSON.stringify(patients));
  searchPatients();
}
