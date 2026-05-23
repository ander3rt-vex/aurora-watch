module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  // Netlify sets NETLIFY=true automatically; GitHub Pages needs the sub-path prefix
  const pathPrefix = process.env.NETLIFY ? "/" : "/aurora-watch/";

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix,
  };
};
