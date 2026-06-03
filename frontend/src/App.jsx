import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Listings from './pages/Listings/Listings';
import PropertyDetail from './pages/PropertyDetail/PropertyDetail';
import PostProperty from './pages/PostProperty/PostProperty';
import Destinations from './pages/Destinations/Destinations';
import Contact from './pages/Contact/Contact';
import AdminCMS from './pages/Admin/AdminCMS';
import DynamicDestinationDetail from './pages/DestinationDetail/DynamicDestinationDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin route – no frontend Navbar/Footer */}
          <Route path="/admin/cms" element={<AdminCMS />} />

          {/* All other routes – wrapped with Navbar + Footer */}
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:destinationSlug/:pointSlug" element={<DynamicDestinationDetail />} />
                <Route path="/destinations/:destinationSlug" element={<DynamicDestinationDetail />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/post-property" element={<PostProperty />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
