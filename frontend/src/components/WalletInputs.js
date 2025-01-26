import React from "react";

function WalletInputs({ chain, wallet, setChain, setWallet }) {
  return (
    <div>
      <h1>Input a Wallet and Chain</h1>
      <input
        onChange={(e) => setWallet(e.target.value)}
        value={wallet}
        placeholder="Enter wallet address"
      ></input>
      <p>
        <span>Set Chain : </span>
        <select onChange={(e) => setChain(e.target.value)} value={chain}>
          <option value="0x1">ETH Mainnet</option>
          <option value="0x89">Polygon Mainnet</option>
          <option value="0x144">zkSync Era</option>
          <option value="0xaa36a7">Sepolia</option>
          <option value="0x6f3">OP Sepolia</option>
          <option value="0x133">Polygon Amoy</option>
        </select>
      </p>
    </div>
  );
}

export default WalletInputs;
