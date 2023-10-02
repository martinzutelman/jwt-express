require('dotenv').config();
const express = require('express'); 
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { join } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();

router.use (express.json());

router.post('/create', async (req, res) => {
    try 
    {  
      
        await prisma.Project.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                userId: req.body.userId
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


router.post('/join', async (req, res) => {
    try 
    {  
        const project = await prisma.Project.findUnique({
            where: {
                id: req.body.projectId
            }
        })
        if (project == null) return res.status(404).send()
        await prisma.projectUser.create({
            data: {
                projectId: req.body.projectId,
                userId: req.body.userId
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

router.get('/:id', async (req, res) => {
    try 
    {  
        const project = await prisma.Project.findUnique({
            where: {
                id: req.params.id
            }
        })
        if (project == null) return res.status(404).send()
        res.status(200).json(project);
    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})

module.exports = router;