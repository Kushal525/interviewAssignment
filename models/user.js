const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    ph_no:{
        type: Number,
        unique: true,
        required: true,
        validate: {
            validator: (value) => {
              return /^[7-9]\d{9}$/.test(value)
            }
        }
        },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }  
    }]
})

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error("No user")
        //return res.send("No user found!")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("Unable to login!")
    }
    
    return user
}

userSchema.methods.generateAuthToken= async function (){
    const user = this
     const token = jwt.sign({_id: user._id.toString()}, "thisismynewassignment")
     user.tokens = user.tokens.concat({ token })
     await user.save()

     return token
}

userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User