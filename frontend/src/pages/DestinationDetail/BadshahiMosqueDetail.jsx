import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
];

const BadshahiMosqueDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Badshahi Mosque, Lahore"
      infoDescription="One of the largest mosques in the world, built in the Mughal era."
      infoBullets={['Mughal architecture', 'Historic landmark', 'Tourist attraction']}
      roomsContent={<p>No rooms available at the mosque, but many hotels nearby.</p>}
      activitiesContent={<ul><li>Guided tours</li><li>Photography</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default BadshahiMosqueDetail;
