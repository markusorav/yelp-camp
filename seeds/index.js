const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database connected!')
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            price,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis accusamus suscipit, fuga recusandae, necessitatibus inventore illum aliquid eaque sequi voluptatum ad voluptatem commodi minus placeat tempora excepturi cumque obcaecati soluta.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { 
                type: 'Point', 
                coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
            },
            author: "6561cf76d571211360184278",
            images: [
                {
                  url: 'https://yelp-camp-storage.s3.us-east-1.amazonaws.com/1701858984152-reggae1.png',
                  filename: '1701858984152-reggae1.png'
                }
              ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});