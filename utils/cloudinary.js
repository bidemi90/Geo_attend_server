const cloudinary= require("cloudinary").v2 

cloudinary.config({ 
    cloud_name: 'dnxpncyjx', 
    api_key: '981765188186577', 
    api_secret: process.env.cloudinaryapisecret
     // Click 'View Credentials' below to copy your API secret
});

module.exports=cloudinary