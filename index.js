const express = require('express'); 
const cookieParser = require('cookie-parser'); 

const app = express();
const PORT = 3000;

app.use (cookieParser());

const auth = require('./routes/auth');
const user = require('./routes/user');

app.use ('/auth', auth);
app.use('/user', user);

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
);