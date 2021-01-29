const fs = require('fs');
const path = require('path');
const sharp = require("sharp");


/**
 * Split a long title into multiple rows
 */
function wrapTitle(title, rowLength, maxRows)
{
	let title_rows = [];
	words = title.split(/(?<=[^a-zA-Z0-9])/);
	let _row = '';
	words.forEach((wrd) => {
		if (_row.length + wrd.length >= rowLength) {
			title_rows.push(_row);
			_row = '';
		}
		_row += wrd;
	});
	if (_row) {
		title_rows.push(_row);
	}

	// Limit rows...
	if (title_rows.length > maxRows) {
		title_rows.length = maxRows;
		title_rows[maxRows-1] += "…";
	}

	return title_rows;
}


/**
 * Sanitize text for embedding into XML/HTML.
 * @param {*} text The text to sanitize
 */
function sanitizeHTML(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}



async function generateSocialImage(filename, title, siteName, authorImage, options = {}) {
	const { outputDir, urlPath, titleColor, hideTerminal, bgColor, terminalBgColor, customSVG, customFontFilename, lineBreakAt } = options;

	if (!(title && outputDir && urlPath)) {
		console.error("eleventy-plugin-generate-social-images Error: Missing values");
		return;
	}

	// Generate outputDir if it does not exist...
	const sep = path.sep;
	const targetDir = path.normalize(outputDir);
	const initDir = path.isAbsolute(targetDir) ? sep : '';
	targetDir.split(sep).reduce((parentDir, childDir) => {
		const curDir = path.resolve(parentDir, childDir);
		if (!fs.existsSync(curDir)) {
			fs.mkdirSync(curDir);
		}
		return curDir;
	}, initDir);


	// Generate multi-line SVG text for the Title...
	const line_length = lineBreakAt;
	const max_lines = 4;
	const start_x = 150;
	const start_y = 210;
	const line_height = 60;
	const font_size = 38;

	let title_rows = wrapTitle(title, line_length, max_lines);

	const start_y_middle = start_y + (((max_lines - title_rows.length) * line_height) / 3);

	const svgTitle = title_rows.reduce((p, c, i) => {
		c = sanitizeHTML(c);
		return p + `<text x="${start_x}" y="${start_y_middle + (i * line_height)}" fill="${titleColor}" font-size="${font_size}px" font-weight="700">${c}</text>`;
	}, '');

	let customFont = '';
	if (customFontFilename) {
		customFont = `@font-face {
					font-family: 'cust';
					font-style: 'normal';
					src: url("${customFontFilename}");
				}`;
	}

	const terminalWindow = `<rect x="100" y="64" width="1000" height="500" rx="16" ry="16" fill="${terminalBgColor}" stroke-width="1" stroke="#aaa" />
		<circle cx="135" cy="100" r="12" fill="#FD5454" />
		<circle cx="170" cy="100" r="12" fill="#F6B23C" />
		<circle cx="205" cy="100" r="12" fill="#22C036" />`;


	let template = `<svg width="1200" height="628" viewbox="0 0 1200 628" xmlns="http://www.w3.org/2000/svg">

		<defs>
			<style>
				${customFont}
			</style>
			<linearGradient id="the-gradient" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="#647DEE" />
				<stop offset="100%" stop-color="#7F53AC" />
			</linearGradient>
		</defs>

		<rect x="0" y="0" width="1200" height="628" rx="0" ry="0" fill="${bgColor || 'url(#the-gradient)'}" />

		${hideTerminal ? '' : terminalWindow}

		${customSVG}

		<g style="font-family:'cust',sans-serif">
			${svgTitle}
			<text x="265" y="500" fill="#fff" font-size="30px" font-weight="700">${siteName}</text>
		</g>
	</svg>`;

	try {
		const svgBuffer = Buffer.from(template);

		const imgInset = await sharp(authorImage)
			.resize({
				width: 100,
				height: 100,
				fit: "contain"
			})
			.toBuffer();

		await sharp(svgBuffer)
			.resize(1200, 628)
			.composite([{ input: imgInset, top: 440, left: 150 }])
			.png()
			.toFile(`${targetDir}/${filename}.png`);
	} catch (err) {
		console.error("eleventy-plugin-generate-social-images Error: ", err, { template, filename, title, siteName, authorImage, options } );
		return '';
	}

	return `${urlPath}/${filename}.png`;
}

module.exports = generateSocialImage;
