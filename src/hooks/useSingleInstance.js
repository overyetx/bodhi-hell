import { useEffect } from "react";

export default function useSingleInstance() {
  useEffect(() => {
    const bc = new BroadcastChannel("bodhi-instance");

    let isActive = true;

    bc.onmessage = (msg) => {
      if (msg.data === "CHECK") {
        bc.postMessage("EXISTS");
      } else if (msg.data === "EXISTS") {
        isActive = false;

        // Disable UI
        document.body.innerHTML = `
          <div style="
            background:#111;
            color:#fff;
            height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            font-size:20px;
            padding:20px;
          ">
            <div>
              <p><b>This app is already open in another tab.</b></p>
              <p>Please switch to that tab to continue.</p>
            </div>
          </div>
        `;
      }
    };

    // Ask if another instance exists
    bc.postMessage("CHECK");

    return () => {
      bc.close();
    };
  }, []);
}