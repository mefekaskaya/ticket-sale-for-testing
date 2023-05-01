import axios, { AxiosRequestConfig } from "axios";

import { User } from "../../../types";
import { baseUrl } from "./constants";

interface jwtHeader {
  Authorization?: string;
}

export function getJWTHeader(user: User): jwtHeader {
  return { Authorization: `Bearer ${user.token}` };
}

const config: AxiosRequestConfig = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);
