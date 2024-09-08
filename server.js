import http from 'http';
import fs from 'fs';
import mime from 'mime';

const port = 3000, dir = 'public/';

let appdata = [
  { 'model': 'toyota', 'year': 1999, 'mpg': 23 },
  { 'model': 'honda', 'year': 2004, 'mpg': 30 },
  { 'model': 'ford', 'year': 1987, 'mpg': 14}
];


const server = http.createServer(function(request, response) {
  if (request.method === 'GET') {
    handleGet(request, response);
  } else if (request.method === 'POST') {
    handlePost(request, response);
  } else if (request.method === 'PUT') {
    handlePut(request, response);
  } else if (request.method === 'DELETE') {
    handleDelete(request, response);
  }
});

const handleGet = function(request, response) {
  if (request.url === '/') {
    sendFile(response, 'public/index.html');
  } else if (request.url === '/vehicles') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(appdata));
  } else {
    const filename = dir + request.url.slice(1);
    sendFile(response, filename);
  }
};

const handlePost = function(request, response) {
  let dataString = '';

  request.on('data', function(data) {
    dataString += data;
  });

  request.on('end', function() {
    const newVehicle = JSON.parse(dataString);
    appdata.push(newVehicle);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(appdata));
  });
};

const handleDelete = function(request, response) {
  let dataString = '';

  request.on('data', function(data) {
    dataString += data;
  });

  request.on('end', function() {
    const { model } = JSON.parse(dataString);

    appdata = appdata.filter(vehicle => vehicle.model !== model);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(appdata));
  });
};

const sendFile = function(response, filename) {
  const type = mime.getType(filename);

  fs.readFile(filename, function(err, content) {
    if (err === null) {
      response.writeHeader(200, { 'Content-Type': type });
      response.end(content);
    } else {
      response.writeHeader(404);
      response.end('404 Error: File Not Found');
    }
  });
};

const handlePut = function(request, response) {
  let dataString = '';

  request.on('data', function(data) {
    dataString += data;
  });

  request.on('end', function() {
    const updatedVehicle = JSON.parse(dataString);
    const oldModel = updatedVehicle.oldModel;

    appdata = appdata.map(vehicle => {
      if (vehicle.model === oldModel) {
        return {
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          mpg: updatedVehicle.mpg
        };
      }
      return vehicle;
    });

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(appdata));
  });
};



server.listen( process.env.PORT || port )