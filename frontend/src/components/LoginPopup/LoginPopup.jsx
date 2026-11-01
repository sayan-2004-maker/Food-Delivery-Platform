import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLoginPopup }) => {

    const { url, setToken } = useContext(StoreContext);

    const [currState, setCurrState] = useState("Login");

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [formMessage, setFormMessage] = useState({ type: "", text: "" });

    const isLoginMode = currState === "Login";

    const switchMode = (nextMode) => {
        setCurrState(nextMode);
        setData((prev) => ({
            ...prev,
            name: "",
            password: ""
        }));
        setFormMessage({ type: "", text: "" });
    };

    const onChangeHandler = (event) => {
        const { name, value } = event.target;

        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const onLogin = async (event) => {
        event.preventDefault();

        if (loading) return;

        const email = data.email.trim();
        const password = data.password;
        const name = data.name.trim();

        if (!email || !password) {
            setFormMessage({
                type: "error",
                text: "Please fill in your email and password."
            });
            return;
        }

        if (!isLoginMode && !name) {
            setFormMessage({
                type: "error",
                text: "Please enter your name to create an account."
            });
            return;
        }

        setFormMessage({ type: "", text: "" });
        setLoading(true);

        try {
            const endpoint = isLoginMode ? "/api/user/login" : "/api/user/register";
            const newUrl = `${url}${endpoint}`;

            const payload = isLoginMode
                ? { email, password }
                : { name, email, password };

            const response = await axios.post(
                newUrl,
                payload,
                {
                    timeout: 15000,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.success) {
                const receivedToken = response.data.token;

                if (!receivedToken) {
                    setFormMessage({
                        type: "error",
                        text: "Authentication successful, but no token was returned."
                    });
                    return;
                }

                setToken(receivedToken);
                localStorage.setItem("token", receivedToken);
                setShowLoginPopup(false);
            } else {
                const message = response.data.message || "Authentication failed";

                if (!isLoginMode && message.toLowerCase().includes("already exists")) {
                    setCurrState("Login");
                    setFormMessage({
                        type: "info",
                        text: "This email is already registered. Please log in instead."
                    });
                    return;
                }

                if (isLoginMode && (
                    message.toLowerCase().includes("user doesn't exist") ||
                    message.toLowerCase().includes("invalid credentials")
                )) {
                    setFormMessage({
                        type: "error",
                        text: "Incorrect email or password. If you are new, create a new account first."
                    });
                    return;
                }

                setFormMessage({
                    type: "error",
                    text: message
                });
            }

        } catch (error) {
            const message = error.response?.data?.message ||
                (error.code === "ECONNABORTED"
                    ? "The server is taking too long to respond. Check the backend and database, then try again."
                    : error.message || "Server connection error");

            if (!isLoginMode && message.toLowerCase().includes("already exists")) {
                setCurrState("Login");
                setFormMessage({
                    type: "info",
                    text: "This email is already registered. Please log in instead."
                });
                return;
            }

            setFormMessage({
                type: "error",
                text: message
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-popup">

            <form
                onSubmit={onLogin}
                className="login-popup-container"
            >

                <div className="login-popup-title">

                    <h2>{isLoginMode ? "Login" : "Sign Up"}</h2>

                    <img
                        onClick={() => setShowLoginPopup(false)}
                        src={assets.cross_icon}
                        alt="Close"
                    />

                </div>


                <div className="login-popup-inputs">

                    {!isLoginMode && (
                        <input
                            name="name"
                            onChange={onChangeHandler}
                            value={data.name}
                            type="text"
                            placeholder="Your Name"
                            required
                        />
                    )}

                    <input
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder="Your email"
                        required
                    />

                    <input
                        name="password"
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder="Password"
                        minLength="8"
                        required
                    />

                </div>

                {formMessage.text && (
                    <div className={`login-popup-message ${formMessage.type}`}>
                        {formMessage.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Please wait..."
                        : isLoginMode
                            ? "Login"
                            : "Create account"
                    }
                </button>


                <div className="login-popup-condition">

                    <input
                        type="checkbox"
                        required={!isLoginMode}
                    />

                    <p>
                        By continuing, I agree to the
                        terms & conditions and privacy policy.
                    </p>

                </div>


                {isLoginMode ? (
                    <p>
                        Create a new account? {" "}
                        <span
                            onClick={() => switchMode("Sign Up")}
                            style={{ cursor: "pointer", color: "#ff4d4d", fontWeight: 600 }}
                        >
                            Click here
                        </span>
                    </p>
                ) : (
                    <p>
                        Already have an account? {" "}
                        <span
                            onClick={() => switchMode("Login")}
                            style={{ cursor: "pointer", color: "#ff4d4d", fontWeight: 600 }}
                        >
                            Login here
                        </span>
                    </p>
                )}

            </form>

        </div>
    );
};

export default LoginPopup;