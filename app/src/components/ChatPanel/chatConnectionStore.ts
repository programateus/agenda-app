import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import type { ChatMessage } from "@/services/chats";

export type ChatConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type ChatConnectionSnapshot = {
  status: ChatConnectionStatus;
  selectedChatId: string | null;
  joinedChatId: string | null;
};

type ChatConnectionConfig = {
  accessToken: string | null;
  hubUrl: string | null;
};

class ChatConnectionStore {
  private connection: HubConnection | null = null;
  private config: ChatConnectionConfig = {
    accessToken: null,
    hubUrl: null,
  };
  private readonly listeners = new Set<() => void>();
  private readonly messageListeners = new Set<(message: ChatMessage) => void>();
  private snapshot: ChatConnectionSnapshot = {
    status: "idle",
    selectedChatId: null,
    joinedChatId: null,
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  subscribeToMessages = (listener: (message: ChatMessage) => void) => {
    this.messageListeners.add(listener);

    return () => {
      this.messageListeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  getServerSnapshot = () => this.snapshot;

  setSelectedChat(chatId: string | null) {
    if (this.snapshot.selectedChatId === chatId) {
      return;
    }

    this.updateSnapshot({
      selectedChatId: chatId,
    });

    void this.syncChatGroup();
  }

  async configure(config: ChatConnectionConfig) {
    const nextAccessToken = config.accessToken?.trim() || null;
    const nextHubUrl = config.hubUrl?.trim() || null;

    if (!nextAccessToken || !nextHubUrl) {
      await this.dispose();
      return;
    }

    const hasSameConfig =
      this.config.accessToken === nextAccessToken &&
      this.config.hubUrl === nextHubUrl;

    if (hasSameConfig && this.connection) {
      return;
    }

    await this.dispose();

    this.config = {
      accessToken: nextAccessToken,
      hubUrl: nextHubUrl,
    };

    const connection = new HubConnectionBuilder()
      .withUrl(nextHubUrl, {
        accessTokenFactory: () => nextAccessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection = connection;
    this.registerConnectionHandlers(connection);
    this.updateSnapshot({
      status: "connecting",
      joinedChatId: null,
    });

    try {
      await connection.start();

      if (this.connection !== connection) {
        await connection.stop();
        return;
      }

      this.updateSnapshot({
        status: "connected",
      });

      await this.syncChatGroup();
    } catch {
      if (this.connection === connection) {
        this.updateSnapshot({
          status: "error",
          joinedChatId: null,
        });
      }
    }
  }

  async dispose() {
    const connection = this.connection;

    this.connection = null;
    this.config = {
      accessToken: null,
      hubUrl: null,
    };
    this.updateSnapshot({
      status: "idle",
      joinedChatId: null,
    });

    if (!connection) {
      return;
    }

    try {
      await connection.stop();
    } catch {
      this.updateSnapshot({
        status: "error",
      });
    }
  }

  private registerConnectionHandlers(connection: HubConnection) {
    connection.on("ChatMessageCreated", (message: ChatMessage) => {
      this.messageListeners.forEach((listener) => {
        listener(message);
      });
    });

    connection.onreconnecting(() => {
      if (this.connection !== connection) {
        return;
      }

      this.updateSnapshot({
        status: "reconnecting",
        joinedChatId: null,
      });
    });

    connection.onreconnected(async () => {
      if (this.connection !== connection) {
        return;
      }

      this.updateSnapshot({
        status: "connected",
      });

      await this.syncChatGroup();
    });

    connection.onclose(() => {
      if (this.connection !== connection) {
        return;
      }

      this.updateSnapshot({
        status: "error",
        joinedChatId: null,
      });
    });
  }

  private async syncChatGroup() {
    const connection = this.connection;

    if (!connection || connection.state !== HubConnectionState.Connected) {
      return;
    }

    const previousChatId = this.snapshot.joinedChatId;
    const nextChatId = this.snapshot.selectedChatId;

    try {
      if (previousChatId && previousChatId !== nextChatId) {
        await connection.invoke("LeaveChat", previousChatId);

        if (this.connection !== connection) {
          return;
        }

        this.updateSnapshot({
          joinedChatId: null,
        });
      }

      if (nextChatId && nextChatId !== this.snapshot.joinedChatId) {
        await connection.invoke("JoinChat", nextChatId);

        if (this.connection !== connection) {
          return;
        }

        this.updateSnapshot({
          joinedChatId: nextChatId,
        });
      }
    } catch {
      if (this.connection === connection) {
        this.updateSnapshot({
          status: "error",
          joinedChatId: null,
        });
      }
    }
  }

  private updateSnapshot(
    partialSnapshot: Partial<ChatConnectionSnapshot>,
  ): void {
    this.snapshot = {
      ...this.snapshot,
      ...partialSnapshot,
    };

    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

export const chatConnectionStore = new ChatConnectionStore();
