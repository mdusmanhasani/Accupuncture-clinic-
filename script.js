function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

function getPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(patients) {
  localStorage.setItem('patients', JSON.stringify(patients));
}

function addPatient() {
  const name = document.getElementById('newName').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  const address = document.getElementById('newAddress').value.trim();
  const date = document.getElementById('treatDate').value;
  const fee = document.getElementById('treatFee').value;
  const symptoms = document.getElementById('treatSymptoms').value.trim();
  const points = document.getElementById('points').value.trim();

  if (!name || !phone) {
    alert("Name and Phone are required.");
    return;
  }

  let patients = getPatients();
  const existing = patients.find(p => p.name === name && p.phone === phone);
  if (existing) {
    alert("Patient already exists. Redirecting to Search...");
    showTab('search');
    document.querySelector('#search input').value = name;
    searchPatient(name);
    return;
  }

  const treatments = [];
  if (date && fee) {
    treatments.push({ date, fee: parseFloat(fee), symptoms, points });
  }

  patients.push({ name, phone, address, treatments });
  savePatients(patients);
  alert("Patient added!");

  // Clear fields
  document.getElementById('newName').value = '';
  document.getElementById('newPhone').value = '';
  document.getElementById('newAddress').value = '';
  document.getElementById('treatDate').value = '';
  document.getElementById('treatFee').value = '';
  document.getElementById('treatSymptoms').value = '';
  document.getElementById('points').value = '';
}

function addTreatment() {
  const name = document.getElementById('newName').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  const date = document.getElementById('treatDate').value;
  const fee = document.getElementById('treatFee').value;
  const symptoms = document.getElementById('treatSymptoms').value.trim();
  const points = document.getElementById('points').value.trim();

  if (!name || !phone || !date || !fee) {
    alert("Please enter Name, Phone, Date, and Fee.");
    return;
  }

  const patients = getPatients();
  const patient = patients.find(p => p.name === name && p.phone === phone);
  if (!patient) {
    alert("Patient not found.");
    return;
  }

  patient.treatments.push({ date, fee: parseFloat(fee), symptoms, points });
  savePatients(patients);
  alert("Treatment added!");

  document.getElementById('treatDate').value = '';
  document.getElementById('treatFee').value = '';
  document.getElementById('treatSymptoms').value = '';
  document.getElementById('points').value = '';
}

function searchPatient(query) {
  const results = document.getElementById('searchResults');
  results.innerHTML = '';
  const patients = getPatients();
  const found = patients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.phone.includes(query)
  );

  found.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'result-card';
    const treatmentHTML = (p.treatments || [])
      .map(t => `<li>${t.date} - ₹${t.fee} - ${t.symptoms || ''} (${t.points || '0'} pts)</li>`)
      .join('');

    div.innerHTML = `
      <b>${p.name}</b><br/>
      Phone: ${p.phone}<br/>
      Address: ${p.address || 'N/A'}<br/>
      Treatments:<ul>${treatmentHTML}</ul>
      <button class="edit-btn" onclick="editPatient(${index})">✏️</button>
      <button class="delete-btn" onclick="deletePatient(${index})">🗑️</button>
    `;
    results.appendChild(div);
  });
}

function editPatient(index) {
  const patients = getPatients();
  const p = patients[index];
  const newName = prompt("Edit Name", p.name);
  const newPhone = prompt("Edit Phone", p.phone);
  const newAddress = prompt("Edit Address", p.address || '');

  if (newName && newPhone) {
    patients[index].name = newName;
    patients[index].phone = newPhone;
    patients[index].address = newAddress;
    savePatients(patients);
    searchPatient(newName);
  }
}

function deletePatient(index) {
  if (confirm("Are you sure you want to delete this patient?")) {
    const patients = getPatients();
    patients.splice(index, 1);
    savePatients(patients);
    searchPatient('');
  }
}

function exportData() {
  alert("Oops! Export not available. You can copy the data manually.");
}

function loadReports() {
  const patients = getPatients();
  const from = new Date(document.getElementById('reportFrom').value);
  const to = new Date(document.getElementById('reportTo').value);
  if (isNaN(from) || isNaN(to)) {
    alert("Please select both From and To dates.");
    return;
  }
  to.setDate(to.getDate() + 1);

  const counts = { today: 0, week: 0, month: 0 };
  const fees = {};

  const now = new Date();
  patients.forEach(p => {
    (p.treatments || []).forEach(t => {
      const d = new Date(t.date);
      if (d >= from && d < to) {
        const ds = t.date;
        fees[ds] = (fees[ds] || 0) + parseFloat(t.fee);
      }
      if (isSameDay(d, now)) counts.today += 1;
      if (isSameWeek(d, now)) counts.week += 1;
      if (isSameMonth(d, now)) counts.month += 1;
    });
  });

  drawPieChart(counts);
  drawBarChart(fees);
}

function isSameDay(d1, d2) {
  return d1.toDateString() === d2.toDateString();
}

function isSameWeek(d1, d2) {
  const start = new Date(d2);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d1 >= start && d1 < end;
}

function isSameMonth(d1, d2) {
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

function drawPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Today', 'This Week', 'This Month'],
      datasets: [{
        data: [data.today, data.week, data.month],
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
      }]
    }
  });
}

function drawBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Fees Collected',
        data: Object.values(data),
        backgroundColor: '#673ab7'
      }]
    }
  });
    }
