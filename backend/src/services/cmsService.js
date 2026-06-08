const CmsData = require('../models/CmsData');
const { readJsonObject } = require('../utils/jsonStore');

const createCmsService = ({ cmsFile, ensureDataDir }) => {
  const getCms = async () => {
    const cms = await CmsData.findOne({ key: 'main' }).lean();
    return {
      destinations: cms?.destinations ?? null,
      homePage: cms?.homePage ?? null,
      reviews: cms?.reviews ?? null,
      destinationsPage: cms?.destinationsPage ?? null,
      listingsPage: cms?.listingsPage ?? null,
      getawaysPage: cms?.getawaysPage ?? null,
      partnerLogos: cms?.partnerLogos ?? null,
    };
  };

  const updateCms = async (cmsPayload) => {
    const update = {};
    if (Array.isArray(cmsPayload?.destinations)) update.destinations = cmsPayload.destinations;
    if (cmsPayload?.homePage && typeof cmsPayload.homePage === 'object') update.homePage = cmsPayload.homePage;
    if (Array.isArray(cmsPayload?.reviews)) update.reviews = cmsPayload.reviews;
    if (cmsPayload?.destinationsPage && typeof cmsPayload.destinationsPage === 'object') update.destinationsPage = cmsPayload.destinationsPage;
    if (cmsPayload?.listingsPage && typeof cmsPayload.listingsPage === 'object') update.listingsPage = cmsPayload.listingsPage;
    if (cmsPayload?.getawaysPage && typeof cmsPayload.getawaysPage === 'object') update.getawaysPage = cmsPayload.getawaysPage;
    if (Array.isArray(cmsPayload?.partnerLogos)) update.partnerLogos = cmsPayload.partnerLogos;

    if (Object.keys(update).length === 0) {
      const error = new Error('No valid CMS fields provided.');
      error.status = 400;
      throw error;
    }

    await CmsData.findOneAndUpdate(
      { key: 'main' },
      { $set: update },
      { upsert: true, returnDocument: 'after' }
    );
  };

  const seedCmsFromFile = async () => {
    ensureDataDir();
    const cms = readJsonObject(cmsFile);
    if (!cms) {
      const error = new Error('CMS source file not found or invalid.');
      error.status = 404;
      error.payload = { cms: null };
      throw error;
    }

    const update = {
      destinations: Array.isArray(cms.destinations) ? cms.destinations : [],
    };
    if (cms.homePage && typeof cms.homePage === 'object') update.homePage = cms.homePage;
    if (Array.isArray(cms.reviews)) update.reviews = cms.reviews;
    if (cms.destinationsPage && typeof cms.destinationsPage === 'object') update.destinationsPage = cms.destinationsPage;
    if (cms.listingsPage && typeof cms.listingsPage === 'object') update.listingsPage = cms.listingsPage;
    if (cms.getawaysPage && typeof cms.getawaysPage === 'object') update.getawaysPage = cms.getawaysPage;
    if (Array.isArray(cms.partnerLogos)) update.partnerLogos = cms.partnerLogos;

    await CmsData.findOneAndUpdate(
      { key: 'main' },
      { $set: update },
      { upsert: true, returnDocument: 'after' }
    );
  };

  return {
    getCms,
    updateCms,
    seedCmsFromFile,
  };
};

module.exports = {
  createCmsService,
};
