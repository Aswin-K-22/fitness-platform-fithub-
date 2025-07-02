import React, { useState, useCallback } from "react";
import type { Gym } from "../../../types/gym.types";

interface GymTableProps {
  gyms: Gym[];
}

const GymTable: React.FC<GymTableProps> = ({ gyms }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const openModal = useCallback((gym: Gym) => {
    setSelectedGym(gym);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedGym(null);
  }, []);

  return (
    <>
      <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gyms.map((gym, index) => (
                <tr key={gym.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={`${backendUrl}${gym.images[0]?.url || "/default-gym.jpg"}`}
                          alt={gym.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                        <div className="text-sm text-gray-500">{gym.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{gym.address?.city || "N/A"}</div>
                    <div className="text-sm text-gray-500">{gym.address?.state || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{gym.contact?.phone || "N/A"}</div>
                    <div className="text-sm text-gray-500">{gym.contact?.email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{gym.ratings?.average || "N/A"}</span>
                      <div className="ml-2 flex text-yellow-400">
                        {gym.ratings?.average
                          ? Array(Math.floor(gym.ratings.average)).fill(<i className="fas fa-star"></i>)
                          : null}
                        {gym.ratings?.average && gym.ratings.average % 1 !== 0 ? (
                          <i className="fas fa-star-half-alt"></i>
                        ) : null}
                        {gym.ratings?.average
                          ? Array(5 - Math.ceil(gym.ratings.average)).fill(<i className="far fa-star"></i>)
                          : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-gray-600 hover:text-gray-700" onClick={() => openModal(gym)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <i className="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedGym && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex items-start justify-between p-4 border-b border-gray-200 rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">Gym Details</h3>
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
                  src={`${backendUrl}${selectedGym.images[0]?.url || "/default-gym.jpg"}`}
                  alt={selectedGym.name}
                  className="w-1/2 h-48 object-cover rounded-lg"
                />
                <div className="w-1/2 space-y-4">
                  <h4 className="font-semibold text-lg">{selectedGym.name}</h4>
                  <p className="text-gray-600">{selectedGym.description}</p>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-map-marker-alt text-indigo-600"></i>
                    <span className="text-gray-600">{`${selectedGym.address?.city || "N/A"}, ${
                      selectedGym.address?.state || "N/A"
                    }`}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-phone text-indigo-600"></i>
                    <span className="text-gray-600">{selectedGym.contact?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h5 className="font-semibold mb-4">Facilities</h5>
                <div className="grid grid-cols-3 gap-4">
                  {selectedGym.facilities?.hasPool && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-swimming-pool text-indigo-600"></i>
                      <span>Swimming Pool</span>
                    </div>
                  )}
                  {selectedGym.facilities?.hasSauna && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-hot-tub text-indigo-600"></i>
                      <span>Sauna</span>
                    </div>
                  )}
                  {selectedGym.facilities?.hasParking && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-parking text-indigo-600"></i>
                      <span>Parking</span>
                    </div>
                  )}
                  {selectedGym.facilities?.hasLockerRooms && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-lock text-indigo-600"></i>
                      <span>Locker Rooms</span>
                    </div>
                  )}
                  {selectedGym.facilities?.hasWifi && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-wifi text-indigo-600"></i>
                      <span>Wifi</span>
                    </div>
                  )}
                  {selectedGym.facilities?.hasShowers && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-shower text-indigo-600"></i>
                      <span>Showers</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b">
              <button className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md text-sm px-5 py-2.5 mr-2">
                Save Changes
              </button>
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
    </>
  );
};

export default React.memo(GymTable);