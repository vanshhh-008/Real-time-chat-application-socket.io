import React, { useEffect, useState } from "react";
import "./SignupPage.css";
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

const SignupForm = () => {

  
  const [signupinfo, setSignUpInfo] = useState({
    name: '',
    email: '',
    password: '',
    pic: '',
  });

  const [profilePic, setProfilePic] = useState(null); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleClear = () => {
    setSignUpInfo({ name: '', email: '', password: '', pic: '' });
    setProfilePic(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!profilePic) return "";

    const formData = new FormData();
    formData.append("file", profilePic);
    formData.append("upload_preset", "ProfilePic"); // your preset
    formData.append("cloud_name", "dc7u1pe1e");    // your cloud name

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dc7u1pe1e/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        return data.url.toString();
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      toast.error("Image upload failed, try again.");
      return "";
    }
  };

  const HandleSignUp = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupinfo;

    if (!name || !email || !password) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

  
    const imageUrl = await uploadImageToCloudinary();

    if (profilePic && !imageUrl) {
      setLoading(false);
      return;
    }

    
    const signupData = {
      ...signupinfo,
      pic: imageUrl,
    };

    try {
      const response = await fetch("https://real-time-chat-application-socket-io-17xp.onrender.com/auth/signup", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Successfully Signed Up!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(result.message || "Signup failed. Try again.");
      }
    } catch (error) {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <Toaster toastOptions={{ duration: 5000 }} />
      <div className="app2">
        <header className="header2">
          <h1>Sign Up</h1>
          <p>Fill out the form below to proceed.</p>
        </header>
        <main className="form-container2" style={{ marginBottom: '55px' }}>
          <form className="form2" onSubmit={HandleSignUp}>
            <div className="form-group2">
              <label htmlFor="name">Name</label>
              <div className='forminput'>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={signupinfo.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="form-group2">
              <label htmlFor="email">Email</label>
              <div className='forminput'>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={signupinfo.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="form-group2">
              <label htmlFor="password">Password</label>
              <div className='forminput'>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={signupinfo.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="form-group2">
              <label htmlFor="profilePic">Profile Picture</label>
              <div className='forminput'>
                <input
                  type="file"
                  id="profilePic"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {profilePic && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Preview"
                    width="100"
                    height="100"
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>

            <div className="d-flex flex-column">
              <button
                type="submit"
                className="btn btn-primary mb-2"
                style={{ padding: '10px 0px' }}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Signup"
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary mb-3"
                style={{ padding: '10px 0px' }}
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '2px' }}>
              Already have an account?
              <Link to="/login" style={{ textDecoration: 'none' }}> Login</Link>
            </p>
          </form>
        </main>
      </div>
    </>
  );
};

export default SignupForm;
