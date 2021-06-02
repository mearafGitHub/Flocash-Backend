const express = require('express');
const morgan = require('morgan');
const request = require('request');
const volleyball = require('volleyball');
const https = require('https')
const fs = require('fs')
const path = require('path')
const followRedirects = require('follow-redirects');
const cors = require('cors'); 
const body_parser = require('body-parser');
const { response } = require('express');
const { send } = require('process');
const app = express();
app.use(express.json({type: '*/*'}));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
  "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
const paymentOption = {cbeBirr: 115, card: 123, cbeBranch: 154}
const cbeUrl = 'http://developer.flocash.com/flocash-demo/v2/checkout/select'
const cardUrl = 'https://sandbox.flocash.com/vterminal/payment/card.do?txnref=SBFLOEC2105208483690317'
/*const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname,'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'certificate.pem'))
}, app)

sslServer.listen(7000, () => {
  console.log("Secure Server Started on https://localhost:7000");
 })*/
 
 app.listen(7000, () => {
  console.log("Server Started on http://localhost:7000");
 })
 app.post('/notify', (req, res) => {
  console.log("FLOCASH NOTIFICATION: "+req.body)
 });

app.get('', (req, res)=>{
  res.render('index')
})


app.post('/pay', (req, res) => {
  console.log(req.body.country.value);
  const post_data=JSON.stringify({                                                                                                                                      
    order:
    {
      amount: req.body.amount,    
      orderId: req.body.orderId,
      item_name: req.body.item_name,
      item_price: req.body.item_price,                                                                                            
      quantity: req.body.quantity,
      currency: req.body.currency
    },
    merchant: 
    {
      merchantAccount: req.body.merchantAccount
    },
    payer: 
    {
      country: req.body.country.value,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      mobile: req.body.mobile,
      email: req.body.email
    },
    payOption:{
      id: 123
    }    
    
  });
  console.log(post_data)
  const options = {
    hostname: 'sandbox.flocash.com',
    port: 443,
    path: '/rest/v2/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(req.body.api_user_name + ':' + req.body.api_user_password).toString('base64')
    }
  }
  const request = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
    console.log("API RESPONSE BODY: "+response.redirect)
    res.redirect(cardUrl)
    //res.send(response.statusCode)
    response.on('post_data', d => {
      process.stdout.write(d)
    })
  })
  request.on('error', error => {
    console.error("HERE IS THE ERROR MESSAGE FROM REQUEST: "+error.message)
  })
  request.write(post_data)
  request.end()
  
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

