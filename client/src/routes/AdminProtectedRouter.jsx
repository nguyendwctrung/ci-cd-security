import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "@/components/common/AdminLoading";

export default function AdminProtectedRouter({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if admin token exists
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        // Verify token with server
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/admin/auth/verify-token`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.role === "admin") {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem("adminToken");
                setIsAuthenticated(false);
            }
        })
        .catch((error) => {
            console.error("Token verification failed:", error);
            localStorage.removeItem("adminToken");
            setIsAuthenticated(false);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/auth/login" replace />;
    }

    return children;
}
