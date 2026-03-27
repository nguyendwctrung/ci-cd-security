import { useState, useEffect} from "react";
import { Lock, Eye, EyeOff, Save, ArrowLeft} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "@/routes/ProtectedRouter.jsx";
import JustValidate from "just-validate";
import { toast } from "sonner";
export default function ChangePassword() {
    const {user, setUser} = useAuth();
    const navigate = useNavigate();
    const [isSumit, setIsSumit] = useState(false);


    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isLoading, setIsLoading] = useState(false);



    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    useEffect (() => {
        const validator = new JustValidate('#changePasswordForm');
        validator
        .addField("#currentPassword", [
            {
                rule: 'required',
                errorMessage: 'Current password is required',
            }
        ])
        .addField("#newPassword", [
            {
                rule: 'required',
                errorMessage: 'New password is required',
            },
            {
                rule: 'minLength',
                value: 8,
            },
            {
                rule: 'maxLength',
                value: 30,
            },
            {
                rule: 'customRegexp',
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            }
        ])
        .addField("#confirmPassword", [
            {
                rule: 'required',
                errorMessage: 'Please confirm your new password',
            },
            {
                validator: (value, fields) => {
                    return value === fields['#newPassword'].elem.value;
                },
                errorMessage: 'Passwords do not match',
            }
        ])
        .onSuccess(() => {
            setIsSumit(true);
        });
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSumit) return;
        if (isLoading) return;

        setIsLoading(true);

        const form = e.target;
        const currentPassword = form.currentPassword.value;
        const newPassword = form.newPassword.value;
        fetch("http://localhost:10000/api/user/profile/change-password", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword : currentPassword,
                newPassword: newPassword
            })
        })
        .then (res => {
            if (!res.ok) {
                return res.json().then(data => {
                    throw new Error(data.message || "Failed to change password");
                });
            }
            return res.json();
        })
        .then (data => {
            if (data.success){
                toast.success("Password changed successfully.");
                setUser (data.data);
                navigate('/');
            } else {
                toast.error(data.message || "Failed to change password.");
            }
        })
        .catch (err => {
            console.error("Error changing password:", err);
            toast.error(err.message || "Server error while changing password.");
        })
        .finally(() => {
            setIsLoading(false);
            setIsSumit(false);
        });
    };

    return (
        <div className="min-h-screen  py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Đổi mật khẩu</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-black/50 rounded-2xl" id="changePasswordForm">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                            <Lock className="w-4 h-4" />
                            <span>Current Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                id = "currentPassword"
                                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                            <Lock className="w-4 h-4" />
                            <span>New Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                id = "newPassword"
                                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                            <Lock className="w-4 h-4" />
                            <span>Confirm New Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                id = "confirmPassword"
                                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    
                    

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-4 cursor-pointer bg-blue-400 hover:bg-blue-300 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Change Password</span>
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}
