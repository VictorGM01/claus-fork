require('dotenv').config();
const app = require('./src/app');
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log('API Claus is running!');
});
