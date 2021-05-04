import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
import { register } from "../actions/auth";
import { Redirect } from "react-router-dom";

const SignUp = ({ register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confpassword: "",
  });

  const { userId, password, confpassword } = formData;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  async function onSubmit(event) {
    event.preventDefault();
    console.log("success");
    register(userId, password, confpassword);
  }
  // Redirect if logged in
  if (isAuthenticated) {
    return <Redirect to="/chat" />;
  }
  return (
    <Fragment>
      <div className="form-container sign-up-container">
        <form onSubmit={onSubmit}>
          <h1>Create Account</h1>

          <input
            className="app-input"
            type="text"
            name="userId"
            onChange={handleChange}
            value={formData.userId}
            placeholder="User Id"
          />
          <input
            className="app-input"
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            placeholder="Password"
          />
          <input
            className="app-input"
            type="password"
            name="confpassword"
            onChange={handleChange}
            value={formData.confpassword}
            placeholder="Re-enter Password"
          />
          <br />

          <button className="auth" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { register })(SignUp);
