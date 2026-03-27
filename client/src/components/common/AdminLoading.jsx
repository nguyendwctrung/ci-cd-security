// @ts-expect-error
import milotic from "@/assets/icons/milotic.png";
import "animate.css";
import {cn} from "@/lib/utils.js";
export default function Loading({ src, size = "w-16 h-16", text = "Loading..." , className=""}) {
    if (!src) {
        src = milotic;
    }
    return (
        <div className={cn(`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50`, className)}>
            <div className="bg-black/30 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate__animated animate__zoomIn animate__faster">
                <div className="flex flex-col items-center space-y-6">
                    {src && (
                        <div className="relative">
                            <img
                                src={src}
                                alt="Loading"
                                className={`${size} rounded-full shadow-lg border-4 border-gradient-to-r from-rose-400 to-pink-500`}
                            />
                            <div className="absolute inset-0 rounded-full border-4 border-rose-300 border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-white text-xl font-semibold">{text}</p>
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}