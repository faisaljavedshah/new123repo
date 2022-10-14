//Importing dependencies
const express = require('express');
var path = require('path');
const port = process.env.PORT || 3000;

//Starting Express app
const app = express();

//Set the base path to the angular-test dist folder
app.use(express.static(path.join(__dirname, '/')));

//Any routes will be redirected to the angular app
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

//Starting server on port 8081
app.listen(port, () => {
    console.log("Server is listening on: ", port);
  });