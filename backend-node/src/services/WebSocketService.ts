import { Server as SocketIOServer, Socket } from 'socket.io';
import { WebSocketMessage } from '../types';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Handle client joining a room
      socket.on('join_room', (room: string) => {
        socket.join(room);
        console.log(`👥 Client ${socket.id} joined room: ${room}`);
      });

      // Handle client leaving a room
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        console.log(`👋 Client ${socket.id} left room: ${room}`);
      });

      // Handle custom events
      socket.on('custom_event', (data: any) => {
        console.log(`📨 Custom event from ${socket.id}:`, data);
        // Echo back to sender
        socket.emit('custom_event_response', {
          message: 'Event received',
          data: data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
        this.connectedClients.delete(socket.id);
      });

      // Send welcome message
      socket.emit('welcome', {
        message: 'Connected to Energex WebSocket service',
        clientId: socket.id,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Broadcast new post to all connected clients
  broadcastNewPost(post: any): void {
    const message: WebSocketMessage = {
      type: 'new_post',
      data: post,
      timestamp: new Date().toISOString()
    };

    this.io.emit('new_post', message);
    console.log(`📢 Broadcasted new post: ${post.title}`);
  }

  // Broadcast post update to all connected clients
  broadcastPostUpdate(post: any): void {
    const message: WebSocketMessage = {
      type: 'post_updated',
      data: post,
      timestamp: new Date().toISOString()
    };

    this.io.emit('post_updated', message);
    console.log(`📢 Broadcasted post update: ${post.title}`);
  }

  // Broadcast post deletion to all connected clients
  broadcastPostDeletion(postId: number): void {
    const message: WebSocketMessage = {
      type: 'post_deleted',
      data: { id: postId },
      timestamp: new Date().toISOString()
    };

    this.io.emit('post_deleted', message);
    console.log(`📢 Broadcasted post deletion: ${postId}`);
  }

  // Send message to specific room
  sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`📨 Sent ${event} to room: ${room}`);
  }

  // Send message to specific client
  sendToClient(clientId: string, event: string, data: any): void {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      console.log(`📨 Sent ${event} to client: ${clientId}`);
    } else {
      console.log(`❌ Client not found: ${clientId}`);
    }
  }

  // Broadcast system message
  broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const systemMessage: WebSocketMessage = {
      type: 'system_message',
      data: {
        message,
        type,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('system_message', systemMessage);
    console.log(`📢 System message broadcasted: ${message}`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get connected clients info
  getConnectedClientsInfo(): any[] {
    return Array.from(this.connectedClients.entries()).map(([id, socket]) => ({
      id,
      connectedAt: socket.handshake.time,
      rooms: Array.from(socket.rooms),
      address: socket.handshake.address
    }));
  }

  // Broadcast cache statistics
  broadcastCacheStats(stats: any): void {
    const message: WebSocketMessage = {
      type: 'cache_stats',
      data: stats,
      timestamp: new Date().toISOString()
    };

    this.io.emit('cache_stats', message);
  }

  // Broadcast database statistics
  broadcastDatabaseStats(stats: any): void {
    const message: WebSocketMessage = {
      type: 'database_stats',
      data: stats,
      timestamp: new Date().toISOString()
    };

    this.io.emit('database_stats', message);
  }
}
