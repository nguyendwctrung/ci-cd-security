import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import SideBar from "@/pages/admin/components/SideBar.jsx";


export default function AdminLayout () {
    
    useEffect (() => {
        document.body.style.backgroundColor = 'rgb(230,230,230)'; // light gray
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        // bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
        document.body.style.backgroundImage = 'linear-gradient(to bottom right, #f8fafc, #ebf8ff, #e0e7ff)';
        
        // Cleanup: xóa styles khi component unmount
        return () => {
        document.body.style.backgroundColor = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
        };
    }, [])
    return (
        // change body color
        <div>
            <SideBar/>
            <div className ="ml-64 p-4">
                <Outlet/>
            </div>
        </div>
    );
}