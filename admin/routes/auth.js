const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('login', { error: null, layout: false });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { error: '请输入用户名和密码', layout: false });
  }

  let users;
  try {
    users = JSON.parse(fs.readFileSync(config.usersPath, 'utf-8'));
  } catch (e) {
    return res.render('login', { error: '系统错误：无法读取用户数据', layout: false });
  }

  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.render('login', { error: '用户名或密码错误', layout: false });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
