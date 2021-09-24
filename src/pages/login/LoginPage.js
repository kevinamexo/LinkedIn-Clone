import React, { useState, useEffect } from "react";
import { GrLinkedin } from "react-icons/gr";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import "./LoginPage.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { loginUser } from "../../redux/features/userSlice";
import { auth } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(null);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const loginFormSchema = yup.object().shape({
    email: yup
      .string("Invalid email address")
      .matches(
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        "Enter a valid e-mail address"
      )
      .required("Email address is required"),
    password: yup.string().required("Password is required"),
  });

  const formOptions = { resolver: yupResolver(loginFormSchema) };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginFormSchema),
  });

  const handleLoginSubmit = async (data) => {
    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        console.log(userCredential);
        history.push("/");
      })
      .catch((e) => {
        console.log(e);
        setErrorCode(e.code);
      });
  };

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
        return "Wrong email or password";
    }
  };

  useEffect(() => {
    // var user = auth.currentUser;
    if (user) {
      history.push("/");
    } else {
      setLoading(false);
      setAuthenticated(false);
    }
  }, []);

  return (
    <div className="loggedOut__page">
      <nav className="loggedOut-header">
        <span className="loggedOut__header-logoSection">
          <p>Linked</p>
          <GrLinkedin className="loggedOut__header-logo" />
        </span>

        <span className="loggedOut__header-btns">
          <Link to="/register">
            <button className="loggedOut__page-join">Join now</button>
          </Link>
          <Link to="/login">
            <button className="loggedOut__page-signIn">Sign in</button>
          </Link>
        </span>
      </nav>
      <div className="loggedOut__body">
        <div className="loggedOut__welcome">
          <p>Welcome to your professional community</p>
        </div>
        <form onSubmit={handleSubmit(handleLoginSubmit)}>
          <p className="auth-error">{errorMessage()}</p>
          <div className="form-group">
            <input
              type="text"
              placeholder="Email address..."
              {...register("email")}
            />
            <p className="form-error">{errors.email?.message}</p>
          </div>
          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
            />
            <p
              role="button"
              className="form-group__showPassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </p>
            <p className="form-error">{errors.password?.message}</p>
          </div>
          <a className="form-group__forgotPassword">Forgot Password?</a>
          <button className="form-group__loginButton">Sign in</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
