import axios from "axios";

const pastilleAxios = axios.create({
  baseURL: "http://localhost:3000",
  headers: { pastille_botid: process.env.BOT_ID },
});

pastilleAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default pastilleAxios;
