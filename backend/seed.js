const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const SAMPLE_SHIPMENTS = [
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
    summary: "Shipment SHP1001 is currently travelling through Salem and is expected to reach Coimbatore within the next 3 hours.",
    riskLevel: "Low / Normal",
    telemetry: { speed: "68 km/h", temperature: "4.2 °C (Cold Storage)", distanceCovered: "340 km", totalDistance: "520 km" },
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
    summary: "Shipment SHP1002 is experiencing a 45-minute delay near NH44.",
    riskLevel: "Moderate (Traffic Slowdown)",
    telemetry: { speed: "42 km/h", temperature: "22.5 °C (Ambient)", distanceCovered: "270 km", totalDistance: "560 km" },
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
    summary: "Shipment SHP1003 has successfully arrived at Chennai Port Terminal.",
    riskLevel: "None (Completed)",
    telemetry: { speed: "0 km/h (Docked)", temperature: "18.0 °C", distanceCovered: "460 km", totalDistance: "460 km" },
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
    summary: "Shipment SHP1004 is navigating Palakkad Gap corridor. Pharma cold chain at optimal 2.1°C.",
    riskLevel: "Low",
    telemetry: { speed: "62 km/h", temperature: "2.1 °C (Pharma Cold Chain)", distanceCovered: "155 km", totalDistance: "515 km" },
    timeline: [
      { location: "Kochi", status: "completed", label: "Completed", note: "Docked & Checked (06:00 AM)" },
      { location: "Thrissur", status: "completed", label: "Completed", note: "Checkpost Verified (08:45 AM)" },
      { location: "Palakkad", status: "current", label: "Current Location", note: "Pass Corridor (10:50 AM)" },
      { location: "Coimbatore", status: "upcoming", label: "Upcoming", note: "ETA 01:00 PM" },
      { location: "Bengaluru", status: "destination", label: "Destination", note: "ETA 06:00 PM" }
    ]
  }
];

async function runSeed() {
  if (!uri || uri.includes('<db_password>')) {
    console.error("❌ Please set a valid MONGODB_URI in backend/.env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'supplysync_db');
    const collection = db.collection('shipments');

    console.log("🗑️  Clearing existing shipments...");
    await collection.deleteMany({});

    console.log("🌱 Inserting demo shipments...");
    const result = await collection.insertMany(SAMPLE_SHIPMENTS);
    console.log(`✅ Seeded ${result.insertedCount} shipments into MongoDB Atlas!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await client.close();
    console.log("🔒 Connection closed.");
  }
}

runSeed();
