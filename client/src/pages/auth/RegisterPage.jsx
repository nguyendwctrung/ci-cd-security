import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// @ts-expect-error
import pikachu from "@/assets/icons/pikachu.jpg";
import justValidate from "just-validate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

function RegisterForm({ next, setSharedData }) {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const validator = new justValidate("#login-form");

    validator.addField("#email", [
      { rule: "required" },
      {
        validator: (value) => value.includes("@gmail.com"),
        errorMessage: "Email must be a valid gmail address",
      },
    ]);

    validator.addField("#username", [
      { rule: "required" },
      {
        rule: "minLength",
        value: 3,
        errorMessage: "Username must be at least 3 characters long",
      },
    ]);

    validator.addField("#password", [
      { rule: "required" },
      {
        rule: "minLength",
        value: 8,
        errorMessage: "Password must be at least 8 characters long",
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: "Password must contain at least one capital letter",
      },
      {
        validator: (value) => /[0-9]/.test(value),
        errorMessage: "Password must contain at least one number",
      },
      {
        validator: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
        errorMessage: "Password must contain at least one special character",
      },
    ]);

    validator.addField("#confirmed-password", [
      { rule: "required" },
      {
        validator: (value, fields) => {
          const password = fields["#password"]?.elem.value;
          return value === password;
        },
        errorMessage: "Passwords do not match",
      },
    ]);

    validator.onSuccess((event) => {
      event.preventDefault();

      // Prevent multiple submissions
      if (isLoading) {
        return;
      }

      setIsLoading(true);

      const formData = {
        email: event.target.querySelector("#email").value,
        username: event.target.querySelector("#username").value,
        password: event.target.querySelector("#password").value,
      };
      console.log("Form Data Submitted: ", formData);
      setSharedData((prev) => ({ ...prev, ...formData }));

      fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            toast.error("Registration failed!");
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          toast.success("OTP sent to your email!");
          next();
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }, [next, setSharedData, isLoading]);

  return (
    <div className="">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative py-4">
          Sign Up
          <span>
            <img
              src={pikachu}
              className="absolute top-2 right-10 w-[50px] aspect-square flex rounded-full"
            ></img>
          </span>
        </h1>

        <p className="text-gray-400">Sign up to your PokeMap account</p>
      </div>

      <form className="space-y-6" id="login-form">
        <div>
          <label
            htmlFor="email"
            className="block text-white text-sm font-medium mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-white text-sm font-medium mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-white text-sm font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <div>
          <label
            htmlFor="confirmed-password"
            className="block text-white text-sm font-medium mb-2"
          >
            Confirmed Password
          </label>
          <input
            type="password"
            id="confirmed-password"
            name="confirmed-password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed text-gray-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing Up...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          Already have account?{" "}
          <a
            href="/account/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

function OTPForm({ back, sharedData }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/api/auth/verify-otp-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sharedData.email,
        otp,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          toast.error("Invalid OTP!");
          throw new Error("Invalid OTP");
        }
        return response.json();
      })
      .then((data) => {
        console.log("OTP verified:", data);
        toast.success("OTP verified successfully!");
        // navigate to login form
        navigate("/account/login");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleResendOTP = () => {
    fetch(`${API_URL}/api/auth/resend-otp-singup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sharedData.email }),
    })
      .then((response) => {
        if (!response.ok) {
          toast.error("Failed to resend OTP!");
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        toast.success("OTP resent successfully!");
      });
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative">
          Enter OTP
          <span>
            <img
              src={pikachu}
              className="absolute top-0 right-10 w-[50px] aspect-square flex rounded-full"
            ></img>
          </span>
        </h1>
        <p className="text-gray-400">We sent a code to {sharedData.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="otp"
            className="block text-white text-sm font-medium mb-2"
          >
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Verify OTP
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={handleResendOTP}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          Resend OTP
        </button>
        <div
          className="mt-4 text-gray-400 text-sm cursor-pointer"
          onClick={back}
        >
          Back to Sign Up
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  const [currentForm, setCurrentForm] = useState("register");
  const [sharedData, setSharedData] = useState({
    email: "",
    username: "",
  });

  const goToRegisterForm = () => {
    setCurrentForm("register");
  };

  const goToOTPForm = () => {
    setCurrentForm("otp");
  };
  const renderCurrentForm = () => {
    switch (currentForm) {
      case "register":
        return (
          <RegisterForm next={goToOTPForm} setSharedData={setSharedData} />
        );
      case "otp":
        return <OTPForm back={goToRegisterForm} sharedData={sharedData} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[50px] px-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
        {renderCurrentForm()}
      </div>
    </div>
  );
}
