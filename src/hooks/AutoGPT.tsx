// hooks/useAutoGPT.ts
import { useState, useEffect, useCallback } from "react";

const useAutoGPT = (url: string) => {
  console.log(url);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [initOutput, setInitOutput] = useState("");

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  useEffect(() => {
    console.log("useEffect called"); // Add this line

    if (socket) {
      console.log("Socket already exists"); // Add this line
      return;
    }

    const ws = new WebSocket(url);
    ws.addEventListener("open", () => {
      console.log("Connected to server");
      console.log("WebSocket ready state:", ws.readyState); // Add this line
      setSocket(ws);
    });

    ws.addEventListener("error", (error) => {
      console.log("WebSocket error:", error); // Add this line
    });

    ws.addEventListener("close", () => {
      console.log("Disconnected from server");
      console.log("WebSocket ready state:", ws.readyState); // Add this line
    });

    ws.addEventListener("message", (event) => {
      console.log("WebSocket message received:", event.data);
      const data = JSON.parse(event.data);

      if (data.type === "init_result" || data.type === "partial_output") {
        console.log("Received output:", data.autogpt_output);
        setInitOutput((prevOutput) => prevOutput + data.autogpt_output);
      } else if (data.type === "error") {
        console.error("Error:", data.message);
      }
    });

    ws.addEventListener("close", () => {
      console.log("Disconnected from server");
    });

    return () => {
      ws.close();
    };
  }, []);

  return { initOutput, sendMessage };
};

export default useAutoGPT;
