// Basic Setup
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
// Import MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Kids Zone Server is Running');
})



// kidszone
// Ad6oAEtzIfTnpXXC


const uri = `mongodb+srv://${process.env.KZ_DB_USER}:${process.env.KZ_DB_PASS}@cluster0.sbe3ku7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection



    // Basic Database Setup
    const toysCollection = client.db('toysDB').collection('toys');

    // Get all Toys
    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find();
      res.send(await cursor.toArray());
    })

    // Get all Toys for All Toy Page
    app.get('/all-toys', async (req, res) => {
      const result = await toysCollection.find().sort({ price: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(20).toArray()
      // const result = await toysCollection.find().sort({ price: 1 }).collation({ locale: "en_US", numericOrdering: true }).limit(20).toArray()
      res.send(result);
    });


    // Toy Details
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      res.send(await toysCollection.findOne(query))
    })

    // My Toy with User EMail
    app.get('/my-toys', async (req, res) => {
      let queryEmail = {};
      // let querySort = {};
      if (req.query?.email) {
          queryEmail = { sellerEmail: req.query.email }
      }
      // if (req.query?.sort == "accen") {
      //   querySort = 1
      // }
      const result = await toysCollection.find(queryEmail).toArray();
      res.send(result);
    })

    // Add Toy to Database
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      console.log(toy);
      res.send(await toysCollection.insertOne(toy));
    })


    // Update Toy By USer
    app.put('/my-toys/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true};
      const updatedToy = req.body;
      const updateInfo = {
        $set: {
          picture: updatedToy.picture,
          name: updatedToy.name,
          category: updatedToy.category,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          rating: updatedToy.rating,
          description: updatedToy.description,
          sellerEmail: updatedToy.sellerEmail,
          sellerName: updatedToy.sellerName,
        }
      }
      res.send(await toysCollection.updateOne(filter, updateInfo, option))
    })

    // Delete Toy by USer
    app.delete('/my-toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      res.send(await toysCollection.deleteOne(query));
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// Finalize Setup
app.listen(port, () => {
  console.log('My Kids Zone is Running in port:', port)
})