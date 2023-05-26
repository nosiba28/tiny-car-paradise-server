const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ay2ityn.mongodb.net/?retryWrites=true&w=majority`;

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

        const carsCollection = client.db('tinyCarDB').collection('cars');

        app.get('/cars', async (req, res) => {
            // console.log(req.query);
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/limitedCars', async (req, res) => {
            // console.log(req.query);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page-1) * limit;
            const result = await carsCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        })
        app.get('/mycars', async (req, res) => {
            console.log(req.query.sellerEmail);
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const cursor = carsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/myAscendingCars', async (req, res) => {
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const cursor = carsCollection.find(query).sort({ "price": 1 });
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/myDescendingCars', async (req, res) => {
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const cursor = carsCollection.find(query).sort({ "price": -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/mycars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.findOne(query);
            res.send(result);
        })

        app.post('/cars', async (req, res) => {
            const newCar = req.body;
            console.log(newCar);
            const result = await carsCollection.insertOne(newCar);
            res.send(result);
        })

        app.patch('/mycars/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedToy = req.body;
            console.log(updatedToy);

            const updateDoc = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    details: updatedToy.details,
                },
            };

            const result = await carsCollection.updateOne(filter, updateDoc);

            res.send(result);
        })

        app.delete('/mycars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Car server is running');
})
app.listen(port, () => {
    console.log(`Car server is running on port: ${port}`)
})