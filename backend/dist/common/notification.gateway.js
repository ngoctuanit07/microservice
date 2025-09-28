"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
let NotificationGateway = class NotificationGateway {
    constructor() {
        this.logger = new common_1.Logger('NotificationGateway');
        this.connectedClients = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
        const userId = this.extractUserIdFromSocket(client);
        if (userId) {
            this.connectedClients.set(client.id, { socket: client, userId });
            client.join(`user_${userId}`);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    handleJoinUserRoom(client, data) {
        client.join(`user_${data.userId}`);
        this.connectedClients.set(client.id, { socket: client, userId: data.userId });
        this.logger.log(`User ${data.userId} joined room`);
    }
    sendNotificationToUser(userId, notification) {
        this.server.to(`user_${userId}`).emit('notification', {
            id: Date.now(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: new Date(),
            ...notification,
        });
    }
    sendAlertToUser(userId, alert) {
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
    sendSystemBroadcast(message) {
        this.server.emit('system_message', {
            id: Date.now(),
            message: message.text,
            type: message.type || 'info',
            timestamp: new Date(),
        });
    }
    sendHostStatusUpdate(userId, hostUpdate) {
        this.server.to(`user_${userId}`).emit('host_status_update', {
            hostId: hostUpdate.hostId,
            status: hostUpdate.status,
            lastCheckedAt: hostUpdate.lastCheckedAt,
            timestamp: new Date(),
        });
    }
    extractUserIdFromSocket(client) {
        try {
            const userId = client.handshake.query.userId;
            return userId ? parseInt(userId.toString()) : null;
        }
        catch (error) {
            this.logger.error('Error extracting userId from socket', error);
            return null;
        }
    }
    getConnectedUsersCount() {
        return this.connectedClients.size;
    }
    isUserOnline(userId) {
        for (const [, client] of this.connectedClients) {
            if (client.userId === userId) {
                return true;
            }
        }
        return false;
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_user_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleJoinUserRoom", null);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    })
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map