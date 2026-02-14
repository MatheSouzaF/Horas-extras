import { useState, type FormEvent } from "react";

type AuthPanelProps = {
  errorMessage: string;
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
};

export function AuthPanel({
  errorMessage,
  onLogin,
  onRegister,
}: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      onLogin(email.trim().toLowerCase(), password);
      return;
    }

    onRegister(name.trim(), email.trim().toLowerCase(), password);
  };

  return (
    <section className="card auth-card">
      <h2>{mode === "login" ? "Entrar" : "Criar usuário"}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="field">
            <span>Nome</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Matheus"
              required={mode === "register"}
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ex.: matheus@email.com"
            required
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </label>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

        <div className="auth-actions">
          <button type="submit">
            {mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setMode((current) => (current === "login" ? "register" : "login"))
            }
          >
            {mode === "login" ? "Criar conta" : "Já tenho conta"}
          </button>
        </div>
      </form>
    </section>
  );
}
