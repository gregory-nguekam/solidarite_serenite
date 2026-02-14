import type { Role } from "../auth/roles";

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

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type AdminUser = {
  id: string;
  email?: string;
  nom?: string;
  prenom?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  telephone?: string;
  role?: Role | string;
  isActive?: boolean;
  isValidated?: boolean;
  membres?: MemberOption[];
  documents?: AdminDocument[];
  adresse?: AdminAddress;
};

export type MemberOption = {
  id: string;
  nom?: string;
  name?: string;
  initiales?: string;
  email?: string;
  type?: string;
};

export type AdminDocument = {
  id: string;
  nom?: string;
  name?: string;
  type?: string;
  size?: number;
  fichierBase64?: string;
};

export type DocumentType = "IDENTITE" | "JUSTIFICATIF_DOMICILE" | "RIB" | string;

export type AdminAddress = {
  numeroRue?: string;
  numero_rue?: string;
  rue?: string;
  codePostal?: string;
  code_postal?: string;
  ville?: string;
  complement?: string;
  complement_adresse?: string;
};

export type UpdateAdherentRequest = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: {
    numeroRue?: string;
    rue?: string;
    codePostal?: string;
    ville?: string;
    complement?: string;
  };
};

const unwrapList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const record = payload as { items?: T[]; data?: T[]; results?: T[] };
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.results)) return record.results;
  }
  return [];
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(buildUrl("/api/admin/users"), {
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = (await res.json()) as unknown;
  console.log("fetchAdminUsers raw response:", data);
  return unwrapList<AdminUser>(data);
}

export async function fetchAdminUserDetails(id: string): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}`), {
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function validateUser(id: string, validated: boolean): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}/validate`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ validated }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function updateAdminUser(id: string, payload: UpdateAdherentRequest): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function setActive(id: string, active: boolean): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}/active`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function updateRole(id: string, role: Role | string): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}/role`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function assignMembre(
  id: string,
  membreId: string | null,
  replace = true
): Promise<AdminUser> {
  const res = await fetch(buildUrl(`/api/admin/users/${id}/assign-membre`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
    body: JSON.stringify({ membreId, replace }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminUser;
}

export async function fetchMembres(): Promise<MemberOption[]> {
  const res = await fetch(buildUrl("/api/membres"), {
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const data = (await res.json()) as unknown;
  return unwrapList<MemberOption>(data);
}

export async function upsertUserDocument(id: string, type: DocumentType, file: File): Promise<AdminDocument> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(buildUrl(`/api/admin/users/${id}/documents/${type}`), {
    method: "PATCH",
    headers: { Accept: "application/json", ...authHeaders() },
    body,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as AdminDocument;
}
