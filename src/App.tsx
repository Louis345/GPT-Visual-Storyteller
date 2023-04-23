import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Header from "./components/Header/Header";
import InputForm from "./components/InputForm/InputForm";

const theme = createTheme();

function App() {
  const [userInput, setUserInput] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <InputForm />
      {/* The rest of your layout components */}
    </ThemeProvider>
  );
}

export default App;
