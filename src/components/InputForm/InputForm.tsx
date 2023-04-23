import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { openaiApi, localApi } from "../../api/openai";
import useAutoGPT from "../../hooks/AutoGPT";

const InputForm: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [apiSelection, setApiSelection] = useState("openai");
  const { initOutput, sendMessage } = useAutoGPT("ws://localhost:5001");

  useEffect(() => {
    if (apiSelection === "auto-gpt") {
      // Send an Auto-GPT init message when the socket is ready and user selects Auto-GPT
      sendMessage({ type: "init" });
    }
  }, [apiSelection, sendMessage]);

  console.log("initOutput!", initOutput);
  console.log("initOutput!", initOutput);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (apiSelection === "openai") {
      // Make an axios call for OpenAI API
      try {
        console.log("endpoint: /davinci-codex/completions");
        const response = await openaiApi.post("/davinci-codex/completions", {
          input: inputText,
          // Add additional parameters here if needed
        });
        console.log(response.data);
        // Pass the response to the OutputDisplay component or handle it as needed
      } catch (error) {
        console.error("Error making API call:", error);
      }
    } else {
      // Send input via WebSocket for local AutoGPT
      console.log("send message", inputText);
      sendMessage({ type: "user_input", input: inputText });
    }

    // Clear the input field after submitting the form
    setInputText("");
  };
  const parseAutogptOutput = (output: string) => {
    const regex = /\u001b\[\d+m(.*?)\u001b\[0m/g;
    const matches = [...output.matchAll(regex)];

    return matches.map((match, index) => {
      const text = match[1];
      const chipLabel = text.endsWith(":") ? text.slice(0, -1) : text;

      return (
        <Chip
          key={index}
          label={chipLabel}
          color={text.startsWith("NEWS") ? "primary" : "error"}
          variant="outlined"
          style={{ marginRight: 4 }}
        />
      );
    });
  };
  const parsedAutogptOutput = (output: string) => {
    const regex = /\u001b\[\d+m|[\s\S]+?(?=\u001b\[0m|\u001b\[\d+m|$)/g;
    const matches = [...output.matchAll(regex)];
    const cleanedOutput = matches
      .map((match) => match[0].replace(/\u001b\[\d+m/g, ""))
      .join("");
    const lines = cleanedOutput.split("\n");
    return lines;
  };

  console.log(apiSelection);
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Enter your text"
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
      />
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="api-selection-label">API</InputLabel>
        <Select
          labelId="api-selection-label"
          id="api-selection"
          value={apiSelection}
          onChange={(event) => setApiSelection(event.target.value)}
          label="API"
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="auto-gpt">Auto-GPT</MenuItem>
        </Select>
      </FormControl>
      {parsedAutogptOutput(initOutput).map((line, index) => (
        <Typography key={index} variant="body1">
          {line}
        </Typography>
      ))}
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
};

export default InputForm;
