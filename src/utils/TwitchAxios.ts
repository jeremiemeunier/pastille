import axios from "axios";

const TwitchAxios = axios.create({});

TwitchAxios.interceptors.response.use(
  (response) => response,
  (err) => {
    return Promise.reject({
      data: err.response.data,
      status: err.response.status,
    });
  }
);

export default TwitchAxios;
