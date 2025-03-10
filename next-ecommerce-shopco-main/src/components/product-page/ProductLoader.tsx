export default function ProductLoader() {
  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        {/* Breadcrumb loader */}
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        
        <section className="mb-11">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image loader */}
            <div className="aspect-square bg-gray-200 rounded animate-pulse" />
            
            {/* Content loader */}
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </section>
        
        {/* Tabs loader */}
        <div className="h-48 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </main>
  );
} 