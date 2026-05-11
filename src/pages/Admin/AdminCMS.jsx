import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  adminLogin,
  fetchAdminBookings,
  fetchCms,
  seedCms,
  updateBooking,
  updateBookingStatus,
  updateCms,
} from '../../services/cmsApi';
import './AdminCMS.css';

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const splitLines = (value) =>
  String(value || '')
    .split('\n');

const stripBulletPrefix = (value) =>
  String(value || '').replace(/^\s*(?:[•·●▪◦\-*]|✔|✓|☑|✅)+\s*/, '');

const normalizeBulletLines = (items) => {
  const source = Array.isArray(items) ? items : splitLines(items);
  return source.map((line) => stripBulletPrefix(line));
};

const joinLines = (items) => {
  if (Array.isArray(items)) return items.join('\n');
  if (typeof items === 'string') return items;
  return '';
};

const cleanLines = (items) => {
  const source = Array.isArray(items) ? items : splitLines(items);
  return source.map((line) => String(line || '').trim()).filter(Boolean);
};

const hasContentValue = (value) => {
  if (Array.isArray(value)) return cleanLines(value).length > 0;
  return String(value || '').trim().length > 0;
};

const getDestinationContentState = (destination) => {
  const fallbackTabs = destination?.points?.[0]?.tabs || {};
  const initialized = Boolean(destination?.destinationContentInitialized);

  const resolveValue = (destinationValue, fallbackValue, emptyValue) => {
    if (initialized) return destinationValue ?? emptyValue;
    return hasContentValue(destinationValue) ? destinationValue : (fallbackValue ?? emptyValue);
  };

  return {
    infoTitle: initialized
      ? (destination?.destinationInfoTitle || destination?.name || '')
      : (destination?.destinationInfoTitle || destination?.name || fallbackTabs.infoTitle || ''),
    infoDescription: resolveValue(destination?.destinationInfoDescription, fallbackTabs.infoDescription, ''),
    mapEmbed: resolveValue(destination?.destinationMapEmbed, '', ''),
    infoBullets: resolveValue(destination?.destinationInfoBullets, fallbackTabs.infoBullets, []),
    infoGallery: resolveValue(destination?.destinationInfoGallery, fallbackTabs.infoGallery, []),
    rooms: resolveValue(destination?.destinationRooms, fallbackTabs.rooms, []),
    activities: resolveValue(destination?.destinationActivities, fallbackTabs.activities, []),
    famousPlaces: resolveValue(destination?.destinationFamousPlaces, fallbackTabs.famousPlaces, []),
    galleryTitle: resolveValue(destination?.destinationGalleryTitle, fallbackTabs.galleryTitle, ''),
    galleryDescription: resolveValue(destination?.destinationGalleryDescription, fallbackTabs.galleryDescription, ''),
    galleryImages: resolveValue(destination?.destinationGalleryImages, fallbackTabs.galleryImages, []),
  };
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
const IMAGE_INPUT_ACCEPT = 'image/*,.heic,.heif,image/heic,image/heif';

const isHeicFile = (file) => {
  const name = String(file?.name || '').toLowerCase();
  const type = String(file?.type || '').toLowerCase();
  return type === 'image/heic'
    || type === 'image/heif'
    || type === 'image/heic-sequence'
    || type === 'image/heif-sequence'
    || name.endsWith('.heic')
    || name.endsWith('.heif');
};

const getBase64SizeMb = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return '';
  const base64 = dataUrl.split(',')[1] || '';
  const bytes = Math.ceil(base64.length * 0.75);
  const kb = bytes / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
};

const compressImageFile = (file) => new Promise((resolve, reject) => {
  if (file.size > MAX_IMAGE_BYTES) {
    return reject(new Error(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — each image must be 4 MB or smaller.`));
  }
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const MAX_DIM = 1920;
    let { width, height } = img;
    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', 0.78));
  };
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error(`Failed to load "${file.name}".`));
  };
  img.src = objectUrl;
});

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  if (file.size > MAX_IMAGE_BYTES) {
    return reject(new Error(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — each image must be 4 MB or smaller.`));
  }

  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
  reader.readAsDataURL(file);
});

const prepareImageUpload = (file) => (isHeicFile(file) ? readFileAsDataUrl(file) : compressImageFile(file));

/* ── NAV_ITEMS ─────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'home-hero', label: 'Hero Section', icon: '🖼️' },
  { id: 'listings-hero', label: 'Listings Hero', icon: '🏨' },
  { id: 'getaways-hero', label: 'Getaways Hero', icon: '🧳' },
  { id: 'home-travel', label: 'Travel Section', icon: '✈️' },
  { id: 'home-locations', label: 'Our Locations', icon: '📍' },
  { id: 'home-dining', label: 'Dine In', icon: '🍽️' },
  { id: 'home-offers', label: 'Offers Banner', icon: '🏷️' },
  { id: 'home-app', label: 'App Section', icon: '📱' },
  { id: 'home-contact', label: 'Contact Info', icon: '📞' },
  { id: 'home-footer-menu', label: 'Footer Menu', icon: '📚' },
  { id: 'home-footer-reviews', label: 'Footer Reviews', icon: '⭐' },
  { id: 'destinations', label: 'Destinations', icon: '🏔️' },
  { id: 'bookings', label: 'Bookings', icon: '📋' },
];

/* ── ADMIN COMPONENT ──────────────────────────────── */
const AdminCMS = () => {
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cmsData, setCmsData] = useState({ destinations: [], homePage: {}, destinationsPage: {}, listingsPage: {}, getawaysPage: {} });
  const [bookings, setBookings] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState('');
  const [destTab, setDestTab] = useState('basic');      // basic | destination-info | tourist-points
  const [pointTab, setPointTab] = useState('info');      // info | rooms | activities | gallery
  const [roomImageModal, setRoomImageModal] = useState(null); // {destId, ptId, roomIdx}
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [brandLogo, setBrandLogo] = useState('');

  /* booking filters */
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingPage, setBookingPage] = useState(1);
  const [editingBookingId, setEditingBookingId] = useState('');
  const [bookingEdits, setBookingEdits] = useState({ dateFrom: '', dateTo: '', persons: '' });
  const BOOKINGS_PER_PAGE = 10;

  /* ── helpers ───────────────────────────────────── */
  const homePage = cmsData.homePage || {};
  const destinationsPage = cmsData.destinationsPage || {};
  const listingsPage = cmsData.listingsPage || {};
  const getawaysPage = cmsData.getawaysPage || {};
  const adminBrandLogo = homePage.brandLogo || brandLogo || '';
  const destinations = cmsData.destinations || [];
  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const todayDateStr = formatDateLocal(new Date());
  const nextDayFromCheckIn = bookingEdits.dateFrom
    ? formatDateLocal(new Date(new Date(bookingEdits.dateFrom).getTime() + 24 * 60 * 60 * 1000))
    : formatDateLocal(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const patchHome = useCallback((key, value) => {
    setCmsData((prev) => ({
      ...prev,
      homePage: { ...(prev.homePage || {}), [key]: value },
    }));
  }, []);

  const patchHomeNested = useCallback((section, field, value) => {
    setCmsData((prev) => ({
      ...prev,
      homePage: {
        ...(prev.homePage || {}),
        [section]: { ...((prev.homePage || {})[section] || {}), [field]: value },
      },
    }));
  }, []);

  const patchDestinationsPage = useCallback((field, value) => {
    setCmsData((prev) => ({
      ...prev,
      destinationsPage: {
        ...(prev.destinationsPage || {}),
        [field]: value,
      },
    }));
  }, []);

  const patchListingsPage = useCallback((field, value) => {
    setCmsData((prev) => ({
      ...prev,
      listingsPage: {
        ...(prev.listingsPage || {}),
        [field]: value,
      },
    }));
  }, []);

  const patchGetawaysPage = useCallback((field, value) => {
    setCmsData((prev) => ({
      ...prev,
      getawaysPage: {
        ...(prev.getawaysPage || {}),
        [field]: value,
      },
    }));
  }, []);

  /* ── load dashboard ────────────────────────────── */
  const loadDashboard = useCallback(async (authToken) => {
    setLoading(true);
    setError('');
    try {
      const [cmsResult, bookingsResult] = await Promise.allSettled([
        fetchCms(),
        fetchAdminBookings(authToken),
      ]);

      if (bookingsResult.status === 'rejected' && bookingsResult.reason?.status === 401) {
        localStorage.removeItem('admin_token');
        setToken('');
        setError('Session expired. Please login again.');
        return;
      }
      if (cmsResult.status === 'rejected') throw cmsResult.reason;

      const cms = cmsResult.value;
      const bookingsPayload = bookingsResult.status === 'fulfilled' ? bookingsResult.value : { bookings: [] };

      setCmsData({
        destinations: cms?.destinations || [],
        homePage: cms?.homePage || {},
        destinationsPage: cms?.destinationsPage || {},
        listingsPage: cms?.listingsPage || {},
        getawaysPage: cms?.getawaysPage || {},
      });
      setBookings(bookingsPayload?.bookings || []);

      const dests = cms?.destinations || [];
      if (dests[0]) {
        setSelectedDestinationId(dests[0].id);
        setSelectedPointId((dests[0].points || [])[0]?.id || '');
      }
    } catch (err) {
      if (err?.status === 401) {
        localStorage.removeItem('admin_token');
        setToken('');
        setError('Session expired. Please login again.');
        return;
      }
      setError(err.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    loadDashboard(token);
  }, [token, loadDashboard]);

  useEffect(() => {
    let mounted = true;
    fetchCms()
      .then((cms) => {
        if (!mounted) return;
        setBrandLogo(cms?.homePage?.brandLogo || '');
      })
      .catch(() => {
        if (!mounted) return;
        setBrandLogo('');
      });
    return () => {
      mounted = false;
    };
  }, []);

  /* ── destination/point helpers ──────────────────── */
  const selectedDestination = useMemo(
    () => destinations.find((d) => d.id === selectedDestinationId) || destinations[0] || null,
    [destinations, selectedDestinationId]
  );

  const selectedPoint = useMemo(() => {
    if (!selectedDestination) return null;
    return (selectedDestination.points || []).find((p) => p.id === selectedPointId) || (selectedDestination.points || [])[0] || null;
  }, [selectedDestination, selectedPointId]);

  const destinationContent = useMemo(
    () => getDestinationContentState(selectedDestination),
    [selectedDestination]
  );

  const stats = useMemo(() => {
    const pts = destinations.reduce((s, d) => s + ((d.points || []).length), 0);
    return { destinations: destinations.length, points: pts, bookings: bookings.length };
  }, [destinations, bookings]);

  const patchDestination = (destId, updater) => {
    setCmsData((prev) => ({
      ...prev,
      destinations: prev.destinations.map((d) => d.id !== destId ? d : updater(d)),
    }));
  };

  const patchPoint = (destId, ptId, updater) => {
    patchDestination(destId, (d) => ({
      ...d,
      points: (d.points || []).map((p) => p.id !== ptId ? p : updater(p)),
    }));
  };

  const uploadImage = async (file) => {
    const base64 = await prepareImageUpload(file);
    const result = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ image: base64 }),
    });
    const raw = await result.text();
    let payload = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch (_error) {
      payload = {};
    }
    if (!result.ok) {
      const fallback = result.status === 404
        ? 'Upload endpoint not found. Restart backend server and try again.'
        : `Failed to upload image to server (${result.status}).`;
      throw new Error(payload.error || raw || fallback);
    }
    return payload.url;
  };

  const uploadImages = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (list.length === 0) return [];
    return Promise.all(list.map(uploadImage));
  };

  const handleHomeHeroSlidesUpload = async (files) => {
    if (!files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines((homePage.hero || {}).slides || []);
      patchHomeNested('hero', 'slides', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload hero slides.');
    }
  };

  const removeHomeHeroSlideAt = (idx) => {
    const current = cleanLines((homePage.hero || {}).slides || []);
    patchHomeNested('hero', 'slides', current.filter((_, i) => i !== idx));
  };

  const handleHomeSectionImageUpload = async (section, field, file, fallbackMessage) => {
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file);
      patchHomeNested(section, field, imageUrl);
    } catch (err) {
      setError(err.message || fallbackMessage);
    }
  };

  const handleHomeCollectionImageUpload = async (collectionKey, idx, file, fallbackMessage) => {
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file);
      const items = homePage[collectionKey] || [];
      patchHome(collectionKey, items.map((item, itemIdx) => itemIdx === idx ? { ...item, image: imageUrl } : item));
    } catch (err) {
      setError(err.message || fallbackMessage);
    }
  };

  const handleBrandLogoUpload = async (file) => {
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file);
      patchHome('brandLogo', imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to upload logo.');
    }
  };

  const handleDestinationsPageHeroSlidesUpload = async (files) => {
    if (!files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(destinationsPage.heroSlides || []);
      patchDestinationsPage('heroSlides', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload destinations page hero slides.');
    }
  };

  const removeDestinationsPageHeroSlideAt = (idx) => {
    const current = cleanLines(destinationsPage.heroSlides || []);
    patchDestinationsPage('heroSlides', current.filter((_, i) => i !== idx));
  };

  const handleListingsPageHeroSlidesUpload = async (files) => {
    if (!files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(listingsPage.heroSlides || []);
      patchListingsPage('heroSlides', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload listings page hero slides.');
    }
  };

  const removeListingsPageHeroSlideAt = (idx) => {
    const current = cleanLines(listingsPage.heroSlides || []);
    patchListingsPage('heroSlides', current.filter((_, i) => i !== idx));
  };

  const handleGetawaysPageHeroSlidesUpload = async (files) => {
    if (!files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(getawaysPage.heroSlides || []);
      patchGetawaysPage('heroSlides', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload getaways page hero slides.');
    }
  };

  const removeGetawaysPageHeroSlideAt = (idx) => {
    const current = cleanLines(getawaysPage.heroSlides || []);
    patchGetawaysPage('heroSlides', current.filter((_, i) => i !== idx));
  };

  const handleDestinationCardImageUpload = async (file) => {
    if (!selectedDestination || !file) return;
    try {
      const imageData = await uploadImage(file);
      patchDestination(selectedDestination.id, (d) => ({ ...d, cardImage: imageData }));
    } catch (err) {
      setError(err.message || 'Unable to upload destination image.');
    }
  };

  const handlePointCardImageUpload = async (file) => {
    if (!selectedDestination || !selectedPoint || !file) return;
    try {
      const imageData = await uploadImage(file);
      patchPoint(selectedDestination.id, selectedPoint.id, (p) => ({ ...p, cardImage: imageData }));
    } catch (err) {
      setError(err.message || 'Unable to upload point image.');
    }
  };

  const handleDestinationHeroSlidesUpload = async (files) => {
    if (!selectedDestination || !files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(selectedDestination.heroSlides || []);
      patchDestination(selectedDestination.id, (d) => ({ ...d, heroSlides: [...current, ...uploaded] }));
    } catch (err) {
      setError(err.message || 'Unable to upload destination hero slides.');
    }
  };

  const removeDestinationHeroSlideAt = (idx) => {
    if (!selectedDestination) return;
    const current = cleanLines(selectedDestination.heroSlides || []);
    patchDestination(selectedDestination.id, (d) => ({ ...d, heroSlides: current.filter((_, i) => i !== idx) }));
  };

  const handlePointHeroSlidesUpload = async (pointId, files) => {
    if (!selectedDestination || !pointId || !files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const point = (selectedDestination.points || []).find((entry) => entry.id === pointId);
      const current = cleanLines(point?.heroSlides || []);
      patchPoint(selectedDestination.id, pointId, (p) => ({ ...p, heroSlides: [...current, ...uploaded] }));
    } catch (err) {
      setError(err.message || 'Unable to upload point hero slides.');
    }
  };

  const removePointHeroSlideAt = (pointId, idx) => {
    if (!selectedDestination || !pointId) return;
    const point = (selectedDestination.points || []).find((entry) => entry.id === pointId);
    const current = cleanLines(point?.heroSlides || []);
    patchPoint(selectedDestination.id, pointId, (p) => ({ ...p, heroSlides: current.filter((_, i) => i !== idx) }));
  };

  const addDestination = () => {
    const id = `destination-${Date.now()}`;
    setCmsData((prev) => ({
      ...prev,
      destinations: [...(prev.destinations || []), {
        id,
        name: 'NEW DESTINATION',
        slug: id,
        cardImage: '',
        heroSlides: [],
        destinationContentInitialized: false,
        destinationInfoTitle: '',
        destinationInfoDescription: '',
        destinationMapEmbed: '',
        destinationInfoBullets: [],
        destinationInfoGallery: [],
        destinationRooms: [],
        destinationActivities: [],
        destinationFamousPlaces: [],
        destinationGalleryTitle: '',
        destinationGalleryDescription: '',
        destinationGalleryImages: [],
        points: [],
      }],
    }));
    setSelectedDestinationId(id);
    setSelectedPointId('');
  };

  const removeDestination = async () => {
    if (!selectedDestination) return;
    if (!window.confirm(`Delete "${selectedDestination.name}" and all its tourist points, rooms, activities? This cannot be undone.`)) return;

    const newDestinations = (cmsData.destinations || []).filter((d) => d.id !== selectedDestination.id);
    const newCms = { ...cmsData, destinations: newDestinations };

    setCmsData(newCms);
    setSelectedDestinationId(newDestinations[0]?.id || '');
    setSelectedPointId(newDestinations[0]?.points?.[0]?.id || '');
    setDestTab('basic');
    setPointTab('info');

    // Auto-save to persist the deletion
    try {
      setSaving(true); setError(''); setStatus('');
      await updateCms(newCms, token);
      setStatus('Destination deleted and saved successfully!');
    } catch (err) {
      setError(err.message || 'Destination removed locally but failed to save. Click Save to retry.');
    } finally {
      setSaving(false);
    }
  };

  const addPoint = () => {
    if (!selectedDestination) return;
    const id = `point-${Date.now()}`;
    patchDestination(selectedDestination.id, (d) => ({
      ...d,
      points: [...(d.points || []), {
        id, name: 'NEW POINT', slug: id, cardImage: '', heroSlides: [],
        tabs: { infoTitle: '', infoDescription: '', infoBullets: [], infoGallery: [], rooms: [], activities: [], galleryImages: [] },
      }],
    }));
    setSelectedPointId(id);
  };

  const removePoint = () => {
    if (!selectedDestination || !selectedPoint) return;
    patchDestination(selectedDestination.id, (d) => ({
      ...d,
      points: (d.points || []).filter((p) => p.id !== selectedPoint.id),
    }));
    const next = (selectedDestination.points || []).find((p) => p.id !== selectedPoint.id);
    setSelectedPointId(next?.id || '');
  };

  const patchDestinationContentField = (field, value) => {
    if (!selectedDestination) return;
    patchDestination(selectedDestination.id, (d) => ({
      ...d,
      destinationContentInitialized: true,
      [field]: value,
    }));
  };

  const uploadDestinationInfoImages = async (files) => {
    if (!selectedDestination || !files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(destinationContent.infoGallery || []);
      patchDestinationContentField('destinationInfoGallery', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload destination information images.');
    }
  };

  const removeDestinationInfoImageAt = (idx) => {
    if (!selectedDestination) return;
    const current = cleanLines(destinationContent.infoGallery || []);
    patchDestinationContentField('destinationInfoGallery', current.filter((_, i) => i !== idx));
  };

  const uploadDestinationTabImages = async (field, files) => {
    if (!selectedDestination || !files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const current = cleanLines(destinationContent[field] || []);
      patchDestinationContentField(field, [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload images.');
    }
  };

  const removeDestinationTabImageAt = (field, idx) => {
    const current = cleanLines(destinationContent[field] || []);
    patchDestinationContentField(field, current.filter((_, i) => i !== idx));
  };

  const uploadRoomImages = async (roomIdx, files) => {
    if (!files?.length) return;
    try {
      const uploaded = await uploadImages(files);
      const rooms = destinationContent.rooms || [];
      const current = cleanLines(Array.isArray(rooms[roomIdx]?.images) ? rooms[roomIdx].images : (rooms[roomIdx]?.image ? [rooms[roomIdx].image] : []));
      updateRoom(roomIdx, 'images', [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || 'Unable to upload room images.');
    }
  };

  const removeRoomImageAt = (roomIdx, imgIdx) => {
    const rooms = destinationContent.rooms || [];
    const current = cleanLines(Array.isArray(rooms[roomIdx]?.images) ? rooms[roomIdx].images : (rooms[roomIdx]?.image ? [rooms[roomIdx].image] : []));
    updateRoom(roomIdx, 'images', current.filter((_, i) => i !== imgIdx));
  };

  const uploadActivityImageAt = async (activityIdx, imageIdx, file) => {
    if (!file) return;
    try {
      const imageData = await uploadImage(file);
      updateActivityImage(activityIdx, imageIdx, imageData);
    } catch (err) {
      setError(err.message || 'Unable to upload activity image.');
    }
  };

  // rooms
  const addRoom = () => {
    const rooms = [...(destinationContent.rooms || []), { images: [], title: '', price: '', discountPercent: '', discountNote: '', quantity: '', persons: '', area: '', amenities: [] }];
    patchDestinationContentField('destinationRooms', rooms);
  };
  const removeRoom = (idx) => patchDestinationContentField('destinationRooms', (destinationContent.rooms || []).filter((_, i) => i !== idx));
  const updateRoom = (idx, field, val) => {
    patchDestinationContentField('destinationRooms', (destinationContent.rooms || []).map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };
  const addRoomAmenity = (idx) => {
    const rooms = (destinationContent.rooms || []).map((r, i) => i === idx ? { ...r, amenities: [...(r.amenities || []), { icon: '', label: '' }] } : r);
    patchDestinationContentField('destinationRooms', rooms);
  };
  const updateRoomAmenity = (rIdx, aIdx, field, val) => {
    const rooms = (destinationContent.rooms || []).map((r, ri) => ri === rIdx ? {
      ...r, amenities: (r.amenities || []).map((a, ai) => ai === aIdx ? { ...a, [field]: val } : a)
    } : r);
    patchDestinationContentField('destinationRooms', rooms);
  };
  const removeRoomAmenity = (rIdx, aIdx) => {
    const rooms = (destinationContent.rooms || []).map((r, ri) => ri === rIdx ? {
      ...r, amenities: (r.amenities || []).filter((_, ai) => ai !== aIdx)
    } : r);
    patchDestinationContentField('destinationRooms', rooms);
  };

  // activities
  const addActivity = () => {
    patchDestinationContentField('destinationActivities', [...(destinationContent.activities || []), { title: '', description: '', images: ['', '', '', '', ''] }]);
  };
  const removeActivity = (idx) => patchDestinationContentField('destinationActivities', (destinationContent.activities || []).filter((_, i) => i !== idx));
  const updateActivity = (idx, field, val) => {
    patchDestinationContentField('destinationActivities', (destinationContent.activities || []).map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };
  // famous places
  const addFamousPlace = () => patchDestinationContentField('destinationFamousPlaces', [...(destinationContent.famousPlaces || []), { title: '', description: '', images: [] }]);
  const removeFamousPlace = (idx) => patchDestinationContentField('destinationFamousPlaces', (destinationContent.famousPlaces || []).filter((_, i) => i !== idx));
  const updateFamousPlace = (idx, field, val) => patchDestinationContentField('destinationFamousPlaces', (destinationContent.famousPlaces || []).map((p, i) => i === idx ? { ...p, [field]: val } : p));
  const removeFamousPlaceImage = (idx, imageIdx) => {
    patchDestinationContentField('destinationFamousPlaces', (destinationContent.famousPlaces || []).map((p, i) => {
      if (i !== idx) return p;
      const images = [...(p.images || [])].filter((_, j) => j !== imageIdx);
      return { ...p, images };
    }));
  };
  const uploadFamousPlaceImages = async (idx, files) => {
    if (!files || files.length === 0) return;
    const uploaded = [];
    for (const file of Array.from(files)) {
      try {
        const imageData = await uploadImage(file);
        uploaded.push(imageData);
      } catch (err) {
        setError(err.message || 'Failed to upload famous place image.');
      }
    }
    if (uploaded.length > 0) {
      patchDestinationContentField('destinationFamousPlaces', (destinationContent.famousPlaces || []).map((p, i) => {
        if (i !== idx) return p;
        return { ...p, images: [...(p.images || []).filter(Boolean), ...uploaded] };
      }));
    }
  };

  const updateActivityImage = (aIdx, imgIdx, val) => {
    patchDestinationContentField('destinationActivities', (destinationContent.activities || []).map((a, i) => {
      if (i !== aIdx) return a;
      const images = [...(a.images || ['', '', '', '', ''])];
      while (images.length < 5) images.push('');
      images[imgIdx] = val;
      return { ...a, images };
    }));
  };

  /* ── actions ───────────────────────────────────── */
  const handleSave = async () => {
    setError(''); setStatus(''); setSaving(true);
    try {
      await updateCms(cmsData, token);
      setStatus('All CMS content saved successfully!');
    } catch (err) { setError(err.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleSeed = async () => {
    setError(''); setStatus('');
    try {
      await seedCms(token);
      await loadDashboard(token);
      setStatus('CMS data seeded successfully.');
    } catch (err) { setError(err.message || 'Failed to seed.'); }
  };

  const handleBookingStatus = async (bookingId, val) => {
    try {
      const result = await updateBookingStatus(bookingId, val, token, {
        resendNotifications: val === 'confirmed',
      });
      setBookings((prev) => prev.map((b) => b.bookingId === bookingId ? { ...b, status: val } : b));
      if (val === 'confirmed') {
        const emailSent = Boolean(result?.notifications?.confirmationEmailSent);

        const nextStatus = emailSent
          ? 'Booking confirmed and confirmation email sent.'
          : 'Booking confirmed. Confirmation email was not sent.';

        setStatus(nextStatus);
      } else {
        setStatus('Booking status updated.');
      }
      setError('');
    } catch (err) { setError(err.message); }
  };

  const handleBookingEditStart = (booking) => {
    setEditingBookingId(booking.id);
    setBookingEdits({ dateFrom: booking.dateFrom || '', dateTo: booking.dateTo || '', persons: booking.persons || '' });
    setError('');
    setStatus('');
  };

  const handleBookingEditChange = (field, value) => {
    setBookingEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookingSave = async (bookingId) => {
    const { dateFrom, dateTo, persons } = bookingEdits;
    if (!dateFrom || !dateTo) {
      setError('Both check-in and check-out dates are required.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }
    if (fromDate < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    if (toDate <= fromDate) {
      setError('Check-out date must be at least one day after check-in date.');
      return;
    }

    try {
      const result = await updateBooking(bookingId, { dateFrom, dateTo, persons }, token);
      setBookings((prev) => prev.map((b) => b.bookingId === bookingId ? { ...b, dateFrom: result.booking.dateFrom, dateTo: result.booking.dateTo, persons: result.booking.persons } : b));
      setStatus('Booking dates updated successfully.');
      setError('');
      setEditingBookingId('');
    } catch (err) {
      setError(err.message || 'Failed to save booking dates.');
    }
  };

  const handleBookingCancel = () => {
    setEditingBookingId('');
    setBookingEdits({ dateFrom: '', dateTo: '', persons: '' });
    setError('');
    setStatus('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setError(''); setStatus('');
    try {
      const su = username.trim(); const sp = password.trim();
      if (!su || !sp) throw new Error('Please enter username and password.');
      const result = await adminLogin(su, sp);
      localStorage.setItem('admin_token', result.token);
      setToken(result.token);
      setUsername(''); setPassword('');
    } catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setCmsData({ destinations: [], homePage: {}, destinationsPage: {}, listingsPage: {}, getawaysPage: {} });
    setBookings([]);
    setActiveNav('dashboard');
  };

  const navTo = (id) => { setActiveNav(id); setSidebarOpen(false); };

  /* ── LOGIN SCREEN ──────────────────────────────── */
  if (!token) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="login-logo">
            {adminBrandLogo ? (
              <img src={adminBrandLogo} alt="Brand logo" className="login-logo-img" />
            ) : null}
          </div>
          <h1>Admin Panel</h1>
          <p>Sign in to manage your content</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={loginLoading}>{loginLoading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          {error && <p className="toast error">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="admin-loader">
          <div className="loader-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /* ── SECTION RENDERS ───────────────────────────── */

  const renderDashboard = () => (
    <div className="panel-section dashboard-panel">
      <h2 className="section-title">Dashboard Overview</h2>
      <p className="section-desc dashboard-desc">Live snapshot of your content with quick admin actions.</p>
      <div className="stats-grid">
        <div className="stat-card blue"><span className="stat-icon">🏔️</span><div className="stat-content"><div className="stat-number">{stats.destinations}</div><div className="stat-label">Destinations</div></div></div>
        <div className="stat-card green"><span className="stat-icon">📍</span><div className="stat-content"><div className="stat-number">{stats.points}</div><div className="stat-label">Tourist Points</div></div></div>
        <div className="stat-card orange"><span className="stat-icon">📋</span><div className="stat-content"><div className="stat-number">{stats.bookings}</div><div className="stat-label">Bookings</div></div></div>
      </div>
      <div className="quick-actions">
        <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save All Changes'}</button>
        <button className="btn outline" onClick={handleSeed}>🌱 Seed Default Data</button>
        <button className="btn outline" onClick={() => loadDashboard(token)}>🔄 Refresh Data</button>
      </div>
    </div>
  );

  const renderHeroSection = () => {
    const hero = homePage.hero || {};
    return (
      <div className="panel-section">
        <h2 className="section-title">🖼️ Hero Section</h2>
        <p className="section-desc">Manage the homepage hero slider, title, and contact buttons.</p>
        <div className="form-grid">
          <div className="form-group full">
            <label>Hero Title</label>
            <textarea rows={3} value={hero.title || ''} onChange={(e) => patchHomeNested('hero', 'title', e.target.value)} placeholder="CHECK IN TO THE\nTIME OF YOUR LIFE" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={hero.phone || ''} onChange={(e) => patchHomeNested('hero', 'phone', e.target.value)} placeholder="+923001234567" />
          </div>
          <div className="form-group">
            <label>WhatsApp Number</label>
            <input value={hero.whatsapp || ''} onChange={(e) => patchHomeNested('hero', 'whatsapp', e.target.value)} placeholder="+923001234567" />
          </div>
          <div className="form-group full upload-field-stack">
            <label>Hero Slides Upload</label>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              multiple
              onChange={async (e) => {
                await handleHomeHeroSlidesUpload(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {cleanLines(hero.slides || []).length > 0 && (
            <div className="image-preview-grid full">
              {cleanLines(hero.slides).map((url, i) => (
                <div key={i} className="img-thumb"><img src={url} alt={`Slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removeHomeHeroSlideAt(i)} title="Remove slide">✕</button></div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListingsHeroSection = () => (
    <div className="panel-section">
      <h2 className="section-title">🏨 Listings Hero</h2>
      <p className="section-desc">Manage the hero title and slider images shown at the top of the Listings page.</p>
      <div className="form-grid">
        <div className="form-group full">
          <label>Hero Title</label>
          <textarea rows={3} value={listingsPage.heroTitle || ''} onChange={(e) => patchListingsPage('heroTitle', e.target.value)} placeholder="FIND YOUR\nPERFECT HOTEL" />
        </div>
        <div className="form-group full upload-field-stack">
          <label>Hero Slides Upload</label>
          <input
            type="file"
            accept={IMAGE_INPUT_ACCEPT}
            multiple
            onChange={async (e) => {
              await handleListingsPageHeroSlidesUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {cleanLines(listingsPage.heroSlides || []).length > 0 && (
          <div className="image-preview-grid full">
            {cleanLines(listingsPage.heroSlides).map((url, i) => (
              <div key={`listings-page-slide-${i}`} className="img-thumb"><img src={url} alt={`Listings page slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removeListingsPageHeroSlideAt(i)} title="Remove slide">✕</button></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGetawaysHeroSection = () => (
    <div className="panel-section">
      <h2 className="section-title">🧳 Getaways Hero</h2>
      <p className="section-desc">Manage the hero title and slider images shown at the top of the Getaways page.</p>
      <div className="form-grid">
        <div className="form-group full">
          <label>Hero Title</label>
          <textarea rows={3} value={getawaysPage.heroTitle || ''} onChange={(e) => patchGetawaysPage('heroTitle', e.target.value)} placeholder="PLAN YOUR\nTRIP / TOUR" />
        </div>
        <div className="form-group full upload-field-stack">
          <label>Hero Slides Upload</label>
          <input
            type="file"
            accept={IMAGE_INPUT_ACCEPT}
            multiple
            onChange={async (e) => {
              await handleGetawaysPageHeroSlidesUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {cleanLines(getawaysPage.heroSlides || []).length > 0 && (
          <div className="image-preview-grid full">
            {cleanLines(getawaysPage.heroSlides).map((url, i) => (
              <div key={`getaways-page-slide-${i}`} className="img-thumb"><img src={url} alt={`Getaways page slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removeGetawaysPageHeroSlideAt(i)} title="Remove slide">✕</button></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTravelSection = () => {
    const travel = homePage.travel || {};
    return (
      <div className="panel-section">
        <h2 className="section-title">✈️ Travel Section</h2>
        <p className="section-desc">Edit the travel section content and image shown on the homepage.</p>
        <div className="form-grid">
          <div className="form-group full">
            <label>Title</label>
            <input value={travel.title || ''} onChange={(e) => patchHomeNested('travel', 'title', e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Description</label>
            <textarea rows={4} value={travel.description || ''} onChange={(e) => patchHomeNested('travel', 'description', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Button Text</label>
            <input value={travel.buttonText || ''} onChange={(e) => patchHomeNested('travel', 'buttonText', e.target.value)} />
          </div>
          <div className="form-group upload-field-stack">
            <label>Upload Image</label>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              onChange={async (e) => {
                await handleHomeSectionImageUpload('travel', 'image', e.target.files?.[0], 'Unable to upload travel image.');
                e.target.value = '';
              }}
            />
            {!!travel.image && (
              <button className="btn small outline" type="button" onClick={() => patchHomeNested('travel', 'image', '')}>
                Remove Current Image
              </button>
            )}
          </div>
          {travel.image && (
            <div className="image-preview-grid full">
              <div className="img-thumb large"><img src={travel.image} alt="Travel" /></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLocations = () => {
    const locs = homePage.locations || [];
    const updateLoc = (idx, field, value) => {
      const updated = locs.map((l, i) => i === idx ? { ...l, [field]: value } : l);
      patchHome('locations', updated);
    };
    const addLoc = () => patchHome('locations', [...locs, { id: Date.now(), name: '', location: '', image: '' }]);
    const removeLoc = (idx) => patchHome('locations', locs.filter((_, i) => i !== idx));

    return (
      <div className="panel-section">
        <h2 className="section-title">📍 Our Locations</h2>
        <p className="section-desc">Manage the hotel cards displayed in the locations slider.</p>
        <div className="items-list">
          {locs.map((loc, idx) => (
            <div key={loc.id || idx} className="item-card">
              <div className="item-card-header">
                <span className="item-num">#{idx + 1}</span>
                <button className="btn-icon danger" onClick={() => removeLoc(idx)} title="Remove">✕</button>
              </div>
              {loc.image && <img src={loc.image} alt={loc.name} className="item-card-img" />}
              <div className="form-grid compact">
                <div className="form-group"><label>Name</label><input value={loc.name || ''} onChange={(e) => updateLoc(idx, 'name', e.target.value)} /></div>
                <div className="form-group"><label>Location</label><input value={loc.location || ''} onChange={(e) => updateLoc(idx, 'location', e.target.value)} /></div>
                <div className="form-group full upload-field-stack">
                  <label>Upload Image</label>
                  <input
                    type="file"
                    accept={IMAGE_INPUT_ACCEPT}
                    onChange={async (e) => {
                      await handleHomeCollectionImageUpload('locations', idx, e.target.files?.[0], 'Unable to upload location image.');
                      e.target.value = '';
                    }}
                  />
                  {!!loc.image && (
                    <button className="btn small outline" type="button" onClick={() => updateLoc(idx, 'image', '')}>
                      Remove Current Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn outline" onClick={addLoc}>+ Add Location</button>
      </div>
    );
  };

  const renderDining = () => {
    const items = homePage.dining || [];
    const updateItem = (idx, field, value) => {
      patchHome('dining', items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };
    const addItem = () => patchHome('dining', [...items, { id: Date.now(), name: '', description: '', image: '' }]);
    const removeItem = (idx) => patchHome('dining', items.filter((_, i) => i !== idx));

    return (
      <div className="panel-section">
        <h2 className="section-title">🍽️ Dine In Section</h2>
        <p className="section-desc">Manage restaurants displayed on the homepage.</p>
        <div className="items-list">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="item-card">
              <div className="item-card-header">
                <span className="item-num">#{idx + 1}</span>
                <button className="btn-icon danger" onClick={() => removeItem(idx)} title="Remove">✕</button>
              </div>
              {item.image && <img src={item.image} alt={item.name} className="item-card-img" />}
              <div className="form-grid compact">
                <div className="form-group"><label>Name</label><input value={item.name || ''} onChange={(e) => updateItem(idx, 'name', e.target.value)} /></div>
                <div className="form-group"><label>Subtitle</label><input value={item.description || ''} onChange={(e) => updateItem(idx, 'description', e.target.value)} /></div>
                <div className="form-group full upload-field-stack">
                  <label>Upload Image</label>
                  <input
                    type="file"
                    accept={IMAGE_INPUT_ACCEPT}
                    onChange={async (e) => {
                      await handleHomeCollectionImageUpload('dining', idx, e.target.files?.[0], 'Unable to upload dining image.');
                      e.target.value = '';
                    }}
                  />
                  {!!item.image && (
                    <button className="btn small outline" type="button" onClick={() => updateItem(idx, 'image', '')}>
                      Remove Current Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn outline" onClick={addItem}>+ Add Restaurant</button>
      </div>
    );
  };

  const renderOffers = () => {
    const offers = homePage.offersBanner || {};
    return (
      <div className="panel-section">
        <h2 className="section-title">🏷️ Offers Banner</h2>
        <p className="section-desc">Edit the promotional banner text and button.</p>
        <div className="form-grid">
          <div className="form-group full"><label>Title</label><textarea rows={2} value={offers.title || ''} onChange={(e) => patchHomeNested('offersBanner', 'title', e.target.value)} /></div>
          <div className="form-group full"><label>Description</label><input value={offers.description || ''} onChange={(e) => patchHomeNested('offersBanner', 'description', e.target.value)} /></div>
          <div className="form-group"><label>Button Text</label><input value={offers.buttonText || ''} onChange={(e) => patchHomeNested('offersBanner', 'buttonText', e.target.value)} /></div>
        </div>
      </div>
    );
  };

  const renderAppSection = () => {
    const app = homePage.appSection || {};
    return (
      <div className="panel-section">
        <h2 className="section-title">📱 App Section</h2>
        <p className="section-desc">Edit the mobile app promotion section.</p>
        <div className="form-grid">
          <div className="form-group full"><label>Title</label><input value={app.title || ''} onChange={(e) => patchHomeNested('appSection', 'title', e.target.value)} /></div>
          <div className="form-group full"><label>Description</label><textarea rows={3} value={app.description || ''} onChange={(e) => patchHomeNested('appSection', 'description', e.target.value)} /></div>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    const contact = homePage.contact || {};
    return (
      <div className="panel-section">
        <h2 className="section-title">📞 Contact Info</h2>
        <p className="section-desc">Update contact details shown on the homepage.</p>
        <div className="form-grid">
          <div className="form-group full upload-field-stack">
            <label>Upload Brand Logo</label>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              onChange={async (e) => {
                await handleBrandLogoUpload(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {!!homePage.brandLogo && (
              <button className="btn small outline" type="button" onClick={() => patchHome('brandLogo', '')}>
                Remove Current Logo
              </button>
            )}
          </div>
          {homePage.brandLogo && (
            <div className="image-preview-grid full">
              <div className="img-thumb large"><img src={homePage.brandLogo} alt="Brand logo" /></div>
            </div>
          )}
          <div className="form-group"><label>Phone</label><input value={contact.phone || ''} onChange={(e) => patchHomeNested('contact', 'phone', e.target.value)} /></div>
          <div className="form-group"><label>Email</label><input value={contact.email || ''} onChange={(e) => patchHomeNested('contact', 'email', e.target.value)} /></div>
          <div className="form-group"><label>WhatsApp URL</label><input value={(contact.social || {}).whatsapp || ''} onChange={(e) => patchHomeNested('contact', 'social', { ...(contact.social || {}), whatsapp: e.target.value })} /></div>
          <div className="form-group"><label>Facebook URL</label><input value={(contact.social || {}).facebook || ''} onChange={(e) => patchHomeNested('contact', 'social', { ...(contact.social || {}), facebook: e.target.value })} /></div>
          <div className="form-group"><label>Instagram URL</label><input value={(contact.social || {}).instagram || ''} onChange={(e) => patchHomeNested('contact', 'social', { ...(contact.social || {}), instagram: e.target.value })} /></div>
          <div className="form-group"><label>Twitter URL</label><input value={(contact.social || {}).twitter || ''} onChange={(e) => patchHomeNested('contact', 'social', { ...(contact.social || {}), twitter: e.target.value })} /></div>
          <div className="form-group"><label>LinkedIn URL</label><input value={(contact.social || {}).linkedin || ''} onChange={(e) => patchHomeNested('contact', 'social', { ...(contact.social || {}), linkedin: e.target.value })} /></div>
          <div className="form-group full"><label>Form Heading</label><input value={contact.formTitle || ''} onChange={(e) => patchHomeNested('contact', 'formTitle', e.target.value)} /></div>
        </div>
      </div>
    );
  };

  const renderFooterReviews = () => {
    const reviews = Array.isArray(homePage.footerReviews) ? homePage.footerReviews : [];

    const patchReview = (idx, field, value) => {
      patchHome('footerReviews', reviews.map((item, itemIdx) => (
        itemIdx === idx ? { ...item, [field]: value } : item
      )));
    };

    const addReview = () => {
      patchHome('footerReviews', [
        ...reviews,
        {
          id: `footer-review-${Date.now()}`,
          name: '',
          description: '',
          image: '',
          stars: 5,
          published: true,
        },
      ]);
    };

    const removeReview = (idx) => {
      patchHome('footerReviews', reviews.filter((_, itemIdx) => itemIdx !== idx));
    };

    const uploadReviewImage = async (idx, file) => {
      if (!file) return;
      try {
        const imageUrl = await uploadImage(file);
        patchReview(idx, 'image', imageUrl);
      } catch (err) {
        setError(err.message || 'Unable to upload review image.');
      }
    };

    return (
      <div className="panel-section">
        <h2 className="section-title">⭐ Footer Reviews</h2>
        <p className="section-desc">Manage the customer reviews shown in the footer. Each review supports an image, reviewer name, description, and star rating.</p>

        {reviews.length === 0 ? <p className="empty-msg">No footer reviews added yet.</p> : null}

        <div className="items-list">
          {reviews.map((review, idx) => (
            <div key={review.id || idx} className="item-card">
              <div className="item-card-header">
                <span className="item-num">Review #{idx + 1}</span>
                <button className="btn-icon danger" type="button" onClick={() => removeReview(idx)} title="Remove review">✕</button>
              </div>

              {review.image ? <img src={review.image} alt={review.name || `Review ${idx + 1}`} className="item-card-img" /> : null}

              <div className="form-grid compact">
                <div className="form-group">
                  <label>Reviewer Name</label>
                  <input value={review.name || ''} onChange={(e) => patchReview(idx, 'name', e.target.value)} placeholder="Guest name" />
                </div>
                <div className="form-group">
                  <label>Stars</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={review.stars ?? 5}
                    onChange={(e) => patchReview(idx, 'stars', Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                  />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea
                    rows={4}
                    value={review.description || review.review || ''}
                    onChange={(e) => {
                      patchReview(idx, 'description', e.target.value);
                      patchReview(idx, 'review', e.target.value);
                    }}
                    placeholder="Write the review text shown in the footer"
                  />
                </div>
                <div className="form-group full upload-field-stack">
                  <label>Reviewer Image</label>
                  <input
                    type="file"
                    accept={IMAGE_INPUT_ACCEPT}
                    onChange={async (e) => {
                      await uploadReviewImage(idx, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  {!!review.image && (
                    <button className="btn small outline" type="button" onClick={() => patchReview(idx, 'image', '')}>
                      Remove Current Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn outline" type="button" onClick={addReview}>+ Add Review</button>
      </div>
    );
  };

  const renderFooterMenu = () => {
    const defaultMenuItems = [
      { id: 'footer-home', label: 'HOME', href: '/' },
      { id: 'footer-hotels', label: 'HOTELS', href: '/destinations' },
      { id: 'footer-destinations', label: 'DESTINATIONS', href: '/listings' },
      { id: 'footer-contact', label: 'CONTACT', href: '/contact' },
    ];
    const rawMenuItems = Array.isArray(homePage.footerMenu) ? homePage.footerMenu : [];
    const menuItems = defaultMenuItems.map((defaultItem, idx) => ({
      ...defaultItem,
      ...(rawMenuItems[idx] || {}),
      id: defaultItem.id,
      label: defaultItem.label,
    }));

    const patchMenuItem = (idx, field, value) => {
      patchHome('footerMenu', menuItems.map((item, itemIdx) => (
        itemIdx === idx ? { ...item, [field]: value } : item
      )));
    };

    return (
      <div className="panel-section">
        <h2 className="section-title">📚 Footer Menu</h2>
        <p className="section-desc">The footer menu matches the header: Home, Hotels, Destinations, and Contact. You can update the links, but no extra items are shown.</p>

        <div className="items-list">
          {menuItems.map((item, idx) => (
            <div key={item.id || idx} className="item-card">
              <div className="item-card-header">
                <span className="item-num">Menu Item #{idx + 1}</span>
              </div>

              <div className="form-grid compact">
                <div className="form-group">
                  <label>Label</label>
                  <input value={item.label || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Link</label>
                  <input value={item.href || ''} onChange={(e) => patchMenuItem(idx, 'href', e.target.value)} placeholder="/contact or https://example.com" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDestinations = () => {
    const DEST_TABS = [
      { id: 'basic', label: 'Basic Info' },
      { id: 'destination-info', label: 'Destination Info' },
      { id: 'tourist-points', label: 'Tourist Points' },
    ];
    const POINT_TABS = [
      { id: 'info', label: 'Information' },
      { id: 'rooms', label: 'Rooms' },
      { id: 'activities', label: 'Activities' },
      { id: 'gallery', label: 'Gallery & Images' },
      { id: 'famous', label: 'Famous Places' },
    ];

    /* ── Information sub-tab ── */
    const renderInfoTab = () => (
      <div className="sub-tab-content">
        <div className="form-grid">
          <div className="form-group full">
            <label>Section Title</label>
            <input value={destinationContent.infoTitle || ''} onChange={(e) => patchDestinationContentField('destinationInfoTitle', e.target.value)} placeholder="Discover this destination" />
          </div>
          <div className="form-group full">
            <label>Description</label>
            <textarea rows={5} value={destinationContent.infoDescription || ''} onChange={(e) => patchDestinationContentField('destinationInfoDescription', e.target.value)} placeholder="Describe this destination..." />
          </div>
          <div className="form-group full">
            <label>Google Maps Embed</label>
            <textarea
              rows={5}
              value={destinationContent.mapEmbed || ''}
              onChange={(e) => patchDestinationContentField('destinationMapEmbed', e.target.value)}
              placeholder="Paste a Google Maps iframe or the embed URL here"
            />
          </div>
          <div className="form-group full">
            <label>Highlights / Bullets (one per line)</label>
            <textarea rows={4} value={joinLines(normalizeBulletLines(destinationContent.infoBullets || []))} onChange={(e) => patchDestinationContentField('destinationInfoBullets', normalizeBulletLines(e.target.value))} placeholder="Comfortable Rooms & Eco-Friendly&#10;Resort Located 8 Minutes from Airport&#10;Beautiful Mountain Views" />
          </div>
          <div className="form-group full">
            <label>Information Images (3 recommended)</label>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              multiple
              onChange={async (e) => {
                await uploadDestinationInfoImages(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {(destinationContent.infoGallery || []).length > 0 && (
            <div className="image-preview-grid full">
              {cleanLines(destinationContent.infoGallery).map((url, i) => (
                <div key={i} className="img-thumb">
                  <img src={url} alt={`Info ${i + 1}`} />
                  <span>Image {i + 1}{getBase64SizeMb(url) ? ` · ${getBase64SizeMb(url)}` : ''}</span>
                  <button className="btn-icon danger" type="button" onClick={() => removeDestinationInfoImageAt(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {cleanLines(destinationContent.infoGallery).length > 0 && (
            <div className="form-group full">
              <button className="btn small outline" type="button" onClick={() => patchDestinationContentField('destinationInfoGallery', [])}>
                Remove All Information Images
              </button>
            </div>
          )}
        </div>
      </div>
    );

    /* ── Rooms sub-tab ── */
    const renderRoomsTab = () => {
      const rooms = destinationContent.rooms || [];
      return (
        <div className="sub-tab-content">
          {rooms.map((room, rIdx) => (
            <div key={rIdx} className="nested-card">
              <div className="nested-card-header">
                <span className="item-num">Room #{rIdx + 1}</span>
                <button className="btn-icon danger" onClick={() => removeRoom(rIdx)} title="Remove Room">✕</button>
              </div>

              <div className="form-grid compact">
                <div className="form-group full">
                  <label>Room Title</label>
                  <input value={room.title || ''} onChange={(e) => updateRoom(rIdx, 'title', e.target.value)} placeholder="Deluxe Master Room" />
                </div>
                <div className="form-group">
                  <label>Price Per Day (PKR)</label>
                  <input value={room.price || ''} onChange={(e) => updateRoom(rIdx, 'price', e.target.value)} placeholder="14,000" />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input value={room.discountPercent || ''} onChange={(e) => updateRoom(rIdx, 'discountPercent', e.target.value)} placeholder="15" />
                </div>
                <div className="form-group full">
                  <label>Discount Note</label>
                  <input value={room.discountNote || ''} onChange={(e) => updateRoom(rIdx, 'discountNote', e.target.value)} placeholder="Weekend special for this room" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input value={room.quantity || ''} onChange={(e) => updateRoom(rIdx, 'quantity', e.target.value)} placeholder="05" />
                </div>
                <div className="form-group">
                  <label>No. of Persons</label>
                  <input value={room.persons || ''} onChange={(e) => updateRoom(rIdx, 'persons', e.target.value)} placeholder="2" />
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input value={room.area || ''} onChange={(e) => updateRoom(rIdx, 'area', e.target.value)} placeholder="450 sq ft" />
                </div>

                {/* Room Images */}
                <div className="form-group full">
                  <label>Room Images</label>
                  <input
                    type="file"
                    accept={IMAGE_INPUT_ACCEPT}
                    multiple
                    onChange={async (e) => {
                      await uploadRoomImages(rIdx, e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>
                {cleanLines(Array.isArray(room.images) ? room.images : (room.image ? [room.image] : [])).length > 0 && (
                  <div className="image-preview-grid full">
                    {cleanLines(Array.isArray(room.images) ? room.images : [room.image]).map((url, i) => (
                      <div key={i} className="img-thumb">
                        <img src={url} alt={`Room ${rIdx + 1} img ${i + 1}`} />
                        <span>Img {i + 1}{getBase64SizeMb(url) ? ` · ${getBase64SizeMb(url)}` : ''}</span>
                        <button className="btn-icon danger" type="button" onClick={() => removeRoomImageAt(rIdx, i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {cleanLines(Array.isArray(room.images) ? room.images : (room.image ? [room.image] : [])).length > 0 && (
                  <div className="form-group full">
                    <button className="btn small outline" type="button" onClick={() => updateRoom(rIdx, 'images', [])}>
                      Remove All Room Images
                    </button>
                  </div>
                )}

                {/* Facilities / Amenities */}
                <div className="form-group full">
                  <label>Facilities / Amenities</label>
                  <div className="amenities-list">
                    {(room.amenities || []).map((am, aIdx) => (
                      <div key={aIdx} className="amenity-row">
                        <input className="amenity-icon-input" value={am.icon || ''} onChange={(e) => updateRoomAmenity(rIdx, aIdx, 'icon', e.target.value)} placeholder="🍳" />
                        <input className="amenity-label-input" value={am.label || ''} onChange={(e) => updateRoomAmenity(rIdx, aIdx, 'label', e.target.value)} placeholder="Free Breakfast" />
                        <button className="btn-icon danger small" onClick={() => removeRoomAmenity(rIdx, aIdx)} title="Remove">✕</button>
                      </div>
                    ))}
                    <button className="btn small outline" onClick={() => addRoomAmenity(rIdx)}>+ Add Facility</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn outline" onClick={addRoom}>+ Add Room</button>
        </div>
      );
    };

    /* ── Activities sub-tab ── */
    const renderActivitiesTab = () => {
      const activities = destinationContent.activities || [];
      return (
        <div className="sub-tab-content">
          {activities.map((act, aIdx) => (
            <div key={aIdx} className="nested-card">
              <div className="nested-card-header">
                <span className="item-num">Activity #{aIdx + 1}</span>
                <button className="btn-icon danger" onClick={() => removeActivity(aIdx)} title="Remove Activity">✕</button>
              </div>
              <div className="form-grid compact">
                <div className="form-group full">
                  <label>Title</label>
                  <input value={act.title || ''} onChange={(e) => updateActivity(aIdx, 'title', e.target.value)} placeholder="#WhatAwaitsYou" />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea rows={3} value={act.description || ''} onChange={(e) => updateActivity(aIdx, 'description', e.target.value)} />
                </div>
                <div className="form-group full">
                  <label>5 Activity Images (mandatory)</label>
                  <div className="activity-images-grid">
                    {[0, 1, 2, 3, 4].map((imgIdx) => {
                      const imgUrl = (act.images || [])[imgIdx] || '';
                      return (
                        <div key={imgIdx} className="activity-img-slot">
                          <label>Image {imgIdx + 1} {!imgUrl && <span className="required">*</span>}</label>
                          <input
                            type="file"
                            accept={IMAGE_INPUT_ACCEPT}
                            onChange={async (e) => {
                              await uploadActivityImageAt(aIdx, imgIdx, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                          {imgUrl && (
                            <button className="btn small outline" type="button" onClick={() => updateActivityImage(aIdx, imgIdx, '')}>
                              Remove Image
                            </button>
                          )}
                          {imgUrl && <img src={imgUrl} alt={`Act ${aIdx + 1} img ${imgIdx + 1}`} className="activity-img-preview" />}
                          {imgUrl && getBase64SizeMb(imgUrl) && <span className="img-size-label">{getBase64SizeMb(imgUrl)}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn outline" onClick={addActivity}>+ Add Activity</button>
        </div>
      );
    };

    /* ── Famous Places sub-tab ── */
    const renderFamousPlacesTab = () => {
      const places = destinationContent.famousPlaces || [];
      return (
        <div className="sub-tab-content">
          {places.map((place, idx) => (
            <div key={idx} className="nested-card">
              <div className="nested-card-header">
                <span className="item-num">Place #{idx + 1}</span>
                <button className="btn-icon danger" onClick={() => removeFamousPlace(idx)} title="Remove">✕</button>
              </div>
              <div className="form-grid compact">
                <div className="form-group full">
                  <label>Title</label>
                  <input value={place.title || ''} onChange={(e) => updateFamousPlace(idx, 'title', e.target.value)} placeholder="Place name..." />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea rows={3} value={place.description || ''} onChange={(e) => updateFamousPlace(idx, 'description', e.target.value)} placeholder="Describe this place..." />
                </div>
                <div className="form-group full">
                  <label>Famous Place Images</label>
                  <input
                    type="file"
                    accept={IMAGE_INPUT_ACCEPT}
                    multiple
                    onChange={async (e) => {
                      await uploadFamousPlaceImages(idx, e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>
                {(place.images || []).filter(Boolean).length > 0 && (
                  <div className="form-group full image-preview-grid">
                    {(place.images || []).filter(Boolean).map((imgUrl, imageIdx) => (
                      <div key={`${idx}-${imageIdx}`} className="img-thumb image-thumb-small">
                        <img src={imgUrl} alt={`Famous place ${idx + 1} view ${imageIdx + 1}`} />
                        <button type="button" className="btn-icon danger" onClick={() => removeFamousPlaceImage(idx, imageIdx)} title="Remove image">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn outline" onClick={addFamousPlace}>+ Add Famous Place</button>
        </div>
      );
    };

    /* ── Gallery sub-tab ── */
    const renderGalleryTab = () => (
      <div className="sub-tab-content">
        <div className="form-grid">
          <div className="form-group full">
            <label>Gallery Title</label>
            <input value={destinationContent.galleryTitle || ''} onChange={(e) => patchDestinationContentField('destinationGalleryTitle', e.target.value)} placeholder="GALLERY & IMAGES" />
          </div>
          <div className="form-group full">
            <label>Gallery Description</label>
            <textarea rows={3} value={destinationContent.galleryDescription || ''} onChange={(e) => patchDestinationContentField('destinationGalleryDescription', e.target.value)} placeholder="Explore our beautiful destination..." />
          </div>
          <div className="form-group full">
            <label>Gallery / Hero Images (used in destination hero, 3 recommended)</label>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              multiple
              onChange={async (e) => {
                await uploadDestinationTabImages('destinationGalleryImages', e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {(destinationContent.galleryImages || []).length > 0 && (
            <div className="image-preview-grid full">
              {cleanLines(destinationContent.galleryImages).map((url, i) => (
                <div key={i} className="img-thumb">
                  <img src={url} alt={`Gallery ${i + 1}`} />
                  <span>Gallery {i + 1}{getBase64SizeMb(url) ? ` · ${getBase64SizeMb(url)}` : ''}</span>
                  <button className="btn-icon danger" type="button" onClick={() => removeDestinationTabImageAt('destinationGalleryImages', i)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {cleanLines(destinationContent.galleryImages).length > 0 && (
            <div className="form-group full">
              <button className="btn small outline" type="button" onClick={() => patchDestinationContentField('destinationGalleryImages', [])}>
                Remove All Gallery Images
              </button>
            </div>
          )}
        </div>
      </div>
    );

    const createDestinationInfo = () => {
      const fallbackTabs = selectedDestination?.points?.[0]?.tabs || {};
      patchDestination(selectedDestination.id, (d) => ({
        ...d,
        destinationContentInitialized: true,
        destinationInfoTitle: d.destinationInfoTitle || d.name || fallbackTabs.infoTitle || '',
        destinationInfoDescription: hasContentValue(d.destinationInfoDescription) ? d.destinationInfoDescription : (fallbackTabs.infoDescription || ''),
        destinationMapEmbed: d.destinationMapEmbed || '',
        destinationInfoBullets: hasContentValue(d.destinationInfoBullets) ? cleanLines(d.destinationInfoBullets || []) : cleanLines(fallbackTabs.infoBullets || []),
        destinationInfoGallery: hasContentValue(d.destinationInfoGallery) ? cleanLines(d.destinationInfoGallery || []) : cleanLines(fallbackTabs.infoGallery || []),
        destinationRooms: hasContentValue(d.destinationRooms) ? (d.destinationRooms || []) : (fallbackTabs.rooms || []),
        destinationActivities: hasContentValue(d.destinationActivities) ? (d.destinationActivities || []) : (fallbackTabs.activities || []),
        destinationFamousPlaces: hasContentValue(d.destinationFamousPlaces) ? (d.destinationFamousPlaces || []) : (fallbackTabs.famousPlaces || []),
        destinationGalleryTitle: hasContentValue(d.destinationGalleryTitle) ? d.destinationGalleryTitle : (fallbackTabs.galleryTitle || ''),
        destinationGalleryDescription: hasContentValue(d.destinationGalleryDescription) ? d.destinationGalleryDescription : (fallbackTabs.galleryDescription || ''),
        destinationGalleryImages: hasContentValue(d.destinationGalleryImages) ? cleanLines(d.destinationGalleryImages || []) : cleanLines(fallbackTabs.galleryImages || []),
      }));
    };

    const renderDestinationInfoTab = () => {
      const hasDestinationInfo = Boolean(selectedDestination) && (
        Boolean(selectedDestination.destinationContentInitialized) ||
        hasContentValue(selectedDestination.destinationInfoTitle) ||
        hasContentValue(selectedDestination.destinationInfoDescription) ||
        hasContentValue(selectedDestination.destinationMapEmbed) ||
        hasContentValue(selectedDestination.destinationInfoBullets) ||
        hasContentValue(selectedDestination.destinationInfoGallery) ||
        hasContentValue(selectedDestination.destinationRooms) ||
        hasContentValue(selectedDestination.destinationActivities) ||
        hasContentValue(selectedDestination.destinationFamousPlaces) ||
        hasContentValue(selectedDestination.destinationGalleryImages) ||
        hasContentValue(selectedDestination.points?.[0]?.tabs?.infoDescription) ||
        hasContentValue(selectedDestination.points?.[0]?.tabs?.rooms) ||
        hasContentValue(selectedDestination.points?.[0]?.tabs?.activities)
      );

      if (!selectedDestination) {
        return (
          <div className="sub-tab-content">
            <p className="empty-msg">Select a destination first.</p>
          </div>
        );
      }

      if (!hasDestinationInfo) {
        return (
          <div className="sub-tab-content">
            <div className="dest-panel-head">
              <div>
                <h3>Destination Information</h3>
                <p className="section-desc">Add the main overview content for this destination. Tourist points stay separate and are only used for the small cards.</p>
              </div>
              <button className="btn small primary" type="button" onClick={createDestinationInfo}>+ Add Info</button>
            </div>
            <p className="empty-msg">No destination info added yet.</p>
          </div>
        );
      }

      return (
        <div className="sub-tab-content">
          <div className="dest-panel-head">
            <div>
              <h3>Destination Information</h3>
              <p className="section-desc">This content controls the full destination detail tabs. Tourist points stay separate and only work as the small cards.</p>
            </div>
          </div>
          <div className="inner-tabs">
            {POINT_TABS.map((t) => (
              <button key={t.id} className={`inner-tab${pointTab === t.id ? ' active' : ''}`} onClick={() => setPointTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="inner-tab-body">
            {pointTab === 'info' && renderInfoTab()}
            {pointTab === 'rooms' && renderRoomsTab()}
            {pointTab === 'activities' && renderActivitiesTab()}
            {pointTab === 'gallery' && renderGalleryTab()}
            {pointTab === 'famous' && renderFamousPlacesTab()}
          </div>
        </div>
      );
    };

    /* ── Points panel ── */
    const renderPointsPanel = () => {
      if (!selectedDestination) return <p className="empty-msg">Select a destination first.</p>;
      const points = selectedDestination.points || [];

      return (
        <div className="points-section">
          <div className="dest-panel-head">
            <h3>Tourist Points ({points.length})</h3>
            <button className="btn small primary" onClick={addPoint}>+ Add Point</button>
          </div>

          {points.length === 0 ? (
            <p className="empty-msg">No tourist points added yet.</p>
          ) : (
            <div className="points-list">
              {points.map((point) => (
                <div key={point.id} className="point-card">
                  <div className="point-card-header" style={{ cursor: 'default' }}>
                    <div className="point-card-meta">
                      {point.cardImage && (
                        <img src={point.cardImage} alt={point.name} className="point-card-thumb" />
                      )}
                      <div className="point-card-fields">
                        <div className="form-group" style={{ marginBottom: 8 }}>
                          <label>Point Name</label>
                          <input
                            value={point.name || ''}
                            onChange={(e) => { const name = e.target.value; patchPoint(selectedDestination.id, point.id, (p) => ({ ...p, name, slug: toSlug(name) })); }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 8 }}>
                          <label>Slug</label>
                          <input
                            value={point.slug || ''}
                            onChange={(e) => patchPoint(selectedDestination.id, point.id, (p) => ({ ...p, slug: toSlug(e.target.value) }))}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 8 }}>
                          <label>Google Place ID</label>
                          <input
                            value={point.googlePlaceId || ''}
                            onChange={(e) => patchPoint(selectedDestination.id, point.id, (p) => ({ ...p, googlePlaceId: e.target.value }))}
                            placeholder="ChIJ..."
                          />
                        </div>
                        <div className="form-group">
                          <label>Card Image Upload</label>
                          <input
                            type="file"
                            accept={IMAGE_INPUT_ACCEPT}
                            onChange={(e) => {
                              setSelectedPointId(point.id);
                              handlePointCardImageUpload(e.target.files?.[0]);
                            }}
                          />
                          {!!point.cardImage && (
                            <button className="btn small outline" style={{ marginTop: 6 }} type="button"
                              onClick={() => patchPoint(selectedDestination.id, point.id, (p) => ({ ...p, cardImage: '' }))}>
                              Remove Image
                            </button>
                          )}
                        </div>
                        <div className="form-group upload-field-stack">
                          <label>Hero Section Slides</label>
                          <input
                            type="file"
                            accept={IMAGE_INPUT_ACCEPT}
                            multiple
                            onChange={async (e) => {
                              await handlePointHeroSlidesUpload(point.id, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </div>
                        {cleanLines(point.heroSlides || []).length > 0 && (
                          <div className="image-preview-grid full">
                            {cleanLines(point.heroSlides).map((url, i) => (
                              <div key={`${point.id}-${i}`} className="img-thumb"><img src={url} alt={`${point.name} slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removePointHeroSlideAt(point.id, i)} title="Remove slide">✕</button></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="btn-icon danger" style={{ alignSelf: 'flex-start' }} onClick={() => { setSelectedPointId(point.id); removePoint(); }} title="Delete point">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="panel-section">
        <h2 className="section-title">🏔️ Destinations</h2>
        <p className="section-desc">Manage resort destinations and tourist points with their content tabs.</p>

        <div className="form-grid" style={{ marginBottom: 20 }}>
          <div className="form-group full admin-subsection">
            <label>Destinations Page Hero Title</label>
            <textarea
              rows={3}
              value={destinationsPage.heroTitle || ''}
              onChange={(e) => patchDestinationsPage('heroTitle', e.target.value)}
              placeholder="EXPLORE\nDESTINATIONS"
            />
          </div>
          <div className="form-group full admin-subsection">
            <label>Destinations Page Hero Slides</label>
            <p className="section-note">Upload the images used at the top of the Destinations listing page.</p>
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              multiple
              onChange={async (e) => {
                await handleDestinationsPageHeroSlidesUpload(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {cleanLines(destinationsPage.heroSlides || []).length > 0 && (
            <div className="image-preview-grid full">
              {cleanLines(destinationsPage.heroSlides).map((url, i) => (
                <div key={`destinations-page-slide-${i}`} className="img-thumb"><img src={url} alt={`Destinations page slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removeDestinationsPageHeroSlideAt(i)} title="Remove slide">✕</button></div>
              ))}
            </div>
          )}
        </div>

        {/* Destination selector */}
        <div className="dest-selector-bar">
          <select value={selectedDestination?.id || ''} onChange={(e) => {
            setSelectedDestinationId(e.target.value);
            const nd = destinations.find((d) => d.id === e.target.value);
            setSelectedPointId(nd?.points?.[0]?.id || '');
            setDestTab('basic');
            setPointTab('info');
          }}>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn small primary" onClick={addDestination}>+ New Destination</button>
        </div>

        {selectedDestination && (
          <>
            {/* Destination-level tabs */}
            <div className="inner-tabs dest-level-tabs">
              {DEST_TABS.map((t) => (
                <button key={t.id} className={`inner-tab${destTab === t.id ? ' active' : ''}`} onClick={() => setDestTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {destTab === 'basic' && (
              <div className="inner-tab-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Destination Name</label>
                    <input value={selectedDestination.name || ''} onChange={(e) => { const name = e.target.value; patchDestination(selectedDestination.id, (d) => ({ ...d, name, slug: toSlug(name) })); }} />
                  </div>
                  <div className="form-group">
                    <label>Slug</label>
                    <input value={selectedDestination.slug || ''} onChange={(e) => patchDestination(selectedDestination.id, (d) => ({ ...d, slug: toSlug(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label>Google Place ID</label>
                    <input
                      value={selectedDestination.googlePlaceId || ''}
                      onChange={(e) => patchDestination(selectedDestination.id, (d) => ({ ...d, googlePlaceId: e.target.value }))}
                      placeholder="ChIJ..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Image Upload</label>
                    <input type="file" accept={IMAGE_INPUT_ACCEPT} onChange={(e) => handleDestinationCardImageUpload(e.target.files?.[0])} />
                    {!!selectedDestination.cardImage && (
                      <button className="btn small outline" type="button" onClick={() => patchDestination(selectedDestination.id, (d) => ({ ...d, cardImage: '' }))}>
                        Remove Current Image
                      </button>
                    )}
                  </div>
                  {selectedDestination.cardImage && (
                    <div className="image-preview-grid full">
                      <div className="img-thumb large">
                        <img src={selectedDestination.cardImage} alt="Card" />
                        {getBase64SizeMb(selectedDestination.cardImage) && <span>{getBase64SizeMb(selectedDestination.cardImage)}</span>}
                      </div>
                    </div>
                  )}
                  <div className="form-group full admin-subsection">
                    <label>Destination Hero Section</label>
                    <p className="section-note">Upload the slides used in the destination hero banner.</p>
                    <input
                      type="file"
                      accept={IMAGE_INPUT_ACCEPT}
                      multiple
                      onChange={async (e) => {
                        await handleDestinationHeroSlidesUpload(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {cleanLines(selectedDestination.heroSlides || []).length > 0 && (
                    <div className="image-preview-grid full">
                      {cleanLines(selectedDestination.heroSlides).map((url, i) => (
                        <div key={i} className="img-thumb"><img src={url} alt={`Slide ${i + 1}`} /><span>Slide {i + 1}</span><button className="btn-icon danger small" type="button" onClick={() => removeDestinationHeroSlideAt(i)} title="Remove slide">✕</button></div>
                      ))}
                    </div>
                  )}
                  <div className="form-group full">
                    <button className="btn small danger" onClick={removeDestination}>Delete This Destination</button>
                  </div>
                </div>
              </div>
            )}

            {destTab === 'destination-info' && (
              <div className="inner-tab-body">
                {renderDestinationInfoTab()}
              </div>
            )}

            {destTab === 'tourist-points' && (
              <div className="inner-tab-body">
                {renderPointsPanel()}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBookings = () => {
    const q = bookingSearch.toLowerCase();
    const filtered = bookings.filter((b) => {
      if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
      if (q && !(
        (b.fullName || '').toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q) ||
        (b.mobile || '').toLowerCase().includes(q) ||
        (b.roomName || '').toLowerCase().includes(q) ||
        (b.resortName || '').toLowerCase().includes(q)
      )) return false;
      return true;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKINGS_PER_PAGE));
    const safePage = Math.min(bookingPage, totalPages);
    const paged = filtered.slice((safePage - 1) * BOOKINGS_PER_PAGE, safePage * BOOKINGS_PER_PAGE);

    return (
      <div className="panel-section">
        <h2 className="section-title">📋 Bookings</h2>

        {/* toolbar */}
        <div className="booking-toolbar">
          <input className="booking-search" placeholder="Search name, email, mobile, room..." value={bookingSearch} onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }} />
          <select className="booking-filter" value={bookingFilter} onChange={(e) => { setBookingFilter(e.target.value); setBookingPage(1); }}>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="email_failed">Email Failed</option>
          </select>
          <span className="booking-count">{filtered.length} of {bookings.length} bookings</span>
          <button className="btn small outline" onClick={() => loadDashboard(token)}>Refresh</button>
        </div>

        {paged.length === 0 ? <p className="empty-msg">No bookings match your filters.</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Guest</th><th>Mobile</th><th>Email</th><th>Room</th><th>Resort</th><th>Dates</th><th>Persons</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paged.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.fullName}</strong></td>
                    <td className="nowrap">{b.mobile || '—'}</td>
                    <td>{b.email}</td>
                    <td>{b.roomName}</td>
                    <td>{b.resortName}</td>
                    <td className="nowrap">
                      {editingBookingId === b.id ? (
                        <div className="booking-edit-dates">
                          <input
                            type="date"
                            value={bookingEdits.dateFrom}
                            min={todayDateStr}
                            onChange={(e) => handleBookingEditChange('dateFrom', e.target.value)}
                          />
                          <span>→</span>
                          <input
                            type="date"
                            value={bookingEdits.dateTo}
                            min={nextDayFromCheckIn}
                            onChange={(e) => handleBookingEditChange('dateTo', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>{b.dateFrom} → {b.dateTo}</>
                      )}
                    </td>
                    <td>
                      {editingBookingId === b.id ? (
                        <input
                          type="number"
                          value={bookingEdits.persons}
                          min="1"
                          onChange={(e) => handleBookingEditChange('persons', e.target.value)}
                          className="booking-persons-input"
                        />
                      ) : (
                        b.persons || '—'
                      )}
                    </td>
                    <td>
                      <select className={`status-select ${b.status}`} value={b.status} onChange={(e) => handleBookingStatus(b.bookingId || b.id, e.target.value)}>
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="email_failed">Email Failed</option>
                      </select>
                    </td>
                    <td>
                      {editingBookingId === b.id ? (
                        <div className="booking-edit-actions">
                          <button className="btn small" onClick={() => handleBookingSave(b.bookingId || b.id)}>Save</button>
                          <button className="btn small outline" onClick={handleBookingCancel}>Cancel</button>
                        </div>
                      ) : (
                        <div className="booking-edit-actions">
                          <button className="btn small outline" onClick={() => handleBookingEditStart(b)}>Edit</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="booking-pagination">
            <button className="btn small" disabled={safePage <= 1} onClick={() => setBookingPage(safePage - 1)}>← Prev</button>
            <span className="page-info">Page {safePage} of {totalPages}</span>
            <button className="btn small" disabled={safePage >= totalPages} onClick={() => setBookingPage(safePage + 1)}>Next →</button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return renderDashboard();
      case 'home-hero': return renderHeroSection();
      case 'listings-hero': return renderListingsHeroSection();
      case 'getaways-hero': return renderGetawaysHeroSection();
      case 'home-travel': return renderTravelSection();
      case 'home-locations': return renderLocations();
      case 'home-dining': return renderDining();
      case 'home-offers': return renderOffers();
      case 'home-app': return renderAppSection();
      case 'home-contact': return renderContact();
      case 'home-footer-menu': return renderFooterMenu();
      case 'home-footer-reviews': return renderFooterReviews();
      case 'destinations': return renderDestinations();
      case 'bookings': return renderBookings();
      default: return renderDashboard();
    }
  };

  /* ── MAIN LAYOUT ───────────────────────────────── */
  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-logo">
            {adminBrandLogo ? (
              <img src={adminBrandLogo} alt="Brand logo" className="brand-logo-img" />
            ) : null}
          </span>
          <span className="brand-sub">CMS Panel</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`nav-item${activeNav === item.id ? ' active' : ''}`} onClick={() => navTo(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn danger full" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <h1 className="topbar-title">{NAV_ITEMS.find((n) => n.id === activeNav)?.label || 'Dashboard'}</h1>
          <div className="topbar-actions">
            <button className="btn primary compact" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save'}</button>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
          {status && <div className="toast success" onClick={() => setStatus('')}>{status}</div>}
          {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default AdminCMS;
