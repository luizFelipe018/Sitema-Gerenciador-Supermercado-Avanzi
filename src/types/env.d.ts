declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST?: string
    DB_USER?: string
    DB_PASSWORD?: string
    DB_NAME?: string
    DB_PORT?: string
    PORT?: string
    JWT_SECRET?: string
    PASTA_IMAGENS?: string
    PASTA_PRATOS?: string
  }
}
