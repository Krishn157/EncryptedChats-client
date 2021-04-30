import React, { Fragment, useState } from "react";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

const AuthPage = () => {
  const [isSignup, setSignup] = useState(false);
  return (
    <Fragment>
      <div
        className={isSignup ? `container right-panel-active` : `container`}
        id="container"
      >
        <SignUp />
        <SignIn />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                className="ghost auth"
                id="signIn"
                onClick={() => setSignup(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start secure chats</p>
              <button
                className="ghost auth"
                id="signUp"
                onClick={() => setSignup(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AuthPage;
