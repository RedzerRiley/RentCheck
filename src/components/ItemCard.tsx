import { Calendar, Tag } from 'lucide-react';

interface ItemCardProps {
  item: {
    id: number;
    name: string;
    category: string;
    price: string;
    status: string;
    image: string;
  };
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Item Image */}
      <div className="relative h-48 bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          [Item Image]
        </div>
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              item.status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {item.status === 'available' ? 'Available' : 'Rented'}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-gray-900">{item.name}</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Tag className="w-4 h-4" />
          {item.category}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-xl text-blue-600">{item.price}</div>
          </div>
          
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              item.status === 'available'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={item.status !== 'available'}
          >
            {item.status === 'available' ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}