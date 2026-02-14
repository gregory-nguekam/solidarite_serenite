const API_BASE = import.meta.env.VITE_API_URL;

type ApiErrorPayload = { message?: string };

const buildUrl = (path: string) => {
  if (!API_BASE) {
    throw new Error("VITE_API_URL is not set.");
  }
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const readErrorMessage = async (res: Response) => {
  try {
    const data = (await res.json()) as ApiErrorPayload;
    if (data?.message) return data.message;
  } catch {
    // Ignore JSON parse errors and fall back to status text.
  }
  return res.statusText || `HTTP ${res.status}`;
};

export async function login(email: string, password: string) {
  const res = await fetch(buildUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = (await res.json()) as { token?: string; accessToken?: string; jwt?: string };
  const token = data.token ?? data.accessToken ?? data.jwt;
  if (!token) throw new Error("Login failed: token missing.");
  localStorage.setItem("token", token);
  return token;
}

export async function me(token?: string) {
  const authToken = token ?? localStorage.getItem("token");
  if (!authToken) throw new Error("Not authorized");
  const res = await fetch(buildUrl("/api/me"), {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json();
}

export async function registerAdherent(payload: FormData) {
  const res = await fetch(buildUrl("/api/adherent/register"), {
    method: "POST",
    body: payload,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = (await res.json()) as { token?: string; accessToken?: string; jwt?: string };
  const token = data.token ?? data.accessToken ?? data.jwt;
  if (token) localStorage.setItem("token", token);
  return data;
}

export async function registerMembre(payload: FormData) {
  const res = await fetch(buildUrl("/api/membre/register"), {
    method: "POST",
    body: payload,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = (await res.json()) as { token?: string; accessToken?: string; jwt?: string };
  const token = data.token ?? data.accessToken ?? data.jwt;
  if (token) localStorage.setItem("token", token);
  return data;
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(buildUrl("/api/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json();
}


export async function test() {
  const res = await fetch(buildUrl("/api/adherent/test"), {
  });
  console.log(res, " : voici la réponse");
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json();
}
