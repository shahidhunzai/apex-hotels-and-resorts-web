import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600',
];

const ShalimarGardensDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Shalimar Gardens, Lahore"
      infoDescription="A beautiful Mughal garden with fountains and terraces."
      infoBullets={['Mughal garden', 'Fountains', 'Terraces']}
      roomsContent={<p>No rooms available in the gardens, but many hotels nearby.</p>}
      activitiesContent={<ul><li>Garden walks</li><li>Photography</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default ShalimarGardensDetail;
