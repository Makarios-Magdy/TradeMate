import React, { useState } from "react";
import { useRegisterMutation } from '../redux/product';
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [register] = useRegisterMutation();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const result = await register({
                username,
                email,
                password
            });
            if (result) {
                navigate("/login");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="signup">
            <div className="signup-container">
                <h2>Create Account</h2>
                <form className="signup-form" onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="signup-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="signup-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="signup-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="signup-btn primary">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
