import axios from "axios";

const DiscordAxios = axios.create({
  baseURL: "https://discord.com/api",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

DiscordAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default DiscordAxios;
