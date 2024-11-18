import axios from "axios";

const TwitchAxios = axios.create({});

TwitchAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default TwitchAxios;
