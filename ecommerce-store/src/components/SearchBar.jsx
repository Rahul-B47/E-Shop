import { FiSearch } from "react-icons/fi";

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="w-full relative mb-6">
      <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-11 pr-4 py-3 sm:py-3.5 sm:text-base text-sm rounded-xl shadow-md bg-white/70 dark:bg-white/10 backdrop-blur-md placeholder-gray-500 dark:placeholder-white/50 text-gray-800 dark:text-white border border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
  );
}
