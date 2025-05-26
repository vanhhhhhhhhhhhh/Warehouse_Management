import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

// Server should return AuthModel
export function login(email, password) {
  return axios.post(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email,
  firstname,
  lastname,
  password,
  password_confirmation
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email) {
  return axios.post(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token) {
  return axios.post(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
} 