import { Alert, Box, Button, Chip, CircularProgress, Divider, Drawer, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  updateAdminUser,
  upsertUserDocument,
  type AdminAddress,
  type AdminDocument,
  type AdminUser,
  type DocumentType,
  type MemberOption,
  type UpdateAdherentRequest,
} from "../api/admin";

type UserDetailsDrawerProps = {
  user: AdminUser | null;
  onClose: () => void;
  onUserUpdated?: (user: AdminUser) => void;
  loading?: boolean;
  error?: string | null;
};

const getDisplayName = (user: AdminUser) => {
  const prenom = user.prenom ?? user.firstName ?? "";
  const nom = user.nom ?? user.lastName ?? "";
  const full = [prenom, nom].filter(Boolean).join(" ").trim();
  return full || user.name || user.email || "Utilisateur";
};

const getMemberLabel = (member: MemberOption) => {
  const name = member.nom ?? member.name ?? "Membre";
  const initiales = member.initiales ? ` (${member.initiales})` : "";
  return `${name}${initiales}`;
};

const formatFileSize = (size?: number) => {
  if (typeof size !== "number") return "-";
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / 1024 / 1024).toFixed(1)} Mo`;
};

const buildAddressLine = (address?: AdminAddress) => {
  if (!address) return "-";
  const numero = address.numeroRue ?? address.numero_rue ?? "";
  const rue = address.rue ?? "";
  const line1 = [numero, rue].filter(Boolean).join(" ").trim();
  const codePostal = address.codePostal ?? address.code_postal ?? "";
  const ville = address.ville ?? "";
  const line2 = [codePostal, ville].filter(Boolean).join(" ").trim();
  const complement = address.complement ?? address.complement_adresse ?? "";
  const lines = [line1, line2, complement].filter(Boolean);
  return lines.length ? lines.join(", ") : "-";
};

const getDocumentName = (doc: AdminDocument) => {
  return doc.nom ?? doc.name ?? "Document";
};

const DOCUMENT_LABELS: Record<string, string> = {
  IDENTITE: "Pièce d'identité",
  JUSTIFICATIF_DOMICILE: "Justificatif de domicile",
  RIB: "RIB",
};

const KNOWN_DOCUMENT_TYPES = ["IDENTITE", "JUSTIFICATIF_DOMICILE", "RIB"] as const;
type KnownDocumentType = (typeof KNOWN_DOCUMENT_TYPES)[number];

const isKnownDocumentType = (value: string): value is KnownDocumentType => {
  return KNOWN_DOCUMENT_TYPES.includes(value as KnownDocumentType);
};

const getDocumentExtension = (doc: AdminDocument) => {
  const name = getDocumentName(doc);
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

const inferMimeType = (doc: AdminDocument) => {
  if (doc.type) return doc.type;
  const ext = getDocumentExtension(doc);
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
};

const isPreviewableImage = (doc: AdminDocument) => {
  const mime = inferMimeType(doc);
  return mime.startsWith("image/");
};

const isPreviewablePdf = (doc: AdminDocument) => {
  const mime = inferMimeType(doc);
  return mime === "application/pdf";
};

const extractDataUrl = (doc: AdminDocument) => {
  const raw = doc.fichierBase64?.trim();
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;
  return null;
};

const base64ToObjectUrl = (base64: string, mime: string) => {
  const sanitized = base64.replace(/\s+/g, "");
  const byteString = atob(sanitized);
  const buffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([buffer], { type: mime });
  return URL.createObjectURL(blob);
};

const resolveDocumentUrl = (doc: AdminDocument) => {
  if (!doc.fichierBase64) return null;
  const dataUrl = extractDataUrl(doc);
  if (dataUrl) return { url: dataUrl, revoke: false };
  const mime = inferMimeType(doc);
  return { url: base64ToObjectUrl(doc.fichierBase64, mime), revoke: true };
};

const getValidationLabel = (user: AdminUser) => {
  if (user.isValidated === true) return { label: "Valide", color: "success" as const };
  if (user.isValidated === false) return { label: "En attente", color: "warning" as const };
  return { label: "Inconnu", color: "default" as const };
};

type UserFormState = {
  nom: string;
  prenom: string;
  telephone: string;
  numeroRue: string;
  rue: string;
  codePostal: string;
  ville: string;
  complement: string;
};

type DocumentSlot = {
  type: DocumentType;
  label: string;
  doc?: AdminDocument;
};

const buildInitialForm = (user: AdminUser | null): UserFormState => {
  const address = user?.adresse;
  return {
    nom: user?.nom ?? user?.lastName ?? "",
    prenom: user?.prenom ?? user?.firstName ?? "",
    telephone: user?.telephone ?? "",
    numeroRue: address?.numeroRue ?? address?.numero_rue ?? "",
    rue: address?.rue ?? "",
    codePostal: address?.codePostal ?? address?.code_postal ?? "",
    ville: address?.ville ?? "",
    complement: address?.complement ?? address?.complement_adresse ?? "",
  };
};

const buildUpdatePayload = (form: UserFormState): UpdateAdherentRequest => {
  return {
    nom: form.nom.trim(),
    prenom: form.prenom.trim(),
    telephone: form.telephone.trim(),
    adresse: {
      numeroRue: form.numeroRue.trim(),
      rue: form.rue.trim(),
      codePostal: form.codePostal.trim(),
      ville: form.ville.trim(),
      complement: form.complement.trim(),
    },
  };
};

const mergeDocuments = (documents: AdminDocument[], updated: AdminDocument) => {
  const byIdIndex = updated.id ? documents.findIndex((doc) => doc.id === updated.id) : -1;
  if (byIdIndex >= 0) {
    const next = [...documents];
    next[byIdIndex] = { ...next[byIdIndex], ...updated };
    return next;
  }
  if (updated.type) {
    const byTypeIndex = documents.findIndex((doc) => doc.type === updated.type);
    if (byTypeIndex >= 0) {
      const next = [...documents];
      next[byTypeIndex] = { ...next[byTypeIndex], ...updated };
      return next;
    }
  }
  return [...documents, updated];
};

export default function UserDetailsDrawer({
  user,
  onClose,
  onUserUpdated,
  loading = false,
  error,
}: UserDetailsDrawerProps) {
  const open = Boolean(user);
  const addressLine = user ? buildAddressLine(user.adresse) : "-";
  const documents = user?.documents ?? [];
  const members = user?.membres ?? [];
  const validationChip = user ? getValidationLabel(user) : null;
  const isActive = user?.isActive ?? true;
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<UserFormState>(() => buildInitialForm(user));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const previewDoc = useMemo(() => {
    if (!previewDocId) return null;
    return documents.find((doc) => doc.id === previewDocId) ?? null;
  }, [documents, previewDocId]);

  const documentSlots = useMemo<DocumentSlot[]>(() => {
    if (!isEditing) {
      return documents.map((doc) => ({
        type: doc.type ?? doc.id,
        label: doc.type ? DOCUMENT_LABELS[doc.type] ?? doc.type : getDocumentName(doc),
        doc,
      }));
    }
    const slots: DocumentSlot[] = [];
    const docsByType = new Map<string, AdminDocument>();
    documents.forEach((doc) => {
      if (doc.type) docsByType.set(doc.type, doc);
    });
    KNOWN_DOCUMENT_TYPES.forEach((type) => {
      slots.push({ type, label: DOCUMENT_LABELS[type] ?? type, doc: docsByType.get(type) });
    });
    documents.forEach((doc) => {
      if (doc.type && !isKnownDocumentType(doc.type)) {
        slots.push({ type: doc.type, label: doc.type, doc });
      }
      if (!doc.type) {
        slots.push({ type: doc.id, label: getDocumentName(doc), doc });
      }
    });
    return slots;
  }, [documents, isEditing]);

  const previewAsset = useMemo(() => {
    if (!previewDoc?.fichierBase64) return null;
    return resolveDocumentUrl(previewDoc);
  }, [previewDoc]);

  useEffect(() => {
    return () => {
      if (previewAsset?.revoke) {
        URL.revokeObjectURL(previewAsset.url);
      }
    };
  }, [previewAsset]);

  useEffect(() => {
    if (!open) {
      setPreviewDocId(null);
    }
  }, [open]);

  useEffect(() => {
    setIsEditing(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user || isEditing) return;
    setFormState(buildInitialForm(user));
    setFormError(null);
    setSelectedFiles({});
    setPreviewDocId(null);
  }, [user, isEditing]);

  const handleDownload = (doc: AdminDocument) => {
    if (!doc.fichierBase64) return;
    const asset = resolveDocumentUrl(doc);
    if (!asset) return;
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = getDocumentName(doc);
    link.rel = "noopener";
    link.click();
    if (asset.revoke) {
      setTimeout(() => URL.revokeObjectURL(asset.url), 0);
    }
  };

  const handlePreview = (doc: AdminDocument) => {
    if (!doc.fichierBase64) return;
    setPreviewDocId(doc.id);
  };

  const handleCancelEdit = () => {
    setFormState(buildInitialForm(user));
    setIsEditing(false);
    setFormError(null);
    setSelectedFiles({});
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = buildUpdatePayload(formState);
      const updated = await updateAdminUser(user.id, payload);
      onUserUpdated?.(updated);
      setIsEditing(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (type: DocumentType, file?: File) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleUpload = async (type: DocumentType) => {
    if (!user) return;
    const file = selectedFiles[type];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    setFormError(null);
    try {
      const updatedDoc = await upsertUserDocument(user.id, type, file);
      const nextDocuments = mergeDocuments(documents, updatedDoc);
      onUserUpdated?.({ ...user, documents: nextDocuments });
      setSelectedFiles((prev) => ({ ...prev, [type]: null }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible de téléverser le document.");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420, md: 520 },
          p: { xs: 1.5, sm: 2 },
          display: "grid",
          gap: 1.25,
        },
      }}
    >
      {user && (
        <>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Fiche utilisateur
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {getDisplayName(user)} {user.email ? `• ${user.email}` : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {loading && <CircularProgress size={18} />}
              {!isEditing && (
                <Button variant="outlined" size="small" onClick={() => setIsEditing(true)} disabled={loading}>
                  Modifier
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="text" size="small" onClick={handleCancelEdit} disabled={isSaving}>
                    Annuler
                  </Button>
                  <Button variant="contained" size="small" onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </>
              )}
              <Button variant="outlined" size="small" onClick={onClose}>
                Fermer
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {formError && <Alert severity="error">{formError}</Alert>}

          <Divider />

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Statut
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip label={user.role ?? "Role inconnu"} color="primary" size="small" />
              <Chip label={isActive ? "Actif" : "Désactivé"} color={isActive ? "success" : "default"} size="small" />
              {validationChip && <Chip label={validationChip.label} color={validationChip.color} size="small" />}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Identité & coordonnées
            </Typography>
            {isEditing ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField
                    label="Nom"
                    size="small"
                    value={formState.nom}
                    onChange={(event) => setFormState((prev) => ({ ...prev, nom: event.target.value }))}
                  />
                  <TextField
                    label="Prénom"
                    size="small"
                    value={formState.prenom}
                    onChange={(event) => setFormState((prev) => ({ ...prev, prenom: event.target.value }))}
                  />
                  <TextField
                    label="Téléphone"
                    size="small"
                    value={formState.telephone}
                    onChange={(event) => setFormState((prev) => ({ ...prev, telephone: event.target.value }))}
                  />
                  <TextField label="Email" size="small" value={user.email ?? ""} InputProps={{ readOnly: true }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", opacity: 0.6 }}>
                  Adresse
                </Typography>
                <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField
                    label="Numéro"
                    size="small"
                    value={formState.numeroRue}
                    onChange={(event) => setFormState((prev) => ({ ...prev, numeroRue: event.target.value }))}
                  />
                  <TextField
                    label="Rue"
                    size="small"
                    value={formState.rue}
                    onChange={(event) => setFormState((prev) => ({ ...prev, rue: event.target.value }))}
                  />
                  <TextField
                    label="Code postal"
                    size="small"
                    value={formState.codePostal}
                    onChange={(event) => setFormState((prev) => ({ ...prev, codePostal: event.target.value }))}
                  />
                  <TextField
                    label="Ville"
                    size="small"
                    value={formState.ville}
                    onChange={(event) => setFormState((prev) => ({ ...prev, ville: event.target.value }))}
                  />
                  <TextField
                    label="Complément"
                    size="small"
                    sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
                    value={formState.complement}
                    onChange={(event) => setFormState((prev) => ({ ...prev, complement: event.target.value }))}
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 0.75 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Identifiant
                  </Typography>
                  <Typography variant="body2">{user.id}</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Nom
                  </Typography>
                  <Typography variant="body2">{user.nom ?? user.lastName ?? "-"}</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Prénom
                  </Typography>
                  <Typography variant="body2">{user.prenom ?? user.firstName ?? "-"}</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Téléphone
                  </Typography>
                  <Typography variant="body2">{user.telephone ?? "-"}</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" }, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Adresse
                  </Typography>
                  <Typography variant="body2">{addressLine}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Membres attribués
            </Typography>
            {members.length ? (
              <Box sx={{ display: "grid", gap: 0.75 }}>
                {members.map((member) => (
                  <Box key={member.id} sx={{ display: "grid", gap: 0.3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getMemberLabel(member)}
                    </Typography>
                    {member.email && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {member.email}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Aucun membre attribué.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Documents ({documents.length})
            </Typography>
            {documentSlots.length ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                {documentSlots.map((slot) => {
                  const doc = slot.doc;
                  const docTypeLabel = slot.label;
                  const uploadType = doc?.type ?? (isKnownDocumentType(String(slot.type)) ? String(slot.type) : null);
                  const pendingFile = uploadType ? selectedFiles[uploadType] : null;
                  const isUploading = uploadType ? Boolean(uploading[uploadType]) : false;

                  return (
                    <Box
                      key={doc?.id ?? `${slot.type}-${docTypeLabel}`}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1,
                        display: "grid",
                        gap: 0.6,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {doc ? getDocumentName(doc) : docTypeLabel}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Type: {doc?.type ?? docTypeLabel} • Taille: {formatFileSize(doc?.size)}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          label={doc?.fichierBase64 ? "Fichier fourni" : "Fichier manquant"}
                          color={doc?.fichierBase64 ? "success" : "default"}
                          size="small"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!doc?.fichierBase64}
                          onClick={() => doc && handlePreview(doc)}
                        >
                          Prévisualiser
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!doc?.fichierBase64}
                          onClick={() => doc && handleDownload(doc)}
                        >
                          Télécharger
                        </Button>
                        {isEditing && uploadType && (
                          <Button component="label" size="small" variant="outlined" disabled={isUploading}>
                            {doc?.fichierBase64 ? "Remplacer" : "Ajouter"}
                            <input
                              type="file"
                              hidden
                              accept="image/*,.pdf"
                              onChange={(event) => handleFileChange(uploadType, event.target.files?.[0])}
                            />
                          </Button>
                        )}
                        {isEditing && uploadType && pendingFile && (
                          <Button size="small" variant="contained" onClick={() => handleUpload(uploadType)} disabled={isUploading}>
                            {isUploading ? "Envoi..." : "Uploader"}
                          </Button>
                        )}
                      </Box>
                      {isEditing && uploadType && pendingFile && (
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Nouveau fichier: {pendingFile.name}
                        </Typography>
                      )}
                    </Box>
                  );
                })}

                {previewDoc && previewAsset && (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 1,
                      display: "grid",
                      gap: 0.75,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Aperçu • {getDocumentName(previewDoc)}
                      </Typography>
                      <Button size="small" variant="text" onClick={() => setPreviewDocId(null)}>
                        Fermer l'aperçu
                      </Button>
                    </Box>
                    {isPreviewableImage(previewDoc) && (
                      <Box
                        component="img"
                        src={previewAsset.url}
                        alt={getDocumentName(previewDoc)}
                        sx={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 1 }}
                      />
                    )}
                    {isPreviewablePdf(previewDoc) && (
                      <Box
                        component="iframe"
                        src={previewAsset.url}
                        title={getDocumentName(previewDoc)}
                        sx={{ width: "100%", height: 360, border: "none", borderRadius: 1 }}
                      />
                    )}
                    {!isPreviewableImage(previewDoc) && !isPreviewablePdf(previewDoc) && (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Aperçu non disponible pour ce type de fichier. Téléchargez le document pour le consulter.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {isEditing ? "Ajoutez des documents pour cet utilisateur." : "Aucun document transmis."}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}
