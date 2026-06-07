import ProfileHeader from "@/pages/client/Profile/components/ProfileHeader.jsx";
import { useState, useRef } from "react";

export default function MiniProfileAuthor({ userId, username, children }) {
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        // Delay 300ms trước khi ẩn popup để tránh việc biến mất quá nhanh
        timeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 300);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Mini Menu Popup */}
            {isHovered && (
                <div
                    className="absolute top-full left-0 mt-2 z-50 animate__animated animate__lightSpeedInRight"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl p-4 w-fit min-w-[500px]">
                        <ProfileHeader
                            isMiniCard={true}
                            user_id_outside={userId}
                            username_outside={username}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


