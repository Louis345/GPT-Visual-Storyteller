import axios from "axios";

const openaiApi = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
  },
});
const localApi = axios.create({
  baseURL: "http://localhost:5001", // Update this to match your server's baseURL
  headers: {
    "Content-Type": "application/json",
  },
});

export { openaiApi, localApi };
