const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 3000

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://natureglow-740e8.web.app', 'https://natureglow-740e8.firebaseapp.com'],
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

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
    const reviewsCollection = client.db('NatureGlow').collection('reviews')


    // Verify Token Middleware
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorize access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorize access' })
        }
        req.decoded = decoded;
        next()
      })
    }

    // Verify Admin Middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      const isAdmin = user?.role === 'Admin'
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      next()
    }

    // Token Post Route
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })

    // User Route Start Here
    // Get All Users
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const search = req.query.search?.trim()
      const query = {}
      if (search) query.name = { $regex: `${search}`, $options: 'i' }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })

    // app.get('/user/admin/:email', verifyToken, async (req, res) => {
    //   const email = req.params.email
    //   console.log(email, req.user?.email);
    //   if (email !== req.user?.email) {
    //     return res.status(403).send({ message: 'forbidden access' })
    //   }
    //   const query = { email: email }
    //   const user = await usersCollection.findOne(query)
    //   let Admin = false
    //   if (user) {
    //     Admin = user?.role === 'Admin'
    //   }
    //   res.send({ Admin })
    // })
    app.get('/user/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'Admin';
      }
      res.send({ admin });
    })


    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      res.send(result)
    })

    // Post Single User
    app.post('/user', async (req, res) => {
      const user = req.body
      const query = { email: user?.email }
      const axistingUser = await usersCollection.findOne(query)
      if (axistingUser) {
        const updatedOrder = {
          $set: {
            status: "Active",
            lastLogin: new Date().toLocaleDateString()
          }
        }
        const result = await usersCollection.updateOne(query, updatedOrder)
        return res.send(result)
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    // Update Single User By Id
    app.put('/user/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const user = req.body
      const updatedUser = {
        $set: {
          name: user.name,
          profile: user.profile,
          phone: user.phone,
          cover: user.cover,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          address: user.address
        }
      }
      const result = await usersCollection.updateOne(query, updatedUser, options)
      res.send(result)
    })

    // Delete Single User By ID
    app.delete('/user/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })



    // Product Rout Start Here
    // Get Products
    app.get('/products', async (req, res) => {
      const { category, status, sort } = req.query
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
    app.get('/all-products', verifyToken, verifyAdmin, async (req, res) => {
      const search = req.query.search?.trim()
      let query = {}
      if (search) {
        query = { name: { $regex: search, $options: 'i' } };
      }
      const result = await productsCollection.find(query).toArray()
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
    app.post('/product', verifyToken, verifyAdmin, async (req, res) => {
      const product = req.body
      const result = await productsCollection.insertOne(product)
      res.send(result)
    })

    // Update Single Product
    app.put('/product/:id', verifyToken, verifyAdmin, async (req, res) => {
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
    app.delete('/product/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })



    // Order Route Start Here
    // Get All Orders
    app.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
      const result = await ordersCollection.find().toArray()
      res.send(result)
    })

    // Get Orders By Email
    app.get('/orders/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await ordersCollection.find(query).toArray()
      res.send(result)
    })

    // Get Single Order By ID
    app.get('/order/:id', verifyToken, async (req, res) => {
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
    app.patch('/update_order/:id', verifyToken, async (req, res) => {
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
    app.delete('/order/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await ordersCollection.deleteOne(query)
      res.send(result)
    })


    // Review Rout Start Here
    // Get All Reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray()
      res.send(result)
    })

    // Get Product-based Reviews
    app.get('/reviews/:product_id', async (req, res) => {
      const product_id = req.params.product_id
      const query = { product_id: product_id }
      const result = await reviewsCollection.find(query).toArray()
      res.send(result)
    })


    // Post Review on Related Product
    app.post('/review', async (req, res) => {
      const review = req.body
      const result = await reviewsCollection.insertOne(review)
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
  res.send('Hello Welcome to NatureGlow')
})

app.listen(port, () => {
  console.log(`NatureGlow is running on port ${port}`)
})