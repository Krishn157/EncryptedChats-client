import axios from "axios";
import url from "../constants/Url";
import setAuthToken from "../utils/setAuthToken";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
} from "./types";

//Load User
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    const res = await axios.get(url + "/curr_user");
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Register User
export const register = (userId, password, confpassword) => async (
  dispatch
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ userId, password, confpassword });
  console.log("headers", axios.defaults.headers.common);
  try {
    const res = await axios.post(url + "/auth/register", body, config);
    console.log(res.data);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
  } catch (err) {
    console.log(err);
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

//Login User
export const login = (userId, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ userId, password });
  try {
    const res = await axios.post(url + "/auth/login", body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
  } catch (err) {
    console.log(err);
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//LogOut

export const logout = () => (dispatch) => {
  delete axios.defaults.headers.common["Authorization"];
  dispatch({ type: LOGOUT });
};
