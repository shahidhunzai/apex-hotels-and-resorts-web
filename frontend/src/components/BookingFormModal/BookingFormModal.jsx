import React, { useEffect, useState, useRef } from 'react';
import './BookingFormModal.css';

const BookingFormModal = ({ room, resort, onClose }) => {
  const formRef = useRef();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDate(new Date());
  const minCheckoutStr = dateFrom
    ? formatDate(new Date(new Date(dateFrom).getTime() + 24 * 60 * 60 * 1000))
    : formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    if (dateTo <= dateFrom) {
      setDateTo(minCheckoutStr);
    }
  }, [dateFrom, dateTo, minCheckoutStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    const formData = new FormData(formRef.current);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      dateFrom: formData.get('dateFrom'),
      dateTo: formData.get('dateTo'),
      persons: formData.get('persons'),
      roomName: room?.title || '',
      resortName: resort || 'Pindi Point, Murree',
    };

    const from = new Date(data.dateFrom);
    const to = new Date(data.dateTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      setError('Please select valid check-in and check-out dates.');
      setSending(false);
      return;
    }
    if (from < today) {
      setError('Check-in date cannot be in the past.');
      setSending(false);
      return;
    }
    if (to <= from) {
      setError('Check-out must be at least one day after check-in.');
      setSending(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Unable to send booking emails');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Booking email error:', err);
      setError(`Failed to send booking: ${err?.text || err?.message || 'Unknown error'}. Please try again or contact us directly.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={onClose}>&times;</button>

        {success ? (
          <div className="booking-success">
            <div className="booking-success-icon">✓</div>
            <h2>Booking Request Sent!</h2>
            <p>Thank you! A confirmation email has been sent to your inbox. Our team will contact you shortly.</p>
            <button className="booking-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="booking-modal-header">
              <span className="booking-badge">{resort || 'Pindi Point, Murree'}</span>
              <h2 className="booking-modal-title">Book: {room?.title}</h2>
              <p className="booking-modal-subtitle">Fill in your details below to reserve this room</p>
            </div>

            <form ref={formRef} className="booking-form" onSubmit={handleSubmit}>
              <div className="booking-form-group">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" placeholder="John Doe" required />
              </div>

              <div className="booking-form-row">
                <div className="booking-form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" placeholder="you@email.com" required />
                </div>
                <div className="booking-form-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input type="tel" id="mobile" name="mobile" placeholder="+92 3xx-xxxxxxx" required />
                </div>
              </div>

              <div className="booking-form-row">
                <div className="booking-form-group">
                  <label htmlFor="dateFrom">Check-in</label>
                  <input type="date" id="dateFrom" name="dateFrom" min={todayStr} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
                </div>
                <div className="booking-form-group">
                  <label htmlFor="dateTo">Check-out</label>
                  <input type="date" id="dateTo" name="dateTo" min={minCheckoutStr} value={dateTo} onChange={(e) => setDateTo(e.target.value)} required />
                </div>
              </div>

              <div className="booking-form-group">
                <label htmlFor="persons">No. of Persons</label>
                <input type="number" id="persons" name="persons" placeholder="2" min="1" required />
              </div>

              {error && <p className="booking-error">{error}</p>}

              <button type="submit" className="booking-btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;
