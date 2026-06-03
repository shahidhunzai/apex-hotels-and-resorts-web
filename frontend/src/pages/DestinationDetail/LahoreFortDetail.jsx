import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600',
];

const LahoreFortDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Lahore Fort, Lahore"
      infoDescription="A UNESCO World Heritage site with rich history and architecture."
      infoBullets={['UNESCO site', 'Mughal history', 'Architectural marvel']}
      roomsContent={<p>No rooms available at the fort, but many hotels nearby.</p>}
      activitiesContent={<ul><li>Guided tours</li><li>Photography</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default LahoreFortDetail;
