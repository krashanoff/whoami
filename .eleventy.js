module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('styles/**/*.pcss');

  // I need footnotes.
  let markdownIt = require("markdown-it");
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };
  eleventyConfig.setLibrary("md", markdownIt(options).use(require("markdown-it-footnote")));

  // Date formatting.
  eleventyConfig.addFilter("date", (value) => new Date(value).toLocaleDateString('en-US', {
    dateStyle: 'medium'
  }));

  eleventyConfig.addCollection("posts", (collection) => {
    let posts = collection.getFilteredByGlob("src/posts/**/*.md");
    posts.reverse();
    return posts;
  });

  // CNAME
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};
