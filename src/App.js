import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { Provider } from "react-redux";
import "./App.css";
import url from "./constants/Url";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import { loadUser } from "./actions/auth";
import store from "./store";
import setAuthToken from "./utils/setAuthToken";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Chat from "./pages/Chat";
import { ToastContainer } from 'react-toastify';

if (localStorage.token) {
  console.log("localstorage.token", localStorage.token);
  setAuthToken(localStorage.token);
}

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  // window.onunload = () => {
  //   // Clear the local storage
  //   localStorage.clear();
  // };
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <ToastContainer

          />
          <Switch>
            <Route exact path="/" component={AuthPage} />
            <PrivateRoute exact path="/c" component={ChatPage} />
            <PrivateRoute exact path="/chat" component={Chat} />
          </Switch>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;
