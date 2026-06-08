const mongoose = require('mongoose');

const CmsDataSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    destinations: { type: [mongoose.Schema.Types.Mixed], default: [] },
    homePage: { type: mongoose.Schema.Types.Mixed, default: {} },
    reviews: { type: [mongoose.Schema.Types.Mixed], default: [] },
    destinationsPage: { type: mongoose.Schema.Types.Mixed, default: {} },
    listingsPage: { type: mongoose.Schema.Types.Mixed, default: {} },
    getawaysPage: { type: mongoose.Schema.Types.Mixed, default: {} },
    partnerLogos: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CmsData', CmsDataSchema);
