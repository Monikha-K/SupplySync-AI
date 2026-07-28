export const formatDistance = (miles) => {
  return new Intl.NumberFormat('en-US').format(miles) + ' mi';
};

export const formatRating = (rating) => {
  return Number(rating).toFixed(1);
};