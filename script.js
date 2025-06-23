let currentId = null;

    const authSection = document.getElementById("authSection");
    const perfilSection = document.getElementById("perfilSection");
    const perfilTitulo  = document.getElementById("perfilTitulo");
    const imagemPerfil = document.getElementById("imagemPerfil");

    /* ----------- cadastro ----------- */
    document.getElementById("formSignup").addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("suNome").value.trim();
      const email = document.getElementById("suEmail").value.trim();
      const senha = document.getElementById("suSenha").value.trim();

      // Validação simples do email gmail
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        return alert("O email deve ser um Gmail válido terminando em @gmail.com");
      }

      const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Conta criada! Agora faça login.`);
        authSection.style.display = "block";
        perfilSection.style.display = "none";
        document.getElementById("formSignup").reset();
        // Focar input do login
        document.getElementById("loNome").focus();
      } else {
        alert(data.error || "Falha no cadastro");
      }
    });

    /* ------------- login ------------- */
    document.getElementById("formLogin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome  = document.getElementById("loNome").value.trim();
      const senha = document.getElementById("loSenha").value.trim();

      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });
      const data = await res.json();

      if (!res.ok) return alert(data.error || "Falha no login");

      currentId = data.id;
      perfilTitulo.textContent = `Olá, ${data.nome}!`;
      await carregarPerfil();

      // Esconder login/cadastro e mostrar perfil
      authSection.style.display = "none";
      perfilSection.style.display = "block";
    });

    /* ---- carregar dados/imagem ---- */
    async function carregarPerfil() {
      const res = await fetch(`/perfil/${currentId}`);
      const user = await res.json();
      if (user.imagemUrl) {
        imagemPerfil.src = user.imagemUrl + "?" + Date.now();
        imagemPerfil.alt = "Imagem de " + user.nome;
      } else {
        imagemPerfil.src = "";
        imagemPerfil.alt = "Sem imagem";
      }
    }

    /* ----- upload imagem ----- */
    document.getElementById("formImagem").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const res = await fetch(`/perfil/${currentId}/imagem`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return alert("Falha no upload");
      await carregarPerfil();
      alert("Imagem atualizada!");
    });

    /* ----- deletar imagem ----- */
    document.getElementById("btnDeletar").addEventListener("click", async () => {
      if (!confirm("Deseja deletar a imagem?")) return;
      const res = await fetch(`/perfil/${currentId}/imagem`, { method: "DELETE" });
      if (!res.ok) return alert("Erro ao deletar");
      await carregarPerfil();
      alert("Imagem deletada");
    });

    /* -------- logout -------- */
    document.getElementById("btnLogout").addEventListener("click", () => {
      currentId = null;
      perfilSection.style.display = "none";
      authSection.style.display = "block";
      // Limpa os inputs de login
      document.getElementById("formLogin").reset();
      // Foca o input do login
      document.getElementById("loNome").focus();
    });