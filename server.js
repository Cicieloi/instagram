const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Novo usuário conectado', socket.id);

  let username = '';  // Variável para armazenar o nome do usuário

  socket.on('join', (name) => {
    username = name || 'Anônimo'; 
    console.log(`${username} entrou no chat`);

    socket.broadcast.emit('user joined', username);

    const messages = [
      { username: 'Admin', text: 'Bem-vindo ao chat!', timestamp: '10:00' }
    ];
    socket.emit('previous messages', messages);
  });

  socket.on('chat message', (msg) => {
    const message = {
      username: username,
      text: msg,
      timestamp: new Date().toLocaleTimeString(),
    };
    io.emit('chat message', message); // Enviar para todos os usuários
  });

  socket.on('disconnect', () => {
    if (username) {
      socket.broadcast.emit('user left', username);
      console.log(`${username} desconectado`);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
