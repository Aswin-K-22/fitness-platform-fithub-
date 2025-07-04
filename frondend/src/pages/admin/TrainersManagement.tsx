
// src/presentation/features/admin/pages/TrainerManagement.tsx
import React, { useState, useEffect } from "react";
//import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { type Trainer } from "../../types/trainer.type";
import { approveTrainer, getTrainers,  } from "../../services/api/adminApi";
import StatCard from "../../components/feature/admin/StatCard";




const TrainerManagement: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [stats, setStats] = useState({
    totalTrainers: 0,
    pendingApproval: 0,
    activeTrainers: 0,
    suspended: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const limit = 3;
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const defaultProfilePic = "/images/user.jpg";

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const response = await getTrainers(
          page,
          limit,
          searchQuery || undefined,
          statusFilter || undefined,
          specializationFilter || undefined
        );
        setTrainers(response.trainers);
        setStats(response.stats);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (error) {
        console.error("Trainer management admin side error: ", error);
        setError("Failed to load trainers");
        setStats(staticStats);
        setTotalPages(1);
        toast.error("Failed to load trainers");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, [page, searchQuery, statusFilter, specializationFilter]);

  const staticStats = {
    totalTrainers: 248,
    pendingApproval: 12,
    activeTrainers: 189,
    suspended: 0,
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSpecializationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecializationFilter(e.target.value);
    setPage(1);
  };

  const handleToggleApproval = async (trainerId: string, currentStatus: boolean) => {
    try {
      await approveTrainer(trainerId);
      toast.success(`Trainer ${currentStatus ? "unapproved" : "approved"} successfully!`);
      const response = await getTrainers(
        page,
        limit,
        searchQuery || undefined,
        statusFilter || undefined,
        specializationFilter || undefined
      );
      setTrainers(response.trainers);
      setStats(response.stats);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error toggling trainer approval:", error);
      toast.error(`Failed to ${currentStatus ? "unapprove" : "approve"} trainer`);
    }
  };

  const openModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrainer(null);
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
          onClick={() => setPage(i)}
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
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
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
              onClick={() => setPage(totalPages)}
              className="mx-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4">{error} (Showing fallback data)</div>;

  return (
    <main className="max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Trainer Management</h1>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <StatCard
            title="Total Trainers"
            value={stats.totalTrainers}
            icon="fas fa-users"
            bgColor="bg-custom bg-opacity-10"
            textColor="text-custom"
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            icon="fas fa-clock"
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
          <StatCard
            title="Active Trainers"
            value={stats.activeTrainers}
            icon="fas fa-check-circle"
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          <StatCard
            title="Suspended"
            value={stats.suspended}
            icon="fas fa-ban"
            bgColor="bg-red-100"
            textColor="text-red-600"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <input
              type="text"
              placeholder="Search by name "
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
            <select
              value={specializationFilter}
              onChange={handleSpecializationFilterChange}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Specializations</option>
              <option value="Cardio">Cardio</option>
              <option value="Pilates">Pilates</option>
              <option value="Strength">Strength</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={trainer.profilePic ? `${backendUrl}${trainer.profilePic}` : defaultProfilePic}
                          alt={trainer.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{trainer.name}</div>
                        <div className="text-sm text-gray-500">{trainer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trainer.specialties?.join(", ") || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trainer.experienceLevel || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trainer.verifiedByAdmin ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {trainer.verifiedByAdmin ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* <Link to={`/admin/trainers/${trainer.id}`} className="text-indigo-600 hover:text-indigo-900">
                        <i className="fas fa-eye"></i> View
                      </Link> */}
                      <button
                        onClick={() => openModal(trainer)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                       <i className="fas fa-eye"></i> View
                      </button>
                      <button
                        onClick={() => handleToggleApproval(trainer.id, trainer.verifiedByAdmin)}
                        className={`${
                          trainer.verifiedByAdmin ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        <i className={`fas ${trainer.verifiedByAdmin ? "fa-times" : "fa-check"}`}></i>
                        {trainer.verifiedByAdmin ? " Unapprove" : " Approve"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {isModalOpen && selectedTrainer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex items-start justify-between p-4 border-b border-gray-200 rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">Trainer Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full text-sm p-1.5 border border-gray-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="flex space-x-4 mb-6">
                <img
                  src={selectedTrainer.profilePic ? `${backendUrl}${selectedTrainer.profilePic}` : defaultProfilePic}
                  alt={selectedTrainer.name}
                  className="w-1/2 h-48 object-cover rounded-lg"
                />
                <div className="w-1/2 space-y-4">
                  <h4 className="font-semibold text-lg">{selectedTrainer.name}</h4>
                  <p className="text-gray-600">{selectedTrainer.bio || "No bio available"}</p>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-envelope text-indigo-600"></i>
                    <span className="text-gray-600">{selectedTrainer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-graduation-cap text-indigo-600"></i>
                    <span className="text-gray-600">{selectedTrainer.experienceLevel || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h5 className="font-semibold mb-4">Specialties</h5>
                <div className="grid grid-cols-3 gap-4">
                  {selectedTrainer.specialties?.length ? (
                    selectedTrainer.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <i className="fas fa-dumbbell text-indigo-600"></i>
                        <span>{specialty}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No specialties listed</span>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h5 className="font-semibold mb-4">Certifications</h5>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTrainer.certifications?.length ? (
                    selectedTrainer.certifications.map((cert, index) => (
                      <div key={index} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-certificate text-indigo-600"></i>
                          <span>{cert.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">Issuer: {cert.issuer}</span>
                        <span className="text-sm text-gray-500">
                          Earned: {new Date(cert.dateEarned).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No certifications listed</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b">
              <button
                onClick={closeModal}
                className="text-gray-500 bg-white hover:bg-gray-100 rounded-md border border-gray-300 text-sm font-medium px-5 py-2.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TrainerManagement;
