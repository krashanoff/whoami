---
# Very janky, but we generate the resume from front-matter in a markdown
# document.

layout: "layouts/resume.njk"
permalink: "resume/index.html"

competencies:
- name: Software Engineering
  time: 2017
- name: Technical Writing
  time: 2018
- name: Network Applications
  time: 2019
- name: Software Security
  time: 2020

tech:
- name: Linux
  time: 2016
- name: C/C++
  time: 2017
- name: Python
  time: 2017
- name: Shell Scripting
  time: 2017
- name: TCP/IP Stack
  time: 2017
- name: React.js
  time: 2017
- name: Rust
  time: 2018
- name: Go
  time: 2018
- name: BSD Unix
  time: 2019
- name: x86
  time: 2019
- name: SQL
  time: 2020
- name: Java
  time: 2021
- name: C#
  time: 2021

experience:
- company: Booz Allen Hamilton
  location: El Segundo, CA
  positions:
  - position: Engineer
    from: May 2022
    to: Present
    about: |
      * Engineered cross-platform C++ build pipeline that transparently integrated with C# codebase and toolchain.
      * Integrated C++ machine learning model with C# Azure Function application, enabling semantic search.
      * Created parallel web search aggregator in Rust using Lua modules.
      * Created software suite to automate the production and validation of cybersecurity documentation.
  - position: Summer Games Intern
    from: June 2021
    to: August 2021
    about: |
      * Led development of Python library automating operation of leading aerospace and systems engineering software. <!-- * Modeled Air Force Research Lab mission using SysML. -->
      * Integrated mission documentation with simulations using a toolchain engineered in house.
- company: SHHA
  location: San Anselmo, CA
  positions:
  - position: Fullstack Developer
    from: June 2019
    to: September 2019
    about: |
      * Modernized check-in system for community center wrapping a legacy database.
      * Frontend was built with React.js, backend was a Flask microservice.
- company: The Croner Company
  location: Kentfield, CA
  positions:
  - position: Fullstack Intern
    from: February 2017
    to: July 2017
    about: |
      * Helped deploy PostgreSQL database and application WSGI to the internal CentOS server.
      * Scripted migration of data from the legacy system.
      * Helped develop a Django/React.js survey manager.

extra:
- org: ACM@UCLA Teach LA
  title: Lead Developer, Dev Team Director
  location: Los Angeles, CA
  about: |
    * Led development team for a free code editor for teaching kids to program. Built on React.js frontend, Go backend, using Firebase.
    * Developed web development [training program](https://github.com/uclaacm/learning-lab-crash-course-su20) with co-director currently used at other schools.
  accomplishments:
    - "Previously **developer team director for Teach LA**, a club on campus teaching at Title I schools in the Los Angeles Unified School Distict."
    - "**Developed [training program](https://github.com/uclaacm/learning-lab-crash-course-su20)** with co-director of Teach LA currently used at other schools."
# - org: Bruin Language Society
#   title: Instructor
#   location: Los Angeles, CA
#   about: |
#     * Taught a beginner’s Japanese course in 2019 under the largest language-learning club on campus.
#   accomplishments:
#     - "Taught a beginner’s Japanese course in 2019 under the largest language-learning club on campus."



projects:
- name: Gradebetter
  sub: Grading Server
  link: https://github.com/cs130-w22/Group-A3
  about: |
    * Helped lead team of five (5) developers in creation of university capstone.
    * Designed and implemented highly-parallel code runner backend in Go.
    * Designed real-time results view in TypeScript using React.js and WebSockets.
- name: Ribbit
  sub: Chat Application
  about: |
    * Created an asynchronous Rust server providing message-passing for Qt frontend in C++.
    * Network communications were carried out using Protobufs over QUIC.

accomplishments:
- "Taught a beginner's Japanese course in 2019 under the largest language-learning club on campus."
- "Best Use of Marin County Open Data in Marin County’s \"Hack4Health\" 2017 hackathon."
---
