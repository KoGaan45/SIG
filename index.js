const express = require('express');
const { Client } = require('pg');
const fs = require('fs');
const app = express();
app.use(express.json());

async function executeQuery(query) {
    console.log('Executing query:', query);

    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'toto',
        password: 'toto',
        database: 'toto'
    });

    client.connect();

    const dbRes = await client.query(query);

    client.end();

    console.log('Query result:', dbRes.rows);

    return dbRes.rows;
}

app.post('/ajouterPI', async (req, res) => {
    const data = req.body;
    console.log(data);
    const query = `INSERT INTO public.pointinteret(moncampus, composante, nom, adresse, position) VALUES ('${data.campus}','${data.component}', '${data.name}','${data.address}' , ST_SetSRID(ST_Point(${data.gps.longitude}, ${data.gps.latitude}),3857))`;
    const result = await executeQuery(query);
    res.json(result);
});

app.get('/getAllCampus', async (req, res) => {
    const query = 'SELECT * FROM public.campus';
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/insert', async (req, res) => {
    const query = "INSERT INTO public.campus(ville) VALUES ('Chateaudun');";
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/getPI', async (req, res) => {
    const query = 'SELECT * FROM pointinteret';
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/', (req, res) => {
    const htmlContent = fs.readFileSync('app.html', 'utf8');
    res.send(htmlContent);
});

app.listen(3000, () => {
    console.log('App is running on port 3000');
});

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    console.log('L\'utilisateur est sur un appareil mobile');
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Coordonnées géographiques de l'utilisateur: Latitude: ${latitude}, Longitude: ${longitude}`);
    });
} else {
    console.log('L\'utilisateur est sur un ordinateur');
}