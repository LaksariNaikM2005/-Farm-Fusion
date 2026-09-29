const Message = require('../models/Message');
const Notification = require('../models/Notification');

const connectedUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register user socket
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    });

    // Join conversation room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content, conversationId } = data;
        const message = await Message.create({ sender: senderId, receiver: receiverId, content, conversationId });
        const populated = await message.populate('sender', 'name profileImage');

        io.to(conversationId).emit('receive_message', populated);

        // Real-time notification to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            type: 'message',
            message: `New message received`,
            link: `/chat/${conversationId}`,
          });
        }
      } catch (err) {
        console.error('Socket send_message error:', err.message);
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing', { userId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('stop_typing');
    });

    // WebRTC signaling
    socket.on('webrtc_offer', ({ to, offer }) => {
      const targetSocket = connectedUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc_offer', { from: socket.userId, offer });
    });

    socket.on('webrtc_answer', ({ to, answer }) => {
      const targetSocket = connectedUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc_answer', { from: socket.userId, answer });
    });

    socket.on('webrtc_ice', ({ to, candidate }) => {
      const targetSocket = connectedUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc_ice', { from: socket.userId, candidate });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) connectedUsers.delete(socket.userId);
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

const sendNotification = (io, userId, payload) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) io.to(socketId).emit('notification', payload);
};

module.exports = { initSocket, sendNotification };
