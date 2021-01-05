const mongoose=require('mongoose');
const Joi=require('joi');
const {genreSchema}=require('./genre')

const Movie=mongoose.model('Movie',new mongoose.Schema({
    title: {
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:255
    },
    genre:{
        type:genreSchema,
        required:true
    },
    numberInStock:{
        type:Number,
        required:true,
        min:0,
        max:255
    },
    dailyRentalRate:{
        type:Number,
        required:true,
        min:0,
        max:255
    }
}));

function validateMovie(movie){
    const schema={
        title: Joi.string().min(3).max(50).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.string().min(0).required(),
        dailyRentalRate: Joi.string().min(0).required()
    }
    return Joi.validate(movie,schema);
}

exports.Movie=Movie;
exports.validate=validateMovie;