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

app.get("/tokenBalances", async (req, res) => {
  try {
    const { address, chain } = req.query;

    console.log("Request params untuk token balances:", { address, chain });

    if (!address || !chain) {
      throw new Error("Address dan chain harus disediakan");
    }

    const chainHex = chain.toLowerCase();
    if (!chainHex.startsWith("0x")) {
      throw new Error("Chain ID harus dalam format hex (contoh: 0x1)");
    }

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address: address,
      chain: chainHex,
    });

    console.log("Token balances response:", response.raw);

    // Transformasi data token untuk memudahkan pembacaan
    const tokens = response.raw.map((token) => ({
      token_address: token.token_address,
      name: token.name,
      symbol: token.symbol,
      balance: token.balance,
      decimals: token.decimals,
      balanceFormatted: (
        Number(token.balance) / Math.pow(10, token.decimals)
      ).toFixed(6),
    }));

    console.log("Processed tokens:", tokens);

    // Kirim response dengan format yang lebih informatif
    res.json({
      status: "success",
      chain: chainHex,
      wallet: address,
      tokens: tokens.length > 0 ? tokens : [],
      message:
        tokens.length > 0
          ? `Ditemukan ${tokens.length} token`
          : "Tidak ada token yang ditemukan",
    });
  } catch (error) {
    console.error("Error dalam getTokenBalances:", error);

    // Kirim error response yang lebih informatif
    res.status(500).json({
      status: "error",
      message: error.message,
      details: error.details || "No additional details",
      chain: req.query.chain,
      wallet: req.query.address,
    });
  }
});
