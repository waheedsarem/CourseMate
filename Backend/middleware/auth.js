// middleware/auth.js
const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret'; // This should be the same secret used to sign the token

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from 'Bearer TOKEN' format
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' }); // Unauthorized if no token
  }
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' }); // Forbidden if invalid token
    }

    req.user = user; // Attach the decoded token payload to the request
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = authenticateToken;
