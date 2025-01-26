import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

function App() {
  async function backendCall() {
    const response = await axios.get(
      "http://localhost:8080/nativeBalance?address=0x6482f9C2E181F21Ebafc6f7070462BFdBf34C50B&chain=0xaa36a7"
    );

    console.log("your API balance is:", response.data);
  }

  return (
    <div className="App">
      <button onClick={backendCall}>Fetch Hello</button>
    </div>
  );
}

export default App;
