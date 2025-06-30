import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import useDebounce from "../../hooks/useDebounce";
import { getGyms } from "../../services/api/adminApi";
import StatCard from "../../components/feature/admin/StatCard";
import GymTable from "../../components/feature/admin/GymTable";
import type { Gym } from "../../types/gym.types";

const Gyms: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGyms, setTotalGyms] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 5;
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      try {
        const { gyms, total, totalPages } = await getGyms(page, limit, debouncedSearch || undefined);
        setGyms(gyms);
        setTotalGyms(total);
        setTotalPages(totalPages);
        setError(null);
      } catch (error) {
        console.error("Error fetching gyms:", error);
        setError("Failed to load gyms");
        setGyms([]);
        setTotalGyms(0);
        setTotalPages(1);
        toast.error("Failed to load gyms");
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, [page, debouncedSearch]);

  const stats = {
    totalGyms,
    pendingApprovals: 18, // TODO: Make dynamic
    activeMembers: 15248, // TODO: Make dynamic
    monthlyRevenue: 86429, // TODO: Make dynamic
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }, [totalPages]);

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
            page === i ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Gym Management</h1>
        <p className="mt-2 text-sm text-gray-700">Manage and monitor all registered gyms in the FitHub platform</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <StatCard
            title="Total Gyms"
            value={stats.totalGyms}
            icon="fas fa-dumbbell"
            bgColor="bg-indigo-100"
            textColor="text-indigo-600"
            percentage="12%"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon="fas fa-clock"
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
            percentage="8%"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers.toLocaleString()}
            icon="fas fa-users"
            bgColor="bg-green-100"
            textColor="text-green-600"
            percentage="24%"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon="fas fa-dollar-sign"
            bgColor="bg-purple-100"
            textColor="text-purple-600"
            percentage="18%"
          />
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <Link
            to="/gym/add"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Gym
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center py-4">{error}</div>
      ) : (
        <>
          <GymTable gyms={gyms} />
          {renderPagination()}
        </>
      )}
    </main>
  );
};

export default Gyms;