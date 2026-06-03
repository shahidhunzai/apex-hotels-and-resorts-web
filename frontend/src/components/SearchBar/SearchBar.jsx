import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchData.city) params.append('city', searchData.city);
    if (searchData.propertyType) params.append('type', searchData.propertyType);
    if (searchData.minPrice) params.append('minPrice', searchData.minPrice);
    if (searchData.maxPrice) params.append('maxPrice', searchData.maxPrice);

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-field">
          <select 
            name="city" 
            value={searchData.city} 
            onChange={handleChange}
            className="search-input"
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

        <div className="search-field">
          <select 
            name="propertyType" 
            value={searchData.propertyType} 
            onChange={handleChange}
            className="search-input"
          >
            <option value="">Property Type</option>
            <option value="room">Room</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
          </select>
        </div>

        <div className="search-field">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price (PKR)"
            value={searchData.minPrice}
            onChange={handleChange}
            className="search-input"
          />
        </div>

        <div className="search-field">
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price (PKR)"
            value={searchData.maxPrice}
            onChange={handleChange}
            className="search-input"
          />
        </div>

        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
