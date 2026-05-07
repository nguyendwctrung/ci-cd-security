import PokemapIcon from "../../assets/icons/pokemap_icon.png";
import PokedexIcon from "../../assets/icons/pokedex_icon.png";
import { cn } from "../../lib/utils.jsx";
import { Link } from "react-router-dom";
export default function ShortcutToMap({ className }) {

    return (
        <div className={cn("bg-gray-800/50 shadow-[0px_0px_15px] shadow-gray-600 rounded-2xl p-3 h-fit fixed w-[20%] right-[50px] top-32 pb-6", className)}>
            <h2 className="text-white text-xl font-bold mb-6">Tiện ích</h2>
            <div className="grid grid-cols-2 gap-6">
                <Link to="/pokedex" className={`w-full h-full rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform
                    duration-300 cursor-pointer`}>
                    <img src={PokedexIcon}></img>
                </Link>
                <Link to="/pokemap" className={`w-full h-full rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform
                    duration-300 cursor-pointer`}>
                    <img src={PokemapIcon}></img>
                </Link>
            </div>
        </div>
    );
}