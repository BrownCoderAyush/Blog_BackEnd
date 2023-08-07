import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: [250, 'Tweet cannot be more than 250 characters'],
        unique : true
    },
    content : {
        type : String , 
        required : true , 
    },
    upvotes: {
            type: Number,
            ref: 'like'
        },

    upvoteIds : [{
        type : String  
    }],

    comments: [
        {
        postedBy:{ type:String , required : true},
        text : { type : String , required : true}
        }
    ] , 
}, {
    timestamps: true
}
)


const articleModel = mongoose.model('article', articleSchema);

export default articleModel;