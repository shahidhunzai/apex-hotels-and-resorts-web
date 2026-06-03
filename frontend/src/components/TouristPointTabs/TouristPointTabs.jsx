import React, { useMemo, useState } from 'react';
import './TouristPointTabs.css';
import ActivityGalleryCarousel from '../ActivityGalleryCarousel/ActivityGalleryCarousel';

const TouristPointTabs = ({
  destinationContent,
  infoTitle,
  infoDescription,
  infoBullets = [],
  roomsContent,
  activitiesContent,
  galleryTitle,
  galleryDescription,
  galleryImages = [],
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const hasCustomInfoLayout = React.isValidElement(infoDescription);
  const hasDestinationTab = React.isValidElement(destinationContent);

  const tabList = useMemo(() => {
    const tabs = [
      { key: 'info', label: 'Information' },
      { key: 'rooms', label: 'Rooms' },
      { key: 'activities', label: 'Activities' },
      { key: 'gallery', label: 'Gallery & Images' },
    ];

    if (hasDestinationTab) {
      tabs.push({ key: 'destination', label: 'Famous Places' });
    }

    return tabs;
  }, [hasDestinationTab]);

  return (
    <div className="tp-tabs-container">
      <div className="tp-tabs-bar">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={`tp-tab-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tp-tabs-content">
        {activeTab === 'destination' && (
          <div className="tp-info-tab">{destinationContent}</div>
        )}
        {activeTab === 'info' && (
          <div className="tp-info-tab">
            {hasCustomInfoLayout ? (
              infoDescription
            ) : (
              <>
                <h1 className="tp-info-title">{infoTitle}</h1>
                <p className="tp-info-desc">{infoDescription}</p>
                <ul className="tp-info-bullets">
                  {infoBullets.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="tp-rooms-tab">{roomsContent || <em>No room info yet.</em>}</div>
        )}
        {activeTab === 'activities' && (
          <div className="tp-activities-tab">
            {activitiesContent || <em>No activity info yet.</em>}
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="tp-gallery-tab">
            <ActivityGalleryCarousel
              slides={[{
                title: galleryTitle || 'GALLERY & IMAGES',
                description: galleryDescription || 'Browse the best views and moments from our property and surroundings.',
                images: galleryImages.filter(Boolean),
              }]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristPointTabs;
