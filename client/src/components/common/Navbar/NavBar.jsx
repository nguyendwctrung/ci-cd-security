// @ts-expect-error
import LogoIcon from "@/assets/icons/logo.png";
import {useNavigate} from "react-router-dom";

import Profile from "@/components/common/Navbar/components/Profile.jsx";
import SearchBar from "@/components/common/Navbar/components/SearchBar.jsx";


// Main function for NavBar
export default function Navbar(){
    return(
        <>
            <div className="fixed top-0 left-0 w-full h-16 bg-gray-900/80 flex items-center justify-between px-4 shadow-lg z-50">
                <Logo />
                <SearchBar />
                <div className="flex items-center space-x-4">
                    <Profile />
                </div>
            </div>
        </>
    );
}   


function Logo(){

    const logoImage = LogoIcon; // Placeholder logo image
    const navigate = useNavigate(); 

    return (
        <div className="flex items-center space-x-2 cursor-pointer group" onClick = {() => navigate("/")}>
            <img src={logoImage} alt="Logo" className="w-[150px] h-16 object-cover transition-all logo-hover hover:scale-110 duration-500" />
        </div>
    );
}









