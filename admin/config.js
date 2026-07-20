const path = require('path');

module.exports = {
  port: process.env.PORT || 8080,
  sessionSecret: process.env.SESSION_SECRET || 'apiknow-dev-secret-change-me',
  rootDir: path.join(__dirname, '..'),
  siteDir: path.join(__dirname, '..', 'site-2.0'),
  contentDir: path.join(__dirname, '..', 'site-2.0', 'content'),
  publishedDir: path.join(__dirname, '..', 'site-2.0', 'content', '05-已发布'),
  draftDir: path.join(__dirname, '..', 'site-2.0', 'content', '03-草稿'),
  reviewDir: path.join(__dirname, '..', 'site-2.0', 'content', '04-审核中'),
  dataDir: path.join(__dirname, 'data'),
  usersPath: path.join(__dirname, 'data', 'users.json'),
  categoriesPath: path.join(__dirname, 'data', 'categories.json'),
  seriesPath: path.join(__dirname, 'data', 'series.json'),
};
