import React, { useState } from 'react';
import './ContactSection.css';
import { getApiUrl } from '../../services/apiBase';

const ContactSection = ({ data }) => {
  const phone = data?.phone || '+92-3-111-444-100';
  const email = data?.email || 'reservations@roomy.pk';
  const formTitle = data?.formTitle || "WE'RE HERE TO HELP YOU";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setStatus('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to send message.');
      }

      setStatus('Your message has been sent. We will contact you shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setStatus(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-section-bg-bar" />
      <div className="contact-columns contact-section-inner">
        <div className="contact-info-col">
          <h2 className="contact-info-title">CONTACT US</h2>
          <div className="contact-info-details">
            <div className="contact-info-phone">Phone: <a href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>{phone}</a></div>
            <div className="contact-info-email">Email: <a href={`mailto:${email}`}>{email}</a></div>
          </div>
          <div className="contact-blue-bar" />
        </div>
        <div className="contact-form-card contact-form-card-large">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 className="contact-form-heading">{formTitle}</h3>
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="contact-input"
                required
              />
            </div>
            <div className="form-row form-row-2col">
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="contact-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 3xx-xxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className="contact-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Subject <span className="required">*</span></label>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="contact-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea
                name="message"
                placeholder="Message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="contact-input"
                required
              />
            </div>
            {status && <div className="status-message">{status}</div>}
            <button type="submit" className="btn-submit btn-blue" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
