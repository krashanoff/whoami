const markdownIt = require("markdown-it");
const rss = require("@11ty/eleventy-plugin-rss");

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('styles/**/*.pcss');

  // RSS moment
  eleventyConfig.addPlugin(rss);

  // I need footnotes.
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };
  let markdown = markdownIt(options).use(require("markdown-it-footnote"));

  // I also need markdown and YAML data files.
  eleventyConfig.setLibrary("md", markdown);

  // Date formatting.
  eleventyConfig.addFilter("datePlain", (value) => new Date(value).toLocaleDateString('en-US', {
    dateStyle: 'medium'
  }));
  eleventyConfig.addFilter("markdown", (value) => markdown.render(value));
  eleventyConfig.addFilter("timeSinceYear", (value) => 2022 - Number(value));

  eleventyConfig.addCollection("posts", (collection) => {
    let posts = collection.getFilteredByGlob("src/posts/**/*.md");
    posts.reverse();
    return posts;
  });

  // CNAME
  const static = ["static", "CNAME", "robots.txt", "index.css", "resume.css"];
  static.forEach(v => eleventyConfig.addPassthroughCopy(`src/${v}`));

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};
