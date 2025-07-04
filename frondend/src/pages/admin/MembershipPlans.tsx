/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MembershipPlans.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { MembershipPlan } from '../../types/membership.types';
import { getMembershipPlans } from '../../services/api/adminApi';

const MembershipPlans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 5;

  // Dummy stats (to be made dynamic later if needed)
  const stats = [
    { title: "Total Active Plans", value: `${totalPlans} Plans`, icon: "fa-clipboard-list" },
    { title: "Most Popular Plan", value: "Premium Annual", icon: "fa-crown" }, // Placeholder
    { title: "Monthly Revenue", value: "$24,500", icon: "fa-dollar-sign" }, // Placeholder
  ];

useEffect(() => {
    const loadPlans = async () => {
      if (page < 1 || limit < 1) return;
      setLoading(true);
      try {
        const { plans, total, pages } = await getMembershipPlans(page, limit);
        setPlans(plans);
        setTotalPlans(total);
        setTotalPages(pages);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load membership plans');
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    },
    [totalPages]
  );

const renderPagination = useCallback(() => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-3 py-1 rounded-full text-sm font-medium ${
            page === i ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="mx-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              className="mx-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  }, [page, totalPages, handlePageChange]);


 return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                <i className={`fas ${stat.icon} text-indigo-600 text-xl`}></i>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plans Table Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/admin/membership/add')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Plan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 rounded"></div>
                  ))}
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Type', 'Description', 'Price', 'Duration', 'Features'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{plan.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{plan.description || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{plan.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.duration} Month{plan.duration > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="list-disc list-inside text-sm text-gray-500">
                          {plan.features.map((feature, idx) => (
                            <li key={idx}>
                              {feature
                                .split('-')
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No plans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && renderPagination()}
      </div>
    </main>
  );
};

export default MembershipPlans;