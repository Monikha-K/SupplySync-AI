const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Standard Sample Dataset for Fallback & Seeding
let SAMPLE_SHIPMENTS = [
  {
    shipmentId: "SHP1001",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 43210",
    vehicleNumber: "TN-37-AZ-4921",
    pickup: "Chennai",
    destination: "Coimbatore",
    currentLocation: "Salem",
    status: "In Transit",
    statusColor: "success",
    eta: "3 Hours",
    progress: 65,
    lastUpdated: "28 Jul 2026 • 10:30 AM",
    summary: "Shipment SHP1001 is currently travelling through Salem and is expected to reach Coimbatore within the next 3 hours. Transit is progressing normally with no delivery risks identified.",
    riskLevel: "Low / Normal",
    telemetry: {
      speed: "68 km/h",
      temperature: "4.2 °C (Cold Storage)",
      distanceCovered: "340 km",
      totalDistance: "520 km"
    },
    timeline: [
      { location: "Chennai", status: "completed", label: "Completed", note: "Pickup at Central Depot (04:00 AM)" },
      { location: "Vellore", status: "completed", label: "Completed", note: "Passed Toll Gate #4 (07:15 AM)" },
      { location: "Salem", status: "current", label: "Current Location", note: "Travelling through Salem Bypass (10:30 AM)" },
      { location: "Erode", status: "upcoming", label: "Upcoming", note: "ETA 12:15 PM" },
      { location: "Coimbatore", status: "destination", label: "Destination", note: "ETA 01:30 PM" }
    ]
  },
  {
    shipmentId: "SHP1002",
    driverName: "Anitha Ramesh",
    driverPhone: "+91 94431 88900",
    vehicleNumber: "KA-01-MJ-8812",
    pickup: "Bengaluru",
    destination: "Hyderabad",
    currentLocation: "Anantapur",
    status: "Delayed",
    statusColor: "warning",
    eta: "5 Hours",
    progress: 48,
    lastUpdated: "28 Jul 2026 • 11:15 AM",
    summary: "Shipment SHP1002 is currently passing Anantapur. Experiencing a 45-minute delay due to highway maintenance near NH44.",
    riskLevel: "Moderate (Traffic Slowdown)",
    telemetry: {
      speed: "42 km/h",
      temperature: "22.5 °C (Ambient)",
      distanceCovered: "270 km",
      totalDistance: "560 km"
    },
    timeline: [
      { location: "Bengaluru", status: "completed", label: "Completed", note: "Loaded at Hub 4 (05:30 AM)" },
      { location: "Chikkaballapur", status: "completed", label: "Completed", note: "Checkpost cleared (07:45 AM)" },
      { location: "Anantapur", status: "current", label: "Current Location", note: "Slow movement due to lane closure" },
      { location: "Kurnool", status: "upcoming", label: "Upcoming", note: "ETA 02:00 PM" },
      { location: "Hyderabad", status: "destination", label: "Destination", note: "ETA 04:30 PM" }
    ]
  },
  {
    shipmentId: "SHP1003",
    driverName: "Suresh Sundaram",
    driverPhone: "+91 97900 11223",
    vehicleNumber: "TN-09-CB-1102",
    pickup: "Madurai",
    destination: "Chennai",
    currentLocation: "Chennai Port",
    status: "Delivered",
    statusColor: "success",
    eta: "Delivered",
    progress: 100,
    lastUpdated: "28 Jul 2026 • 09:45 AM",
    summary: "Shipment SHP1003 has successfully arrived at Chennai Port Terminal. Unloading and inspection completed on schedule.",
    riskLevel: "None (Completed)",
    telemetry: {
      speed: "0 km/h (Docked)",
      temperature: "18.0 °C",
      distanceCovered: "460 km",
      totalDistance: "460 km"
    },
    timeline: [
      { location: "Madurai", status: "completed", label: "Completed", note: "Origin Dispatch (27 Jul 09:00 PM)" },
      { location: "Tiruchirappalli", status: "completed", label: "Completed", note: "Waypoint Check (01:15 AM)" },
      { location: "Viluppuram", status: "completed", label: "Completed", note: "Toll Pass (05:30 AM)" },
      { location: "Tambaram", status: "completed", label: "Completed", note: "Outer Ring Road (08:30 AM)" },
      { location: "Chennai Port", status: "completed", label: "Destination", note: "Delivered & Signed (09:45 AM)" }
    ]
  },
  {
    shipmentId: "SHP1004",
    driverName: "Vikram Singh",
    driverPhone: "+91 98112 55667",
    vehicleNumber: "MH-12-PQ-9081",
    pickup: "Kochi",
    destination: "Bengaluru",
    currentLocation: "Palakkad",
    status: "In Transit",
    statusColor: "success",
    eta: "7 Hours",
    progress: 30,
    lastUpdated: "28 Jul 2026 • 10:50 AM",
    summary: "Shipment SHP1004 is navigating Palakkad Gap corridor. Cold chain monitoring indicates optimal cargo temperature of 2.1°C.",
    riskLevel: "Low",
    telemetry: {
      speed: "62 km/h",
      temperature: "2.1 °C (Pharma Cold Chain)",
      distanceCovered: "155 km",
      totalDistance: "515 km"
    },
    timeline: [
      { location: "Kochi", status: "completed", label: "Completed", note: "Docked & Checked (06:00 AM)" },
      { location: "Thrissur", status: "completed", label: "Completed", note: "Checkpost Verified (08:45 AM)" },
      { location: "Palakkad", status: "current", label: "Current Location", note: "Pass Corridor (10:50 AM)" },
      { location: "Coimbatore", status: "upcoming", label: "Upcoming", note: "ETA 01:00 PM" },
      { location: "Bengaluru", status: "destination", label: "Destination", note: "ETA 06:00 PM" }
    ]
  }
];

// MongoDB Setup
let dbClient = null;
let db = null;
let isConnectedToAtlas = false;
let mongoErrorMsg = "";

async function initMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_password>')) {
    console.log("ℹ️ MongoDB URI contains '<db_password>' placeholder. Running with high-performance In-Memory Demo Store.");
    mongoErrorMsg = "Atlas password not configured in .env (<db_password> placeholder active)";
    return;
  }

  try {
    console.log("⚡ Connecting to MongoDB Atlas...");
    dbClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000
    });
    await dbClient.connect();
    db = dbClient.db(process.env.MONGODB_DB_NAME || 'supplysync_db');
    isConnectedToAtlas = true;
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const collection = db.collection('shipments');
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log("🌱 Database empty. Auto-seeding initial shipments...");
      await collection.insertMany(SAMPLE_SHIPMENTS);
      console.log("✅ Seeding complete!");
    }
  } catch (err) {
    console.error("❌ MongoDB Atlas connection failed:", err.message);
    isConnectedToAtlas = false;
    mongoErrorMsg = err.message;
  }
}

// Data Helpers
async function getShipmentById(id) {
  const cleanId = id.trim().toUpperCase();
  if (isConnectedToAtlas && db) {
    try {
      const result = await db.collection('shipments').findOne({ shipmentId: cleanId });
      if (result) return result;
    } catch (err) {
      console.error("Atlas query error:", err);
    }
  }
  return SAMPLE_SHIPMENTS.find(s => s.shipmentId === cleanId) || null;
}

async function getAllShipments() {
  if (isConnectedToAtlas && db) {
    try {
      const list = await db.collection('shipments').find({}).toArray();
      if (list && list.length > 0) return list;
    } catch (err) {
      console.error("Atlas fetch error:", err);
    }
  }
  return SAMPLE_SHIPMENTS;
}

async function saveShipment(shipmentData) {
  if (isConnectedToAtlas && db) {
    try {
      await db.collection('shipments').updateOne(
        { shipmentId: shipmentData.shipmentId },
        { $set: shipmentData },
        { upsert: true }
      );
    } catch (err) {
      console.error("Atlas save error:", err);
    }
  }
  const idx = SAMPLE_SHIPMENTS.findIndex(s => s.shipmentId === shipmentData.shipmentId);
  if (idx >= 0) {
    SAMPLE_SHIPMENTS[idx] = shipmentData;
  } else {
    SAMPLE_SHIPMENTS.push(shipmentData);
  }
}

// Endpoints

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    atlasConnected: isConnectedToAtlas,
    dbName: process.env.MONGODB_DB_NAME || 'supplysync_db',
    connectionMessage: isConnectedToAtlas 
      ? 'Connected to MongoDB Atlas' 
      : `Demo Store Active (${mongoErrorMsg || 'No Atlas URI'})`,
    sampleIds: SAMPLE_SHIPMENTS.map(s => s.shipmentId)
  });
});

app.get('/api/shipments', async (req, res) => {
  try {
    const shipments = await getAllShipments();
    res.json({ success: true, shipments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shipment/:id', async (req, res) => {
  try {
    const shipment = await getShipmentById(req.params.id);
    if (shipment) {
      res.json({ success: true, shipment });
    } else {
      res.status(404).json({ 
        success: false, 
        message: `Shipment ID '${req.params.id}' not found. Please try SHP1001, SHP1002, SHP1003, or SHP1004.` 
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shipment', async (req, res) => {
  try {
    const { shipmentId, driverName, driverPhone, vehicleNumber, pickup, destination, currentLocation, status, eta, progress } = req.body;
    
    if (!shipmentId || !pickup || !destination) {
      return res.status(400).json({ success: false, message: "Shipment ID, Pickup, and Destination are required." });
    }

    const newShipment = {
      shipmentId: shipmentId.trim().toUpperCase(),
      driverName: driverName || "Assigned Driver",
      driverPhone: driverPhone || "+91 98000 00000",
      vehicleNumber: vehicleNumber || "TN-01-AB-1234",
      pickup,
      destination,
      currentLocation: currentLocation || pickup,
      status: status || "In Transit",
      statusColor: status === "Delayed" ? "warning" : "success",
      eta: eta || "4 Hours",
      progress: parseInt(progress) || 10,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      summary: `Shipment ${shipmentId} dispatched from ${pickup} bound for ${destination}. Currently near ${currentLocation || pickup}.`,
      riskLevel: "Low / Normal",
      telemetry: {
        speed: "60 km/h",
        temperature: "5.0 °C",
        distanceCovered: "50 km",
        totalDistance: "400 km"
      },
      timeline: [
        { location: pickup, status: "completed", label: "Completed", note: "Origin Dispatch" },
        { location: currentLocation || "En Route Checkpoint", status: "current", label: "Current Location", note: "Active Tracking Node" },
        { location: destination, status: "destination", label: "Destination", note: "Scheduled Destination" }
      ]
    };

    await saveShipment(newShipment);
    res.json({ success: true, message: `Shipment ${newShipment.shipmentId} created successfully!`, shipment: newShipment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/simulate-step', async (req, res) => {
  const { shipmentId } = req.body;
  const shipment = await getShipmentById(shipmentId || 'SHP1001');

  if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

  let newProgress = Math.min(100, shipment.progress + 5);
  let newEta = shipment.eta;
  let newLocation = shipment.currentLocation;

  if (newProgress >= 100) {
    shipment.status = "Delivered";
    shipment.statusColor = "success";
    newEta = "Delivered";
    newLocation = shipment.destination;
    if (shipment.timeline) {
      shipment.timeline.forEach(t => t.status = 'completed');
    }
  } else if (newProgress >= 80) {
    newLocation = shipment.timeline && shipment.timeline[3] ? shipment.timeline[3].location : "Erode Bypass";
    newEta = "1.5 Hours";
    if (shipment.timeline) {
      shipment.timeline[0].status = 'completed';
      shipment.timeline[1].status = 'completed';
      shipment.timeline[2].status = 'completed';
      if (shipment.timeline[3]) shipment.timeline[3].status = 'current';
    }
  } else {
    newEta = `${Math.max(1, Math.round((100 - newProgress) / 20))} Hours`;
  }

  shipment.progress = newProgress;
  shipment.currentLocation = newLocation;
  shipment.eta = newEta;
  shipment.lastUpdated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  shipment.summary = `Shipment ${shipment.shipmentId} is progressing smoothly towards ${shipment.destination}. Current position: ${newLocation}. ETA: ${newEta}.`;

  await saveShipment(shipment);

  res.json({
    success: true,
    shipment,
    log: `[${new Date().toLocaleTimeString()}] Live Telemetry Pulse: Progress advanced to ${newProgress}%. Location: ${newLocation}. Speed: ${shipment.telemetry.speed}.`
  });
});

app.post('/api/seed', async (req, res) => {
  if (!isConnectedToAtlas || !db) {
    return res.status(400).json({
      success: false,
      message: "Cannot seed MongoDB Atlas: Connection not active. Please verify your MongoDB Atlas network access."
    });
  }

  try {
    const collection = db.collection('shipments');
    await collection.deleteMany({});
    await collection.insertMany(SAMPLE_SHIPMENTS);
    res.json({
      success: true,
      message: "Successfully seeded MongoDB Atlas with initial shipments!",
      count: SAMPLE_SHIPMENTS.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai-query', async (req, res) => {
  const { shipmentId, query } = req.body;
  const shipment = await getShipmentById(shipmentId || 'SHP1001');

  if (!shipment) {
    return res.status(404).json({ success: false, answer: "Shipment context not found." });
  }

  const q = (query || '').toLowerCase();
  let answer = "";

  if (q.includes("delay") || q.includes("late") || q.includes("risk")) {
    if (shipment.status === "Delayed") {
      answer = `⚠️ Warning: Shipment ${shipment.shipmentId} is currently delayed by approx 45 minutes near ${shipment.currentLocation} due to traffic. Estimated arrival is now ${shipment.eta}.`;
    } else if (shipment.status === "Delivered") {
      answer = `✅ No risks! Shipment ${shipment.shipmentId} has already been safely delivered to ${shipment.destination}.`;
    } else {
      answer = `🟢 No delivery risks detected for ${shipment.shipmentId}. Cruising smoothly at ${shipment.telemetry.speed} near ${shipment.currentLocation}.`;
    }
  } else if (q.includes("driver") || q.includes("contact") || q.includes("phone")) {
    answer = `👨‍✈️ Driver: ${shipment.driverName} | Phone: ${shipment.driverPhone} | Vehicle: ${shipment.vehicleNumber}`;
  } else if (q.includes("temp") || q.includes("cold") || q.includes("weather")) {
    answer = `🌡️ Cargo Monitoring System: Current payload temperature is ${shipment.telemetry.temperature}. Weather along ${shipment.currentLocation} route is clear.`;
  } else {
    answer = `🤖 AI Agent Update for ${shipment.shipmentId}: Currently in ${shipment.currentLocation} heading to ${shipment.destination}. Progress is at ${shipment.progress}%, ETA is ${shipment.eta}. ${shipment.summary}`;
  }

  res.json({ success: true, answer, shipmentId: shipment.shipmentId });
});

(async () => {
  try {
    await initMongoDB();
  } catch (e) {
    console.error("MongoDB init error:", e.message);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 SupplySync AI Server listening at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} already active. Server is running!`);
    } else {
      console.error("Server error:", err);
    }
  });
})();
