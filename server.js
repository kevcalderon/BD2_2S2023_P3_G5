const express = require("express");
const mongodb = require("./connectionMongo");
const fs = require("fs");
const csv = require("csv-parser");
const app = express();
const port = 3000;

const db = mongodb.db("practica3mongo");
const collection = db.collection("libros");

app.use(express.json());

async function loadInfoMongo() {
  const results = [];
  const result = await collection.deleteMany({});
  console.log("Se limpio los datos de la coleccion libros.");
  fs.createReadStream("./docs/Libros.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      // Insertar los registros en la colección
      const insertResult = await collection.insertMany(results);

      console.log(
        `Se han insertado ${insertResult.insertedCount} registros en la colección libros.`
      );
    });
}

//QUERY 1
app.get("/allBooks", async (req, res) => {
  const libros = await collection.find({}).toArray();
  res.status(200).json({ libros });
});

//QUERY 2
app.get("/category/:name", async (req, res) => {
  const nombreCategoria = req.params.name;
  try {
    const result = await collection
      .find({ Categoria: nombreCategoria })
      .toArray();
    res.status(200).json({ result });
  } catch (error) {
    console.log("Error en query2 ", error);
  }
});

//QUERY 3
app.get("/searchAuthor/:name", async (req, res) => {
  const nombreAutor = req.params.name;
  try {
    const result = await collection.find({ Autor: nombreAutor }).toArray();
    res.status(200).json({ result });
  } catch (err) {
    console.log("Error en query3 ", err);
  }
});

//QUERY 4
app.get("/orderBooksForScore", async (req, res) => {
  try {
    const result = await collection
      .find({})
      .sort({ Calificacion: -1 })
      .toArray();

    res.status(200).json({ result });
  } catch (error) {
    console.log("Error en query3 ", err);
  }
});

//QUERY 5
app.get("/priceLower20", async (req, res) => {
  try {
    const result = await collection
      .find({
        $and: [{ Precio: { $lt: "20" } }],
      })
      .toArray();

    res.status(200).json({ result });
  } catch (error) {
    console.log("Error en query3 ", err);
  }
});

//QUERY 6
app.get("/wordKey/:word", async (req, res) => {
  const word = req.params.word;
  try {
    const result = await collection
      .find({
        $or: [
          { Titulo: { $regex: word, $options: "i" } },
          { Descripcion: { $regex: word, $options: "i" } },
        ],
      })
      .toArray();

    res.status(200).json({ result });
  } catch (error) {
    console.log("Error en query3 ", err);
  }
});

//QUERY 7
app.get("/authorMoreExpensive", async (req, res) => {
  try {
    // Realiza la consulta de agregación para obtener los 10 autores más caros
    const pipeline = [
      {
        $group: {
          Autor: "$Autor",
          totalPrecio: { $sum: { $toDouble: "$Precio" } },
        },
      },
      {
        $sort: { totalPrecio: -1 },
      },
      {
        $limit: 10,
      },
    ];

    const resultado = await collection.aggregate(pipeline).toArray();

    res.status(200).json({ resultado });
  } catch (error) {
    console.log("Error en query7 ", err);
  }
});

//QUERY 8
app.get("/wordKey/:word", async (req, res) => {
  const word = req.params.word;
  try {
    const result = await collection
      .find({
        $or: [
          { Titulo: { $regex: word, $options: "i" } }, // Buscar en el título (insensible a mayúsculas/minúsculas)
          { Descripcion: { $regex: word, $options: "i" } }, // Buscar en la descripción (insensible a mayúsculas/minúsculas)
        ],
      })
      .toArray();

    res.status(200).json({ result });
  } catch (error) {
    console.log("Error en query3 ", err);
  }
});

loadInfoMongo();

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
