# Eleventy Plugin: Generate Social Images

Dynamically generate social media images for your Eleventy blog pages.

This plugin creates an async ShortCode that can be used in your templates to generate social images.

For example:
```njk
{% GenerateSocialImage "How to load third-party Javascript on demand", "abhi.page/" %}
```
will generate the following social image _(author image set in configuration)_:
![](https://abhi.page/img/preview/how-to-load-third-party-javascript-on-demand.png)

The social image is first created as SVG and then converted to PNG using [Sharp](https://github.com/lovell/sharp).

## Why another social-image generator?
There is already a very good plugin [eleventy-plugin-social-images](https://github.com/5t3ph/eleventy-plugin-social-images) by [Stephanie Eckles
](https://dev.to/5t3ph) who has written a [very good article about her approach](https://dev.to/5t3ph/automated-social-sharing-images-with-puppeteer-11ty-and-netlify-22ln). The plugin is very customizable and can serve most people very well.

I created a new plugin because the above mentioned plugin...
* uses Puppeteer to generate the image from a webpage.
  * I faced some issues running Puppeteer on WSL2, so decided to get rid of the dependency.
* uses a separate build process to generate the images.
  * While it is totally fine (even better as it can be used with any other SSG), I wanted the workflow within the Eleventy build process, i.e, by using an Eleventy ShortCode.

## How does it work?
* Generates the image using SVG and then converts it into PNG using [Sharp](https://github.com/lovell/sharp).
* Custom logic to wrap the title line in SVG (as Sharp does not support SVG foreignObject).
* Adds an author/promo image using Sharp composite (as Sharp does not support external image in SVG).

## TODO
- [ ] Cache result to avoid regenerating same image.
- [ ] More customization options!

## Usage

### STEP 1: Install the package:
```bash
npm install @manustays/eleventy-plugin-generate-social-images
```

### STEP 2: Include it in your `.eleventy.js` config file:

```js
const generateSocialImages = require("@manustays/eleventy-plugin-generate-social-images");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(generateSocialImages, {
    promoImage: "./src/img/my_profile_pic.jpg",
    outputDir: "./_site/img/preview",
    urlPath: "/img/preview"
  });
};
```

### Step 3: Use in your template
For example, in your `base.njk` template file, use it in the `<head>` for generating social image meta tags:
```njk
<meta property="og:image" content="{% GenerateSocialImage title, meta.website_name %}" />
<meta name="twitter:image" content="{% GenerateSocialImage title, meta.website_name %}" />
```

## Config Options

| Option      | Type   | Default       | Description |
| ----------- | ------ | ------------- |-------------|
| promoImage  | string |               | Path to a promo Image (ideally, circular) that will be embedded in the social-images |
| outputDir   | string | "./\_site/img/preview" | Project-relative path to the output directory where images will be generated |
| urlPath     | string | "/img/preview" | A path-prefix-esque directory for the &lt;img src&gt; attribute. e.g. `/img/` for `<img src="/img/MY_IMAGE.jpeg">` |


## Credits

* Original idea from [eleventy-plugin-social-images](https://github.com/5t3ph/eleventy-plugin-social-images)
* I created my own version to avoid the Puppeteer dependency.
