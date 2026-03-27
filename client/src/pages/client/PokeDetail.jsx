import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TYPE_COLORS } from '@/components/pokemon/constants.js';
import Loading from '@/components/common/ClientLoading.jsx';
const STAT_COLORS = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-yellow-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-green-500",
  speed: "bg-pink-500",
};

export default function PokeDetail() {
  const [searchParams] = useSearchParams();
  const pokemonId = searchParams.get('id');
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [moveDescriptions, setMoveDescriptions] = useState({}); // Cache mô tả: { "tackle": "Gây sát thương..." }
  const [hoveredMove, setHoveredMove] = useState(null);

  // --- HÀM HELPER: Lấy ID từ URL ---
  const getIdFromUrl = (url) => url.split('/').filter(Boolean).pop();

  // --- HÀM HELPER: Tính toán điểm yếu (Weakness) ---
  const calculateWeaknesses = async (types) => {
    try {
      let damageRelations = {};

      // Gọi API cho từng type của Pokemon
      const typePromises = types.map(t => fetch(t.type.url).then(res => res.json()));
      const typeData = await Promise.all(typePromises);

      typeData.forEach(type => {
        type.damage_relations.double_damage_from.forEach(d => {
          damageRelations[d.name] = (damageRelations[d.name] || 1) * 2;
        });
        type.damage_relations.half_damage_from.forEach(d => {
          damageRelations[d.name] = (damageRelations[d.name] || 1) * 0.5;
        });
        type.damage_relations.no_damage_from.forEach(d => {
          damageRelations[d.name] = 0;
        });
      });

      // Lọc ra các hệ gây damage > 1 (tức là khắc chế)
      return Object.keys(damageRelations).filter(type => damageRelations[type] > 1);
    } catch (e) {
      console.error("Error calculating weakness", e);
      return [];
    }
  };

  // --- HÀM HELPER: Xử lý chuỗi tiến hóa (Đệ quy) ---
  const parseEvolution = (chainNode, result = []) => {
    const id = getIdFromUrl(chainNode.species.url);
    result.push({
      id: id,
      name: chainNode.species.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      min_level: chainNode.evolution_details?.[0]?.min_level || null
    });

    if (chainNode.evolves_to.length > 0) {
      chainNode.evolves_to.forEach(child => parseEvolution(child, result));
    }
    return result;
  };

  // --- USE EFFECT: Gọi API ---
  useEffect(() => {
    if (!pokemonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy thông tin cơ bản
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!pokemonRes.ok) throw new Error("Pokemon not found");
        const pokemonData = await pokemonRes.json();

        // 2. Lấy thông tin loài (Species) - chứa Category và Evolution URL
        const speciesRes = await fetch(pokemonData.species.url);
        const speciesData = await speciesRes.json();

        // 3. Lấy thông tin Tiến hóa
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        // 4. Tính toán điểm yếu
        const weakTypes = await calculateWeaknesses(pokemonData.types);

        // Cập nhật State
        setPokemon(pokemonData);
        setSpecies(speciesData);
        setEvolutionChain(parseEvolution(evoData.chain));
        setWeaknesses(weakTypes);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pokemonId]);

  if (loading) {
    return (
      <Loading text="Loading Pokemon Details..." />
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Error: {error || "No Pokemon Data"}</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-blue-400 underline">Go Back</button>
      </div>
    );
  }

  // --- Xử lý dữ liệu hiển thị ---
  const englishGenus = species.genera.find(g => g.language.name === 'en')?.genus.replace(' Pokémon', '') || 'Unknown';
  const displayId = `#${String(pokemon.id).padStart(3, '0')}`;
  const heightMeters = pokemon.height / 10; // API trả về decimet
  const weightKg = pokemon.weight / 10; // API trả về hectogram

  // Lấy 15 chiêu thức đầu tiên (ưu tiên level-up)
  const moves = pokemon.moves
    .filter(m => m.version_group_details[0].move_learn_method.name === 'level-up')
    .slice(0, 15)
    .map(m => ({
      name: m.move.name,
      url: m.move.url // <--- Lấy thêm URL để fetch chi tiết
    }));

  const handleMoveHover = async (moveName, moveUrl) => {
    setHoveredMove(moveName);

    // Nếu đã có trong cache rồi thì không fetch lại
    if (moveDescriptions[moveName]) return;

    try {
      const res = await fetch(moveUrl);
      const data = await res.json();

      // Tìm mô tả tiếng Anh
      const entry = data.flavor_text_entries.find(e => e.language.name === 'en');
      const description = entry ? entry.flavor_text.replace(/\n|\f/g, ' ') : "No description available.";

      // Lưu vào state cache
      setMoveDescriptions(prev => ({ ...prev, [moveName]: description }));
    } catch (error) {
      console.error("Error fetching move detail:", error);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-8 px-4 font-sans flex justify-center">
      {/* CARD CONTAINER CHÍNH */}
      <div className="w-full max-w-4xl bg-slate-800 rounded-[2rem] border-2 border-slate-600 shadow-2xl overflow-hidden relative animate___animated animate__fadeIn">

        {/* Nút Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors z-10"
        >
          <ArrowLeft className="text-white w-6 h-6" />
        </button>

        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN (TOP SECTION) --- */}
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">

            {/* CỘT TRÁI: HÌNH ẢNH */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-slate-700/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <img
                  src={pokemon.sprites.other['official-artwork'].front_default}
                  alt={pokemon.name}
                  className="w-full h-full object-contain p-4 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
            <div className="w-full md:w-1/2 space-y-6">
              {/* Header: Name & ID */}
              <div className="flex justify-between items-end border-b border-slate-600 pb-4">
                <h1 className="text-4xl font-bold capitalize text-white">{pokemon.name}</h1>
                <span className="text-2xl font-bold text-gray-400">{displayId}</span>
              </div>

              {/* Grid thông số: Height, Weight, Category, Ability */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-slate-400 font-medium mb-1">Height</p>
                  <p className="text-xl text-white">{heightMeters}m</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-1">Category</p>
                  <p className="text-xl text-white">{englishGenus}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-1">Weight</p>
                  <p className="text-xl text-white">{weightKg}kg</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-1">Ability</p>
                  <p className="text-xl text-white capitalize">{pokemon.abilities[0]?.ability.name.replace('-', ' ')}</p>
                </div>
              </div>

              {/* Type */}
              <div>
                <p className="text-slate-400 font-medium mb-2">Type</p>
                <div className="flex gap-2">
                  {pokemon.types.map((t) => (
                    <span
                      key={t.type.name}
                      className={`${TYPE_COLORS[t.type.name]} px-4 py-1.5 rounded-full text-sm font-bold uppercase shadow-lg`}
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weakness */}
              <div>
                <p className="text-slate-400 font-medium mb-2">Weakness</p>
                <div className="flex flex-wrap gap-2">
                  {weaknesses.map((type) => (
                    <span
                      key={type}
                      className={`${TYPE_COLORS[type]} px-3 py-1 rounded-full text-xs font-bold uppercase opacity-80`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: STATS (CHỈ SỐ) - Lấp khoảng trống bên dưới --- */}
        <div className="bg-slate-700/30 px-8 py-8 mx-6 rounded-3xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            Base Stats
            <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded ml-2">Total: {pokemon.stats.reduce((a, b) => a + b.base_stat, 0)}</span>
          </h2>
          <div className="space-y-4">
            {pokemon.stats.map((stat) => (
              <div key={stat.stat.name} className="flex items-center gap-4">
                {/* Tên chỉ số */}
                <span className="w-32 text-slate-300 font-medium capitalize text-sm">
                  {stat.stat.name.replace('special-', 'Sp. ')}
                </span>

                {/* Giá trị số */}
                <span className="w-10 text-white font-bold text-sm text-right">{stat.base_stat}</span>

                {/* Thanh Progress Bar */}
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${STAT_COLORS[stat.stat.name] || 'bg-gray-400'} rounded-full`}
                    style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- PHẦN 3: CHIÊU THỨC (MOVES) --- */}
        <div className="px-10 pb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Moves <span className="text-sm text-slate-400 font-normal">(Level Up)</span></h2>
          <div className="flex flex-wrap gap-2">
            {moves.map((move) => (
              <div
                key={move.name}
                className="relative group" // Relative để làm điểm neo cho popup Absolute
                onMouseEnter={() => handleMoveHover(move.name, move.url)}
                onMouseLeave={() => setHoveredMove(null)}
              >
                {/* Badge Move */}
                <span className="cursor-help bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-sm capitalize hover:bg-slate-600 transition-colors border border-slate-600 block">
                  {move.name.replace('-', ' ')}
                </span>

                {/* Tooltip Popup */}
                {hoveredMove === move.name && (
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 sm:w-48 p-3 bg-black/90 text-white text-xs rounded-lg shadow-xl border border-slate-500 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>

                    {moveDescriptions[move.name] ? (
                      <p>{moveDescriptions[move.name]}</p>
                    ) : (
                      <div className="flex justify-center py-1">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- PHẦN 4: EVOLUTION CHAIN (CHUỖI TIẾN HÓA) --- */}
        <div className="px-10 pb-12 pt-4">
          <h2 className="text-2xl font-bold text-white mb-8 border-t border-slate-700 pt-8">Evolution Chain</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {evolutionChain.map((evo, index) => (
              <React.Fragment key={evo.id}>
                {/* Mũi tên (chỉ hiển thị từ phần tử thứ 2 trở đi) */}
                {index > 0 && (
                  <div className="flex flex-col items-center text-slate-500">
                    <ArrowRight className="hidden md:block w-8 h-8" />
                    <span className="md:hidden text-2xl">↓</span> {/* Mũi tên xuống cho mobile */}
                    {evo.min_level && <span className="text-xs font-bold mt-1 text-slate-400">Lvl {evo.min_level}</span>}
                  </div>
                )}

                {/* Card Tiến hóa */}
                <div
                  onClick={() => navigate(`/pokedex/detail?id=${evo.id}`)}
                  className={`
                      relative group cursor-pointer p-4 rounded-2xl transition-all duration-300
                      ${String(evo.id) === String(pokemon.id)
                      ? 'bg-slate-700 ring-2 ring-blue-500 shadow-lg scale-105' /* Highlight con hiện tại */
                      : 'bg-slate-800 hover:bg-slate-700 hover:scale-105'}
                   `}
                >
                  <img
                    src={evo.image}
                    alt={evo.name}
                    className="w-32 h-32 object-contain drop-shadow-md mb-2"
                  />
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-bold">#{String(evo.id).padStart(3, '0')}</p>
                    <p className="text-white font-bold capitalize text-lg">{evo.name}</p>
                    {/* Badge Current */}
                    {String(evo.id) === String(pokemon.id) && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}