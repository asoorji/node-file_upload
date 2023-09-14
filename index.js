const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();
const port = 3000;

// Connect to MongoDB Atlas using your connection string
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

  app.use('/uploads', express.static('uploads'));


const User = mongoose.model('User', {
  username: String,
  email: String,
  profileImage: {
    name: String,
    contentType: String,
    data: Buffer,
  },
});

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define an API endpoint for uploading images
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Create a new user profile document
    const userProfile = new User({
        username,
        email,
        profileImage: {
          name: req.file.originalname,
          contentType: req.file.mimetype,
          data: req.file.buffer,
        },
      });
  

    // Save the user profile to MongoDB
    await userProfile.save();


res.status(201).send('User profile and image uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading user profile and image');
  }
});

// View a user's profile image
app.get('/profile/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      if (!user.profileImage) {
        return res.status(404).send('Profile image not found for this user');
      }
  
      res.contentType(user.profileImage.contentType);
      res.send(user.profileImage.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error viewing user profile image');
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
