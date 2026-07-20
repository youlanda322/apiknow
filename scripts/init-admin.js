/**
 * 初始化管理员账号脚本
 * 用法: node scripts/init-admin.js
 * 默认账号: admin / admin123（首次登录后请尽快修改）
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'admin', 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');

// 确保目录存在
fs.mkdirSync(DATA_DIR, { recursive: true });

// 检查是否已有用户
if (fs.existsSync(USERS_PATH)) {
  const existing = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  if (existing.length > 0) {
    console.log('管理员账号已存在，跳过初始化。');
    console.log('如需重新初始化，请先删除 admin/data/users.json');
    process.exit(0);
  }
}

// 生成 bcrypt 哈希
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('admin123', salt);

const users = [{
  id: 1,
  username: 'admin',
  passwordHash: hash,
  createdAt: new Date().toISOString().split('T')[0]
}];

fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
console.log('===================================');
console.log('  管理员账号已创建');
console.log('  用户名: admin');
console.log('  密码:   admin123');
console.log('  ⚠ 请登录后尽快修改密码!');
console.log('===================================');
