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

    try {
      // Mapping untuk mendapatkan harga referensi dari mainnet
      let priceReferenceChain = "0x1"; // Default ke ETH mainnet
      let nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Default WETH

      // Tentukan chain referensi dan token berdasarkan chain yang dipilih
      switch (chainHex) {
        case "0x1": // ETH Mainnet
        case "0xaa36a7": // Sepolia (menggunakan harga ETH)
        case "0x6f3": // OP Sepolia (menggunakan harga ETH)
          priceReferenceChain = "0x1";
          nativeCurrency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
          break;
        case "0x89": // Polygon Mainnet
        case "0x133": // Polygon Amoy
          priceReferenceChain = "0x89";
          nativeCurrency = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC
          break;
        default:
          throw new Error(`Chain ${chainHex} tidak didukung`);
      }

      console.log("Mengambil harga referensi dari:", {
        chain: priceReferenceChain,
        token: nativeCurrency,
      });

      const nativePrice = await Moralis.EvmApi.token.getTokenPrice({
        address: nativeCurrency,
        chain: priceReferenceChain,
      });

      const priceData = nativePrice.toJSON();
      console.log("Price data JSON:", priceData);

      const usdPrice = priceData.usdPrice;
      console.log("Final USD price:", usdPrice);

      // Tambahkan informasi testnet jika bukan mainnet
      const isTestnet = !["0x1", "0x89"].includes(chainHex);

      res.json({
        balance: nativeBalance.balance,
        usd: usdPrice,
        chainId: chainHex,
        tokenAddress: nativeCurrency,
        isTestnet: isTestnet,
        priceReference: isTestnet
          ? `Harga dari ${priceReferenceChain}`
          : "Native price",
      });
    } catch (priceError) {
      console.error("Error detail saat mengambil harga:", {
        message: priceError.message,
        stack: priceError.stack,
      });

      res.json({
        balance: nativeBalance.balance,
        usd: null,
        chainId: chainHex,
        error: priceError.message,
      });
    }
  } catch (e) {
    console.error("Error utama:", e);
    res.status(500).json({
      error: e.message,
      details: e.details || "No additional details",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
