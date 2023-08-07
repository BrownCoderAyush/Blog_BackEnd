import express from 'express';
import fs from 'fs';
import admin from 'firebase-admin';


import {connect} from '../database/dbConfig.js';
import articleModel from '../models/articles.model.js';
const path = "credentials.json";
const credentials =  JSON.parse(fs.readFileSync(path))
admin.initializeApp({
    credential : admin.credential.cert(credentials),

});


const app = express();
app.use(express.json());

app.use(async(req,res,next)=>{
    const {authtoken} = req.headers;
    console.log(authtoken , "authtoken");
    if(authtoken){
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
            console.log(req.user , "req.user")
        } catch (error) {
            res.sendStatus(400).json({
                message: "found nothing"
            })
        }
    }
    console.log("here");
    next();
});


app.get('/api/articles',async(req,res)=>{
    try {
        const articles = await articleModel.find({});
        console.log(articles);
        return res.json({
            data : articles , 
            message : "Article fetched successfully"
        })
    } catch (error) {
        return res.status(404).json({
            data : "" , 
            message : error
        })
    }
})
app.get('/api/articles/:name',async(req,res)=>{
    try {
        const {name} = req.params;
        let uid ;
        console.log(req.user , "req.user");
        if(req.user){
            uid = req.user.uid;
        }
        const article = await articleModel.find({
            name
        })
        console.log(article , "here");
        
        if(article[0] != null){
           return res.json({
                data : article , 
                message : "Article fetched successfully"
            })
        }
        throw { message : "cannot find article"};     
    } catch (error) {
        return res.status(404).json({
            data : "" , 
            message : error
        })
    }
})

app.use((req,res,next)=>{
    if(req.user){
        next();
    }
    else {
        res.sendStatus(401);
    }
})
app.put('/api/articles/:name/upvote',async(req,res)=>{
    
    const {name} = req.params;
    let uid = null; 
    let result;
    if(req.user){
        uid = req.user.uid;
        console.log(uid , "uid");
    }
    const article = await articleModel.findOne({
        name
    })
    if(article){

        const upvoteIds = article.upvoteIds || [];
        const canUpvote = uid && ! upvoteIds.includes(uid);
        console.log("canvote " , canUpvote);
        if(canUpvote){
            article.upvotes +=1 ;
            article.upvoteIds.push(uid);
            await article.save();
        }
        result = article.upvotes;

        return res.json({
            upvotes : result
        });
    }
    return res.json({
        message : "article dosen't exist"
    });
})

app.post('/api/articles/:name/comments',async(req,res)=>{
        const {name} = req.params;
        const {text} = req.body;
        const {email} = req.user;

        let article = await articleModel.findOne({
            name
        })
        if(article){
            article.comments.push({postedBy : req.user.email , text})
            await article.save();
            article = await articleModel.findOne({
                name
            })
            return res.json(article);
        }
        return res.send("That artice dosen't exist");   
})


 
app.listen(8000 , async ()=>{
    console.log("server is moving on ....");
    connect();

})