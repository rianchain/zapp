import React from "react";

function WalletInputs({ chain, wallet, setChain, setWallet }) {
  return (
    <div>
      <h1>Input a Wallet and Chain</h1>
      <input onChange={(e) => setWallet(e.target.value)} value={wallet}></input>
      <p>
        <span>Set Chain : </span>
        <select onChange={(e) => setChain(e.target.value)} value={chain}>
          <option value="0x1">ETH</option>
          <option value="0x89">Polygon</option>
        </select>
      </p>
    </div>
  );
}

export default WalletInputs;
