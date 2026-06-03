import React, { useState } from 'react';

const PostProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '',
    city: '',
    location: '',
    price: '',
    beds: '',
    baths: '',
    area: '',
    features: [],
    ownerName: '',
    ownerPhone: '',
    ownerEmail: ''
  });

  const featureOptions = [
    'Fully Furnished',
    'AC & Heater',
    'WiFi',
    'Parking',
    'Security',
    'Power Backup',
    'Elevator',
    'Gym'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeatureToggle = (feature) => {
    const newFeatures = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Property posted successfully! (This is a demo)');
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-200px)] pb-12">
      <header className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white py-12 mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Post Your Property</h1>
          <p className="mt-2 text-lg opacity-90">List your property and connect with thousands of potential tenants</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow">
            {/* Property Details */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Property Title *</label>
                  <input
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="text"
                    name="title"
                    placeholder="e.g., Spacious Room in DHA"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold mb-2 text-sm text-gray-700 block">Description *</label>
                <textarea
                  className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                  name="description"
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Property Type *</label>
                  <select
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="room">Room</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">City *</label>
                  <select
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select City</option>
                    <option value="karachi">Karachi</option>
                    <option value="lahore">Lahore</option>
                    <option value="islamabad">Islamabad</option>
                    <option value="rawalpindi">Rawalpindi</option>
                    <option value="faisalabad">Faisalabad</option>
                    <option value="multan">Multan</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold mb-2 text-sm text-gray-700 block">Complete Address *</label>
                <input
                  className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                  type="text"
                  name="location"
                  placeholder="e.g., DHA Phase 5, Street 12"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Monthly Rent (PKR) *</label>
                  <input
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="number"
                    name="price"
                    placeholder="25000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Area (sq ft) *</label>
                  <input
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="number"
                    name="area"
                    placeholder="150"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Bedrooms *</label>
                  <select
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    name="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-2 text-sm text-gray-700">Bathrooms *</label>
                  <select
                    className="border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    name="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {featureOptions.map((feature) => (
                  <label key={feature} className="flex items-center gap-3 p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">
                    <input
                      className="w-4 h-4"
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <span className="text-sm text-gray-800">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="font-semibold mb-2 text-sm text-gray-700 block">Your Name *</label>
                  <input
                    className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="text"
                    name="ownerName"
                    placeholder="Full Name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold mb-2 text-sm text-gray-700 block">Phone Number *</label>
                  <input
                    className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="tel"
                    name="ownerPhone"
                    placeholder="+92 300 1234567"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold mb-2 text-sm text-gray-700 block">Email Address *</label>
                  <input
                    className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500"
                    type="email"
                    name="ownerEmail"
                    placeholder="your@email.com"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transform hover:-translate-y-0.5 transition">
              Post Property
            </button>
          </form>

          <aside className="sticky top-24">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tips for a Great Listing</h3>
              <ul className="space-y-2">
                {[
                  'Use a clear and descriptive title',
                  'Provide detailed description',
                  'Be honest about the property condition',
                  'Include accurate pricing',
                  'Mention nearby facilities',
                  'Add high-quality photos (coming soon)',
                  'Respond quickly to inquiries'
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostProperty;
