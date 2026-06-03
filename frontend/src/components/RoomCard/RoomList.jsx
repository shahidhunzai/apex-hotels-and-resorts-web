import React from 'react';
import RoomCard from './RoomCard';
import './RoomList.css';

const RoomList = ({ rooms }) => (
  <div className="room-list-grid">
    {rooms.map((room, idx) => (
      <RoomCard key={idx} {...room} />
    ))}
  </div>
);

export default RoomList;
