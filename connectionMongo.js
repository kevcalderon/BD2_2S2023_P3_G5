const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://3011086840101:admin@bd2.j7gipc3.mongodb.net/practica3mongo";

const mongodbConnection = new MongoClient(uri);

try {
  mongodbConnection.connect();
  console.log("Mongodb connection sucessfull!");
} catch (error) {
  console.log("Error a conectar a mongo", error);
}

module.exports = mongodbConnection;
