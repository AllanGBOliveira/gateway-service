declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    AUTH_SERVICE_PORT: number;
    AUTH_SERVICE_HOST: string;
    GAMES_SERVICE_PORT: number;
    GAMES_SERVICE_HOST: string;
    GAMES_SERVICE_URL: string;
    AUTH_SERVICE_URL: string;
    RABBITMQ_DEFAULT_USER: string;
    RABBITMQ_DEFAULT_PASS: string;
  }
}
