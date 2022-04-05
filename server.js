const express = require('express');
const joyas = require('./data/joyas.js');
const app = express();
const port = 3000;


const HATEOASV1 = () => {
  const result = joyas.map(joya => {
    return {
      title: joya.name,
      src: `http://localhost:3000/joya/${joya.id}`,
    }
  });
  return result;
};

const HATEOASV2 = () => {
  const result = joyas.map(joya => {
    return {
      name: joya.name,
      price: joya.value,
      details: `http://localhost:3000/joya/${joya.id}`,
    }
  });
  return result;
};

const joya = (id) => {
  const result = joyas.find(joya => joya.id === Number(id));
  return result;
};

const categoryFilter = (category) => {
  const result = joyas.filter(joya => joya.category === category);
  return result;
};

const selectedFields = (joya, fields) => {
  for (property in joya){
    if(!fields.includes(property)) delete joya[property];
  }
  return joya;
};

const orderValues = (order) => {
  
  if (order === 'asc') {
    return joyas.sort((a, b) => a.value - b.value);
  }
  if (order === 'desc') {
    return joyas.sort((a, b) => b.value - a.value);
  }else{
    console.log("Valor de orden incorrecto.");
  }
};

app.get('/api/v1/joyas', (req, res) => {
  res.send({
    joyas: HATEOASV1(),
  })
});

app.get('/api/v2/joyas', (req, res) => {

  const { values } = req.query;
  if (values === "asc") return res.send(orderValues("asc"));
  if (values === "desc") return res.send(orderValues("desc"));

  if (req.query.page) {
    const { page } = req.query;
    return res.send({ joyas: HATEOASV2().slice(page * 2 - 2, page * 2) });
  }

  res.send({
    joyas: HATEOASV2(),
  })
});

app.get('/joya/:id', (req, res) => {
  const { id } = req.params;
  res.send(joya(id));
});

app.get('/api/v2/category/:category', (req, res) => {
  const { category } = req.params;
  if (!joyas.find(joya => joya.category === category)){
    res.send(`La categoría ingresada no existe, elige alguna de las siguientes: collar, anillo, aros.`);
  }
  res.send({
    cant: categoryFilter(category).length,
    joyas: categoryFilter(category)
  });
});

app.get('/api/v2/joya/:id', (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  if (fields) return res.send({joya: selectedFields(joya(id), fields.split(","))});  
  joya(id) ? res.send({ joyas: joya(id)}) : res.status(404).send({error: "404 Not Found", message: "No existe una joya con ese ID."});
});


app.listen(port, () => console.log(`Server initialized at port ${port}.`));