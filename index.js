const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 3000

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://natureglow-740e8.web.app', 'https://natureglow-740e8.firebaseapp.com'],
  Credential: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.zyfftle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const productsCollection = client.db('NatureGlow').collection('products')

    // Get All Products
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray()
      console.log(result);
      res.send(result)
    })

    // Get Products by Category
    app.get('/products/:category', async (req, res) => {
      const category = req.params.category
      const query = { category: category }
      const result = await productsCollection.find(query).toArray()
      res.send(result)
    })

    // Get Product by ID
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

    // Add Product on Database
    app.post('/product', async (req, res) => {
      const product = req.body
      const result = await productsCollection.insertOne(product)
      res.send(result)
    })

    app.put('/product/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const product = req.body
      const options = { upsert: true }
      const updatedProduct = {
        $set: {
          name: product.name,
          price: product.price,
          category: product.category,
          status: product.status,
          image: product.image,
          shortBio: product.shortBio,
          description: product.description,
          features: product.features,
        }
      }
      const result = await productsCollection.updateOne(query, updatedProduct, options)
      res.send(result)
    })

    // Delete Product on Database
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`NatureGlow is running on port ${port}`)
})