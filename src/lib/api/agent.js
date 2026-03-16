import axios from "axios";
import { store } from "../store/store";
import { toast } from "react-toastify";
import { router } from "../../app/router/route";

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const agent = axios.create({
  baseURL: "http://localhost:5100/api",
  withCredentials: true
});

// ----------------------
// REQUEST INTERCEPTOR
// ----------------------
agent.interceptors.request.use((config) => {
  store.uIStore.isBusy();
  return config;
});

// ----------------------
// RESPONSE INTERCEPTOR
// ----------------------
agent.interceptors.response.use(
  async (response) => {
    await sleep(500);
    store.uIStore.isIdle();
    return response;
  },
  async (error) => {
    await sleep(500);
    store.uIStore.isIdle();

    if (!error.response) {
      toast.error("Network error");
      return Promise.reject(error);
    }
       console.log("SERVER VALIDATION ERROR:", error.response?.data);
    console.log("DETAIL ERRORS:", error.response?.data?.errors);

    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data.errors) {
          const flattened = Object.values(data.errors).flat();
          throw flattened;
        } else {
          toast.error(data);
        }
        break;

      case 401:
        toast.error("Unauthorized");
        break;

      case 404:
        router.navigate("/not-found");
        break;

      case 500:
        router.navigate("/server-error", { state: { error: data } });
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default agent;
