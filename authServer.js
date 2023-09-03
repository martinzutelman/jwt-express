require('dotenv').config();
const express = require('express'); 
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use (express.json());

app.post('/token', async (req, res) => {
    const refreshToken = req.body.token; 
    
    if (refreshToken == null) return res.sendStatus(401)

    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const userId = user.id;

    const refreshTokens = await prisma.refreshToken.findMany({
        where: {
            userId: userId
        }
    })

    console.log('refreshTokens:', refreshTokens);

    if (!refreshTokens.some(token => token.token === refreshToken)) return res.sendStatus(403)


    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({email: user.email});
        res.json({accessToken: accessToken})
    })
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
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            
            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id
                },
            });

            res.send(
                {
                    'Success': 'Login Success',
                    accessToken: accessToken, 
                    refreshToken: refreshToken
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

function generateAccessToken(user){
    if (user.email){
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'})
    }
    return null 
}

app.listen(4000);


