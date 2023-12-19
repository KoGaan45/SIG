const http = require('http');
const fs = require('fs');
const express = require('express');
const { Client } = require('pg');
const app = express();

app.get('/api/data', async (req, res) => {
    const client = new Client({
        host: '172.17.0.2',
        port: 5432,
        user: 'postgres',
        password: 'mysecretpassword',
        database: 'postgres'
    });

    client.connect();

    const dbRes = await client.query('SELECT * FROM your_table');

    client.end();

    res.json(dbRes.rows);
    console.log(res.json(dbRes.rows));
});

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const htmlContent = fs.readFileSync('app.html', 'utf8');
    res.end(htmlContent);
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
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