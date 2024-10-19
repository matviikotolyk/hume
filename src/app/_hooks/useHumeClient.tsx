import { useState, useEffect } from 'react';
import { Hume, HumeClient } from 'hume';

let humeClient: HumeClient | null = null;
let socket: any | null = null;

export function useHumeClient() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initHumeClient() {
      if (!humeClient) {
        try {
          humeClient = new HumeClient({
            apiKey: process.env.HUME_API_KEY,
            secretKey: process.env.HUME_SECRET_KEY,
          });

          socket = await humeClient.empathicVoice.chat.connect({
            configId: process.env.HUME_CONFIG_ID,
          });

          setIsConnected(true);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Hume client'));
        }
      }
    }

    initHumeClient();

    return () => {
      // Clean up the socket connection when the component unmounts
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { humeClient, socket, isConnected, error };
}