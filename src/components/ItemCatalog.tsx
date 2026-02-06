import { Filter, Grid, List } from 'lucide-react';
import { ItemCard } from './ItemCard';

const mockItems = [
  {
    id: 1,
    name: 'Professional Camera',
    category: 'Electronics',
    price: '$50/day',
    status: 'available',
    image: 'professional camera equipment',
  },
  {
    id: 2,
    name: 'Power Drill Set',
    category: 'Tools',
    price: '$25/day',
    status: 'available',
    image: 'power drill tools',
  },
  {
    id: 3,
    name: 'Camping Tent (4-person)',
    category: 'Outdoor',
    price: '$35/day',
    status: 'rented',
    image: 'camping tent outdoor',
  },
  {
    id: 4,
    name: 'Projector & Screen',
    category: 'Electronics',
    price: '$45/day',
    status: 'available',
    image: 'projector presentation',
  },
  {
    id: 5,
    name: 'Ladder (20ft)',
    category: 'Tools',
    price: '$20/day',
    status: 'available',
    image: 'ladder construction',
  },
  {
    id: 6,
    name: 'Party Sound System',
    category: 'Electronics',
    price: '$75/day',
    status: 'rented',
    image: 'sound system speakers',
  },
];

const categories = ['All Items', 'Electronics', 'Tools', 'Outdoor', 'Events'];

export function ItemCatalog() {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Item Catalog</h2>
          <p className="text-gray-600">Browse and rent available items</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Grid className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <List className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  category === 'All Items'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <select className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            <option>All Status</option>
            <option>Available</option>
            <option>Rented</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
