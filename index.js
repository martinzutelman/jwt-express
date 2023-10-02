const express = require('express'); 
const cookieParser = require('cookie-parser'); 

const app = express();
const PORT = 3000;

app.use (cookieParser());

const user = require('./routes/user');
const auth = require('./routes/auth');
const project = require('./routes/project');

app.use('/user', user);
app.use ('/auth', auth);
app.use('/project', project);

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
);