const genSocialImage = require('./utils/generateSocialImage.js');

// Example use for the plugin:
// {% GenerateSocialImage 'Page title...', 'Website name' %}

// Defaults plugin config
const defaults = {
	outputDir: './_site/img/preview',
	urlPath: '/img/preview',
	titleColor: '#FFF',
	hideTerminal: false,
	bgColor: '',
	customSVG: ''
};

module.exports = (eleventyConfig, options) => {

	// Combine defaults with user defined options
	const { outputDir, urlPath, titleColor, siteName, promoImage, hideTerminal, bgColor, customSVG } = { ...defaults, ...options };

	eleventyConfig.addAsyncShortcode("GenerateSocialImage", async (title) => {
		if (!title) return '';

		return await genSocialImage(
			eleventyConfig.javascriptFunctions.slug(title),		// file-name
			title,												// title
			siteName,											// site-name
			promoImage,											// promo-image
			{													// options
				outputDir,
				urlPath,
				titleColor,
				hideTerminal,
				bgColor,
				customSVG
			}
		);
	});

};
