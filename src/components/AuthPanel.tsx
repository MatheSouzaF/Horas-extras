import { useState, type FormEvent } from "react";

type AuthPanelProps = {
  errorMessage: string;
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
};

type PasswordStrength = "weak" | "medium" | "strong";

const getPasswordStrength = (password: string): PasswordStrength | null => {
  if (!password) return null;
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasMinLength) return "weak";
  if (!hasNumberOrSymbol) return "medium";
  return "strong";
};

const strengthLabels: Record<PasswordStrength, string> = {
  weak: "Fraca",
  medium: "Média",
  strong: "Forte",
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

  const passwordStrength =
    mode === "register" ? getPasswordStrength(password) : null;

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
            placeholder={
              mode === "register"
                ? "Mínimo 8 caracteres, 1 número ou símbolo"
                : "Sua senha"
            }
            required
          />
        </label>

        {passwordStrength ? (
          <div className="password-strength">
            <div className="password-strength-bar" data-strength={passwordStrength}>
              <div className="password-strength-fill" />
            </div>
            <span className="password-strength-label" data-strength={passwordStrength}>
              Força: {strengthLabels[passwordStrength]}
            </span>
          </div>
        ) : null}

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
