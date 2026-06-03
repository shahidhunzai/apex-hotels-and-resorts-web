import React from 'react';
import TouristPointTabs from '../../components/TouristPointTabs/TouristPointTabs';
import './DestinationDetail.css';

const gallery = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600',
];

const CliftonBeachDetail = () => (
  <div className="destination-detail-container">
    <TouristPointTabs
      infoTitle="Clifton Beach, Karachi"
      infoDescription="A popular beach destination for locals and tourists."
      infoBullets={['Beach', 'Family spot', 'Horse riding']}
      roomsContent={<p>Many hotels and guest houses are available near Clifton Beach.</p>}
      activitiesContent={<ul><li>Beach walks</li><li>Horse riding</li><li>Photography</li></ul>}
      galleryImages={gallery}
    />
  </div>
);

export default CliftonBeachDetail;
