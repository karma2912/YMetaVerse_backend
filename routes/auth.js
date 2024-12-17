const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const fetchUser = require("../middleware/fetchUser")
const jwt = require('jsonwebtoken');
const jwtSecret = "Karma$29"

router.post ("/registeruser" , [
   body('name',"Enter a valid name").isLength({min:3}),
   body('email',"Enter a valid email").isEmail(),
   body("password","Enter a valid password").isLength({min:5})
], async (req,res)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).send({ errors: errors.array()});
      }
      try{
         const data = {
            user:{
               id: User.id
            }
         }
         const token = jwt.sign(data, jwtSecret);
         const salt =  await bcrypt.genSalt(10);
         const hashedPass = await bcrypt.hash(req.body.password, salt);
         let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass
         })
         user.save()
         res.json({token})
      }
      catch(error){
         console.error(error.message)
         res.status(500).send("Some error occured")
      } 

    });

   router.post ("/login" , [
      body('email',"Enter a valid email").isEmail(),
      body("password","Enter a valid password").isLength({min:5})
   ], async (req,res)=>{
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.send("User doesn't exists")
         }
      // Accessing the stored user data in the database
      const {email,password} = req.body
   try{
      let user = await User.findOne({email})
      if(!user){
         return res.send("User doesn't exists")
      }
      // Comparing the password of the user with the password stored
      const comparedPass = await bcrypt.compare(password,user.password)
      if(!comparedPass){
         return res.send({"User Credentials": "doesn't matched"})
         }
      // Giving the id of user in an object
         const data = {
            user:{
               id: user.id
            }
         }
         const token = jwt.sign(data, jwtSecret);
         res.json({token})
      }
      
   catch(error){
      console.error(error.message)
      res.status(500).send("Some error occured")
   }
  });

  // Route 3 - Fetching the users credentials
  router.get ("/getuser" , fetchUser , async (req,res)=>{
   try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)

   } catch (error) {
      console.error(error.message)
      res.status(500).send("Some error occured")
   }
  })

    

module.exports = router