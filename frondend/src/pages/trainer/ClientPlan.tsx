import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import { fetchClientPlan } from '../../services/api/trainerApi';
import type { IClientPlan } from '../../types/dtos/IClientPlanDTO';

const ClientPlan: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const [clientPlan, setClientPlan] = useState<IClientPlan | null>(null);

  useEffect(() => {
    const loadClientPlan = async () => {
      try {
        const response = await fetchClientPlan(clientId!);
        setClientPlan(response);
      } catch (error) {
        console.error('Error fetching client plan:', error);
      }
    };
    loadClientPlan();
  }, [clientId]);

  useEffect(() => {
    if (chartRef.current && clientPlan) {
      const chart = echarts.init(chartRef.current);
      const option = {
        animation: false,
        tooltip: { trigger: 'axis' },
        legend: { data: ['Weight', 'Strength'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Weight',
            type: 'line',
            data: [150, 148, 146, 144],
            smooth: true,
            lineStyle: { color: '#4F46E5' },
            itemStyle: { color: '#4F46E5' },
          },
          {
            name: 'Strength',
            type: 'line',
            data: [100, 105, 110, 115],
            smooth: true,
            lineStyle: { color: '#10B981' },
            itemStyle: { color: '#10B981' },
          },
        ],
      };
      chart.setOption(option);
      window.addEventListener('resize', () => chart.resize());
      return () => {
        chart.dispose();
        window.removeEventListener('resize', () => chart.resize());
      };
    }
  }, [clientPlan]);

  if (!clientPlan) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
   

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{clientPlan.name}'s Plan</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    <i className="fas fa-calendar-alt mr-2"></i>Started: {clientPlan.startDate}
                  </span>
                  <span>
                    <i className="fas fa-bullseye mr-2"></i>Goal: {clientPlan.goal}
                  </span>
                </div>
              </div>
              <button className="!rounded-button bg-custom text-white px-4 py-2 flex items-center">
                <i className="fas fa-paper-plane mr-2"></i>Send Update
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Current Workout Plan</h3>
              <div className="space-y-4">
                {clientPlan.workouts.map((workout) => (
                  <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{workout.name}</h4>
                      <span className="text-sm text-custom">{workout.level}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sets</span>
                        <p>{workout.sets}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reps</span>
                        <p>{workout.reps}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Rest</span>
                        <p>{workout.rest}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="!rounded-button mt-4 border border-custom text-custom px-4 py-2">
                <i className="fas fa-plus mr-2"></i>Add Exercise
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Diet Plan</h3>
              <div className="space-y-4">
                {clientPlan.diet.map((meal) => (
                  <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{meal.name}</h4>
                    <p className="text-sm text-gray-600">{meal.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="mr-3">{meal.calories} cal</span>
                      <span>Protein: {meal.protein}g</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="!rounded-button mt-4 border border-custom text-custom px-4 py-2">
                <i className="fas fa-edit mr-2"></i>Edit Diet Plan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="h-64" ref={chartRef}></div>
              </div>
              <div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Workout Completion</div>
                    <div className="text-2xl font-semibold">{clientPlan.workoutCompletion}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Diet Adherence</div>
                    <div className="text-2xl font-semibold">{clientPlan.dietAdherence}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPlan;