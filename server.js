// --- BACKEND SERVER (Node.js + Express) ---
// Run `npm init -y` and `npm install express cors` in your terminal before running `node server.js`

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());          // Allows your Frontend to talk to this Backend
app.use(express.json());  // Allows the server to read JSON data sent by students

// Mock Database of Partnered DSCE Shops
const partnerStores = [
  { id: 101, shopName: "Sagar Stationery & Xerox", item: "5x Record Books + 10x Bluebooks", mrp: 450, appPrice: 390, commissionPct: 5 },
  { id: 102, shopName: "KS Layout Print Hub", item: "Engineering Drawing Kit", mrp: 600, appPrice: 510, commissionPct: 6 },
  { id: 103, shopName: "Campus Cravings Cafe", item: "Cold Coffee + Sandwich Combo", mrp: 160, appPrice: 130, commissionPct: 8 }
];

// Ledger that permanently tracks every coupon generated & commission owed to you
const ledger = [];

// 1. GET Endpoint: Sends the store list to the Frontend
app.get('/api/stores', (req, res) => {
  res.json(partnerStores);
});

// 2. POST Endpoint: Generates a verified coupon & logs your commission on the server
app.post('/api/claim-deal', (req, res) => {
  const { storeId, studentUSN } = req.body;
  const store = partnerStores.find(s => s.id === storeId);

  if (!store) {
    return res.status(404).json({ error: "Store item not found" });
  }

  const couponCode = "DSCE-" + Math.floor(1000 + Math.random() * 9000);
  const commissionOwed = +(store.appPrice * (store.commissionPct / 100)).toFixed(2);

  const transaction = {
    couponCode,
    studentUSN: studentUSN || "ANONYMOUS_FRESHER",
    shopName: store.shopName,
    item: store.item,
    amountPaidByStudent: store.appPrice,
    commissionOwedToApp: commissionOwed,
    timestamp: new Date().toISOString(),
    redeemedAtCounter: false
  };

  ledger.push(transaction);
  console.log("💰 NEW DEAL CLAIMED:", transaction);

  res.json({
    success: true,
    couponCode,
    commissionOwed,
    totalAppRevenueSoFar: ledger.reduce((sum, t) => sum + t.commissionOwedToApp, 0)
  });
});

// 3. GET Endpoint: For YOU (the founder) to audit how much each shopkeeper owes you
app.get('/api/admin/ledger', (req, res) => {
  res.json({
    totalDeals: ledger.length,
    totalCommissionOwed: ledger.reduce((sum, t) => sum + t.commissionOwedToApp, 0),
    transactions: ledger
  });
});

app.listen(PORT, () => {
  console.log(`✅ DSCE Connect Backend running at http://localhost:${PORT}`);
});