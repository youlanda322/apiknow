const express = require('express');
const fs = require('fs');
const config = require('../config');

const router = express.Router();

// 分类列表
router.get('/', (req, res) => {
  let categories = [];
  try {
    categories = JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8'));
  } catch (e) {}

  res.render('categories/list', {
    title: '分类管理',
    categories,
    layout: 'layout',
    error: req.query.error || null
  });
});

// 新建分类
router.post('/', (req, res) => {
  const { id, label } = req.body;
  if (!id || !label) {
    return res.redirect('/categories?error=ID和名称为必填');
  }

  let categories = [];
  try {
    categories = JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8'));
  } catch (e) {}

  if (categories.find(c => c.id === id)) {
    return res.redirect('/categories?error=该ID已存在');
  }

  categories.push({ id, label });
  fs.writeFileSync(config.categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');
  res.redirect('/categories');
});

// 更新分类
router.post('/:id', (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  let categories = [];
  try {
    categories = JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8'));
  } catch (e) {}

  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return res.redirect('/categories?error=分类不存在');

  if (label) categories[idx].label = label;
  fs.writeFileSync(config.categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');
  res.redirect('/categories');
});

// 删除分类
router.post('/:id/delete', (req, res) => {
  const { id } = req.params;

  let categories = [];
  try {
    categories = JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8'));
  } catch (e) {}

  categories = categories.filter(c => c.id !== id);
  fs.writeFileSync(config.categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');
  res.redirect('/categories');
});

module.exports = router;
