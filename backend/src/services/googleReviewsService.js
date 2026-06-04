const fetchGoogleReviews = async ({ placeId, apiKey }) => {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,rating,user_ratings_total,reviews,url',
    key: apiKey,
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload?.status === 'REQUEST_DENIED' || payload?.status === 'INVALID_REQUEST') {
    const error = new Error(payload?.error_message || payload?.status || 'Failed to fetch Google reviews.');
    error.status = 502;
    throw error;
  }

  if (payload?.status && payload.status !== 'OK') {
    return {
      placeId,
      placeName: '',
      rating: null,
      userRatingsTotal: null,
      googleMapsUrl: '',
      reviews: [],
      status: payload.status,
    };
  }

  const result = payload?.result || {};
  const reviews = Array.isArray(result.reviews)
    ? result.reviews
        .map((item, index) => ({
          id: `${placeId}-${index}`,
          name: String(item?.author_name || 'Google User').trim(),
          avatar: String(item?.profile_photo_url || '').trim(),
          review: String(item?.text || '').trim(),
          rating: Number(item?.rating) || null,
          relativeTime: String(item?.relative_time_description || '').trim(),
          authorUrl: String(item?.author_url || '').trim(),
          source: 'google',
        }))
        .filter((item) => item.review)
    : [];

  return {
    placeId,
    placeName: String(result?.name || '').trim(),
    rating: Number(result?.rating) || null,
    userRatingsTotal: Number(result?.user_ratings_total) || null,
    googleMapsUrl: String(result?.url || '').trim(),
    reviews,
    status: payload?.status || 'OK',
  };
};

module.exports = {
  fetchGoogleReviews,
};
