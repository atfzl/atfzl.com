+++
title = "HTTP 0.9"
date = "2025-01-25"
+++

- The first version of Hyper Text Transfer Protocol (HTTP)
- Simple protocol without any headers
- Supported only GET method

#### _Request_

```
GET /index.html
```

#### _Response_

```
<h1>Hello World</h1>
```

#### _Server:_

```js
const net = require('net');
net
  .createServer((socket) => {
    socket.on('data', (data) => {
      if (data.toString() === 'GET /index.html\r\n') {
        socket.write('<h1>Hello World</h1>');
      }
      socket.end();
    });
  })
  .listen(8080);
```

#### _Client:_

```js
const net = require('net');

const client = new net.Socket();

client.connect('8080', 'localhost', () => {
  client.write('GET index.html\r\n');
});

client.on('data', (data) => {
  console.info(`Response from server: ${data.toString()}`);
  client.end();
});
```