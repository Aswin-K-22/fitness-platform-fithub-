/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { IAddMembershipPlanRequestDTO } from '../../types/dtos/IAddMembershipPlanRequestDTO';
import { addMembershipPlan } from '../../services/api/adminApi';

const AddMembershipPlan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IAddMembershipPlanRequestDTO>({
    name: '',
    type: 'Basic',
    description: '',
    price: 0,
    duration: '',
    features: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IAddMembershipPlanRequestDTO, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        type: value as 'Basic' | 'Premium' | 'Diamond',
      }));
    } else if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        name: value,
      }));
    } else if (name === 'description') {
      const sanitizedValue = value.replace(/<[^>]*>/g, '');
      setFormData((prev) => ({
        ...prev,
        description: sanitizedValue.slice(0, 500),
      }));
    } else if (name === 'price') {
      const parsedValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        price: isNaN(parsedValue) ? 0 : Math.min(parsedValue, 100000),
      }));
    } else if (name === 'duration') {
      setFormData((prev) => ({
        ...prev,
        duration: value, 
      })); 
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, value].slice(0, 10)
        : prev.features.filter((feature) => feature !== value),
    }));
    setErrors((prev) => ({ ...prev, features: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IAddMembershipPlanRequestDTO, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }
    if (!['Basic', 'Premium', 'Diamond'].includes(formData.type)) {
      newErrors.type = 'Please select a valid plan type (Basic, Premium, or Diamond)';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    if (isNaN(formData.price) || formData.price <= 0 || formData.price > 100000) {
      newErrors.price = 'Price must be between ₹0.01 and ₹100,000';
    }
    if (!formData.duration || !['1', '3', '6', '12'].includes(formData.duration)) {
      newErrors.duration = 'Please select a valid duration (1, 3, 6, or 12 months)';
    }
    if (formData.features.length === 0) {
      newErrors.features = 'At least one feature must be selected';
    }
    const validFeatures = featureOptions.map((f) => f.value);
    if (!formData.features.every((feature) => validFeatures.includes(feature))) {
      newErrors.features = 'Invalid features selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      console.log('Submitting membership plan with payload:', formData);
      await addMembershipPlan(formData);
      toast.success('Membership plan created successfully!', { position: 'top-right' });
      navigate('/admin/membership-plans');
    } catch (error: any) {
      console.error('Error creating membership plan:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        errorMessage: error.response?.data?.message || 'Unknown error',
      });
      toast.error(error.response?.data?.message || 'Failed to create membership plan');
    } finally {
      setLoading(false);
    }
  };

  const featureOptions = [
    { value: '24/7-access', label: '24/7 Access' },
    { value: 'personal-trainer', label: 'Personal Trainer' },
    { value: 'group-classes', label: 'Group Classes' },
    { value: 'spa-access', label: 'Spa Access' },
  ];

  return (
    <div className="flex-grow py-6">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="#" className="text-gray-400 hover:text-gray-500" aria-label="Home">
                <i className="fas fa-home"></i>
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                <a
                  href="#"
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => navigate('/admin/subscriptions')}
                >
                  Membership Plans
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                <span className="ml-4 text-sm font-medium text-gray-500">Add New Plan</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Add New Membership Plan
                </h3>
                <form id="planForm" onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Custom Plan Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md focus:ring-indigo-600 focus:border-indigo-600 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Premium Plan 2025"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Plan Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md focus:ring-indigo-600 focus:border-indigo-600 ${
                        errors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.type}
                      aria-describedby={errors.type ? 'type-error' : undefined}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Premium">Premium</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                    {errors.type && (
                      <p id="type-error" className="mt-1 text-sm text-red-600">
                        {errors.type}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md focus:ring-indigo-600 focus:border-indigo-600 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe the benefits of this plan (max 500 characters)"
                      maxLength={500}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? 'description-error' : undefined}
                    />
                    {errors.description && (
                      <p id="description-error" className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full pl-7 border rounded-md focus:ring-indigo-600 focus:border-indigo-600 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        required
                        min="0.01"
                        max="100000"
                        step="0.01"
                        aria-required="true"
                        aria-invalid={!!errors.price}
                        aria-describedby={errors.price ? 'price-error' : undefined}
                      />
                    </div>
                    {errors.price && (
                      <p id="price-error" className="mt-1 text-sm text-red-600">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (Months)
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md focus:ring-indigo-600 focus:border-indigo-600 ${
                        errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.duration}
                      aria-describedby={errors.duration ? 'duration-error' : undefined}
                    >
                      <option value="">Select duration</option>
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                    {errors.duration && (
                      <p id="duration-error" className="mt-1 text-sm text-red-600">
                        {errors.duration}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <div className="mt-2 space-y-2">
                      {featureOptions.map((feature) => (
                        <div key={feature.value} className="flex items-start">
                          <input
                            id={feature.value}
                            type="checkbox"
                            name="features"
                            value={feature.value}
                            checked={formData.features.includes(feature.value)}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-600 rounded"
                            aria-describedby={`${feature.value}-description`}
                          />
                          <label htmlFor={feature.value} className="ml-3 text-sm text-gray-700">
                            {feature.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.features && (
                      <p id="features-error" className="mt-1 text-sm text-red-600">
                        {errors.features}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="mt-5 md:mt-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Preview</h3>
                <div className="border rounded-lg p-4">
                  <h4 className="text-xl font-semibold text-gray-900">{formData.name || formData.type}</h4>
                  <p className="mt-2 text-sm text-gray-600">Type: {formData.type}</p>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">
                    ₹{formData.price.toFixed(2)}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </p>
                  <p className="mt-4 text-gray-500">
                    {formData.description || 'Access to premium facilities and services'}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {formData.features.length > 0 ? (
                      formData.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                          <span className="ml-3 text-gray-700">
                            {feature
                              .split('-')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                        <span className="ml-3 text-gray-700">No features selected</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/subscriptions')}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="planForm"
            disabled={loading}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 id="confirm-modal-title" className="text-lg font-medium text-gray-900 mb-4">
              Confirm Plan Creation
            </h3>
            <p className="text-gray-600 mb-2">
              Plan: <span className="font-semibold">{formData.name || formData.type}</span>
            </p>
            <p className="text-gray-600 mb-2">Type: {formData.type}</p>
            <p className="text-gray-600 mb-2">Price: ₹{formData.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-2">Duration: {formData.duration} months</p>
            <p className="text-gray-600 mb-6">
              Are you sure you want to create this plan?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMembershipPlan;