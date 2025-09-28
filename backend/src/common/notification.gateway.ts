import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private logger: Logger = new Logger('NotificationGateway');
  private connectedClients = new Map<string, { socket: Socket; userId: number }>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract userId from token or authentication
    const userId = this.extractUserIdFromSocket(client);
    if (userId) {
      this.connectedClients.set(client.id, { socket: client, userId });
      client.join(`user_${userId}`);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(client: Socket, data: { userId: number }) {
    client.join(`user_${data.userId}`);
    this.connectedClients.set(client.id, { socket: client, userId: data.userId });
    this.logger.log(`User ${data.userId} joined room`);
  }

  // Send notification to specific user
  sendNotificationToUser(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', {
      id: Date.now(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date(),
      ...notification,
    });
  }

  // Send alert to specific user
  sendAlertToUser(userId: number, alert: any) {
    this.server.to(`user_${userId}`).emit('alert', {
      id: Date.now(),
      severity: alert.severity,
      type: alert.type,
      message: alert.message,
      host: alert.host,
      actionRequired: alert.actionRequired,
      timestamp: new Date(),
      ...alert,
    });
  }

  // Send system broadcast
  sendSystemBroadcast(message: any) {
    this.server.emit('system_message', {
      id: Date.now(),
      message: message.text,
      type: message.type || 'info',
      timestamp: new Date(),
    });
  }

  // Send host status update
  sendHostStatusUpdate(userId: number, hostUpdate: any) {
    this.server.to(`user_${userId}`).emit('host_status_update', {
      hostId: hostUpdate.hostId,
      status: hostUpdate.status,
      lastCheckedAt: hostUpdate.lastCheckedAt,
      timestamp: new Date(),
    });
  }

  private extractUserIdFromSocket(client: Socket): number | null {
    try {
      // Extract from query params or headers
      const userId = client.handshake.query.userId;
      return userId ? parseInt(userId.toString()) : null;
    } catch (error) {
      this.logger.error('Error extracting userId from socket', error);
      return null;
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedClients.size;
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    for (const [, client] of this.connectedClients) {
      if (client.userId === userId) {
        return true;
      }
    }
    return false;
  }
}