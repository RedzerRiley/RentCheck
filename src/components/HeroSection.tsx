import { Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl mb-4">
            Simplify Your Rental Management
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Track items, manage rentals, and keep everything organized in one place
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search for items to rent..."
              className="flex-1 px-2 py-3 text-gray-900 outline-none"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-1">500+</div>
              <div className="text-sm text-blue-100">Items Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-1">1,200+</div>
              <div className="text-sm text-blue-100">Active Rentals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-1">98%</div>
              <div className="text-sm text-blue-100">Return Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
