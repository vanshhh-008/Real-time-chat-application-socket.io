import React, { useState } from "react";
import "./SignupPage.css";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [logininfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const HandleLogin = async (e) => {
    e.preventDefault();

    const email = logininfo.email.trim();
    const password = logininfo.password.trim();

    if (!email || !password) {
      toast.error("Email and password are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://real-time-chat-application-socket-io-17xp.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      const { success, message, jwtToken, name,pic,_id } = result;

      if (success) {
        toast.success("Successfully Logged In");


        localStorage.setItem("token", jwtToken);
        localStorage.setItem("id",_id);
        
        localStorage.setItem("LoggedInUser",name);
        localStorage.setItem("pic",pic);
 
    
   
        setTimeout(() => navigate("/chats"), 1000);
      } else {
        toast.error(message || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster toastOptions={{ duration: 3000 }} />
      <div className="app2">
        <header className="header2">
          <h1>LOG IN</h1>
          <p>Fill out the form below to proceed.</p>
        </header>

        <main className="form-container2" style={{ marginBottom: "55px" }}>
          <form className="form2" onSubmit={HandleLogin}>
            {/* Email */}
            <div className="form-group2">
              <label htmlFor="email">Email</label>
              <div className="forminput">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={logininfo.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group2">
              <label htmlFor="password">Password</label>
              <div className="forminput">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={logininfo.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex flex-column">
              <button
                type="submit"
                className="btn btn-primary mb-2"
                style={{ padding: "10px 0px" }}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary mb-3"
                style={{ padding: "10px 0px" }}
                onClick={()=>
                  setLoginInfo({
                    email:"guest@example.com",
                    password:"123456",
                  })}
               
                
              >
                Login With Guests Crendentials
              </button>
            </div>

            <p style={{ textAlign: "center", marginBottom: "2px" }}>
              Don't have an account?
              <Link to="/signup" style={{ textDecoration: "none" }}>
                {" "}Signup
              </Link>
            </p>
          </form>
        </main>
      </div>
    </>
  );
};

export default Login;
