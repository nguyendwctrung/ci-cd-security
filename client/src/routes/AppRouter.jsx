import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout.jsx";
import AdminLayout from "@/layouts/AdminLayout.jsx";
import HomePage from "@/pages/client/HomePage.jsx";
import ProfilePage from "@/pages/client/Profile/ProfilePage.jsx";
import MapPage from "@/pages/client/MapPage.jsx";
import PokedexPage from "@/pages/client/PokedexPage";
import PokeDetail from "@/pages/client/PokeDetail";
import SearchPage from "@/pages/client/SearchPage.jsx";
import PostPage from "@/pages/client/PostPage.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashBoardPage from "@/pages/admin/DashboardPage.jsx";
import UserAdminPage from "@/pages/admin/users/UserAdminPage.jsx";
import PostAdminPage from "@/pages/admin/posts/PostAdminPage.jsx";
import ProtectedRouter from "@/routes/ProtectedRouter.jsx";
import AdminProtectedRouter from "@/routes/AdminProtectedRouter.jsx";
import EditProfile from "@/pages/client/Profile/components/EditProfile";
import ChangePassword from "@/pages/client/Profile/components/ChangePassword";
import FollowPage from "@/pages/client/Profile/components/FollowPage.jsx";
// Admin Auth Pages
import AdminLoginPage from "@/pages/admin/auth/AdminLoginPage.jsx";
import AdminRegisterPage from "@/pages/admin/auth/AdminRegisterPage.jsx";
import AdminForgotPasswordPage from "@/pages/admin/auth/AdminForgotPasswordPage.jsx";

const routers = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRouter>
            <MainLayout></MainLayout>
        </ProtectedRouter>,
        children: [
            {
                path: "",
                element: <HomePage></HomePage>,

            },
            {
                path: "pokemap",
                element: <MapPage></MapPage>
            },
            {
                path: "pokedex",
                element: <PokedexPage></PokedexPage>
            },
            {
                path: "pokedex/detail",
                element: <PokeDetail></PokeDetail>
            },
            {
                path: "profile/:username_id",
                element: <ProfilePage></ProfilePage>
            },
            {
                path: "profile/edit/",
                element: <EditProfile></EditProfile>
            },
            {
                path: "profile/:username_id/follow",
                element: <FollowPage></FollowPage>
            }
            ,
            {
                path: "profile/change-password",
                element: <ChangePassword></ChangePassword>
            },
            {
                path: "search",
                element: <SearchPage></SearchPage>
            },
            {
                path: "post/:postId",
                element: <PostPage></PostPage>
            }
        ]
    },
    {
        path: "/account",
        children: [
            {
                path: "login",
                element: <LoginPage></LoginPage>
            },
            {
                path: "register",
                element: <RegisterPage></RegisterPage>
            }
        ]
    },
    // Admin Auth Routes (không cần bảo vệ)
    {
        path: "/admin/auth",
        children: [
            {
                path: "login",
                element: <AdminLoginPage></AdminLoginPage>
            },
            {
                path: "register",
                element: <AdminRegisterPage></AdminRegisterPage>
            },
            {
                path: "forgot-password",
                element: <AdminForgotPasswordPage></AdminForgotPasswordPage>
            }
        ]
    },
    // Admin Dashboard Routes (cần bảo vệ)
    {
        path: "/admin",
        element: <AdminProtectedRouter>
                    <AdminLayout></AdminLayout>
                </AdminProtectedRouter>,
        children: [
            {
                path: "",
                element: <DashBoardPage></DashBoardPage>
            },
            {
                path: "users",
                element: <UserAdminPage></UserAdminPage>
            },
            {
                path: "posts",
                element: <PostAdminPage></PostAdminPage>
            }
        ]
    }

]);

export default routers;