// src/features/admin/pages/DashboardView.tsx
import React, { useRef } from "react";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import StatCard from "../../components/feature/admin/StatCard";
import ActivityCard from "../../components/feature/admin/ActivityCard";

const DashboardView: React.FC = () => {
  const chartRef = useRef(null);
  const stats = [
    { title: "Total Users", value: "24,892", icon: "fa-users", percentage: "12.5%", color: "text-indigo-600" },
    { title: "Total Revenue", value: "$128,950", icon: "fa-dollar-sign", percentage: "8.2%", color: "text-indigo-600" },
    { title: "Active Trainers", value: "1,234", icon: "fa-dumbbell", percentage: "5.3%", color: "text-indigo-600" },
    { title: "Active Gyms", value: "456", icon: "fa-building", percentage: "3.8%", color: "text-indigo-600" },
  ];

  const activities = [
    { icon: "fa-user-plus", title: "New User Registration", desc: "John Smith joined the platform", time: "2 minutes ago", color: "bg-green-100 text-green-600" },
    { icon: "fa-dumbbell", title: "New Trainer Application", desc: "Sarah Johnson submitted application", time: "15 minutes ago", color: "bg-blue-100 text-blue-600" },
    { icon: "fa-dollar-sign", title: "New Subscription", desc: "Premium plan purchased", time: "1 hour ago", color: "bg-purple-100 text-purple-600" },
    { icon: "fa-star", title: "New Review", desc: "5-star rating received", time: "2 hours ago", color: "bg-yellow-100 text-yellow-600" },
  ];

  const revenueOption: EChartsOption = {
    animation: false,
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
    yAxis: { type: "value" },
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        data: [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000],
        itemStyle: { color: "#4F46E5" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{ offset: 0, color: "rgba(79, 70, 229, 0.3)" }, { offset: 1, color: "rgba(79, 70, 229, 0.1)" }],
          },
        },
      },
    ],
  };

  const userGrowthOption: EChartsOption = {
    animation: false,
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    yAxis: { type: "value" },
    series: [{ data: [150, 230, 224, 218, 135, 147, 260], type: "bar", itemStyle: { color: "#4F46E5" } }],
  };

  const subscriptionOption: EChartsOption = {
    animation: false,
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [{ value: 435, name: "Monthly" }, { value: 310, name: "Yearly" }, { value: 234, name: "Quarterly" }],
        itemStyle: { color: (params: { dataIndex: number }) => ["#4F46E5", "#818CF8", "#C7D2FE"][params.dataIndex] },
      },
    ],
  };

  return (
    <main className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md">Week</button>
              <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md">Month</button>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md">Year</button>
            </div>
          </div>
          <ReactECharts ref={chartRef} option={revenueOption} style={{ height: "320px" }} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <ActivityCard key={index} {...activity} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">User Growth</h3>
          <ReactECharts ref={chartRef} option={userGrowthOption} style={{ height: "256px" }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Subscription Distribution</h3>
          <ReactECharts ref={chartRef} option={subscriptionOption} style={{ height: "256px" }} />
        </div>
      </div>
    </main>
  );
};

export default DashboardView;