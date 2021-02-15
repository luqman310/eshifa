const jwt = require("jsonwebtoken");
const h = require("./../utils/helper");
const Auth = {};
Auth.check = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    var verifyOptions = {
      expiresIn: '8h',
      algorithm: "RS256"
    };
    const start = Date.now();
    let legit = jwt.verify(token, process.env.JWT_PUBLIC, verifyOptions);
    const executionTime = Date.now() - start;
    // h.log(`Token Verified in ${executionTime}ms`);
    req.user = legit.data;
    next();
  } catch (error) {
    returnObj = h.resultObject([], false, 401, 'Auth failed');
    res.status(401).send(returnObj);
  }
};

module.exports = Auth;