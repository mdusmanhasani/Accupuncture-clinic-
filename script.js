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

  if (!name || !phone) return alert("Name and phone required");

  let patients = getPatients();
  if (patients.find(p => p.name === name && p.phone === phone)) {
    alert("Patient already exists. Redirecting to search...");
    showTab('search');
    document.querySelector('#search input').value = name;
    searchPatient(name);
    return;
  }

  patients.push({ name, phone, address, treatments: [] });
  savePatients(patients);
  alert("Patient added!");
}

function searchPatient(query) {
  const results = document.getElementById('searchResults');
  results.innerHTML = '';
  const patients = getPatients();
  const found = patients.filter(p => p.name.includes(query) || p.phone.includes(query));
  found.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'result-card';
    div.innerHTML = `
      <b>${p.name}</b><br/>
      Phone: ${p.phone}<br/>
      Address: ${p.address || 'N/A'}<br/>
      Treatments:
      <ul>${(p.treatments || []).map(t => `<li>${t.date} - ₹${t.fee} - ${t.symptoms}</li>`).join('')}</ul>
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
  if (newName && newPhone) {
    patients[index].name = newName;
    patients[index].phone = newPhone;
    savePatients(patients);
    searchPatient(newName);
  }
}

function deletePatient(index) {
  if (confirm("Delete this patient?")) {
    const patients = getPatients();
    patients.splice(index, 1);
    savePatients(patients);
    searchPatient('');
  }
}

function addTreatment() {
  const name = document.getElementById('treatName').value.trim();
  const phone = document.getElementById('treatPhone').value.trim();
  const date = document.getElementById('treatDate').value;
  const symptoms = document.getElementById('treatSymptoms').value.trim();
  const fee = document.getElementById('treatFee').value;

  if (!name || !phone || !date || !fee) return alert("All fields required");

  const patients = getPatients();
  const patient = patients.find(p => p.name === name && p.phone === phone);
  if (!patient) return alert("Patient not found");

  patient.treatments.push({ date, symptoms, fee: parseFloat(fee) });
  savePatients(patients);
  alert("Treatment added!");
}

function exportData() {
  alert("Oops! Export not available here. You can save data manually as text.");
}

function loadReports() {
  const patients = getPatients();
  const from = new Date(document.getElementById('reportFrom').value);
  const to = new Date(document.getElementById('reportTo').value);
  to.setDate(to.getDate() + 1); // include the 'to' day

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
  const weekStart = new Date(d2);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return d1 >= weekStart && d1 < weekEnd;
}

function isSameMonth(d1, d2) {
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

function drawPieChart(data) {
  new Chart(document.getElementById('pieChart'), {
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
  new Chart(document.getElementById('barChart'), {
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
