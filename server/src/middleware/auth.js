const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async function auth(req,res,next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/,'');
    if (!token) return res.status(401).json({error:'Please log in'});
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({error:'Please log in'});
    req.user = user;
    next();
  } catch { return res.status(401).json({error:'Invalid or expired session'}); }
};
