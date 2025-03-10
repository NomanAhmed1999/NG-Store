export default function ProductListLoader() {
  return (
    <div className="max-w-frame mx-auto px-4 xl:px-0">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-4" />
            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
} 