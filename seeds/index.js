if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Ground = require('../models/campground')
const cities = require('./cities');
const indian = require('./indian_cities')
const { places, descriptors } = require('./seedhelpers')
// const campground = require('../models/campground');

const dbURI =  process.env.DB_URL;

mongoose.connect(dbURI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true, 
})
.then(() => {
  console.log('🥳 Connected to MongoDB ✅');
  // Start your server or other application logic here
})
.catch((err) => {
  console.error(' 😭Error connecting to MongoDB ❌:', err);
});

const sample = (arr) => {
   return arr[Math.floor(Math.random() * arr.length)]
}

const seedDB = async() =>{
    await Ground.deleteMany({});
    for( let i=0;i<400;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Ground({
            author: '67d10ed3c17461fd1c23cc32',
            location : `${cities[random1000].city} , ${cities[random1000].state} `,
            // location : `${[random1000].city} , ${indian[random1000].state} `,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Autem vitae ab consequatur. Quasi incidunt voluptates perferendis quas! Repudiandae consequatur debitis sint dolore odio, labore necessitatibus expedita harum? Sequi, fuga impedit.',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
                // indian[random1000].longitude,
                // indian[random1000].latitude
              ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dams0r5uk/image/upload/v1742074013/YelpCamp/xoqplt0357taaprsgeef.png',
                  filename: 'YelpCamp/xoqplt0357taaprsgeef',
                },
                {
                  url: 'https://res.cloudinary.com/dams0r5uk/image/upload/v1742074014/YelpCamp/fduimne8ote8qzw77j67.png',
                  filename: 'YelpCamp/fduimne8ote8qzw77j67',
                }
            ] 
        })
        await camp.save();
        console.log(`Saved campground ${i + 1}.`);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})