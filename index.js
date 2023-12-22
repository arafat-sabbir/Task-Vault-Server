const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const tasksCollection = client.db("TaskVault").collection("tasks");

    // Save The Newly Registered User Data To Database

    app.post("/api/createUser", async (req, res) => {
      try {
        const userinfo = req.body;
        const useremail = userinfo.email;
        const query = { email: useremail };
        const isexist = await userCollection.findOne(query);
        if (isexist) {
          return console.log("user already exist");
        }
        const result = await userCollection.insertOne(userinfo);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Get the current logged in user data from database

    app.get("/api/getUserinfo", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await userCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // Create New task Based On the User

    app.post("/api/createTasks", async (req, res) => {
      const taskinfo = req.body;
      const result = await tasksCollection.insertOne(taskinfo);
      res.send(result);
    });

    // Get Specific Task For Logged in user
    app.get("/api/getTasksByUser", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await tasksCollection.find(query).toArray();
      res.send(result);
    });

    // Update A specific task 
    app.patch('/api/updateTasks/:id',async(req,res)=>{
      const query = {_id:new ObjectId(req.params.id)}
      const updatedInfo = req.body;
      const updatedTask = {
        $set:{
          tasktitle:updatedInfo.tasktitle,
          taskdeadline:updatedInfo.taskdeadline,
          taskPriority:updatedInfo.taskPriority,
          description:updatedInfo. description,
        }
      }
      const result = await tasksCollection.updateOne(query,updatedTask)
      res.send(result)
      console.log(updatedTask,result);
    })


    // Delete Task by User confirmation
    app.delete("/api/deleteTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query)
      console.log(id,result);
      res.send(result)
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
