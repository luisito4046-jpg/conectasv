import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

import usersRouter from './routes/users.js'

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('El servidor esta funcionando correctamente')
});

app.use('/users', usersRouter);


app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor corriendo en http://localhost:${process.env.PORT || 3000}');
});
