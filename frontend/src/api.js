// ─── Centralized API Layer ────────────────────────────────────────────────────
// All fetch calls go to /api/* — Vite proxy forwards to http://localhost:5000

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchShipment(id) {
  const res = await fetch(`/api/shipment/${encodeURIComponent(id)}`);
  return res.json();
}

export async function fetchAllShipments() {
  const res = await fetch('/api/shipments');
  return res.json();
}

export async function createShipment(data) {
  const res = await fetch('/api/shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function simulateStep(shipmentId) {
  const res = await fetch('/api/simulate-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipmentId })
  });
  return res.json();
}

export async function sendAIQuery(shipmentId, query) {
  const res = await fetch('/api/ai-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipmentId, query })
  });
  return res.json();
}

export async function seedDatabase() {
  const res = await fetch('/api/seed', { method: 'POST' });
  return res.json();
}
