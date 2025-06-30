/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTrainerDetails,toggleUserVerification as approveTrainer} from "../../services/api/adminApi";



const TrainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await getTrainerDetails(id!);
        setTrainer(response.trainer);
      } catch (error) {
        console.log(error);
        
        toast.error("Failed to load trainer details");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainer();
  }, [id]);

  const handleApprove = async () => {
    try {
      await approveTrainer(id!);
      toast.success("Trainer approved successfully!");
      navigate("/admin/trainers");
    } catch (error) {
      console.log(error);
      
      toast.error("Failed to approve trainer");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!trainer) return <div>Trainer not found</div>;

  return (
    <main className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trainer Details</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <img
            src={trainer.profilePic ? `${backendUrl}${trainer.profilePic}` : "/images/user.jpg"}
            alt={trainer.name}
            className="h-20 w-20 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="text-xl font-semibold">{trainer.name}</h3>
            <p className="text-gray-600">{trainer.email}</p>
            <p className={`text-sm ${trainer.verifiedByAdmin ? "text-green-600" : "text-yellow-600"}`}>
              {trainer.verifiedByAdmin ? "Approved" : "Pending Approval"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium">Bio</h4>
            <p>{trainer.bio || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium">Specialties</h4>
            <p>{trainer.specialties.join(", ") || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium">Experience Level</h4>
            <p>{trainer.experienceLevel || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium">Certifications</h4>
            {trainer.certifications.length > 0 ? (
              <ul>
                {trainer.certifications.map((cert: any, index: number) => (
                  <li key={index}>
                    {cert.name} ({cert.issuer}) -{" "}
                    <a href={`${backendUrl}${cert.filePath}`} target="_blank" className="text-indigo-600">
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
        </div>
        {!trainer.verifiedByAdmin && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve Trainer
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default TrainerDetails;