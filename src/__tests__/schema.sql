-- Schema mínimo para a suíte de testes (Vitest + MySQL de CI).
-- Não é o esquema de produção: só cobre tabelas/colunas usadas pelos testes.

CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(255) NULL,
  usuario     VARCHAR(100) NOT NULL,
  senha       VARCHAR(255) NULL,
  cargo       ENUM('administrador','gerente','atendente') NOT NULL DEFAULT 'atendente',
  ativo       TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_login DATETIME NULL,
  criado_em   DATETIME NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produtos (
  codigo                VARCHAR(50) NOT NULL,
  descricao             VARCHAR(255) NULL,
  ean                   VARCHAR(50) NULL,
  departamento          VARCHAR(10) NULL,
  descricao_departamento VARCHAR(255) NULL,
  preco_venda           DECIMAL(10,2) NULL,
  marca                 VARCHAR(100) NULL,
  familia               VARCHAR(50) NULL,
  quantidade_kg_l       DECIMAL(10,3) NULL,
  descricao_kglt        VARCHAR(50) NULL,
  PRIMARY KEY (codigo),
  KEY idx_produtos_ean (ean),
  KEY idx_produtos_desc (descricao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS imagens_verificacao (
  codigo     VARCHAR(50) NOT NULL,
  status     VARCHAR(30) NOT NULL DEFAULT 'pendente',
  observacao TEXT NULL,
  PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS log_placas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  descricao    VARCHAR(255) NULL,
  codigo       VARCHAR(50) NULL,
  ean          VARCHAR(13) NULL,
  preco        DECIMAL(10,2) NULL,
  tipo_placa   VARCHAR(20) NULL,
  impressa     TINYINT(1) NOT NULL DEFAULT 0,
  usuario      VARCHAR(100) NULL,
  usuario_id   INT NULL,
  usuario_nome VARCHAR(255) NULL,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_log_placas_usuario (usuario),
  KEY idx_log_placas_criado (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS registros_placas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario         VARCHAR(100) NULL,
  descricao       VARCHAR(255) NULL,
  codigo          VARCHAR(50) NULL,
  ean             VARCHAR(50) NULL,
  preco           DECIMAL(10,2) NULL,
  preco_info      VARCHAR(50) NULL,
  quantidade_kg_l DECIMAL(10,3) NULL,
  descricao_kglt  VARCHAR(50) NULL,
  config          TEXT NULL,
  marca           VARCHAR(100) NULL,
  ordem           INT NULL,
  tipo_placa      VARCHAR(20) NULL,
  KEY idx_usuario (usuario),
  KEY idx_tipo (tipo_placa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listas_precos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(255) NULL,
  data_oferta  DATE NULL,
  finalizada   TINYINT(1) NOT NULL DEFAULT 0,
  lista_pai_id INT NULL,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
