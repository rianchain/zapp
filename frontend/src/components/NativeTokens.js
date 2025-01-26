import React from "react";
import axios from "axios";

function NativeTokens({
  wallet,
  chain,
  nativeBalance,
  setNativeBalance,
  nativeValue,
  setNativeValue,
}) {
  async function getNativeBalance() {
    try {
      if (!wallet) {
        alert("Mohon masukkan alamat wallet");
        return;
      }

      console.log("Fetching balance untuk:", {
        wallet,
        chain,
      });

      const response = await axios.get("http://localhost:8080/nativeBalance", {
        params: {
          address: wallet,
          chain: chain,
        },
      });

      console.log("Response dari server:", response.data);

      if (response.data.balance) {
        const balanceInEth = (Number(response.data.balance) / 1e18).toFixed(6);
        setNativeBalance(balanceInEth);

        if (response.data.usd) {
          const totalUsdValue = (
            balanceInEth * Number(response.data.usd)
          ).toFixed(2);
          setNativeValue(totalUsdValue);
        } else {
          setNativeValue("N/A");
        }
      } else {
        setNativeBalance("0.000000");
        setNativeValue("0.00");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setNativeBalance("Error");
      setNativeValue("Error");
    }
  }

  return (
    <>
      <h1>Fetch Tokens</h1>
      <p>
        <button onClick={getNativeBalance}>Fetch Balance</button>
        <br />
        <span>
          Native Balance: {nativeBalance}
          {nativeValue === "N/A"
            ? " (Price not available)"
            : nativeValue === "Error"
            ? " (Error fetching price)"
            : ` ($${nativeValue})`}
        </span>
      </p>
      <p style={{ fontSize: "12px", color: "gray" }}>
        Current Chain: {chain} | Wallet: {wallet || "Not set"}
      </p>
      {chain === "0xaa36a7" && (
        <div style={{ fontSize: "10px", color: "orange" }}>
          Note: Using ETH mainnet price as reference for Sepolia
        </div>
      )}
    </>
  );
}

export default NativeTokens;
