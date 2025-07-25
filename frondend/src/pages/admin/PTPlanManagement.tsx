import React, { useState, useEffect, useCallback } from 'react';
import { fetchTrainerPTPlans } from '../../services/api/adminApi';
import type { FetchPTPlansResponse, PTPlan } from '../../types/pTPlan';
import { verifyPTPlan, updatePTPlanAdminPrice } from '../../services/api/adminApi';


// Interface for filter options
type FilterOption = 'all' | 'verified' | 'notVerified';

const PTPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<PTPlan[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PTPlan | null>(null);
  const [adminPrice, setAdminPrice] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plansPerPage = 2;

  // Fetch plans from API
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const verifiedByAdmin = filter === 'verified' ? true : filter === 'notVerified' ? false : null;
      const response: FetchPTPlansResponse = await fetchTrainerPTPlans(currentPage, plansPerPage, verifiedByAdmin);
      console.log('API Response:', response); // Debug: Log the full response
      setPlans(response.plans || []); // Ensure plans is always an array
      setTotalPages(response.pagination.totalPages || 1); // Fallback to 1 if undefined
    } catch (err) {
      setError('Failed to load PT plans. Please try again.');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
    setCurrentPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Handle verification toggle (Placeholder for API call)
 const handleVerify = async (id: string) => {
  try {
    await verifyPTPlan(id); // Call the API to verify
    setPlans(plans.map((plan) =>
      plan.id === id ? { ...plan, verifiedByAdmin: true } : plan
    ));
  } catch (error) {
    console.error('Failed to verify plan:', error);
    alert('Failed to verify plan. Please try again.');
  }
};
  // Open edit modal
  const openEditModal = useCallback((plan: PTPlan) => {
    setSelectedPlan(plan);
    setAdminPrice(plan.adminPrice?.toString() || '');
    setIsModalOpen(true);
  }, []);

  // Handle admin price update (Placeholder for API call)
const handleUpdateAdminPrice = async () => {
  if (!selectedPlan || !adminPrice) return;

  const newAdminPrice = parseFloat(adminPrice);
  if (isNaN(newAdminPrice) || newAdminPrice < 0) {
    alert('Please enter a valid price');
    return;
  }

  try {
    await updatePTPlanAdminPrice(selectedPlan.id, newAdminPrice); // API call
    setPlans(plans.map((plan) =>
      plan.id === selectedPlan.id
        ? {
            ...plan,
            adminPrice: newAdminPrice,
            totalPrice: plan.trainerPrice + newAdminPrice,
          }
        : plan
    ));
    setIsModalOpen(false);
    setAdminPrice('');
    setSelectedPlan(null);
  } catch (error) {
    console.error('Failed to update admin price:', error);
    alert('Failed to update admin price. Please try again.');
  }
};

  // Render pagination
  const renderPagination = useCallback(() => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPage === i ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="py-4 px-6 flex justify-between items-center bg-gray-50">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          {pageNumbers}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    );
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          PT Plan Management
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg text-center">
            Loading plans...
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
          {['all', 'verified', 'notVerified'].map((option) => (
            <button
              key={option}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                filter === option
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200'
              }`}
              onClick={() => handleFilterChange(option as FilterOption)}
            >
              {option === 'all' ? 'All Plans' : option === 'verified' ? 'Verified' : 'Not Verified'}
            </button>
          ))}
        </div>

        {/* Plans Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  {['Title', 'Category', 'Mode', 'Duration (Months)', 'Trainer Price (₹)', 'Admin Price (₹)', 'Total Price (₹)', 'Status', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="py-4 px-6 text-left text-sm font-semibold text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.length === 0 && !loading && !error ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-6 text-center text-sm text-gray-600">
                      No plans available
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-indigo-50 transition-colors duration-150">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{plan.title}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 capitalize">{plan.category}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 capitalize">{plan.mode}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{plan.duration}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">₹{plan.trainerPrice}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">₹{plan.adminPrice ?? 'N/A'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">₹{plan.totalPrice ?? 'N/A'}</td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            plan.verifiedByAdmin
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {plan.verifiedByAdmin ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex gap-3">
                          {!plan.verifiedByAdmin && (
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                              onClick={() => handleVerify(plan.id!)}
                            >
                              Verify
                            </button>
                          )}
                          <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            onClick={() => openEditModal(plan)}
                          >
                            Edit Price
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && renderPagination()}
        </div>

        {/* Edit Admin Price Modal */}
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Admin Price for {selectedPlan.title}
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Price (₹)
                </label>
                <input
                  type="number"
                  value={adminPrice}
                  onChange={(e) => setAdminPrice(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Enter admin price"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  onClick={handleUpdateAdminPrice}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PTPlanManagement;