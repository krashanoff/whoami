const markdownIt = require("markdown-it");
const rss = require("@11ty/eleventy-plugin-rss");
const math = require("eleventy-plugin-mathjax");
const pluginMermaid = require("@kevingimbel/eleventy-plugin-mermaid");

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('styles/**/*.pcss');

  // Math moment
  // eleventyConfig.addPlugin(math, {
  //   output: "chtml",
  //   chtml: {
  //     fontURL:
  //       "https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
  //   },
  //   ignoreFiles: ["./src/resume.njk"],
  // });
  eleventyConfig.addPlugin(pluginMermaid, {
    extra_classes: 'mermaid'
  });

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
