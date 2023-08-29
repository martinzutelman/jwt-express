require('dotenv').config();
const express = require('express'); 
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.use (express.json());

const users = [
    {
        "email": "u3",
        "password": "$2b$10$Uoe/WcIfDNUy9cZ6FvXrkOOj2Huxz1e9fYFjUS9jrUb4Hc6G2zRXG"
    }
]

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

app.post('/users/login', async (req, res) => {

    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    })
    if (user == null)
    {
        return res.status(400).send('Cannot find user')
    }
    try 
    {
        if (await bcrypt.compare(req.body.password, user.password)){
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.send(
                {
                    'Success': 'Login Success',
                    accessToken: accessToken 
                }
            )
        }
        else{
            res.send('Not Allowed')
        }
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


