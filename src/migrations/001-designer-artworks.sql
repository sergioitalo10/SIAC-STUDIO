-- Migration: designer_artworks e designer_earnings
-- 60% para o site, 40% para o designer colaborador
-- Arte precisa ser aprovada pelo admin antes de ir ao site

CREATE TABLE IF NOT EXISTS designers (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designer_artworks (
  id SERIAL PRIMARY KEY,
  designer_id INT REFERENCES designers(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco NUMERIC(10,2) NOT NULL,
  imagem_url VARCHAR(500),
  arquivo_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  observacoes TEXT,
  aprovado_em TIMESTAMP,
  rejeitado_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designer_earnings (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  designer_artwork_id INT NOT NULL,
  designer_id INT NOT NULL,
  valor_venda NUMERIC(10,2) NOT NULL,
  valor_comissao NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garante colunas extras na tabela de itens de pedido (se já existir)
ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_artwork_id INT;
ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_id INT;
ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_nome VARCHAR(255);
