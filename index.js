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
    const ordersCollection = client.db('NatureGlow').collection('orders')
    const usersCollection = client.db('NatureGlow').collection('users')


    // Get All Users
    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // Get Products
    app.get('/products', async (req, res) => {
      const { category, status, sort } = req.query.category
      const search = req.query.search?.trim()
      const maxPrice = req.query.price && parseFloat(req.query.price)
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 6
      const skip = (page - 1) * limit

      let query = {}
      let sortCondition = {}
      if (status) query.status = { $in: status.split(',') }
      if (maxPrice) query.price = { $lte: maxPrice }
      if (category) query.category = { $in: category.split(',') }
      if (search) query.name = { $regex: `${search}`, $options: 'i' }
      if (sort) {
        if (sort === 'price_asc') sortCondition = { price: 1 }
        if (sort === 'price-dsc') sortCondition = { price: - 1 }
        if (sort === 'newest') sortCondition = { createdAt: - 1 }
        if (sort === 'best') sortCondition = { totalSold: - 1 }
      }
      const total = await productsCollection.countDocuments(query)
      const products = await productsCollection.find(query).sort(sortCondition).skip(skip).limit(limit).toArray()
      res.send({ products, totalpage: Math.ceil(total / limit), currentpage: page })
    })

    // Get All Products
    app.get('/all-products', async (req, res) => {
      const result = await productsCollection.find().toArray()
      res.send(result)
    })

    // Best Selling Products
    app.get('/products/best', async (req, res) => {
      const result = await productsCollection.find().sort({ totalSold: - 1 }).limit(8).toArray()
      res.send(result)
    })

    // Get New Products for New Arrivals
    app.get('/products/new', async (req, res) => {
      const result = await productsCollection.find().sort({ createdAt: - 1 }).limit(8).toArray()
      res.send(result)
    })

    // Get Products By Category
    app.get('/products/:category', async (req, res) => {
      const category = req.params.category
      const search = req.query.search?.trim()
      const sort = req.query.sort
      let query = { category: category }
      let sortCondition = {}
      if (search) query.name = { $regex: `${search}`, $options: 'i' }
      if (sort) {
        if (sort === 'price_asc') sortCondition = { price: 1 }
        if (sort === 'price-dsc') sortCondition = { price: - 1 }
        if (sort === 'newest') sortCondition = { createdAt: - 1 }
        if (sort === 'best') sortCondition = { totalSold: - 1 }
      }
      const result = await productsCollection.find(query).sort(sortCondition).toArray()
      res.send(result)
    })

    // Get Product By ID
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

    // Update Single Product
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

    // Delete Product From Database
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })


    // Order Route Start Here
    // Get All Orders
    app.get('/orders', async (req, res) => {
      const result = await ordersCollection.find().toArray()
      res.send(result)
    })

    // Get Single Order By ID
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await ordersCollection.findOne(query)
      res.send(result)
    })

    // Add Product on Database
    app.post('/order', async (req, res) => {
      const order = req.body
      const products = order?.products
      const result = await ordersCollection.insertOne(order)
      const productUpdates = products.map(product => {
        productsCollection.updateOne(
          { _id: new ObjectId(product._id) },
          { $inc: { totalSold: 1 } }
        )
      })

      await Promise.all(productUpdates)
      res.send(result)
    })

    // Update Single Order By ID
    app.patch('/update_order/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const order = req.body
      const updatedOrder = {
        $set: {
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus
        }
      }
      const result = await ordersCollection.updateOne(query, updatedOrder, options)
      console.log(id, query, order, result);
      res.send(result)
    })

    // Delete Order
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await ordersCollection.deleteOne(query)
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