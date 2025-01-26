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

    console.log("Request params:", { address, chain });

    const chainHex = chain.toLowerCase();
    if (!chainHex.startsWith("0x")) {
      throw new Error("Chain ID harus dalam format hex (contoh: 0x1)");
    }

    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address: address,
      chain: chainHex,
    });

    const nativeBalance = response.result;
    console.log("Balance received:", nativeBalance);

    let nativeCurrency;
    let nativePrice;

    try {
      if (chainHex === "0x1") {
        nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
      } else if (chainHex === "0x89") {
        nativeCurrency = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC
      } else {
        throw new Error("Chain tidak didukung");
      }

      console.log("Mencoba mendapatkan harga untuk token:", nativeCurrency);

      nativePrice = await Moralis.EvmApi.token.getTokenPrice({
        address: nativeCurrency,
        chain: chainHex,
      });

      console.log(
        "Response harga token lengkap:",
        JSON.stringify(nativePrice, null, 2)
      );

      // Akses properti usdPrice yang benar dari response
      const usdPrice =
        nativePrice.raw?.usdPrice || nativePrice.result?.usdPrice;

      const result = {
        balance: nativeBalance.balance,
        usd: usdPrice,
      };

      res.json(result);
    } catch (priceError) {
      console.error("Error saat mengambil harga:", priceError);
      res.json({
        balance: nativeBalance.balance,
        usd: null,
        message: "Tidak dapat mengambil harga token",
        error: priceError.message,
      });
    }
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
