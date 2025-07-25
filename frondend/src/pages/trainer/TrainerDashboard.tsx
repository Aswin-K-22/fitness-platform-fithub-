// src/presentation/features/trainer/pages/TrainerDashboard.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import StatCard from "../../components/common/trainer/StatCard";
import NotificationCard from "../../components/common/trainer/NotificationCard";
//import ChatCard from "../components/ChatCard";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { ITrainerDashboardResponseDTO } from "../../types/dtos/ITrainerDashboardResponseDTO";
import { getTrainerDashboardData } from "../../services/api/trainerApi";
import type { RootState } from "../../store/store";
import DashboardChatCard from "../../components/common/trainer/DashboardChatCard";
import DashboardSessionCard from "../../components/common/trainer/DashboardSessionCard";



const TrainerDashboard: React.FC = () => {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const [dashboardData, setDashboardData] = useState<ITrainerDashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
 // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getTrainerDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <svg
          className="animate-spin h-8 w-8 mx-auto text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          ></path>
        </svg>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if ( !dashboardData) {
    return (
      <div className="text-center py-10 text-red-600">
        { "Failed to load dashboard data"}
      </div>
    );
  }

  const chartOption: EChartsOption = {
    animation: false,
    tooltip: { trigger: "axis" },
    legend: { data: ["Sessions", "Revenue"] },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: dashboardData.performance.days },
    yAxis: { type: "value" },
    series: [
      {
        name: "Sessions",
        type: "line",
        data: dashboardData.performance.sessions,
        smooth: true,
        lineStyle: { color: "#4F46E5" },
        itemStyle: { color: "#4F46E5" },
      },
      {
        name: "Revenue",
        type: "line",
        data: dashboardData.performance.revenue,
        smooth: true,
        lineStyle: { color: "#10B981" },
        itemStyle: { color: "#10B981" },
      },
    ],
  };

  console.log('{trainer.profilePic}=',trainer?.profilePic);
  console.log(`import.meta.env.VITE_API_BASE_URL-trainer.profilePic = ${import.meta.env.VITE_API_BASE_URL}${trainer?.profilePic}`);
  
  

  return (
    <div className="bg-gray-50 min-h-screen font-[Inter]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center">
              <img
                className="h-20 w-20 rounded-full object-cover mr-6"
               src={trainer?.profilePic || "/images/trainer.png"}
                alt="Trainer"
                onError={(e) => (e.currentTarget.src = "/images/user.jpg")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {trainer?.name || "Trainer"}
                </h1>
                <p className="text-gray-500">Personal Trainer | Fitness Specialist</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-8">
            <StatCard icon="fa-calendar-day" title="Today's Sessions" value={dashboardData.stats.todaysSessions} />
            <StatCard icon="fa-users" title="Active Clients" value={dashboardData.stats.activeClients} />
            <StatCard icon="fa-dollar-sign" title="Monthly Earnings" value={dashboardData.stats.monthlyEarnings} />
            <StatCard icon="fa-star" title="Average Rating" value={dashboardData.stats.averageRating} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center">
                    <i className="fas fa-plus mr-2"></i> Add Session
                  </button>
                </div>
                <div className="space-y-4">
                  {dashboardData.sessions.length > 0 ? (
                    dashboardData.sessions.map((session, index) => (
                      <DashboardSessionCard key={index} {...session} />
                    ))
                  ) : (
                    <p className="text-gray-500">No upcoming sessions</p>
                  )}
                </div>
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                    <button className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {[1, 2, 3].map((page) => (
                      <button
                        key={page}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        {page}
                      </button>
                    ))}
                    <button className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Analytics</h2>
                <ReactECharts option={chartOption} style={{ height: "300px" }} />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Notifications</h2>
                <div className="space-y-4">
                  {dashboardData.notifications.length > 0 ? (
                    dashboardData.notifications.map((notification, index) => (
                      <NotificationCard key={index} {...notification} />
                    ))
                  ) : (
                    <p className="text-gray-500">No notifications</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Chat</h2>
                <div className="space-y-4">
                  {dashboardData.chats.length > 0 ? (
                    dashboardData.chats.map((chat, index) => (
                      <DashboardChatCard key={index} {...chat} />
                    ))
                  ) : (
                    <p className="text-gray-500">No chats available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default TrainerDashboard;