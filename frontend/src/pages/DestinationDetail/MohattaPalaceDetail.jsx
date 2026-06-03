import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600',
];

const MohattaPalaceDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Mohatta Palace, Karachi"
      infoDescription="A museum housed in a beautiful palace built in 1927."
      infoBullets={['Museum', 'Historic palace', 'Art exhibits']}
      roomsContent={<p>No rooms available at the palace, but many hotels nearby.</p>}
      activitiesContent={<ul><li>Guided tours</li><li>Art exhibits</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default MohattaPalaceDetail;
