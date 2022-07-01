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
  eleventyConfig.addFilter("datePlain", (value) => new Date(value).toLocaleDateString('en-US', {
    dateStyle: 'medium'
  }));

  eleventyConfig.addCollection("posts", (collection) => {
    let posts = collection.getFilteredByGlob("src/posts/**/*.md");
    posts.reverse();
    return posts;
  });

  // CNAME
  const static = ["static", "CNAME", "robots.txt", "index.css"];
  static.forEach(v => eleventyConfig.addPassthroughCopy(`src/${v}`));

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};
