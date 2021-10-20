import React, { useState, useEffect } from "react";
import moment from "moment";
import { GrLinkedin } from "react-icons/gr";
import "./SignupPage.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";

import { useDispatch } from "react-redux";
import { signUp } from "../../redux/features/userSlice";

import { useHistory, Redirect } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
const SignupPage = ({ isAuth }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [errorCode, setErrorCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const history = useHistory();
  //   const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";
  //   const ERROR_MSG_ACCOUNT_EXISTS = `
  //   An account with this E-Mail address already exists.
  //   Try to login with this account instead. If you think the
  //   account is already used from one of the social logins, try
  //   to sign in with one of them. Afterward, associate your accounts
  //   on your personal account page.
  // `;

  const errorMessage = () => {
    // if (!errorCode) return

    // if(errorCode === "auth/user-not-found")
    //   ? "Couldn’t find an account associated with this email. Please try again."
    //   : "Error logging in";

    switch (errorCode) {
      case null:
        return "";
      case "auth/user-not-found":
        return "Couldn’t find an account associated with this email. Please try again.";
      default:
        return "Error Sign up in";
    }
  };

  const signupSchema = yup.object().shape({
    firstName: yup.string("Invalid name").required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup
      .string("Invalid email address")
      .matches(
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        "Enter a valid e-mail address"
      )
      .required("Email address is required"),

    password: yup
      .string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must contain 8 characters, one uppercase, one lowercase, one number and one special case character"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Password is required"),
    // terms: yup
    //   .bool()
    //   .oneOf([true], "You must agree to the terms and conditions to sign up"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
  });

  const handleSignUpSubmit = async (data) => {
    await createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        console.log(userCredential.user);
        addDoc(collection(db, "user"), {
          email: data.email,
          joined: moment().format("DD/MM/YYYY"),
          name: { firstName: data.firstName, lastName: data.lastName },
          joined: moment().format("DD/MM/YYYY"),
          connections: 0,
          coverPhotoUrl: null,
          profilePhotoURL: null,
          organisation: { name: null, logo: null },
          verified: false,
        });
      })
      .catch((e) => {
        console.log(e.code);
      });
  };

  return (
    <div className="signup-page">
      <header>
        <p>Linked</p>
        <GrLinkedin className="signup__header-logo" />
      </header>
      <p className="signup__heading">
        Make the most of your professional life{" "}
      </p>
      <form className="signup-form" onSubmit={handleSubmit(handleSignUpSubmit)}>
        <p>{errorMessage()}</p>
        <div className="form-group">
          <label className="signup-form-label">First Name</label>
          <input type="text" {...register("firstName")} />
          <p>{errors.firstName?.message}</p>
        </div>
        <div className="form-group">
          <label className="signup-form-label">Last Name</label>
          <input type="text" {...register("lastName")} />
          <p>{errors.lastName?.message}</p>
        </div>
        <div className="form-group">
          <label className="signup-form-label">Email</label>
          <input type="text" {...register("email")} />
          <p>{errors.email?.message}</p>
        </div>
        <div className="form-group">
          <label className="signup-form-label">
            Password (6 or more characters)
          </label>
          <input type="password" {...register("password")} />
          <p>{errors.password?.message}</p>
        </div>
        <div className="form-group">
          <label className="signup-form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input type="text" {...register("confirmPassword")} />
          <label>{errors.confirmPassword?.message}</label>
        </div>
        <button type="submit" className="signup__submit">
          Agree & Join
        </button>
        <div className="signup__aleadyRegistered">
          <label>Already on LinkedIn?</label>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
