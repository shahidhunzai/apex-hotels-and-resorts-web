import React from "react";
import "./ContactUs.css";


const ContactUs = () => (
  <section id="contact-us">
    <div className="contactus-main-container contactus-flex-row">
      <div className="contactus-form-card-only">
        <h2 className="contactus-form-title">CONTACT US</h2>
        <form className="contactus-form">
          <div className="contactus-form-row contactus-form-row-2col">
            <div className="contactus-form-group">
              <input type="text" id="formName" className="contactus-input" placeholder="Name" />
            </div>
            <div className="contactus-form-group">
              <input type="email" id="formEmail" className="contactus-input" placeholder="Email" />
            </div>
          </div>
          <div className="contactus-form-row contactus-form-row-2col">
            <div className="contactus-form-group">
              <input type="tel" id="formPhone" className="contactus-input" placeholder="Phone" />
            </div>
            <div className="contactus-form-group">
              <textarea id="formMessage" className="contactus-input" rows={3} placeholder="Message"></textarea>
            </div>
          </div>
          <div className="contactus-form-row">
            <button type="submit" className="contactus-submit-btn">Send Message</button>
          </div>
        </form>
        <div className="contactus-blue-bar-row" />
      </div>
    </div>
  </section>
);

export default ContactUs;
