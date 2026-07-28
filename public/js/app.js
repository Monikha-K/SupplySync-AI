// SupplySync AI - Shipment Monitoring Agent Client Logic

let currentShipment = null;
let simulationInterval = null;
let leafletMapInstance = null;
let leafletMarkers = [];
let leafletPolyline = null;

// Known Route Coordinates Dictionary for Real Map Rendering
const ROUTE_COORDINATES = {
  "SHP1001": [
    { name: "Chennai (Pickup)", lat: 13.0827, lng: 80.2707, status: "completed" },
    { name: "Vellore Checkpoint", lat: 12.9165, lng: 79.1325, status: "completed" },
    { name: "Salem (Current Location)", lat: 11.6643, lng: 78.1460, status: "current" },
    { name: "Erode Bypass", lat: 11.3410, lng: 77.7172, status: "upcoming" },
    { name: "Coimbatore (Destination)", lat: 11.0168, lng: 76.9558, status: "destination" }
  ],
  "SHP1002": [
    { name: "Bengaluru Hub", lat: 12.9716, lng: 77.5946, status: "completed" },
    { name: "Chikkaballapur", lat: 13.4355, lng: 77.7315, status: "completed" },
    { name: "Anantapur (Current Location)", lat: 14.6819, lng: 77.6006, status: "current" },
    { name: "Kurnool Checkpoint", lat: 15.8281, lng: 78.0373, status: "upcoming" },
    { name: "Hyderabad Hub", lat: 17.3850, lng: 78.4867, status: "destination" }
  ],
  "SHP1003": [
    { name: "Madurai Depot", lat: 9.9252, lng: 78.1198, status: "completed" },
    { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, status: "completed" },
    { name: "Viluppuram", lat: 11.9401, lng: 79.4861, status: "completed" },
    { name: "Tambaram", lat: 12.9249, lng: 80.1000, status: "completed" },
    { name: "Chennai Port", lat: 13.0827, lng: 80.2707, status: "destination" }
  ],
  "SHP1004": [
    { name: "Kochi Port", lat: 9.9312, lng: 76.2673, status: "completed" },
    { name: "Thrissur", lat: 10.5276, lng: 76.2144, status: "completed" },
    { name: "Palakkad (Current Location)", lat: 10.7867, lng: 76.6548, status: "current" },
    { name: "Coimbatore Hub", lat: 11.0168, lng: 76.9558, status: "upcoming" },
    { name: "Bengaluru South", lat: 12.9716, lng: 77.5946, status: "destination" }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  document.getElementById('dbStatusBtn').addEventListener('click', openModal);
});

// Check API & Database Health
async function checkHealth() {
  const label = document.getElementById('dbStatusLabel');
  const pulse = document.getElementById('dbPulse');
  const modalText = document.getElementById('modalConnectionStr');

  try {
    const res = await fetch('/api/health');
    const data = await res.json();

    if (data.atlasConnected) {
      label.textContent = `MongoDB Atlas: Connected (${data.dbName})`;
      pulse.className = 'pulse-dot';
      modalText.innerHTML = `✅ <strong>Status:</strong> Connected to MongoDB Atlas Cluster<br>⚡ <strong>Database:</strong> ${data.dbName}`;
    } else {
      label.textContent = `Demo Mode (In-Memory Store)`;
      pulse.className = 'pulse-dot warning';
      modalText.innerHTML = `⚠️ <strong>Status:</strong> ${data.connectionMessage}<br>💡 Using pre-seeded mock dataset with SHP1001, SHP1002, SHP1003, SHP1004.`;
    }
  } catch (err) {
    label.textContent = `Offline / Connection Error`;
    pulse.className = 'pulse-dot warning';
    modalText.innerHTML = `❌ <strong>Status:</strong> Could not reach backend server API.`;
  }
}

// Select Sample Chip
function selectSample(id) {
  document.getElementById('shipmentInput').value = id;
  trackShipment(id);
}

// Handle Search Form Submission
function handleSearch(e) {
  e.preventDefault();
  const id = document.getElementById('shipmentInput').value.trim();
  if (id) {
    trackShipment(id);
  }
}

// Fetch & Track Shipment Data
async function trackShipment(shipmentId) {
  stopSimulation();

  const trackBtnText = document.getElementById('trackBtnText');
  const trackSpinner = document.getElementById('trackSpinner');

  trackBtnText.textContent = 'Searching AI Network...';
  trackSpinner.style.display = 'inline-block';

  try {
    const res = await fetch(`/api/shipment/${encodeURIComponent(shipmentId)}`);
    const data = await res.json();

    if (data.success && data.shipment) {
      currentShipment = data.shipment;
      renderShipment(currentShipment);
      showResultsScreen();
    } else {
      alert(data.message || `Shipment ID '${shipmentId}' was not found. Try SHP1001, SHP1002, SHP1003, or SHP1004.`);
    }
  } catch (err) {
    console.error("Error fetching shipment:", err);
    alert("Server communication error. Please ensure backend server is running.");
  } finally {
    trackBtnText.textContent = 'Track Shipment';
    trackSpinner.style.display = 'none';
  }
}

// Render Shipment Data to Screen 2
function renderShipment(s) {
  document.getElementById('resShipmentId').textContent = s.shipmentId;
  document.getElementById('resPickup').textContent = s.pickup;
  document.getElementById('resDestination').textContent = s.destination;
  document.getElementById('resDriver').textContent = s.driverName;
  document.getElementById('resUpdated').textContent = `Last Updated: ${s.lastUpdated}`;

  // 4 Cards Row
  const statusBadge = document.getElementById('resStatusBadge');
  statusBadge.textContent = (s.status === 'In Transit' ? '🟢 ' : s.status === 'Delayed' ? '🟡 ' : '✅ ') + s.status;
  statusBadge.className = `metric-status-badge ${s.statusColor || (s.status === 'Delayed' ? 'warning' : 'success')}`;

  document.getElementById('resLocation').textContent = s.currentLocation;
  document.getElementById('resETA').textContent = s.eta;
  document.getElementById('resProgressCard').textContent = `${s.progress}%`;

  // Progress Bar
  document.getElementById('resProgressText').textContent = `${s.progress}%`;
  const fillBar = document.getElementById('resProgressFill');
  fillBar.style.width = '0%';
  setTimeout(() => {
    fillBar.style.width = `${s.progress}%`;
  }, 100);

  // Telemetry Row
  if (s.telemetry) {
    document.getElementById('resSpeed').textContent = s.telemetry.speed || 'N/A';
    document.getElementById('resTemp').textContent = s.telemetry.temperature || 'N/A';
    document.getElementById('resDistance').textContent = `${s.telemetry.distanceCovered || '0'} / ${s.telemetry.totalDistance || '0'}`;
  }

  // Timeline
  renderTimeline(s.timeline || []);

  // Real Geographical Map Rendering
  renderRealMap(s);

  // AI Summary Card
  document.getElementById('resAISummary').textContent = s.summary;
  document.getElementById('resRiskLevel').textContent = s.riskLevel || 'Low / Normal';
  document.getElementById('resRiskLevel').style.color = s.status === 'Delayed' ? '#FBBF24' : '#4ADE80';

  // Reset query output
  document.getElementById('aiQueryInput').value = '';
  const responseBox = document.getElementById('aiResponseBox');
  responseBox.style.display = 'none';
  responseBox.textContent = '';
}

// Render Real Geographical Leaflet Map with Pitch-Black Google Dark Mode Theme
function renderRealMap(s) {
  const mapContainer = document.getElementById('googleMap');

  // Waypoints dictionary or dynamic coordinate generation
  const waypoints = ROUTE_COORDINATES[s.shipmentId] || [
    { name: s.pickup, lat: 13.0827, lng: 80.2707, status: "completed" },
    { name: s.currentLocation, lat: 11.6643, lng: 78.1460, status: "current" },
    { name: s.destination, lat: 11.0168, lng: 76.9558, status: "destination" }
  ];

  const currentWp = waypoints.find(w => w.name.includes(s.currentLocation) || w.status === 'current') || waypoints[1] || waypoints[0];

  // Initialize Leaflet Map if not created
  if (!leafletMapInstance) {
    mapContainer.innerHTML = '';
    leafletMapInstance = L.map('googleMap', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([currentWp.lat, currentWp.lng], 8);

    // CartoDB Dark Matter Pitch Black Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Google Maps Dark Mode Visualizer &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(leafletMapInstance);
  } else {
    leafletMapInstance.setView([currentWp.lat, currentWp.lng], 8);
  }

  // Clear existing markers & lines
  leafletMarkers.forEach(m => leafletMapInstance.removeLayer(m));
  leafletMarkers = [];
  if (leafletPolyline) {
    leafletMapInstance.removeLayer(leafletPolyline);
  }

  const latLngs = [];

  waypoints.forEach((wp, idx) => {
    const latLng = [wp.lat, wp.lng];
    latLngs.push(latLng);

    let iconHtml = '📍';
    let badgeClass = 'gmap-pin-badge';

    if (idx === 0) {
      iconHtml = '🟢';
      badgeClass = 'gmap-pin-badge origin';
    } else if (wp.name.includes(s.currentLocation) || wp.status === 'current') {
      iconHtml = '🚚';
      badgeClass = 'gmap-pin-badge current';
    } else if (idx === waypoints.length - 1) {
      iconHtml = '🏁';
      badgeClass = 'gmap-pin-badge destination';
    }

    const customDivIcon = L.divIcon({
      className: 'gmap-pin-wrapper',
      html: `<div class="${badgeClass}">
        <span>${iconHtml}</span>
        <span>${wp.name}</span>
      </div>`,
      iconSize: [140, 32],
      iconAnchor: [70, 16]
    });

    const marker = L.marker(latLng, { icon: customDivIcon }).addTo(leafletMapInstance);
    marker.bindPopup(`
      <div style="color: #0F172A; font-family: sans-serif; font-size: 13px; font-weight: 600; padding: 4px;">
        <div style="font-size: 14px; color: #4285F4; font-weight: 800; margin-bottom: 4px;">${wp.name}</div>
        <div>Shipment ID: <strong>${s.shipmentId}</strong></div>
        <div>Driver: <strong>${s.driverName}</strong></div>
        <div>Status: <strong>${s.status} (${s.progress}%)</strong></div>
      </div>
    `);

    leafletMarkers.push(marker);
  });

  // Polyline for Google Blue Logistics Route Path
  leafletPolyline = L.polyline(latLngs, {
    color: '#4285F4',
    weight: 6,
    opacity: 0.95
  }).addTo(leafletMapInstance);

  // Fit bounds to cover all cities
  if (latLngs.length > 1) {
    leafletMapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [45, 45] });
  }

  // Trigger resize so map renders full width
  setTimeout(() => {
    leafletMapInstance.invalidateSize();
  }, 200);
}
  if (latLngs.length > 1) {
    leafletMapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
  }

  // Trigger resize so map renders full width
  setTimeout(() => {
    leafletMapInstance.invalidateSize();
  }, 200);
}

// Render Timeline Checkpoints
function renderTimeline(timeline) {
  const container = document.getElementById('resTimeline');
  container.innerHTML = '';

  if (!timeline || timeline.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">No timeline checkpoints available.</p>`;
    return;
  }

  timeline.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = `timeline-item ${item.status}`;

    let iconSymbol = '○';
    let tagLabel = 'Upcoming';

    if (item.status === 'completed') {
      iconSymbol = '✓';
      tagLabel = 'Completed';
    } else if (item.status === 'current') {
      iconSymbol = '●';
      tagLabel = 'Current Location';
    } else if (item.status === 'destination') {
      iconSymbol = '🏁';
      tagLabel = 'Destination';
    }

    itemEl.innerHTML = `
      <div class="timeline-marker">${iconSymbol}</div>
      <div class="timeline-content">
        <div class="timeline-location-name">
          <span>📍 ${item.location}</span>
        </div>
        <div class="timeline-status-tag">${tagLabel}</div>
        <div class="timeline-note">${item.note || ''}</div>
      </div>
    `;

    container.appendChild(itemEl);
  });
}

// Toggle Live GPS Movement Simulation
function toggleSimulation() {
  if (simulationInterval) {
    stopSimulation();
  } else {
    startSimulation();
  }
}

function startSimulation() {
  if (!currentShipment) return;

  const btnIcon = document.getElementById('simBtnIcon');
  const btnText = document.getElementById('simBtnText');
  const feedCard = document.getElementById('simFeedCard');

  btnIcon.textContent = '⏸';
  btnText.textContent = 'Pause Simulation';
  feedCard.style.display = 'block';

  appendSimLog(`📡 Started real-time telemetry simulation for ${currentShipment.shipmentId}...`);

  simulationInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/simulate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId: currentShipment.shipmentId })
      });
      const data = await res.json();
      if (data.success && data.shipment) {
        currentShipment = data.shipment;
        renderShipment(currentShipment);
        if (data.log) appendSimLog(data.log);

        if (currentShipment.progress >= 100) {
          appendSimLog(`🎉 Shipment ${currentShipment.shipmentId} reached destination!`);
          stopSimulation();
        }
      }
    } catch (err) {
      console.error("Simulation pulse error:", err);
    }
  }, 2500);
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  const btnIcon = document.getElementById('simBtnIcon');
  const btnText = document.getElementById('simBtnText');
  if (btnIcon && btnText) {
    btnIcon.textContent = '▶';
    btnText.textContent = 'Simulate Live Movement';
  }
}

function appendSimLog(msg) {
  const logList = document.getElementById('simLogList');
  const logItem = document.createElement('div');
  logItem.textContent = msg;
  logList.prepend(logItem);
}

// Speech Synthesis Readout
function readSummarySpeech() {
  const summaryText = document.getElementById('resAISummary').textContent;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Voice Speech Synthesis is not supported in this browser.");
  }
}

// AI Agent Direct Query
async function sendAIQuery() {
  const input = document.getElementById('aiQueryInput');
  const responseBox = document.getElementById('aiResponseBox');
  const queryText = input.value.trim();

  if (!queryText) return;

  responseBox.style.display = 'block';
  responseBox.textContent = '🤖 Agent thinking...';

  try {
    const res = await fetch('/api/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipmentId: currentShipment ? currentShipment.shipmentId : 'SHP1001',
        query: queryText
      })
    });
    const data = await res.json();
    if (data.success) {
      responseBox.textContent = data.answer;
    } else {
      responseBox.textContent = 'Unable to answer query at this time.';
    }
  } catch (err) {
    responseBox.textContent = 'Error connecting to AI Agent service.';
  }
}

// Screen Switchers
function showResultsScreen() {
  document.getElementById('searchScreen').style.display = 'none';
  const results = document.getElementById('resultsScreen');
  results.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (leafletMapInstance) {
    setTimeout(() => {
      leafletMapInstance.invalidateSize();
    }, 300);
  }
}

function showSearchScreen() {
  stopSimulation();
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('searchScreen').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Create Shipment Modal Handlers
function openCreateModal() {
  document.getElementById('createModal').classList.add('active');
}

function closeCreateModal() {
  document.getElementById('createModal').classList.remove('active');
}

async function submitNewShipment(e) {
  e.preventDefault();
  const shipmentId = document.getElementById('newShipmentId').value.trim();
  const driverName = document.getElementById('newDriver').value.trim();
  const driverPhone = document.getElementById('newPhone').value.trim();
  const pickup = document.getElementById('newPickup').value.trim();
  const destination = document.getElementById('newDestination').value.trim();
  const currentLocation = document.getElementById('newLocation').value.trim();
  const progress = document.getElementById('newProgress').value.trim();

  try {
    const res = await fetch('/api/shipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipmentId,
        driverName,
        driverPhone,
        pickup,
        destination,
        currentLocation,
        progress
      })
    });
    const data = await res.json();

    if (data.success && data.shipment) {
      alert(data.message);
      closeCreateModal();
      currentShipment = data.shipment;
      renderShipment(currentShipment);
      showResultsScreen();
    } else {
      alert(data.message || 'Error creating shipment.');
    }
  } catch (err) {
    alert('Server communication error.');
  }
}

// Export / Print Report
function exportReport() {
  window.print();
}

// DB Modal Handlers
function openModal() {
  document.getElementById('dbModal').classList.add('active');
  checkHealth();
}

function closeModal() {
  document.getElementById('dbModal').classList.remove('active');
}

async function seedDatabase() {
  const seedBtn = document.getElementById('seedBtn');
  seedBtn.disabled = true;
  seedBtn.textContent = 'Seeding...';

  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    checkHealth();
  } catch (err) {
    alert('Failed to connect to seed endpoint.');
  } finally {
    seedBtn.disabled = false;
    seedBtn.textContent = '🌱 Seed Atlas Demo Data';
  }
}
