import axios from "axios";

const TwitchAxios = axios.create({});

TwitchAxios.interceptors.response.use(
  (response) => response,
  (err) => {
    return Promise.reject(err.response.data);
  }
);

export default TwitchAxios;
