import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

interface InputBoxProps {
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ label, onChange }) => {
  return (
    <Box>
      <TextField
        label={label}
        variant="outlined"
        fullWidth
        onChange={onChange}
      />
    </Box>
  );
};

export default InputBox;
