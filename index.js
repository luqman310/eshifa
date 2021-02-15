require('dotenv').config();
const routes = require('./app/routes'); //TODO convert it to ./routes
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Static Routes
app.set('trust proxy', true)
app.use('/static', express.static('uploads'));
// Other Routes
app.use('/', routes);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))