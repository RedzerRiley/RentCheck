import { Calendar, Clock, User, Package, AlertCircle } from 'lucide-react';

const mockRentals = [
  {
    id: 1,
    itemName: 'Professional Camera',
    renter: 'John Smith',
    startDate: '2026-02-01',
    endDate: '2026-02-05',
    status: 'active',
    daysRemaining: 2,
  },
  {
    id: 2,
    itemName: 'Camping Tent (4-person)',
    renter: 'Sarah Johnson',
    startDate: '2026-02-03',
    endDate: '2026-02-10',
    status: 'active',
    daysRemaining: 4,
  },
  {
    id: 3,
    itemName: 'Party Sound System',
    renter: 'Mike Davis',
    startDate: '2026-02-05',
    endDate: '2026-02-06',
    status: 'active',
    daysRemaining: 0,
  },
  {
    id: 4,
    itemName: 'Power Drill Set',
    renter: 'Emma Wilson',
    startDate: '2026-01-28',
    endDate: '2026-02-04',
    status: 'overdue',
    daysRemaining: -2,
  },
];

export function RentalTracker() {
  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-1">Rental Tracker</h2>
        <p className="text-gray-600">Monitor active rentals and returns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Rentals</p>
              <p className="text-2xl text-gray-900 mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Today</p>
              <p className="text-2xl text-gray-900 mt-1">5</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl text-gray-900 mt-1">156</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rental Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Renter
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockRentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-gray-900">{rental.itemName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {rental.renter}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {rental.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {rental.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {rental.status === 'overdue' ? (
                      <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        Overdue ({Math.abs(rental.daysRemaining)} days)
                      </span>
                    ) : rental.daysRemaining === 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                        Due Today
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Active ({rental.daysRemaining} days left)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Mark Returned
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
