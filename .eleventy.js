const markdownIt = require("markdown-it");
const math = require("markdown-it-katex");
const footnotes = require("markdown-it-footnote");
const rss = require("@11ty/eleventy-plugin-rss");
const diagrams = require("@kevingimbel/eleventy-plugin-mermaid");
const anchors = require("markdown-it-anchor");

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('styles/**/*.pcss');

  // RSS moment
  eleventyConfig.addPlugin(rss);
  // eleventyConfig.addPlugin(diagrams);

  // I need footnotes.
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };
  let markdown = markdownIt(options).use(footnotes).use(math).use(anchors);

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
  eleventyConfig.addCollection("nist", (collection) => {
    let docs = collection.getFilteredByGlob("src/cyber/nist/**/*.md");
    return docs;
  });
  eleventyConfig.addCollection("fips", (collection) => {
    let docs = collection.getFilteredByGlob("src/cyber/fips/**/*.md");
    return docs;
  });
  eleventyConfig.addCollection("etc", (collection) => {
    let docs = collection.getFilteredByGlob("src/cyber/etc/**/*.md");
    return docs;
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
