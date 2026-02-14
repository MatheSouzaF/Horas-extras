type UserSessionProps = {
  name: string;
  onLogout: () => void;
};

const normalizeName = (name: string) => {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Usuário";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export function UserSession({ name, onLogout }: UserSessionProps) {
  const displayName = normalizeName(name);

  return (
    <section className="card session-card">
      <h2>Board do {displayName}</h2>
      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </section>
  );
}
