
// src/presentation/features/admin/components/UserTable.tsx
import React from "react";
import { User } from "../../../../domain/entities/admin/User";
import { AdminRepository } from "../../../../infra/api/adminApi";
import { ToggleUserVerificationUseCase } from "../../../../app/useCases/admin/toggleUserVerification";
import { toast } from "react-toastify";

const adminRepository = new AdminRepository();
const toggleUserVerificationUseCase = new ToggleUserVerificationUseCase(adminRepository);

interface UserTableProps {
  users: User[];
  onUserUpdate: (updatedUser: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUserUpdate }) => {
  const getMembershipStyle = (membership: string | undefined) => {
    const value = membership || "None";
    switch (value) {
      case "Premium":
        return "bg-blue-100 text-blue-800";
      case "Elite":
        return "bg-purple-100 text-purple-800";
      case "Basic":
        return "bg-gray-100 text-gray-800";
      case "Diamond":
        return "bg-yellow-100 text-yellow-800";
      case "None":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerifiedStyle = (isVerified: boolean) => {
    return isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleToggleVerification = async (id: string) => {
    try {
      const updatedUser = await toggleUserVerificationUseCase.execute(id);
      console.log("Updated user from backend:", updatedUser);
      onUserUpdate(updatedUser);
      toast.success(updatedUser.isVerified ? "User verified" : "User unverified");
    } catch (error) {
      console.error("Failed to toggle user verification:", error);
      toast.error("Failed to toggle verification status", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const defaultProfilePic = "/images/user.jpg";

  return (
    <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user.email || index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profilePic ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`${backendUrl}${user.profilePic}`}
                          alt={user.name || "User"}
                        />
                      ) : (
                        <img className="h-10 w-10 rounded-full" src={defaultProfilePic} alt="Default" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMembershipStyle(
                      user.membership
                    )}`}
                  >
                    {user.membership || "None"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerifiedStyle(user.isVerified || false)}`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="rounded text-indigo-600 hover:text-indigo-700 mr-2">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="rounded text-green-600 hover:text-green-700 mr-2">
                    <i className="fas fa-check"></i>
                  </button>
                  <button
                    onClick={() => handleToggleVerification(user.id)}
                    className={`rounded mr-2 ${
                      user.isVerified ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    <i className={user.isVerified ? "fas fa-ban" : "fas fa-unlock"}></i>
                  </button>
                  <button className="rounded text-gray-600 hover:text-gray-700">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
