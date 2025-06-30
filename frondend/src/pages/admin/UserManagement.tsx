
// src/presentation/features/admin/pages/UserManagement.tsx
import React, { useState, useEffect } from "react";

import type { User } from "../../types/user.types";
import { getUsers } from "../../services/api/adminApi";
import UserTable from "../../components/feature/admin/UserTable";



const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState("");
  const limit = 3;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { users: fetchedUsers, totalPages: fetchedTotalPages } = await getUsers(
          page,
          limit,
          search || undefined,
          membershipFilter || undefined,
          isVerifiedFilter || undefined
        );
        setUsers(fetchedUsers);
        setTotalPages(fetchedTotalPages);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [page, search, membershipFilter, isVerifiedFilter]);

  const handleUserUpdate = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? { ...updatedUser } : user))
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleMembershipFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMembershipFilter(e.target.value);
    setPage(1);
  };

  const handleIsVerifiedFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsVerifiedFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const renderPagination = () => {
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
  };

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-700">Manage and monitor all registered users in the FitHub platform</p>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={handleSearchChange}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={membershipFilter}
          onChange={handleMembershipFilterChange}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Memberships</option>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Elite">Elite</option>
          <option value="Diamond">Diamond</option>
          <option value="None">None</option>
        </select>
        <select
          value={isVerifiedFilter}
          onChange={handleIsVerifiedFilterChange}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <UserTable users={users} onUserUpdate={handleUserUpdate} />
          {renderPagination()}
        </>
      )}
    </main>
  );
};

export default UserManagement;
