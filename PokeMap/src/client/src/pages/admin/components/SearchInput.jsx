import { Search } from "lucide-react";


export default function SearchInput({labelName, placeHolder, searchQuery, setSearchQuery, setSubmitSearchQuery, setPage}){
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log ("Submitting search for query:", searchQuery);
        setSubmitSearchQuery(searchQuery);
        setPage(1);
    }
    return(
        <>
            {/* Search Bar */}
            <div className="mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-slate-700 text-sm font-semibold mb-2 text-2xl">{labelName}</label>
                    <form className="relative" onSubmit ={handleSearchSubmit}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder= {placeHolder}
                        className="w-full pl-12 pr-4 py-3 border text-sm border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-800 placeholder-slate-400"
                    />
                    </form>
                </div>
                </div>
            </div>
            </div>
        </>
    );
}