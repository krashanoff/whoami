const markdownIt = require("markdown-it");
const rss = require("@11ty/eleventy-plugin-rss");
const pluginMermaid = require("@kevingimbel/eleventy-plugin-mermaid");

module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('styles/**/*.pcss');

  eleventyConfig.addPlugin(pluginMermaid, {
    extra_classes: 'mermaid'
  });

  // RSS moment
  eleventyConfig.addPlugin(rss);

  // I need footnotes.
  let options = {
    html: true,
    breaks: false,
    linkify: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ''; // use external default escaping
    },
  };
  let markdown = markdownIt(options).use(require("markdown-it-footnote"));

  // I also need markdown.
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
    docs.sort((a, b) => {
      const groupA = a.data.title.match(/.*800-([0-9]{2}).*/)?.at(-1) || '';
      const groupB = b.data.title.match(/.*800-([0-9]{2}).*/)?.at(-1) || '';
      if (a.data.title.startsWith("WIP"))
        return 1;
      if (b.data.title.startsWith("WIP"))
        return -1;
      return Number(groupA) - Number(groupB);
    });
    return docs;
  });
  eleventyConfig.addCollection("fips", (collection) => {
    let docs = collection.getFilteredByGlob("src/cyber/fips/**/*.md");
    docs.sort((a, b) => {
      const groupA = a.data.title.match(/.*-([0-9]{2}).*/)?.at(-1) || '';
      const groupB = b.data.title.match(/.*-([0-9]{2}).*/)?.at(-1) || '';
      if (a.data.title.startsWith("WIP"))
        return 1;
      if (b.data.title.startsWith("WIP"))
        return -1;
      return Number(groupA) - Number(groupB);
    });
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
