import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import knexdb from "./knexfile.js";

const app = express();
const PORT = 3000;

// Caminho da raiz do projeto (para servir index.html e style.css)
const rootDir = path.resolve();

// 👉 Serve arquivos estáticos (como style.css, index.html, etc)
app.use(express.static(rootDir));

/* configura onde salvar as imagens enviadas */
const uploadsDir = path.join(rootDir, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, req.params.id);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `perfil-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir)); // Permite acessar imagens

/* rota raiz -> index.html */
const indexPath = path.join(rootDir, "index.html");
app.get("/", (_, res) => res.sendFile(indexPath));

/* Cadastro */
app.post("/signup", async (req, res) => {
  try {
    const { nome, senha, email } = req.body;
    if (!nome || !senha || !email)
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });

    const exists = await knexdb("elo").where({ nome }).first();
    if (exists) return res.status(409).json({ error: "Nome já utilizado" });

    const [id] = await knexdb("elo").insert({
      nome,
      email,
      senha_hash: senha,
    });
    res.status(201).json({ id, nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao criar conta" });
  }
});

/* Login */
app.post("/login", async (req, res) => {
  try {
    const { nome, senha } = req.body;
    if (!nome || !senha)
      return res.status(400).json({ error: "Nome e senha obrigatórios" });

    const user = await knexdb("elo").where({ nome }).first();
    if (!user || user.senha_hash !== senha)
      return res.status(401).json({ error: "Credenciais inválidas" });

    res.json({ id: user.id, nome: user.nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login" });
  }
});

/* GET perfil/:id */
app.get("/perfil/:id", async (req, res) => {
  try {
    const user = await knexdb("elo").where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const imagemUrl = user.imagem ? `/uploads/${user.id}/${user.imagem}` : null;
    res.json({ ...user, imagemUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

/* Atualiza imagem */
app.post("/perfil/:id/imagem", upload.single("imagem"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Nenhuma imagem enviada" });

  try {
    const { id } = req.params;
    const user = await knexdb("elo").where({ id }).first();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (user.imagem) {
      const old = path.join(uploadsDir, id, user.imagem);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    await knexdb("elo").where({ id }).update({ imagem: req.file.filename });
    res.json({ mensagem: "Imagem atualizada", imagem: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar imagem" });
  }
});

/* Deleta imagem */
app.delete("/perfil/:id/imagem", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await knexdb("elo").where({ id }).first();
    if (!user || !user.imagem)
      return res.status(404).json({ error: "Nenhuma imagem para deletar" });

    const imgPath = path.join(uploadsDir, id, user.imagem);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await knexdb("elo").where({ id }).update({ imagem: null });
    res.json({ mensagem: "Imagem deletada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar imagem" });
  }
});

/* Inicia o servidor */
app.listen(PORT, () =>
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
);
