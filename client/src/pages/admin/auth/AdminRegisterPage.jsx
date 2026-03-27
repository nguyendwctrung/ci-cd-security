import { useState, useEffect } from 'react';
import justValidate from 'just-validate';
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, User, Eye, EyeOff, KeyRound } from 'lucide-react';

// Step 1: Registration Form
function RegistrationForm({ onNext, setSharedData }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const validator = new justValidate("#admin-register-form");

        validator.addField("#username", [
            { rule: 'required', errorMessage: 'Username is required' },
            { rule: 'minLength', value: 3, errorMessage: "Username must be at least 3 characters" }
        ]);

        validator.addField("#email", [
            { rule: 'required', errorMessage: 'Email is required' },
            {
                validator: (value) => value.includes('@'),
                errorMessage: "Email must be valid"
            }
        ]);

        validator.addField("#password", [
            { rule: 'required', errorMessage: 'Password is required' },
            { rule: 'minLength', value: 8, errorMessage: "Password must be at least 8 characters" },
            {
                validator: (value) => /[A-Z]/.test(value),
                errorMessage: "Must contain at least one capital letter"
            },
            {
                validator: (value) => /[0-9]/.test(value),
                errorMessage: "Must contain at least one number"
            },
            {
                validator: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
                errorMessage: "Must contain at least one special character"
            }
        ]);

        validator.addField("#confirmPassword", [
            { rule: 'required', errorMessage: 'Please confirm your password' },
            {
                validator: (value, fields) => {
                    const password = fields['#password']?.elem?.value;
                    return value === password;
                },
                errorMessage: "Passwords do not match"
            }
        ]);

        validator.onSuccess((event) => {
            event.preventDefault();
            if (isLoading) return;
            setIsLoading(true);

            const formData = {
                username: event.target.querySelector("#username").value,
                email: event.target.querySelector("#email").value,
                password: event.target.querySelector("#password").value
            };

            fetch("http://localhost:10000/api/admin/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success("Registration successful! Please verify your email.");
                    setSharedData({ email: formData.email });
                    onNext();
                } else {
                    toast.error(data.message || "Registration failed!");
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error("Cannot connect to server!");
            })
            .finally(() => {
                setIsLoading(false);
            });
        });
    }, [isLoading, onNext, setSharedData]);

    return (
        <form id="admin-register-form" className="space-y-5">
            <div>
                <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
                    Username
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your username"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="admin@example.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Create a strong password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm your password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                    </span>
                ) : "Create Admin Account"}
            </button>
        </form>
    );
}

// Step 2: OTP Verification
function OTPVerificationForm({ sharedData, onSuccess }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast.error("Please enter the complete OTP code");
            return;
        }

        setIsLoading(true);
        fetch("http://localhost:10000/api/admin/auth/verify-otp-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sharedData.email, otp: otpCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success("Account verified successfully!");
                navigate("/admin/auth/login");
            } else {
                toast.error(data.message || "Invalid OTP!");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            toast.error("Cannot connect to server!");
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const handleResendOTP = () => {
        setResendLoading(true);
        fetch("http://localhost:10000/api/admin/auth/resend-otp-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sharedData.email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success("OTP resent successfully!");
            } else {
                toast.error(data.message || "Failed to resend OTP");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            toast.error("Cannot connect to server!");
        })
        .finally(() => {
            setResendLoading(false);
        });
    };

    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400 mb-6">
                We've sent a verification code to<br />
                <span className="text-purple-400">{sharedData.email}</span>
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {isLoading ? "Verifying..." : "Verify Email"}
                </button>
            </form>

            <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors disabled:opacity-50"
            >
                {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
            </button>
        </div>
    );
}

// Main Component
export default function AdminRegisterPage() {
    const [step, setStep] = useState(1);
    const [sharedData, setSharedData] = useState({ email: '' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                {step === 1 && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Create Admin Account</h1>
                        <p className="text-gray-400">Register for admin access to PokeMap</p>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-400'}`}>
                            1
                        </div>
                        <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-400'}`}>
                            2
                        </div>
                    </div>

                    {step === 1 && (
                        <RegistrationForm
                            onNext={() => setStep(2)}
                            setSharedData={setSharedData}
                        />
                    )}

                    {step === 2 && (
                        <OTPVerificationForm
                            sharedData={sharedData}
                            onSuccess={() => {}}
                        />
                    )}
                </div>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-4">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/admin/auth/login"
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                    <Link
                        to="/account/login"
                        className="text-gray-400 hover:text-white text-sm transition-colors block"
                    >
                        ← Back to User Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
