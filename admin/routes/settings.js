const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('settings', {
    title: '设置',
    layout: 'layout',
    message: req.query.message || null,
    error: null
  });
});

// 修改密码
router.post('/password', (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '请填写所有密码字段', message: null });
  }

  if (newPassword !== confirmPassword) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '新密码两次输入不一致', message: null });
  }

  if (newPassword.length < 6) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '新密码长度至少6位', message: null });
  }

  let users;
  try {
    users = JSON.parse(fs.readFileSync(config.usersPath, 'utf-8'));
  } catch (e) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '无法读取用户数据', message: null });
  }

  const user = users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '用户不存在', message: null });
  }

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.render('settings', { title: '设置', layout: 'layout', error: '当前密码错误', message: null });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  fs.writeFileSync(config.usersPath, JSON.stringify(users, null, 2), 'utf-8');

  res.render('settings', { title: '设置', layout: 'layout', message: '密码修改成功', error: null });
});

module.exports = router;
