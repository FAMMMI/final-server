const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mg8jq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('assignment-12').collection('products');
        const ordersCollection = client.db('assignment-12').collection('orders');
        const usersCollection = client.db('assignment-12').collection('users');


        app.get('/users', async (req, res) => {
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

        app.get('/products', async (req, res) => {
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

        // app.get('/admin/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const user = await usersCollection.findOne({ email: email });
        //     const isAdmin = user.role === 'admin';
        //     res.send({ admin: isAdmin })
        // })

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
                    minimumQuantity: updatedProduct.minimumQuantity,
                    img: updatedProduct.img,
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.put('/orders', async (req, res) => {
            const _id = req.query.id;
            const updatedProduct = req.body;
            const filter = { "_id": ObjectId(_id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    userName: updatedProduct.userName,
                    phone: updatedProduct.phone,
                    address: updatedProduct.address,
                    name: updatedProduct.name,
                    email: updatedProduct.email,
                    description: updatedProduct.description,
                    price: updatedProduct.price,
                    totalPrice: updatedProduct.totalPrice,
                    quantity: updatedProduct.quantity,
                    img: updatedProduct.img,
                    status: updatedProduct.status
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { name: user.name, email: user.email, address: user.address, phone: user.phone, password: user.password };
            const exists = await usersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, user: exists })
            }
            const result = await usersCollection.insertOne(user);
            res.send({ success: true, result });
        })

        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.send({ success: true, result });
        })
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await ordersCollection.insertOne(product);
            res.send(result);
        })

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        app.delete('/products', async (req, res) => {
            const _id = req.query.id;

            // const query = {};
            const result = await productsCollection.deleteOne({ "_id": ObjectId(_id) });
            res.send(result);
        })

        app.delete('/orders', async (req, res) => {
            const _id = req.query.id;
            const result = await ordersCollection.deleteOne({ "_id": ObjectId(_id) });
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