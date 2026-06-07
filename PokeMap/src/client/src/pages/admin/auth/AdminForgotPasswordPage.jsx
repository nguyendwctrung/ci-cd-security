import { useState, useEffect } from 'react';
import justValidate from 'just-validate';
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

// Step 1: Enter Email
function EnterEmailForm({ onNext, setSharedData }) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const validator = new justValidate("#forgot-email-form");

        validator.addField("#email", [
            { rule: 'required', errorMessage: 'Email is required' },
            {
                validator: (value) => value.includes('@'),
                errorMessage: "Email must be valid"
            }
        ]);

        validator.onSuccess((event) => {
            event.preventDefault();
            if (isLoading) return;
            setIsLoading(true);

            const email = event.target.querySelector("#email").value;

            fetch("http://localhost:10000/api/admin/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success("OTP sent to your email!");
                    setSharedData({ email });
                    onNext();
                } else {
                    toast.error(data.message || "Failed to send OTP!");
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
        <div>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-400">Enter your email to receive a reset code</p>
            </div>

            <form id="forgot-email-form" className="space-y-6">
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                </button>
            </form>
        </div>
    );
}

// Step 2: Verify OTP
function VerifyOTPForm({ sharedData, onNext, setSharedData }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

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
        fetch("http://localhost:10000/api/admin/auth/verify-otp-forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sharedData.email, otp: otpCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success("OTP verified successfully!");
                setSharedData(prev => ({ ...prev, resetToken: data.resetToken }));
                onNext();
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
        fetch("http://localhost:10000/api/admin/auth/forgot-password", {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6">
                <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Enter Verification Code</h2>
            <p className="text-gray-400 mb-6">
                We've sent a code to<br />
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
                    {isLoading ? "Verifying..." : "Verify Code"}
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

// Step 3: Reset Password
function ResetPasswordForm({ sharedData }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) return;
        
        const validator = new justValidate("#reset-password-form");

        validator.addField("#newPassword", [
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
                    const password = fields['#newPassword']?.elem?.value;
                    return value === password;
                },
                errorMessage: "Passwords do not match"
            }
        ]);

        validator.onSuccess((event) => {
            event.preventDefault();
            if (isLoading) return;
            setIsLoading(true);

            const newPassword = event.target.querySelector("#newPassword").value;

            fetch("http://localhost:10000/api/admin/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: sharedData.email,
                    resetToken: sharedData.resetToken,
                    newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success("Password reset successfully!");
                    setIsSuccess(true);
                    setTimeout(() => navigate("/admin/auth/login"), 2000);
                } else {
                    toast.error(data.message || "Failed to reset password!");
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
    }, [isLoading, isSuccess, navigate, sharedData]);

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                <p className="text-gray-400 mb-6">
                    Your password has been successfully reset.<br />
                    Redirecting to login...
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                <p className="text-gray-400">Enter your new password below</p>
            </div>

            <form id="reset-password-form" className="space-y-5">
                <div>
                    <label htmlFor="newPassword" className="block text-white text-sm font-medium mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter new password"
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
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Confirm new password"
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

// Main Component
export default function AdminForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [sharedData, setSharedData] = useState({ email: '', resetToken: '' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-400'}`}>
                            1
                        </div>
                        <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-400'}`}>
                            2
                        </div>
                        <div className={`w-12 h-1 rounded ${step >= 3 ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 3 ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-400'}`}>
                            3
                        </div>
                    </div>

                    {step === 1 && (
                        <EnterEmailForm
                            onNext={() => setStep(2)}
                            setSharedData={setSharedData}
                        />
                    )}

                    {step === 2 && (
                        <VerifyOTPForm
                            sharedData={sharedData}
                            onNext={() => setStep(3)}
                            setSharedData={setSharedData}
                        />
                    )}

                    {step === 3 && (
                        <ResetPasswordForm sharedData={sharedData} />
                    )}
                </div>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-4">
                    <Link
                        to="/admin/auth/login"
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
