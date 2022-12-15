/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



import 'dotenv/config';
import express, {RequestHandler} from 'express';
import bcrypt from 'bcryptjs';
import { User } from './models/user';
import { connect } from 'mongoose';
import jwt from 'jsonwebtoken';

const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()

app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});
let dbStatus = 'waiting...'
connect(process.env.DATABASE_URL!)
.then(()=> dbStatus = 'success')
.catch(()=> dbStatus = 'error')
/**********************
 * login/registration *
 **********************/
app.post('/auth/register', async function(req, res) {
  const userName = req.body.userName as string;
  const password = req.body.password as string;
  
  if(!userName || !password){
    return res.status(400).json({error: {message: "error on input"}})
  }
  
  let existingUser = await User.findOne({userName});
  
  if(existingUser){
    return res.status(400).json({error: {message: "user already exist"}})
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    userName,
    password: hashedPassword,
    cart: []
  });
  user.save()
  .then(result => {
    let token = jwt.sign({userName: result.userName, id: result._id}, process.env.ACCESS_TOKEN_SECRET!);
    res.json({result: "success", token});
  })
  .catch(er => res.json({error: 'something went wrong'}))
});

app.post('/auth/login', async function(req, res) {
  const userName = req.body.userName as string;
  const password = req.body.password as string;
  const user = await User.findOne({userName});
  if(!user){
    return res.status(400).json({error: {message: "user does not exist"}})
  }
  if(await bcrypt.compare(password, user.password)){
    let token = jwt.sign({userName, id: user._id}, process.env.ACCESS_TOKEN_SECRET!);
    return res.json( {result: "success", token})
  }
  res.status(400).json({error: {message: "incorrect password"}});
});

/****************************
* cart operations *
****************************/


const checkToken: RequestHandler = (req, res, next) => {
  let authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1];
  
  if(!token){return res.json({message: "error on header"})};

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if(err){return res.json({error: "error with token"});}
    req.body.user = user;
  })
  next();
}

app.get('/auth/cart',checkToken, async function(req, res) {
  let userId = req.body.user.id;
  let user = await User.findOne({_id: userId});
  if(!user){
    return res.status(400).json({error: {message: 'cant find user'}});
  }
  res.json({success: 'post call succeed!', cart: user.cart, body: req.body})
});

app.post('/auth/cart',checkToken , async function(req, res) {
  let userId = req.body.user.id;
  let user = await User.findOneAndUpdate({_id: userId}, {cart: req.body.cart},{new: true});
  if(!user){
    return res.status(400).json({error: {message: 'error updating'}});
  }
  res.json({success: 'post call succeed!', cart: user.cart})
});

/****************************
* Example put method *
****************************/

// app.put('/auth', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

// app.put('/auth/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

// /****************************
// * Example delete method *
// ****************************/

// app.delete('/auth', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

// app.delete('/auth/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
