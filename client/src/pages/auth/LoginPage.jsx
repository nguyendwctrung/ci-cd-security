import { useState, useEffect } from "react";
import justValidate from "just-validate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// @ts-expect-error
import pikachu from "@/assets/icons/pikachu.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

// Login Form Component
function LoginForm({ onForgotPassword, setSharedData }) {
  const navigate = useNavigate();

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

    validator.onSuccess((event) => {
      event.preventDefault();
      if (isLoading) return; // Prevent multiple submissions
      setIsLoading(true);
      const formData = {
        email: event.target.querySelector("#email").value,
        password: event.target.querySelector("#password").value,
      };
      console.log("Form Data:", formData);
      setSharedData((prev) => ({ ...prev, email: formData.email }));

      fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            toast.error("Login failed!");

            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          toast.success("Login successful!");
          navigate("/");
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }, []);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative py-4">
          Welcome
          <span>
            <img
              src={pikachu}
              className="absolute top-2 right-10 w-[50px] aspect-square flex rounded-full"
            ></img>
          </span>
        </h1>
        <p className="text-gray-400">Sign in to your PokeMap account</p>
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Sign In
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          disabled={isLoading}
          onClick={onForgotPassword}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          Forgot your password?
        </button>
      </div>

      <div className="text-center mt-6 pt-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <a
            href="/account/register"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </>
  );
}

// Forgot Password Form Component
function ForgotPasswordForm({
  onBackToLogin,
  onNext,
  sharedData,
  setSharedData,
}) {
  const [email, setEmail] = useState(sharedData.email || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleSubmit = () => {
      if (isLoading) return; // Prevent multiple submissions
      setIsLoading(true);
      console.log("Submitting email for OTP:", email);
      fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((response) => {
          if (!response.ok) {
            toast.error("Failed to send reset code!");
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (!data) return;
          console.log("OTP sent:", data);
          setSharedData((p) => ({ ...p, email: email }));
          onNext();
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Can't connect to server!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    const validator = new justValidate("#forgot-password-form");
    validator.addField("#forgot-email", [
      { rule: "required" },
      {
        validator: (value) => value.includes("@gmail.com"),
        errorMessage: "Email must be a valid gmail address",
      },
    ]);
    validator.onSuccess((e) => {
      e.preventDefault();
      handleSubmit();
    });

    return () => {
      validator.destroy();
    };
  }, [email, isLoading, onNext, setSharedData]); // Include all dependencies

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative">
          Reset Password
          <span>
            <img
              src={pikachu}
              className="absolute top-0 right-5 w-[50px] aspect-square flex rounded-full"
            ></img>
          </span>
        </h1>
        <p className="text-gray-400">Enter your email to receive an OTP</p>
      </div>

      <form className="space-y-6" id="forgot-password-form">
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-white text-sm font-medium mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="forgot-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Send OTP
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={onBackToLogin}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Sign In
        </button>
      </div>
    </>
  );
}

// OTP Verification Form Component
function OTPForm({ onBackToForgot, onNext, sharedData }) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    fetch(`${API_URL}/api/auth/verify-otp-forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sharedData.email,
        otp,
        token: sharedData.resetToken,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          toast.error("Invalid OTP!");
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        console.log("OTP verified:", data);
        toast.success("OTP verified successfully!");
        onNext();
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Invalid OTP or expired!");
      })
      .finally(() => {
        setIsLoading(false);
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
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Verify OTP
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={onBackToForgot}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors bg-transparent border-none cursor-pointer mr-4"
        >
          ← Back
        </button>
      </div>
    </>
  );
}

// Reset Password Form Component
function ResetPasswordForm({ onBackToLogin, sharedData }) {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      if (isLoading) return; // Prevent multiple submissions
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: sharedData.email,
            newPassword: passwords.newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Password reset successfully!");
          setTimeout(() => {
            onBackToLogin();
          }, 2000);
        } else {
          toast.error(data.message || "Failed to reset password");
        }
      } catch (error) {
        console.error("Reset password error:", error);
        toast.error("Server error to connect!");
      } finally {
        setIsLoading(false);
      }
    };

    const validator = new justValidate("#reset-password-form");
    validator.addField("#new-password", [
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
    validator.addField("#confirm-password", [
      { rule: "required" },
      {
        validator: (value, fields) => {
          const newPassword = fields["#new-password"]?.elem.value;
          return value === newPassword;
        },
        errorMessage: "Passwords do not match",
      },
    ]);

    validator.onSuccess(handleFormSubmit);

    return () => {
      validator.destroy();
    };
  }, [sharedData.email, isLoading, passwords.newPassword, onBackToLogin]); // Include dependencies

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 relative">
          New Password
          <span>
            <img
              src={pikachu}
              className="absolute top-0 right-5 w-[50px] aspect-square flex rounded-full"
            ></img>
          </span>
        </h1>
        <p className="text-gray-400">Enter your new password</p>
      </div>

      <form className="space-y-6" id="reset-password-form">
        <div>
          <label
            htmlFor="new-password"
            className="block text-white text-sm font-medium mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-white text-sm font-medium mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Reset Password
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={onBackToLogin}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Sign In
        </button>
      </div>
    </>
  );
}

export default function LoginPage() {
  // Form state management
  const [currentForm, setCurrentForm] = useState("login"); // 'login', 'forgot', 'otp', 'reset'
  console.log("curent form: ", currentForm);
  // Shared data across all forms
  const [sharedData, setSharedData] = useState({
    email: "",
  });

  // Navigation functions
  const goToLogin = () => setCurrentForm("login");
  const goToForgot = () => setCurrentForm("forgot");
  const goToOTP = () => setCurrentForm("otp");
  const goToReset = () => setCurrentForm("reset");
  const renderCurrentForm = () => {
    switch (currentForm) {
      case "login":
        return (
          <LoginForm
            onForgotPassword={goToForgot}
            setSharedData={setSharedData}
          />
        );
      case "forgot":
        return (
          <ForgotPasswordForm
            onBackToLogin={goToLogin}
            onNext={goToOTP}
            sharedData={sharedData}
            setSharedData={setSharedData}
          />
        );
      case "otp":
        return (
          <OTPForm
            onBackToForgot={goToForgot}
            onNext={goToReset}
            sharedData={sharedData}
          />
        );
      case "reset":
        return (
          <ResetPasswordForm
            onBackToLogin={goToLogin}
            sharedData={sharedData}
          />
        );
      default:
        return null;
    }
  };
  // Render current form

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl p-8 w-full max-w-md bg-black/50 mx-auto mt-[100px] shadow-xl border border-gray-700">
        {renderCurrentForm()}
      </div>
    </div>
  );
}
