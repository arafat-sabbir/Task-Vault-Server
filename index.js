const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares

app.use(cors());
app.use(express.json())

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t245pno.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const userCollection = client.db("TaskVault").collection("user");

    // Save The Newly Registered User Data To Database
    app.post("/api/createUser", async (req, res) => {
      try {
        const userinfo = req.body;
        const useremail = userinfo.email
        const query = {email : useremail}
        const isexist = await userCollection.findOne(query)
        if(isexist){
          return console.log('user already exist');

        }
        console.log(userinfo);
        const result = await userCollection.insertOne(userinfo);
        res.send(result);
      } catch (error) {
        console.log(error);;
      }
    });

    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Vault is Running Fine");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
