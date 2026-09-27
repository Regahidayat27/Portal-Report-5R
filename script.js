let dataReport5R = JSON.parse(localStorage.getItem('dataReport5R')) || [];
let statusChart, kategoriChart;
let selectedCloseIndex = null;
let selectedTagIndex = null;

window.onload = function() {
  const today = new Date();
  document.getElementById('tglInspeksi').valueAsDate = today;
  
  const targetDefault = new Date();
  targetDefault.setDate(today.getDate() + 3);
  document.getElementById('targetDate').valueAsDate = targetDefault;
  
  initCharts();
  renderTable();
  updateAnalytics();
  renderActivityFeed();
  renderLeaderboard();
  loadDraft();
};

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');

  if (tabId === 'tabDashboard') {
    setTimeout(() => updateAnalytics(), 100);
  }
}

function goToTab(tabId, btnIndex) {
  const tabs = document.querySelectorAll('.tab-btn');
  switchTab(tabId, tabs[btnIndex]);
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('themeIcon');
  icon.className = document.body.classList.contains('dark-mode') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function saveDraft() {
  const draft = {
    dept: document.getElementById('deptPelapor').value,
    area: document.getElementById('area').value,
    kategori: document.getElementById('kategori').value,
    urgensi: document.getElementById('urgensi').value,
    targetDate: document.getElementById('targetDate').value,
    deskripsi: document.getElementById('deskripsi').value,
    nama: document.getElementById('nama').value,
    pic: document.getElementById('picArea').value
  };
  localStorage.setItem('draft5R', JSON.stringify(draft));
}

function loadDraft() {
  const draft = JSON.parse(localStorage.getItem('draft5R'));
  if (draft) {
    if(draft.dept) document.getElementById('deptPelapor').value = draft.dept;
    if(draft.area) document.getElementById('area').value = draft.area;
    if(draft.kategori) document.getElementById('kategori').value = draft.kategori;
    if(draft.urgensi) document.getElementById('urgensi').value = draft.urgensi;
    if(draft.targetDate) document.getElementById('targetDate').value = draft.targetDate;
    if(draft.deskripsi) document.getElementById('deskripsi').value = draft.deskripsi;
    if(draft.nama) document.getElementById('nama').value = draft.nama;
    if(draft.pic) document.getElementById('picArea').value = draft.pic;
  }
}

function initCharts() {
  const ctxStatus = document.getElementById('statusChart').getContext('2d');
  statusChart = new Chart(ctxStatus, {
    type: 'doughnut',
    data: { labels: ['OPEN', 'CLOSED'], datasets: [{ data: [0, 0], backgroundColor: ['#dc2626', '#16a34a'] }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const ctxKategori = document.getElementById('kategoriChart').getContext('2d');
  kategoriChart = new Chart(ctxKategori, {
    type: 'bar',
    data: { labels: ['Ringkas', 'Rapi', 'Resik', 'Rawat', 'Rajin'], datasets: [{ label: 'Jumlah Temuan', data: [0, 0, 0, 0, 0], backgroundColor: '#0284c7' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

function previewImage(input, previewId, labelId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = 'block';
      document.getElementById(labelId).innerText = file.name;
    }
    reader.readAsDataURL(file);
  }
}

document.getElementById('form5R').addEventListener('submit', function(e) {
  e.preventDefault();

  const tglInput = document.getElementById('tglInspeksi').value;
  const dept = document.getElementById('deptPelapor').value;
  const area = document.getElementById('area').value;
  const kategori = document.getElementById('kategori').value;
  const urgensi = document.getElementById('urgensi').value;
  const targetDate = document.getElementById('targetDate').value;
  const deskripsi = document.getElementById('deskripsi').value;
  const nama = document.getElementById('nama').value;
  const pic = document.getElementById('picArea').value;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const srcBefore = document.getElementById('previewBefore').src;
  const srcAfter = document.getElementById('previewAfter').src;

  const hasAfter = srcAfter && srcAfter !== window.location.href && !srcAfter.endsWith('index.html');
  const status = hasAfter ? 'CLOSED' : 'OPEN';

  const reportItem = {
    tanggal: tglInput,
    targetDate: targetDate,
    waktu: time,
    status: status,
    dept: dept,
    area: area,
    kategori: kategori,
    urgensi: urgensi,
    deskripsi: deskripsi,
    fotoBefore: srcBefore,
    fotoAfter: hasAfter ? srcAfter : '',
    auditor: nama,
    pic: pic
  };

  dataReport5R.push(reportItem);
  localStorage.setItem('dataReport5R', JSON.stringify(dataReport5R));
  localStorage.removeItem('draft5R');

  renderTable();
  updateAnalytics();
  renderActivityFeed();
  renderLeaderboard();

  this.reset();
  document.getElementById('tglInspeksi').valueAsDate = new Date();
  document.getElementById('previewBefore').style.display = 'none';
  document.getElementById('previewAfter').style.display = 'none';
  document.getElementById('labelBefore').innerText = 'Klik/Pilih Foto Before';
  document.getElementById('labelAfter').innerText = 'Klik/Pilih Foto After (Opsional)';

  showToast('✅ Laporan 5R Berhasil Ditambahkan!');
});

function renderActivityFeed() {
  const feedContainer = document.getElementById('recentActivityList');
  feedContainer.innerHTML = '';

  if (dataReport5R.length === 0) {
    feedContainer.innerHTML = `<p class="text-center">Belum ada aktivitas pelaporan terbaru.</p>`;
    return;
  }

  const recentItems = [...dataReport5R].reverse().slice(0, 3);
  recentItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'feed-item';
    div.innerHTML = `
      <div class="feed-header">
        <span>${item.area} (${item.dept})</span>
        <small>${item.tanggal}</small>
      </div>
      <div>${item.deskripsi}</div>
      <div style="margin-top: 4px; color: var(--text-muted);"><small>Auditor: ${item.auditor} | PIC: ${item.pic || '-'}</small></div>
    `;
    feedContainer.appendChild(div);
  });
}

function renderLeaderboard() {
  const lbContainer = document.getElementById('leaderboardList');
  lbContainer.innerHTML = '';

  if (dataReport5R.length === 0) {
    lbContainer.innerHTML = `<p class="text-center">Belum ada peringkat area.</p>`;
    return;
  }

  const areaCounts = {};
  dataReport5R.forEach(item => {
    areaCounts[item.area] = (areaCounts[item.area] || 0) + 1;
  });

  const sortedAreas = Object.keys(areaCounts).sort((a,b) => areaCounts[b] - areaCounts[a]);
  const medals = ['🥇', '🥈', '🥉'];

  sortedAreas.forEach((area, index) => {
    const div = document.createElement('div');
    div.className = 'lb-item';
    div.innerHTML = `
      <div class="lb-header">
        <span>${medals[index] || '#'+(index+1)} ${area}</span>
        <span>${areaCounts[area]} Laporan</span>
      </div>
    `;
    lbContainer.appendChild(div);
  });
}

function renderTable() {
  const tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';

  if (dataReport5R.length === 0) {
    tbody.innerHTML = `<tr id="emptyRow"><td colspan="10" class="text-center">Belum ada temuan yang diinput.</td></tr>`;
    return;
  }

  dataReport5R.forEach((item, index) => {
    const tr = document.createElement('tr');
    const badgeClass = item.status === 'CLOSED' ? 'badge-closed' : 'badge-open';
    const actionBtn = item.status === 'OPEN' ? `<button onclick="openCloseModal(${index})" class="btn-action-close">+ Foto After</button>` : '✅ Done';
    const tagBtn = `<button onclick="openSingleTagModal(${index})" class="btn-action-tag">🖨️ Card</button>`;
    const waBtn = `<button onclick="openWaModal(${index})" class="btn-action-wa"><i class="fa-brands fa-whatsapp"></i> WA</button>`;

    let urgensiBadge = '<span class="badge-med">Medium</span>';
    if (item.urgensi === 'Low') urgensiBadge = '<span class="badge-low">Low</span>';
    if (item.urgensi.includes('High')) urgensiBadge = '<span class="badge-high">High / Red Tag</span>';

    tr.innerHTML = `
      <td><strong>${item.tanggal}</strong><br><small>Due: ${item.targetDate || '-'}</small></td>
      <td><span class="${badgeClass}">${item.status}</span></td>
      <td>${urgensiBadge}</td>
      <td><strong>${item.area}</strong><br><small>(${item.dept || 'N/A'})</small></td>
      <td>${item.kategori}</td>
      <td>${item.deskripsi}</td>
      <td>${item.fotoBefore ? `<img src="${item.fotoBefore}" class="table-img" onclick="openZoomModal('${item.fotoBefore}')">` : '-'}</td>
      <td>${item.fotoAfter ? `<img src="${item.fotoAfter}" class="table-img" onclick="openZoomModal('${item.fotoAfter}')">` : '-'}</td>
      <td>Auditor: ${item.auditor}<br><small>PIC: ${item.pic || '-'}</small></td>
      <td>${actionBtn}${tagBtn}${waBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openCloseModal(index) {
  selectedCloseIndex = index;
  const item = dataReport5R[index];
  document.getElementById('closeAreaText').innerText = `Area: ${item.area} - ${item.deskripsi}`;
  document.getElementById('closeModal').style.display = 'block';
}

function closeModalAction() {
  document.getElementById('closeModal').style.display = 'none';
  document.getElementById('modalPreviewImg').style.display = 'none';
  document.getElementById('modalFotoAfterInput').value = '';
}

function openWaModal(index) {
  const item = dataReport5R[index];
  const text = `🚨 *Laporan Inspeksi 5R PT Lelco Trindo Nusantara*\n\n` +
               `*Tanggal:* ${item.tanggal}\n` +
               `*Area:* ${item.area} (${item.dept})\n` +
               `*Status:* [ ${item.status} ]\n` +
               `*Urgensi:* ${item.urgensi}\n` +
               `*Deskripsi:* ${item.deskripsi}\n` +
               `*PIC Area:* ${item.pic || '-'}\n` +
               `*Auditor:* ${item.auditor}\n\n` +
               `Mohon segera ditindaklanjuti sebelum due date: *${item.targetDate}*`;
               
  document.getElementById('waTextContent').value = text;
  document.getElementById('waModal').style.display = 'block';
}

function closeWaModal() {
  document.getElementById('waModal').style.display = 'none';
}

function copyWaText() {
  const text = document.getElementById('waTextContent');
  text.select();
  navigator.clipboard.writeText(text.value);
  showToast('📋 Teks WA berhasil di-copy!');
  closeWaModal();
}

function generatePhysicalRedTag() {
  const nama = document.getElementById('rtNamaBarang').value || 'Peralatan / Sparepart Rusak';
  const jumlah = document.getElementById('rtJumlah').value || '1 Unit';
  const alasan = document.getElementById('rtAlasan').value || 'Perlu Perbaikan / Afkir';

  const container = document.getElementById('redTagPrintContainer');
  container.innerHTML = `
    <div style="width: 350px; background: red; color: white; border: 4px solid black; padding: 15px; font-family: Arial; font-weight: bold;">
      <h2 style="text-align: center; border-bottom: 2px solid white; padding-bottom: 5px;">🔴 RED TAG KARANTINA 5R</h2>
      <p style="margin-top: 10px; font-size: 13px;">BARANG: ${nama}</p>
      <p style="font-size: 13px;">JUMLAH: ${jumlah}</p>
      <p style="font-size: 13px;">ALASAN: ${alasan}</p>
      <p style="font-size: 13px;">TANGGAL RED TAG: ${new Date().toISOString().slice(0, 10)}</p>
      <div style="margin-top: 20px; border-top: 2px dashed white; padding-top: 10px; font-size: 11px; text-align: center;">
        DILARANG DIPINDAHKAN TANPA IZIN TIM 5R PT LELCO
      </div>
    </div>
  `;

  const opt = {
    margin: 0.2,
    filename: `Stiker_Red_Tag_Physical.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(container).save();
}

function previewModalImage(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById('modalPreviewImg');
      img.src = e.target.result;
      img.style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
}

function submitCloseAction() {
  const previewSrc = document.getElementById('modalPreviewImg').src;
  if (selectedCloseIndex !== null && previewSrc && previewSrc !== window.location.href) {
    dataReport5R[selectedCloseIndex].fotoAfter = previewSrc;
    dataReport5R[selectedCloseIndex].status = 'CLOSED';
    localStorage.setItem('dataReport5R', JSON.stringify(dataReport5R));
    
    renderTable();
    updateAnalytics();
    closeModalAction();
    showToast('🎉 Temuan Berhasil Di-Close!');
  } else {
    alert('Harap pilih foto After terlebih dahulu!');
  }
}

function openSingleTagModal(index) {
  selectedTagIndex = index;
  const item = dataReport5R[index];

  document.getElementById('tagTanggal').innerText = item.tanggal + ' (' + item.waktu + ')';
  document.getElementById('tagTarget').innerText = item.targetDate || '-';
  document.getElementById('tagDept').innerText = item.dept || '-';
  document.getElementById('tagArea').innerText = item.area;
  document.getElementById('tagKategori').innerText = item.kategori;
  document.getElementById('tagUrgensi').innerText = item.urgensi;
  document.getElementById('tagAuditor').innerText = item.auditor;
  document.getElementById('tagPic').innerText = item.pic || '-';
  document.getElementById('tagDeskripsi').innerText = item.deskripsi;
  document.getElementById('tagImgBefore').src = item.fotoBefore || '';
  document.getElementById('tagImgAfter').src = item.fotoAfter || item.fotoBefore;

  document.getElementById('singleTagModal').style.display = 'block';
}

function closeSingleTagModal() {
  document.getElementById('singleTagModal').style.display = 'none';
}

function printSingleTagPDF() {
  const element = document.getElementById('singleTagPrintArea');
  const opt = {
    margin: 0.2,
    filename: `Tag_5R_${dataReport5R[selectedTagIndex].area.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filterDate = document.getElementById('filterDate').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const rows = document.querySelectorAll('#dataBody tr');

  rows.forEach(row => {
    if(row.id === 'emptyRow') return;
    const text = row.innerText.toLowerCase();
    const rowDate = row.children[0].innerText;
    const statusText = row.children[1].innerText;

    const matchesSearch = text.includes(search);
    const matchesStatus = (statusFilter === 'ALL') || (statusText === statusFilter);
    const matchesDate = !filterDate || rowDate.includes(filterDate);

    row.style.display = (matchesSearch && matchesStatus && matchesDate) ? '' : 'none';
  });
}

function updateAnalytics() {
  const total = dataReport5R.length;
  const closed = dataReport5R.filter(item => item.status === 'CLOSED').length;
  const open = total - closed;
  const score = total > 0 ? Math.round((closed / total) * 100) : 0;

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statOpen').innerText = open;
  document.getElementById('statClosed').innerText = closed;
  document.getElementById('statScore').innerText = score + '%';

  document.getElementById('homeStatTotal').innerText = total;
  document.getElementById('homeStatOpen').innerText = open;
  document.getElementById('homeStatClosed').innerText = closed;

  if (statusChart && kategoriChart) {
    statusChart.data.datasets[0].data = [open, closed];
    statusChart.update();

    const counts = { 'Ringkas': 0, 'Rapi': 0, 'Resik': 0, 'Rawat': 0, 'Rajin': 0 };
    dataReport5R.forEach(item => {
      for (let key in counts) {
        if (item.kategori.includes(key)) counts[key]++;
      }
    });

    kategoriChart.data.datasets[0].data = Object.values(counts);
    kategoriChart.update();
  }
}

function openZoomModal(src) {
  document.getElementById('imageModal').style.display = 'block';
  document.getElementById('imgModalTarget').src = src;
}
function closeZoomModal() {
  document.getElementById('imageModal').style.display = 'none';
}

function clearAllData() {
  if (confirm('Apakah Anda yakin ingin menghapus/reset seluruh data laporan?')) {
    dataReport5R = [];
    localStorage.removeItem('dataReport5R');
    renderTable();
    updateAnalytics();
    renderActivityFeed();
    renderLeaderboard();
    showToast('🗑️ Data laporan berhasil di-reset.');
  }
}

function exportToExcel() {
  if (dataReport5R.length === 0) {
    showToast('⚠️ Belum ada data untuk di-export!');
    return;
  }

  const excelData = dataReport5R.map(item => ({
    "Tanggal": item.tanggal,
    "Target Selesai": item.targetDate || '-',
    "Waktu Input": item.waktu,
    "Status": item.status,
    "Urgensi": item.urgensi,
    "Departemen": item.dept,
    "Area / Lokasi": item.area,
    "Kategori 5R": item.kategori,
    "Deskripsi Temuan": item.deskripsi,
    "Auditor": item.auditor,
    "PIC Area": item.pic || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report 5R Harian");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Report_5R_Lelco_${today}.xlsx`);
}

function exportToCSV() {
  if (dataReport5R.length === 0) {
    showToast('⚠️ Belum ada data untuk di-export!');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Tanggal,Due Date,Status,Urgensi,Departemen,Area,Kategori,Deskripsi,Auditor,PIC\n";
  dataReport5R.forEach(row => {
    csvContent += `${row.tanggal},${row.targetDate || '-'},${row.status},${row.urgensi},"${row.dept}","${row.area}","${row.kategori}","${row.deskripsi}","${row.auditor}","${row.pic || '-'}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Report_5R_Lelco_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
}

function exportToPDF() {
  if (dataReport5R.length === 0) {
    showToast('⚠️ Belum ada data untuk dicetak!');
    return;
  }

  const element = document.getElementById('printArea');
  const opt = {
    margin:       0.3,
    filename:     `Laporan_5R_Lelco_${new Date().toISOString().slice(0, 10)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(element).save();
}