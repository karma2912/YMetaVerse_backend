const jwt = require('jsonwebtoken');
const jwtSecret = "Karma$29"

const fetchUser= (req,res,next)=>{ 
    const token = req.header("auth-token")
    if(!token){
        res.status(500).json({error: "Require a valid token"})
    }
  try{
    const decoded = jwt.verify(token,jwtSecret)
    req.user = decoded.user
    next();
  }
  catch(error){
    res.status(401).json({error: "Require a valid token"})
  }
}

module.exports = fetchUser;