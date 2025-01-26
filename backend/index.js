const Moralis = require("moralis").default;
const express = require("express");
const app = express();
const cors = require("cors");
const port = 8080;
require("dotenv").config();

app.use(cors());

// Inisialisasi Moralis di awal aplikasi
const startMoralis = async () => {
  try {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    console.log("Moralis initialized successfully");
  } catch (err) {
    console.error("Failed to initialize Moralis:", err);
  }
};
startMoralis();

app.get("/", (req, res) => {
  res.send("Hello Niggas!");
});

app.get("/nativeBalance", async (req, res) => {
  try {
    const { address, chain } = req.query;

    // Pastikan chain ID dalam format yang benar
    const chainHex = chain.toLowerCase();
    if (!chainHex.startsWith("0x")) {
      throw new Error("Chain ID harus dalam format hex (contoh: 0x1)");
    }

    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address: address,
      chain: chainHex,
    });

    const nativeBalance = response.result; // Gunakan response.result untuk mendapatkan balance
    console.log("Balance received:", nativeBalance);

    res.json(nativeBalance);
  } catch (e) {
    console.error("Error in /nativeBalance:", e);
    res.status(500).json({
      error: e.message,
      details: e.details || "No additional details",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
