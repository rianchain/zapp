import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import WalletInputs from "./components/WalletInputs";

function App() {
  const [wallet, setWallet] = useState("");
  const [chain, setChain] = useState("0x1");

  return (
    <div className="App">
      <WalletInputs
        chain={chain}
        setChain={setChain}
        wallet={wallet}
        setWallet={setWallet}
      />
    </div>
  );
}

export default App;
