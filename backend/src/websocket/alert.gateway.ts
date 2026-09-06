import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'alerts' })
export class AlertGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('AlertGateway');
  private alertInterval: NodeJS.Timeout;

  constructor(private jwt: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    // Simulate real-time alerts every 30s
    const sampleAlerts = [
      { type: 'alert', level: 'amber', title: 'Bab al-Mandeb Transit Delay', message: 'Congestion +18%. Transit: 8.2 days (normal: 7)', source: 'MarineTraffic' },
      { type: 'alert', level: 'red', title: 'Australian Wheat Drought', message: 'NDVI 34% below normal. 12% yield reduction projected.', source: 'NASA EarthData' },
      { type: 'alert', level: 'green', title: 'SAGO Reserve Replenished', message: 'Strategic wheat at 8.2 months (target: 6 months)', source: 'SAGO' },
    ];
    let i = 0;
    this.alertInterval = setInterval(() => {
      // emit to the namespace; a no-op when no clients are connected
      const alert = { ...sampleAlerts[i % 3], timestamp: new Date().toISOString(), id: `alert-${Date.now()}` };
      this.server.emit('alert', alert);
      i++;
    }, 30000);
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (token) this.jwt.verify(token as string);
      this.logger.log(`Client connected: ${client.id}`);
      client.emit('connected', { status: 'connected', message: 'EWS Alert Stream active' });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  broadcastAlert(alert: any) {
    this.server.emit('alert', alert);
  }
}
