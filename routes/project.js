require('dotenv').config();
const authenticateToken = require('./authMiddleware');
const express = require('express'); 
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { join } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();


router.use (express.json());

router.post('/create',authenticateToken, async (req, res) => {
    try 
    {  
      
        const newProject = await prisma.Project.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                creatorId: req.user.id
            }
        });

        await prisma.ProjectCollaborators.create({
            data: {
                projectId: newProject.id, 
                userId: req.user.id 
            }
        });

        res.status(201).send();
    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})


router.post('/join', authenticateToken, async (req, res) => {
    try 
    {  
        const project = await prisma.Project.findUnique({
            where: {
                id: req.body.projectId
            }
        })
        if (project == null) return res.status(404).send()
        await prisma.ProjectCollaborators.create({
            data: {
                projectId: req.body.projectId,
                userId: req.user.id
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

router.put('/modify', authenticateToken, async (req, res) => {
    try 
    {  
        const project = await prisma.Project.findUnique({
            where: {
                id: req.body.projectId
            }
        });

        if (!project) {
            return res.status(404).send(); 
        }

        const isCollaborator = await prisma.ProjectCollaborators.findFirst({
            where: {
                projectId: project.id,
                userId: req.user.id
            }
        });
        
        if (!isCollaborator) {
            return res.status(401).send(); 
        }

        await prisma.Project.update({
            where: {
                id: project.id
            },
            data: {
                name: req.body.name,
                description: req.body.description
            }
        });

        res.status(201).send();

    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})

router.get('/getp', authenticateToken, async (req, res) => {
    try 
    {  
        //maybe agregar filtro de arriba

        const project = await prisma.Project.findUnique({
            where: {
                id: req.body.projectId
            }
        });

        res.status(200).json(project);
    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})

router.delete('/delete', authenticateToken, async (req, res) => {
    try 
    {  
        const project = await prisma.Project.findUnique({
            where: {
                id: req.body.projectId
            }
        });

        if (!project) {
            return res.status(404).send(); 
        }

        if (project.creatorId != req.user.id) {
            return res.status(401).send(); 
        }

        await prisma.ProjectCollaborators.deleteMany({
            where: {
                projectId: project.id
            }
        });

        await prisma.Project.delete({
            where: {
                id: project.id
            }
        });

        res.status(200).send();

    } 
    catch (error) 
    {
       console.log(error)
       res.status(500).send()
    }
})

module.exports = router;