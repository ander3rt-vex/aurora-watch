module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  // GitHub Actions always sets GITHUB_ACTIONS=true; everything else (Netlify, local) serves from /
  const pathPrefix = process.env.GITHUB_ACTIONS === "true" ? "/aurora-watch/" : "/";

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
