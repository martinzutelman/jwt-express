require('dotenv').config();
const express = require('express'); 
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.use (express.json());


app.get ('/users', authenticateToken, async (req, res) => {
    
    const userInfo = await prisma.user.findUnique({
        where: {
            email: req.user.email
        }
    })
    res.json(userInfo)
});

app.post('/users', async (req, res) => {
    try 
    {  
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
      
        await prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword
            }
        })
        res.status(201).send();
    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})


function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        
        if (err) return res.sendStatus(403)
        req.user = user
        console.log(user)
        next()
        
    } )
}

app.listen(3000);


