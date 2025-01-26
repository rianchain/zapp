import React from "react";
import axios from "axios";

function Tokens({ wallet, chain, tokens, setTokens }) {
  async function getTokenBalances() {
    try {
      const response = await axios.get("http://localhost:8080/tokenBalances", {
        params: {
          address: wallet,
          chain: chain,
        },
      });

      if (response.data && response.data.tokens) {
        const formattedTokens = response.data.tokens.map((t) => ({
          ...t,
          bal: (Number(t.balance) / Math.pow(10, t.decimals)).toFixed(6),
        }));
        setTokens(formattedTokens);
      }
    } catch (error) {
      console.error("Error:", error);
      setTokens([]);
    }
  }

  return (
    <>
      <p>
        <button onClick={getTokenBalances}>Get Tokens</button>
        <br />
        {tokens.length > 0 &&
          tokens.map((token, index) => (
            <div key={index}>
              {token.symbol}: {token.bal}
            </div>
          ))}
      </p>
    </>
  );
}

export default Tokens;
