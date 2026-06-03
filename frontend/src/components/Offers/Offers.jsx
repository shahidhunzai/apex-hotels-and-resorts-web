import React from "react";
import "./Offers.css";

const Offers = () => (
  <div id="offers">
    <div className="offers-main-container">
      <div className="offers-main-row">
        <div className="offers-row-2">
          <div className="offers-content">
            <h1>See the</h1>
            <h1>offers &amp; deals </h1>
            <p>Hurry up! Book your room now &amp; unlock new memories with us.</p>
            <img
              alt="Offers"
              loading="lazy"
              src="https://assets.roomy.pk/images/locations_5/homepage/offers_img_2.png"
              style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
            />
            <h2>hot</h2>
          </div>
          <div className="offers-img-2">
            <img
              alt="Arrow"
              loading="lazy"
              src="https://assets.roomy.pk/images/locations_5/homepage/offers_arrow.png"
              style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
            />
          </div>
          <div className="offer-bank-div">
            <div className="offers-bank-box" style={{ marginLeft: 0, cursor: "pointer" }}>
              <img
                alt="Ramazan Deal"
                loading="lazy"
                src="https://assets.roomy.pk/images/locations_5/promos/ramadan_deals_2026/offers.png"
                style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
              />
              <h1>Ramazan Deal</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Offers;
