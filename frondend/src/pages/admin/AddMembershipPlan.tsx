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
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a
              href="#"
              className="hover:text-indigo-600 transition-colors"
              onClick={() => navigate('/admin/membership-plans')}
            >
              Membership Plans
            </a>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Add New Plan</span>
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Membership Plan</h2>
            <form id="planForm" onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Plan Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Premium Plan 2025"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Plan Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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
                  <p id="type-error" className="mt-1 text-sm text-red-500">
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the benefits of this plan (max 500 characters)"
                  maxLength={500}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
                {errors.description && (
                  <p id="description-error" className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₹
                  </span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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
                  <p id="price-error" className="mt-1 text-sm text-red-500">
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Months)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.duration}
                  aria-describedby={errors.duration ? 'duration-error' : undefined}
                >
                  <option value="" disabled>Select duration</option>
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
                {errors.duration && (
                  <p id="duration-error" className="mt-1 text-sm text-red-500">
                    {errors.duration}
                  </p>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featureOptions.map((feature) => (
                    <div key={feature.value} className="flex items-center">
                      <input
                        id={feature.value}
                        type="checkbox"
                        name="features"
                        value={feature.value}
                        checked={formData.features.includes(feature.value)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        aria-describedby={`${feature.value}-description`}
                      />
                      <label htmlFor={feature.value} className="ml-2 text-sm text-gray-700">
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.features && (
                  <p id="features-error" className="mt-2 text-sm text-red-500">
                    {errors.features}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Plan Preview</h2>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {formData.name || formData.type}
            </h3>
            <p className="mt-2 text-sm text-gray-600">Type: {formData.type}</p>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              ₹{formData.price.toFixed(2)}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
            <p className="mt-3 text-sm text-gray-500">
              {formData.description || 'Access to premium facilities and services'}
            </p>
            <ul className="mt-4 space-y-2">
              {formData.features.length > 0 ? (
                formData.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {feature
                        .split('-')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                  </li>
                ))
              ) : (
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-500">No features selected</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/admin/membership-plans')}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="planForm"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Plan'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Plan Creation
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Plan: <span className="font-medium">{formData.name || formData.type}</span>
              </p>
              <p className="text-sm text-gray-600">Type: {formData.type}</p>
              <p className="text-sm text-gray-600">Price: ₹{formData.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Duration: {formData.duration} months</p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to create this plan?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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