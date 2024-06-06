const express= require('express')
const app=express();
const db=require('./db')
const stud=require('./models/stud')

const passport=require('./auth');

const bodyParser=require('body-parser');
app.use(bodyParser.json());
// .json ke jagah kuch aur format likha toh usme kar dega

app.use(passport.initialize());
const localauthMiddleware=passport.authenticate('local',{session:false})

app.get('/',function(req,res){
    res.send('This is a student portal')
})

app.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Assuming the request body contains the person data
        const username = data.username;
        
        // Check if the username already exists
        const existingUser = await stud.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if an admin user already exists
        if (data.role === 'admin') {
            const adminUser = await stud.findOne({ role: 'admin' });
            if (adminUser) {
                return res.status(400).json({ error: 'Admin user already exists' });
            }
        }

        // Create a new student document using the Mongoose model
        const newstud = new stud(data);
  
        // Save the new student to the database
        const response = await newstud.save();
  
        console.log('Data saved');
        res.status(200).json(response);
  
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//chat gpt ache se bataya kyu query mei pass nhi karneka username and password unsafe practice hai vaise toh ....url sabko dikhta h na so...aagya passport.js ab ...
app.post('/login', localauthMiddleware, async (req, res) => {
    try {
        // Check if user is authenticated
        if (req.isAuthenticated()) {
            console.log(req.user);
            // Check user's role
            if (req.user.role === 'admin') {
                return res.status(200).json({ message: 'Admin login successful', user: req.user });
            } else {
                return res.status(200).json({ message: 'Student login successful', user: req.user });
            }
        } else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
//student routes aur admin routes mei auth nhi lagate hai bcoz in front end agar login pe auth aagya toh bass na fir admin student vahi pe alag ho jayenge ....

const studentroutes=require("./routes/studentroutes");
app.use('/login',studentroutes);

const adminroutes=require("./routes/adminroutes");
app.use('/login',adminroutes);

app.listen(3000,()=> {
    console.log('Server is listening ')
})

