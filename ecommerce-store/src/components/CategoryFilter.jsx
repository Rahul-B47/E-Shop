export default function CategoryFilter({ categories, selected, setSelected }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-3 min-w-full sm:flex-wrap sm:justify-center">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelected(category)}
            className={`px-5 py-2.5 whitespace-nowrap rounded-full text-sm font-semibold shadow-sm transition-all duration-200 border ${
              selected === category
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-indigo-100 border-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
