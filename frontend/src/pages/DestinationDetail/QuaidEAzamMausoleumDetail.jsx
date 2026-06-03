import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
];

const QuaidEAzamMausoleumDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Quaid-e-Azam Mausoleum, Karachi"
      infoDescription="The resting place of Pakistan’s founder, Muhammad Ali Jinnah."
      infoBullets={['National monument', 'Historic site', 'Tourist attraction']}
      roomsContent={<p>No rooms available at the mausoleum, but many hotels nearby.</p>}
      activitiesContent={<ul><li>Guided tours</li><li>Photography</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default QuaidEAzamMausoleumDetail;
