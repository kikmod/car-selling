const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const port = 8080;
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const csp = require('helmet-csp');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './public/img');
    },
    filename: function (request, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);



app.use(express.static('./public'));



app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
const Book = require('./models/bookschema');
const Availability = require('./models/availability')
const Node = require('./models/nodeschema');
const Review = require('./models/review');
const Payment = require("./models/payment");
const Add = require("./models/add");
const Addss = require("./models/add-adminschema");
const path = require('path');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dckk3cr84',
    api_key: '922144357814857',
    api_secret: '2R_q7BVyI0i0XuM5thoNU-k1Mhg',
    secure: true
});

cloudinary.uploader.upload

const mongoose = require('mongoose');

mongoose
    .connect('mongodb+srv://moustafaheliel242000:01120075449h@cluster0.hqufgmm.mongodb.net/all-data?retryWrites=true&w=majority')
    .then((result) => {
        app.listen(process.env.PORT || port, () => {
            console.log(`Example app listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });





app.use(helmet());


app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'res.cloudinary.com', 'data:'],
            },
        },
    })
);



app.get('/', (req, res) => {
    // Check if the user is authenticated
    if (req.session.userIsAuthenticated) {
        // User is authenticated, redirect to the admin page
    }
    res.redirect('/index');

});
// Inside the route where you render the index page (e.g., /index)
app.get('/index', async (req, res) => {
    try {
        // Fetch other necessary data
        const reviews = await Review.find();
        const sellItems = await Add.find({ approved: true });
        const sellItemss = await Addss.find();
        const availability = await Availability.find();



        // Fetch image URLs from the 'Add' and 'Addss' collections
        const imageUrl = sellItems.map((item) => item.img);
        const imageUrls = sellItemss.map((item) => item.imge);

        res.render('index.ejs', {
            arrAvailability: availability,
            arrReview: reviews,
            arrAdd: sellItems,
            arrAddss: sellItemss,
            userIsAuthenticated: req.session.userIsAuthenticated,
            imgUrl: imageUrl,
            imgeUrl: imageUrls,
            req: req,


        });

    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while fetching data.");
    }
});




app.get('/api/getAdImage/:adId', async (req, res) => {
    try {
        // Fetch the ad information based on adId from your database
        const ad = await Add.findById(req.params.adId);

        // Send the image URL as a JSON response
        res.json({ imageUrl: ad.img });
    } catch (error) {
        console.error('Error fetching ad image: ', error);
        res.status(500).json({ error: 'An error occurred while fetching ad image' });
    }
});


app.get('/api/getAddImage/:adIdd', async (req, res) => {
    try {
        // Fetch the ad information based on adId from your database
        const add = await Adds.findById(req.params.adIdd);

        // Send the image URL as a JSON response
        res.json({ imageUrls: add.imge });
    } catch (error) {
        console.error('Error fetching ad image: ', error);
        res.status(500).json({ error: 'An error occurred while fetching ad image' });
    }
});


app.post('/admin/approve-ad/:adId', async (req, res) => {
    try {
        const ad = await Add.findById(req.params.adId);
        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        // Set the 'approved' field to true for the ad
        ad.approved = true;
        await ad.save();

        // Redirect to a page or send a response
        res.redirect('/admin'); // You can redirect back to the admin page

    } catch (error) {
        console.error('Error approving ad:', error);
        res.status(500).send('An error occurred while approving the ad');
    }
});

app.post('/admin/refuse-ad/:adId', async (req, res) => {
    try {
        const ad = await Add.findById(req.params.adId);
        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        // Set the 'approved' field to false for the ad (or you can delete it)
        ad.approved = false;
        await ad.save();

        // Redirect to a page or send a response
        res.redirect('/admin'); // You can redirect back to the admin page

    } catch (error) {
        console.error('Error refusing ad:', error);
        res.status(500).send('An error occurred while refusing the ad');
    }
});



app.get('/payment.ejs', (req, res) => {
    res.render('payment.ejs');
});
app.post("/payment", (req, res) => {
    const {
        cardNumber,
        cardHolder,
        expirationMonth,
        expirationYear,
        cvv
    } = req.body;

    // Create a new Payment object
    const payment = new Payment({
        cardNumber,
        cardHolder,
        expirationMonth,
        expirationYear,
        cvv
    });

    // Save the payment object to the database
    payment.save()
        .then(() => {
            res.redirect('/index ');
        })
        .catch((error) => {
            res.status(500).send("Error saving payment: " + error);
        });
});





app.get("/availability.ejs", async (req, res) => {


    try {
        const sellItems = await Add.find({ approved: true });
        const sellItemss = await Addss.find();
        // Fetch image URLs from the 'Add' and 'Addss' collections
        const imageUrl = sellItems.map((item) => item.img);
        const imageUrls = sellItemss.map((item) => item.imge);


        res.render('availability.ejs', {

            arrAdd: sellItems,
            arrAddss: sellItemss,
            imgUrl: imageUrl,
            imgeUrl: imageUrls,


        });

    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while fetching data.");
    }
});

app.post('/availability', async (req, res) => {
    try {
        const { Fname, Lname, Email, Number, Details } = req.body;

        const newAvailability = new Availability({
            Fname,
            Lname,
            Email,
            Number,
            Details,
            status: 'Pending',
        });



        await newAvailability.save();

        res.redirect('/index');
    } catch (error) {
        console.error('Checking saving error:', error);
        res.status(500).send('An error occurred while saving the Checking ');
    }
});

app.post('/admin/approve-availability/:availabilityId', async (req, res) => {
    try {
        const availability = await Availability.findById(req.params.availabilityId);

        if (!availability) {
            return res.status(404).send('Availability not found');
        }

        // Set the 'adminResponse' field to 'approved' for the availability
        availability.adminResponse = 'approved';
        availability.adminMessage = req.body.adminnnMessage || 'Your availability request has been approved, Our team will contact you through the phone number mentioned';

        await availability.save();

        // Send an email to the user
        const userEmail = availability.Email;
        const userMessage = `Your availability request has been approvedوOur team will contact you through the phone number mentioned Message from admin: ${availability.adminMessage}`;

        // Send an email to the user with the admin response


        // Redirect or send a response
        res.redirect('/admin'); // You can redirect back to the admin page
    } catch (error) {
        console.error('Error approving availability:', error);
        res.status(500).send('An error occurred while approving the availability');
    }
});

// Similar route for refusing availability
app.post('/admin/refuse-availability/:availabilityId', async (req, res) => {
    try {
        const availability = await Availability.findById(req.params.availabilityId);
        if (!availability) {
            return res.status(404).send('Availability not found');
        }

        // Set the 'adminResponse' field to 'refused' for the availability
        availability.adminResponse = 'refused';
        availability.adminMessage = req.body.adminMessage || 'Your availability request has been refused.';

        await availability.save();

        // Send an email to the user
        const userEmail = availability.Email;
        const userMessage = `Your availability request has been refused. Message from admin: ${availability.adminMessage}`;


        // Redirect or send a response
        res.redirect('/admin'); // You can redirect back to the admin page
    } catch (error) {
        console.error('Error refusing availability:', error);
        res.status(500).send('An error occurred while refusing the availability');
    }
}
);


app.get("/review.ejs", (req, res) => {
    res.render("review.ejs")
});

app.post('/review', async (req, res) => {
    try {
        const { reviews, name1, country } = req.body;

        const newReview = new Review({
            reviews,
            name1: name1,
            country,

        });

        await newReview.save();

        res.redirect('/index');
    } catch (error) {
        console.error('Review saving error:', error);
        res.status(500).send('An error occurred while saving the review');
    }
});






app.get('/sign-out', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while logging out:', err);
        }
        // Redirect the user to the homepage or any other desired page after logout
        res.redirect('/index ');
    });
});



app.get('/add-admin.ejs', (req, res) => {

    res.render('add-admin.ejs'); // Render the "add.ejs" template
});


app.post('/add-admin', upload.single('imge'), async (req, res) => {

    const { pricee, yearr, modell, versionn, statuss } = req.body;

    const uniqueFileName = uuidv4() + '_' + req.file.originalname;

    try {
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'ap1jp7mz',
            image_file_type: ['png', 'jpeg', 'jpg']
        });

        // Create a new Add object with the Cloudinary URL
        const newAddss = new Addss({
            statuss,
            versionn,
            modell,
            yearr,
            pricee,
            imge: result.secure_url,
            // Save the Cloudinary URL
        });

        // Save the Add object to the database
        await newAddss.save();

        // Redirect to the index page
        res.redirect('/admin');
    } catch (error) {
        console.error('Add saving error:', error);
        res.status(500).send('An error occurred while saving the add');
    }
});
// 




app.get('/add.ejs', (req, res) => {
    res.render('add.ejs'); // Render the "add.ejs" template
});

app.post('/add', upload.single('img'), async (req, res) => {

    const { price, year, model, version, status, number } = req.body;

    const uniqueFileName = uuidv4() + '_' + req.file.originalname;

    try {
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'ap1jp7mz',
            image_file_type: ['png', 'jpeg', 'jpg']
        });

        // Create a new Add object with the Cloudinary URL
        const newAdd = new Add({
            status,
            version,
            model,
            year,
            price,
            img: result.secure_url,
            number,
            // Save the Cloudinary URL

        });

        // Save the Add object to the database
        await newAdd.save();

        // Redirect to the index page
        res.redirect('/index');
    } catch (error) {
        console.error('Add saving error:', error);
        res.status(500).send('An error occurred while saving the add');
    }
});
// ...
app.get('/sign-up.ejs', (req, res) => {
    res.render('sign-up.ejs', { userIsAuthenticated: req.session.userIsAuthenticated });
});

// Add a new route to handle the logout action



app.post('/sign-up', async (req, res) => {
    try {
        const { name, email, password, cpassword, number } = req.body;

        // Handle the errors
        if (password !== cpassword) {
            return res.render('sign-up.ejs', { error: 'Passwords do not match. Please try again.' });
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.render('sign-up.ejs', { error: 'Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit. Please try again.' });
        }

        // Check if the email already exists in the database
        const existingUser = await Node.findOne({ email });

        if (existingUser) {
            return res.render('sign-up.ejs', { error: 'Email already exists. Please try again with a different email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const node = new Node({
            name,
            email,
            password: hashedPassword,
            cpassword,
            number,

        });

        await node.save();

        // Set user session here (if needed)
        req.session.userIsAuthenticated = true;

        // Redirect to a success page or the dashboard
        res.redirect('/index'); // You can create a success page

    } catch (error) {

        console.error('Sign up error:', error);
        return res.render('sign-up.ejs', { error: 'An error occurred during sign-up. Please try again.' });

    }
});


// Configure the email transporter

app.get('/admin', async (req, res) => {
    try {
        // Fetch data from the 'Node,' 'Review,' and 'Add' collections
        const nodes = await Node.find();
        const reviews = await Review.find();
        const sellItems = await Add.find();
        const availability = await Availability.find();
        // Fetch the image URL from the 'Add' collection
        const imageUrl = sellItems.map((item) => item.img);
        // Render the admin page and pass the data to the view
        res.render('admin.ejs', {
            arrNode: nodes,
            arrReview: reviews,
            arrAdd: sellItems,
            arrAvailability: availability,
            userIsAuthenticated: req.session.userIsAuthenticated,
            imgUrl: imageUrl, // Pass the image URL to the view
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while fetching data.");
    }
});
app.get('/admin/logout', (req, res) => {
    // Destroy the session to log the admin out
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while logging out:', err);
        }
        // Redirect the admin to the index page
        res.redirect('/index');
    });
});

// ... (your existing code)

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const node = await Node.findOne({ email });

        if (!node) {
            return res.render('login.ejs', { error: 'Invalid email or password. Please try again.' });
        }

        const passwordMatch = await bcrypt.compare(password, node.password);

        if (!passwordMatch) {
            return res.render('login.ejs', { error: 'Invalid email or password. Please try again.' });
        }

        // Check if the user has the email "helil@admin.com"
        if (email === "helil@admin.com") {
            // Redirect to the admin page
            return res.redirect('/admin');
        }

        // For regular users, you can redirect to the regular user's page (e.g., '/index')
        req.session.userIsAuthenticated = true;

        req.session.Email = email;

        // Render the regular user's page
        res.redirect('/index');
    } catch (error) {
        console.error('Login error:', error);
        return res.render('login.ejs', { error: 'An error occurred during login. Please try again.' });
    }
});


// ... (your existing code)

app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while logging out:', err);
        }
        // Redirect the user to the homepage or any other desired page after logout
        res.redirect('/index');
    });
});


app.get('/login.ejs', (req, res) => {
    res.render('login.ejs', { userIsAuthenticated: req.session.userIsAuthenticated });
});




app.get('/html/:id', (req, res) => {
    Node.findById(req.params.id)
        .then((result) => {
            res.render('', { objNode: result });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.delete('/html/:id', (req, res) => {
    Node.findByIdAndDelete(req.params.id)
        .then((params) => {
            res.json({ mylink: '/html' });
        })
        .catch((err) => {
            console.log(err);
        });
});





app.use((req, res) => {
    res.status(404).send("Sorry, can't find that");
});
