import {Outlet} from "react-router-dom";
import Navbar from "@/components/common/Navbar/NavBar.jsx";


function MainLayout(){
    return (
        <div>
            <Navbar></Navbar>
            <main className = "mt-16">
                <Outlet/>
            </main>
        </div>
    )
}
export default MainLayout;