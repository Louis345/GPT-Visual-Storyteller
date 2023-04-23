const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP server
const server = require("http").createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });
let pythonProcess = null;

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received message:", message);
    const messageString = message.toString(); // Convert the Buffer to a string
    console.log("Received message as string:", messageString);
    const data = JSON.parse(messageString);

    if (data.type === "init") {
      // Handle Auto-GPT initialization
      const pythonExecutable =
        "/Users/jamaltaylor/Development/auto-gpt/venv/bin/python";
      const pythonModule = "-m";
      const pythonModuleName = "autogpt";

      pythonProcess = spawn(pythonExecutable, [pythonModule, pythonModuleName]);

      let output = "";
      let buffer = "";
      pythonProcess.stdout.on("data", (data) => {
        buffer += data;
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep the last (possibly incomplete) line in the buffer

        for (const line of lines) {
          console.log("stdout:", line);
          output += line + "\n";
          ws.send(
            JSON.stringify({
              type: "partial_output",
              autogpt_output: line + "\n",
            })
          );
        }
      });
      pythonProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      pythonProcess.on("exit", (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          ws.send(
            JSON.stringify({ type: "init_result", autogpt_output: output })
          );
        } else {
          ws.send(
            JSON.stringify({ type: "error", message: "Error running Auto-GPT" })
          );
        }
      });
    } else if (data.type === "user_input") {
      // Handle user input
      const userInput = data.input;
      console.log("Python process state:", {
        processRunning: pythonProcess != null,
        stdinAvailable: pythonProcess != null && pythonProcess.stdin != null,
      });

      console.log("User input:", userInput);

      if (pythonProcess && pythonProcess.stdin) {
        pythonProcess.stdin.write(userInput + "\n");
      } else {
        console.error(
          "Error: Auto-GPT process is not running or stdin is not available"
        );
      }
    }
  });

  ws.on("error", function (error) {
    console.log("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
