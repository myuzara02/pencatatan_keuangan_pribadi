const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const router = express.Router();

router.post('/login', async function (req, res) {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) throw new Error('Check your credentials');

    if (!bcrypt.compareSync(req.body.password, user.password))
      throw new Error('Check your credentials');

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/register', async function (req, res) {
//   try {
//     const user = new User(req.body);
//     user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
//     await user.save();
//     res.send('User Registered Successfully');
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

router.post('/register', async function (req, res) {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // Email sudah ada dalam basis data, tidak bisa mendaftar
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
    }

    const user = new User(req.body);
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    await user.save();
    res.status(201).json({ message: 'Pendaftaran Pengguna Berhasil', user: user });
  } catch (error) {
    console.error('Kesalahan saat mendaftarkan pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mendaftarkan pengguna' });
  }
});



module.exports = router;
