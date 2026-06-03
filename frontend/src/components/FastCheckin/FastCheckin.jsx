import React from "react";
import "./FastCheckin.css";

const FastCheckin = () => (
  <section id="mobile-apps">
    <div className="fastcheckin-main-container">
      <div className="fastcheckin-main-row">
        <div className="fastcheckin-row-2">
          <div className="fast-img-div-img-3">
            <img
              alt="Fast Check In"
              loading="lazy"
              src="https://assets.roomy.pk/images/locations_5/homepage/fast_check_in_desktop_2.png"
              style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
            />
          </div>
          <div className="fast-content-row">
            <h1>FAST CHECK IN APP</h1>
            <p>A three-step feature for a contactless and hassle-free check-in process.</p>
            <p>Download Our App &amp; Book A Room Now!</p>
            <div className="fast-img-div">
              <div className="fast-img-div-img-1">
                <a href="https://play.google.com/store/apps/details?id=pk.roomy.app" target="_blank" rel="noopener noreferrer">
                  <img
                    alt="Google Play"
                    loading="lazy"
                    src="https://assets.roomy.pk/images/locations_5/homepage/google_play_desktop.jpg"
                    style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
                  />
                </a>
              </div>
              <div className="fast-img-div-img-2">
                <a href="https://apps.apple.com/us/app/roomy-pk-hotels/id1463746734?mt=8" target="_blank" rel="noopener noreferrer">
                  <img
                    alt="App Store"
                    loading="lazy"
                    src="https://assets.roomy.pk/images/locations_5/homepage/app_store_desktop.jpg"
                    style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
                  />
                </a>
              </div>
            </div>
            <div className="fast-checkin-bot-arrow">
              <img
                alt="Arrow"
                src="https://assets.roomy.pk/images/locations_5/homepage/fast_checkin_bot_arrow.png"
                loading="lazy"
                style={{ opacity: 1, transition: "opacity 1s ease-in-out", willChange: "opacity", userSelect: "none", WebkitUserDrag: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FastCheckin;
