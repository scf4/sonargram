/* eslint-disable */
const withImages = require('next-images');

module.exports = withImages({
  future: { webpack5: true },
  webpack: (config, _options) => {
    return config;
  },
});

