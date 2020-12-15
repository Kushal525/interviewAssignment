require('./db/mongoose')
const express = require("express")
const User = require('./models/user')
const auth = require('./middleware/auth')

const app = express()
const port = 3000

app.use(express.json())

app.post('/user/register', async (req, res) => {
    const user = new User(req.body)
    try{
        const email= await User.findOne({"email": req.body.email})
        const ph_no = await User.findOne({"ph_no" : req.body.ph_no})
        if(email || ph_no){
            throw new Error()
        }
        await user.save()
        await user.generateAuthToken()
        res.send("Success")
    }catch(e){
        res.send("User emailid or phone numer is already exist")
    }
})

app.post('/user/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
         await user.generateAuthToken()
         res.send(user)

        res.send("Login Successfull")
    }catch(e){
        res.send("User not found")
    }
})

app.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logout suceesful")
    } catch (e) {
        res.status(500).send()
    }
})

app.listen(port, () => {
    console.log("server is up on port "+ port)
})