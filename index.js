// const express = require ('express');
// const cors = require ('cors');

// const app = express();
// const port = process.env.port || 7000;

// //middlewire
// app.use(cors());
// app.use(express.json());

// // /Mongodb setup 
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://Cargo-Connect:QzWHuGgpxA14yRiD@cluster0.mkelkx7.mongodb.net/?appName=Cluster0";

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
// await client.connect();
// const db = client.db('cargo_db')
// const productCollection = db.collection('products');

// app.get('/products',async(req, res)=>{
//     const newProduct = req.body;
//     const result = await productCollection.insertOne(newProduct);
//     res.send(result);

// })

// app.get('/products',async (req, res)=>{
//   // console.log("connected");
//   const cursor = productsCollection.find();
//   const result = await cursor.toArray();

//   // console.log(result);
//   res.send(result)
// });


const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const uri = "mongodb+srv://Cargo-Connect:QzWHuGgpxA14yRiD@cluster0.mkelkx7.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db('cargo_db');
    const productCollection = db.collection('products');
    const importCollection = db.collection('imports');
    const userCollection = db.collection('users');
    const exportCollection = db.collection("exports");


//users api
app.post('/users',async(req,res)=>{
const newUser = req.body;
const email = req.body.email;
const query = {email:email}
const existingUser = await userCollection.findOne(query);
if(existingUser){
  res.send('user alredy exists')

}
else{
  const result = await userCollection.insertOne(newUser);
  res.send(result);
}


})











    // Insert a product
    app.post('/products', async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get all products
    app.get('/products', async (req, res) => {
      try {
        const cursor = productCollection.find().sort({priceUSD: 1});
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

//Latest Product APi 6 calling 

    app.get ('/latestProducts',async (req, res)=>{
        const cursor = productCollection.find().sort({created_at:-1}).limit(8);
        const result = await cursor .toArray();
        res.send(result);

    })

    // app.get ('/products/:id', async(req,res)=>{
    //     const id = req.params.id;
    //     const query = req.params.id;
    //     const result = await productCollection.findOne(query)
    //     res.send(result);

    // })







app.post('/imports', async (req, res) => {
  try {
    const newImport = req.body;
    const result = await importCollection.insertOne(newImport);
    res.send(result);
  } catch (error) {
    console.error('Error inserting import:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
app.get('/imports', async (req, res) => {
  const email = req.query.email;
  const query = email ? { buyer_email: email } : {};
  const cursor = importCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// Node.js + Express + MongoDB


app.delete('/imports/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }; // convert string to ObjectId
    const result = await importCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});


app.post('/imports', async (req, res) => {
  const importData = req.body;
  const result = await importCollection.insertOne(importData);
  res.send(result);
});


app.get('/imports', async (req, res) => {
  try {
    console.log(connected);
    const email = req.query.email;
    const query = {};

    if (email) {
      query.buyer_email = email;
    }

    const cursor = importCollection.find(query); // ✅ use query here
    const result = await cursor.toArray();
    res.send(result);
    console.log(result);
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


const { ObjectId } = require('mongodb');

app.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const product = await exportCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).send({ message: "Product not found" });
    res.send(product);
  } catch (err) {
    res.status(500).send({ message: "Server error" });
  }
});

// export 
app.post("/exports", async (req, res) => {
      try {
        const exportData = req.body;

        // Optional: add timestamp
        exportData.created_at = new Date();

        const result = await exportCollection.insertOne(exportData);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add export" });
      }
    });

    // -----------------------------
    // GET /exports -> Fetch all exports
    // -----------------------------
    app.get("/exports", async (req, res) => {
      try {
        const cursor = exportCollection.find().sort({ created_at: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch exports" });
      }
    });

    // -----------------------------
    // GET /exports/:email -> Fetch exports by user email
    // -----------------------------
    app.get("/exports/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const cursor = exportCollection.find({ email }).sort({ created_at: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch user exports" });
      }
    });

    // -----------------------------
    // DELETE /exports/:id -> Delete an export
    // -----------------------------
    app.delete("/exports/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await exportCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to delete export" });
      }
    });
  


// Get product by ObjectId
app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };  // important fix!
  const result = await productCollection.findOne(query);
  res.send(result);
});

// Save export
app.post('/exports', async (req, res) => {
  const exportData = req.body;
  const result = await exportCollection.insertOne(exportData);
  res.send(result);
});


// POST: add export
app.post('/exports', async (req, res) => {
  const exportData = req.body;
  const result = await exportCollection.insertOne(exportData);
  res.send(result);
});

// GET: get exports by email (for myExport page)
app.get('/exports', async (req, res) => {
  const email = req.query.email;
  let query = {};
  if (email) {
    query = { email: email };
  }
  const result = await exportCollection.find(query).toArray();
  res.send(result);
});



// DELETE export
app.delete('/exports/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await exportCollection.deleteOne(query);
  res.send(result);
});

// PUT update export (quantity)
app.put('/exports/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const query = { _id: new ObjectId(id) };
  const update = { $set: updatedData };
  const result = await exportCollection.updateOne(query, update);
  res.send(result);
});


app.get('/exports', async (req, res) => {
  const cursor = exportsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});


















    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error(err);
  }
}
















run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('Cargo Connect server is running');
});

// Start server
app.listen(port, () => {
  console.log(`Cargo Connect is running on port: ${port}`);
});





































































//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
   

//   }
// }
// run().catch(console.dir);















app.get('/',(req ,res)=>{
    res.send('Cargo  Connect  server is running')
})
app.listen (port,()=>{
    console.log(`Cargo   Connect is running on port: ${port}`)
})