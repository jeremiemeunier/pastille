import axios from "axios";

const pastilleAxios = axios.create({
  baseURL: "http://localhost:3000",
  headers: { pastille_botid: process.env.BOT_ID },
});

pastilleAxios.interceptors.response.use(
  (response) => response,
  (err) => {
    return Promise.reject({
      data: err.response.data,
      status: err.response.status,
    });
  }
);

export default pastilleAxios;
