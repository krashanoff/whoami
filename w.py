#!/bin/python3

"""
(✿◕‿◕) bless this mess (✿◕‿◕)

Builds and serves the site.

Dependencies (Python libraries):
* `watchdog`
* `pyyaml`

Dependencies (binary):
* `pandoc` with Lua support
"""

import os
import time
import pathlib
import shutil
import http.server
import socketserver
import subprocess as P
from collections import defaultdict
from subprocess import Popen
from datetime import datetime
import yaml
import multiprocessing as mp
import uuid

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

MODE=os.getenv("MODE") or "dev"
SERVER_MODE=MODE.upper() != "BUILD"

BASE_URL="https://krashanoff.com"
SITE_OUT="_site"
PANDOC_PATH=os.getenv("PANDOC_PATH") or "/opt/homebrew/bin/pandoc"
PANDOC_TIMEOUT=3 * 1000
TAG_INFO={
  "thoughts": "Things that I think &#x1F44D",
  "software": "computer :)",
  "web": "Frontend development and notes about the World Wide Web.",
  "server": "The journey of the little server that could&trade;.",
  "cs101": "Special series on the basics of CS.",
  # "cryptography": "Usually about standards.",
  "rant": "airplane food",
  "reverse_engineering": "ghidra delorean"
}
TAG_STYLE_PREAMBLE="""
  <style>
    body {
      font-family: Georgia, 'Times New Roman', Times, serif;
      line-height: 1.5;
      margin: 0 auto;
      max-width: 36em;
      padding: 0.5rem;
    }

    nav {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: 1rem;
      padding-bottom: 2rem;
      border-bottom: solid 1px #0b0b0b;
    }

    details {
      border-left: 5px solid #0b0b0b;
      padding-left: 1rem;
    }

    figure {
      border: 0.5px solid #0b0b0b;
      padding: 1rem;
      max-width: 80%;
      margin-top: 2rem;
      margin-bottom: 2rem;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
    }

    img {
      padding-bottom: 1rem;
    }

    .no-list {
      list-style: none;
      list-style-type: none;
      list-style-type: none;
      padding-left: 0;
    }
  </style>
"""

REPLACE_CHARS={
  ",\":.()[]": "",
  " ": "-",
}

def slugify(title: str):
  """Replace characters to slugify the title of an article"""
  result = title
  for key, val in REPLACE_CHARS.items():
    for c in key:
      result = result.replace(c, val)
  return result.lower()

def get_temp_path():
  """
  I originally used mkstemp, but I changed it after I started
  seeing pandoc exit with status 64.
  """
  os.makedirs("build", exist_ok=True)
  temp_path = f"./build/{uuid.uuid4()}"
  with open(temp_path, "w") as _temp_file:
    pass
  return temp_path

def pandoc_on_path(p):
  """
  Call pandoc on the given input file, returning the path to
  the output file. Any media used by the file will be placed
  into a directory `mediadir` in the current directory of the
  running module.

  After you're done, please delete the temporary file path.
  """
  tmp_file_path = get_temp_path()
  cmd = f"{PANDOC_PATH} -d pandoc/pandoc.yml -o {tmp_file_path} {p}"
  print(f"EXEC {cmd}")
  subp = Popen(cmd.split(" "), stdout=P.PIPE, stderr=P.STDOUT)
  subp.wait(PANDOC_TIMEOUT)
  if subp.returncode == 0:
    print("\t* OK")
  else:
    print(f"\tx FAIL {subp.returncode}")
    exit(1)
  return tmp_file_path

def get_frontmatter(file_path):
  """
  Return the frontmatter for a file as a YAML object.
  """
  with open(file_path, "r") as f:
    content = f.read()
    frontmatter_str = content.split("---")[1]
    print(frontmatter_str)
    if not frontmatter_str:
      return {}
    return yaml.load(frontmatter_str, Loader=yaml.CLoader)
  
def convert_relative_to_canonical(content):
  """
  Converts links like /mediadir/some/file.png to an absolute link
  like krashanoff.com/mediadir/some/file.png.

  This is only really important for images.
  """
  return content.replace("img src=\"/", "img src=\"https://krashanoff.com/")

def format_zulu(datelike):
  return f"{datelike.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]}Z"

def gen_atom(posts_by_tag_with_content):
  with open(f"{SITE_OUT}/feed.xml", "w") as out_file:
    max_post_date = max(posts_by_tag_with_content, key=lambda p: p["date"])["date"]
    out_file.write(f'<feed xmlns="http://www.w3.org/2005/Atom" xml:base="{BASE_URL}">')
    out_file.write(f"""
                    <title>krashanoff</title>
                    <subtitle>The blog of Leonid Krashanoff.</subtitle>
                    <link href="{BASE_URL}/feed.xml" rel="self"/>
                    <link href="{BASE_URL}/"/>
                    <updated>{format_zulu(max_post_date)}</updated>
                    <id>{BASE_URL}/</id>
                    <author>
                      <name>Leonid Krashanoff</name>
                      <email>hello@krashanoff.com</email>
                    </author>
                   """)
    for post in sorted(posts_by_tag_with_content, key=lambda p: p["date"], reverse=True):
      # In the future, might have to change language from 'en' to something else.
      frontmatter = post["frontmatter"]
      iso_ts = format_zulu(post["date"])
      absolute_post_url = post["url"]

      out_file.write(f"""
                    <entry>
                      <title>{frontmatter["title"]}</title>
                      <link href="{absolute_post_url}"/>
                      <updated>{iso_ts}</updated>
                      <id>{absolute_post_url}</id>
                    </entry>
                     """)
      
    out_file.write("</feed>")

def copy(s, d, tree = False):
  print(f"COPY {s} -> {d}")
  try:
    dest_path = pathlib.Path(d)
    create = str(dest_path.parent)
    os.makedirs(create, exist_ok=True)
    if tree:
      shutil.copytree(s, d, dirs_exist_ok=True)
    else:
      shutil.copy(s, d)
  except:
    print("\tx FAIL")
    return -1
  print("\t* OK")
  return 0

def postprocess(file):
  """
  Postprocesses Pandoc outputs. In particular, performs the following:
  1. Corrects links to files that would normally be stored in mediadir.
  2. Groups all footnotes to one spot at the bottom of the page.
  """

  # Process all mediadir links
  updated_content = ""
  with open(file, "r") as f:
    updated_content = f.read()
    updated_content = updated_content.replace("src=\"mediadir/src/static", "src=\"/static")
    updated_content = updated_content.replace("src=\"mediadir/", "src=\"/mediadir/")
  with open(file, "w") as f:
    f.write(updated_content)

def pathify_date(published_at: datetime, filename, frontmatter):
  # filename_without_suffix = filename.removesuffix(".md").split("-", 1)[1]
  return f"{published_at.strftime('%Y/%m/%d')}/{slugify(frontmatter['title'])}/index.html"

def copy_static():
  """
  Copy static files for the website to their intended directory/directories.
  """
  copy("src/CNAME", f"{SITE_OUT}/CNAME")
  copy("src/robots.txt", f"{SITE_OUT}/robots.txt")
  copy("src/resume.html", f"{SITE_OUT}/resume/index.html")
  # Copy the now-populated mediadir
  copy("mediadir", f"{SITE_OUT}/mediadir", True)
  copy("src/static", f"{SITE_OUT}/static", True)

def generate_tags(posts_by_tag):
  """
  Generates tag pages. Expects a dictionary mapping from tag name
  to a list of post metadata.
  """
  for tag_name, tagline in TAG_INFO.items():
    try:
      os.makedirs(f"{SITE_OUT}/tags/{tag_name}")
    except:
      pass

    with open(f"{SITE_OUT}/tags/{tag_name}/index.html", "w") as out_file:
      out_file.write(f"<!DOCTYPE html><html><head><title>{tag_name} - krashanoff</title>")
      out_file.write(TAG_STYLE_PREAMBLE)
      out_file.write("</head>")
      out_file.write(f"<h1>Posts tagged: {tag_name}</h1>")
      out_file.write(f"<p>{tagline}</p>")
      out_file.write("<ul>")

      post_links = []
      for post in posts_by_tag[tag_name]:
        frontmatter, path = post["frontmatter"], post["path"]

        date_plain = frontmatter["date"].strftime("%d %b %Y")
        post_links.append((
          frontmatter["date"],
          f"""
            <li>
              <a href="/{path}" tabindex="0">{frontmatter["title"]}</a>
              <small><time>{date_plain}</time></small>
            </li>
          """,
        ))

      sorted_post_links = list(map(lambda p: p[1], sorted(post_links, key=lambda p: p[0])))
      sorted_post_links.reverse()
      out_file.write("\n".join(sorted_post_links))
      out_file.write("</ul>")
      out_file.write("</html>")

def process_all():
  """Generate the website."""
  processing_start_at = datetime.now()

  # Make output directories
  try:
    os.makedirs({SITE_OUT}, exist_ok=True)
    os.makedirs(f"{SITE_OUT}/posts", exist_ok=True)
  except:
    pass

  # Process posts
  post_links = []
  posts_by_tag = defaultdict(lambda: [])
  for file_path in os.listdir("src/posts"):
    base_path = f"src/posts/{file_path}"
    print(f"Processing {base_path}")

    frontmatter = get_frontmatter(base_path)
    pathified_date = pathify_date(frontmatter["date"], file_path, frontmatter)
    site_target_path = f"{SITE_OUT}/{pathified_date}"

    if "tags" in frontmatter:
      for tag in frontmatter["tags"]:
        posts_by_tag[tag].append({
          "frontmatter": frontmatter,
          "path": pathified_date,
        })

    date_plain = frontmatter["date"].strftime("%d %b %Y")
    post_links.append((
      frontmatter["date"],
      f"""
        <li>
          <a href="{pathified_date.removesuffix('index.html')}" tabindex="0">{frontmatter["title"]}</a>
          <small><time>{date_plain}</time></small>
        </li>
      """,
    ))

    print(f"WRITING PANDOC OUTPUT TO: {site_target_path}")
    pandoc_output_path = pandoc_on_path(base_path)
    postprocess(pandoc_output_path)
    copy(pandoc_output_path, site_target_path)
    os.remove(pandoc_output_path)

  # For each post, get the finalized content for atom generation.
  atom_posts = []
  for file_path in os.listdir("src/posts"):
    updated_path = f"src/posts/{file_path}"
    frontmatter = get_frontmatter(updated_path)
    pathified_date = pathify_date(frontmatter["date"], file_path, frontmatter)

    with open(f"{SITE_OUT}/{pathified_date}") as f:
      print(f"{SITE_OUT}/{pathified_date}")
      content = f.read()
      atom_posts.append({
        "frontmatter": frontmatter,
        "date": frontmatter["date"],
        "url": f"https://krashanoff.com/{pathified_date}"
      })

  # Generate atom feed
  gen_atom(atom_posts)

  # Generate tag pages
  generate_tags(posts_by_tag)

  # Process index
  sorted_post_links = list(map(lambda p: p[1], sorted(post_links, key=lambda p: p[0])))
  sorted_post_links.reverse()
  with open("src/index.html", "r") as f:
    content = f.read()
    content = content.replace("{{ post_list }}", "\n".join(sorted_post_links))
    
    with open(f"{SITE_OUT}/index.html", "w") as outfile:
      outfile.write(content)

  copy_static()

  end_time = datetime.now()
  print(f"Processed all files in {end_time - processing_start_at}")

class ReprocessHandler(FileSystemEventHandler):
  def on_any_event(self, _event):
    process_all()

def register_observer():
  observer = Observer()
  reprocess_handler = ReprocessHandler()
  observer.schedule(reprocess_handler, "src", True)
  observer.schedule(reprocess_handler, "pandoc", True)
  observer.start()
  return observer

class Handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory="_site", **kwargs)

def file_server():
  with socketserver.TCPServer(("", 8080), Handler) as httpd:
    print("Server started at http://localhost:8080")
    httpd.serve_forever()

def main(observe = True):
  """Watch src for changes and reprocess as necessary"""

  process_all()

  # Start server for the output directory
  http_server = mp.Process(target=file_server)
  http_server.start()

  if not observe:
    return  
  observer = register_observer()
  
  try:
    while True:
      time.sleep(5)
  except KeyboardInterrupt:
    observer.stop()
    http_server.join()

if __name__ == '__main__':
  main()
