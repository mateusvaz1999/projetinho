CREATE DATABASE login;
USE perfil;

CREATE TABLE login (
  id INT PRIMARY KEY,
  nome VARCHAR(100),
  imagem VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS elo (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  senha_hash VARCHAR(255) NOT NULL,
  imagem VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir o perfil inicial com id = 1
INSERT INTO login (id, nome, imagem) VALUES (1, 'Meu Perfil', NULL);

INSERT INTO elo (nome, email, senha_hash)
VALUES ('Usuário Teste', 'teste@example.com', '123');

drop database perfil;
select * from perfil;