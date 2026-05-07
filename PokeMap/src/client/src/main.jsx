import {RouterProvider} from "react-router-dom";
import {createRoot } from 'react-dom/client'
import {Toaster} from "sonner"
import routers from "@/routes/AppRouter.jsx"
import '@/assets/styles/index.css'


createRoot(document.getElementById('root')).render(

  <>
    <Toaster richColors closeButton position = "top-right"/>
    <RouterProvider router={routers}></RouterProvider>
  </>

)
