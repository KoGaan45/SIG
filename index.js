const express = require('express');
const { Client } = require('pg');
const fs = require('fs');

/* 
const cors = require('cors');

const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/geoserver', createProxyMiddleware({ target: 'http://localhost:8080', changeOrigin: true }));
app.use(cors());

*/

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
    const query = `INSERT INTO public.pointinteret(moncampus, composante, nom, adresse, position) VALUES ('${data.campus}','${data.component}', '${data.name}','${data.address}' , ST_SetSRID(ST_Point(${data.gps.longitude}, ${data.gps.lattitude}),4326))`;
    const result = await executeQuery(query);
    res.json(result);
});

app.post('/modifierPI', async (req, res) => {
    const data = req.body;
    console.log(data);
    const query = `UPDATE public.pointinteret SET moncampus='${data.campus}', composante='${data.component}', nom='${data.name}', adresse='${data.address}', "position"=ST_SetSRID(ST_Point(${data.gps.longitude}, ${data.gps.lattitude}),4326) WHERE idpoint='${data.id}';`
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

app.get('/getServices', async (req, res) => {
    const query = 'SELECT * FROM service';
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/getTypes', async (req, res) => {
    const query = 'SELECT DISTINCT type FROM public ';
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/getCampus', async (req, res) => {
    const query = 'SELECT * FROM campus';
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/getMatieres', async (req, res) => {
    var type = req.query.type;
    const query = `SELECT DISTINCT nom FROM public WHERE type='${type}'`;
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/getServiceByPI', async (req, res) => {
    var id = req.query.id;
    const query = `SELECT * FROM service WHERE monpoint='${id}'`;
    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
});

app.get('/', (req, res) => {
    const htmlContent = fs.readFileSync('app.html', 'utf8');
    res.send(htmlContent);
});

app.post('/filtrer', async (req, res) => {
    const data = req.body;
    console.log(data);

    var baseQuery = `
    SELECT DISTINCT pt.idpoint
    FROM pointinteret AS pt
    LEFT JOIN service AS s ON s.monpoint = pt.idpoint
    LEFT JOIN public_service as ps ON s.idservice = ps.service_idservice
    LEFT JOIN public AS pub ON pub.idpublic = ps.public_idpublic
    LEFT JOIN campus AS c ON c.idcampus=pt.moncampus
    `;

    var whereClauses = [];
    if (data.nomaff) whereClauses.push(`pt.nom = '${data.nomaff}'`);
    if (data.serviceaff) whereClauses.push(`s.nom = '${data.serviceaff}'`);
    if (data.campusaff) whereClauses.push(`c.idcampus = '${data.campusaff}'`);
    if (data.typeaff) whereClauses.push(`pub.type = '${data.typeaff}'`);
    if (data.matiereaff) whereClauses.push(`pub.nom = '${data.matiereaff}'`);

    var query = baseQuery;
    if (whereClauses.length) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const result = await executeQuery(query);
    res.json(result);
    console.log(result);
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

