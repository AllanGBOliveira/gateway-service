declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    AUTH_SERVICE_PORT: number;
    AUTH_SERVICE_HOST: string;
    GAMES_SERVICE_PORT: number;
    GAMES_SERVICE_HOST: string;
    RABBITMQ_DEFAULT_PORT: number;
    RABBITMQ_DEFAULT_UI_PORT: number;
    RABBITMQ_DEFAULT_USER: string;
    RABBITMQ_DEFAULT_PASS: string;
  }
}
