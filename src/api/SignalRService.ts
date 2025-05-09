import * as signalR from '@microsoft/signalr'

export interface FriendRequest {
  userId: string
  login: string
  displayName: string | null
}

export class SignalRService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://your-api-address/hubs/friend", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem('accessToken') || ''
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();
  }

  async startConnection(): Promise<void> {
    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("Connection error:", err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  setupFriendRequestListener(callback: (user: FriendRequest, message: string) => void): void {
    this.connection.on("ReceiveFriendRequest", callback);
  }

  async sendFriendRequest(recipientId: string): Promise<void> {
    try {
      await this.connection.invoke("SendRequest", recipientId);
    } catch (err) {
      console.error("Send error:", err);
    }
  }

  async stopConnection(): Promise<void> {
    await this.connection.stop();
  }
}

export const signalRService = new SignalRService();