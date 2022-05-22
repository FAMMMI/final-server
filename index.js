const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mg8jq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const productCollection = client.db('assignment-12').collection('products');
        const ordersCollection = client.db('assignment-12').collection('orders');
        const usersCollection = client.db('assignment-12').collection('users');


        app.get('/users', verifyJWT, async (req, res) => {
            const email = req.query.email;
            console.log(email);
            if (email === undefined || email === '') {
                const query = {};
                const cursor = usersCollection.find(query);
                const user = await cursor.toArray();
                res.send(user);
            }
            else {
                const query = { email: email };
                const cursor = usersCollection.find(query);
                const user = await cursor.toArray();
                res.send(user);
            }
        })

        app.get('/product', async (req, res) => {
            const id = req.query.id;

            if (id !== undefined) {
                const _id = req.query.id;
                const cursor = productCollection.find({ "_id": ObjectId(_id) });
                const products = await cursor.toArray();
                res.send(products);
            }
            else {
                const query = {};
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            if (email !== undefined) {
                const query = { email: email };
                const cursor = ordersCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else {
                const query = {};
                const cursor = ordersCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/products/:id', async (req, res) => {
            const _id = req.params.id;
            const updatedProduct = req.body;
            console.log(updatedProduct, _id);
            const filter = { "_id": ObjectId(_id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    description: updatedProduct.description,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity,
                    productCode: updatedProduct.productCode,
                    img: updatedProduct.img,
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })




    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})