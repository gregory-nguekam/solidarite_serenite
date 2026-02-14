import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { Role } from "../auth/roles";
import { assignMembre, fetchAdminUserDetails, fetchAdminUsers, fetchMembres, setActive, updateRole, validateUser, type AdminUser, type MemberOption } from "../api/admin";
import UserDetailsDrawer from "../ui/UserDetailsDrawer";

const ROLE_OPTIONS: Role[] = ["VISITOR", "ADHERENT", "ADMIN_MEMBRE", "SUPER_ADMIN"];

type ValidationState = "validated" | "pending" | "unknown";

const getValidationState = (user: AdminUser): ValidationState => {
  if (user.isValidated === true) {
    return "validated";
  }
  if (user.isValidated === false) {
    return "pending";
  }
  return "unknown";
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

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [associationFilter, setAssociationFilter] = useState("ALL");

  const membersById = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setMembersError(null);
      const [usersResult, membersResult] = await Promise.allSettled([fetchAdminUsers(), fetchMembres()]);
      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        setError(usersResult.reason instanceof Error ? usersResult.reason.message : "Impossible de charger les utilisateurs.");
      }
      if (membersResult.status === "fulfilled") {
        setMembers(membersResult.value);
      } else {
        setMembersError(
          membersResult.reason instanceof Error ? membersResult.reason.message : "Impossible de charger les membres."
        );
      }
      setLoading(false);
    };

    void load();
  }, []);

  const setPending = (id: string, next: boolean) => {
    setPendingIds((prev) => ({ ...prev, [id]: next }));
  };

  const applyUpdate = async (id: string, patch: Partial<AdminUser>, action: () => Promise<AdminUser | void>) => {
    const snapshot = users;
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...patch } : user)));
    setPending(id, true);
    setError(null);
    try {
      const updated = await action();
      if (updated) {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updated } : user)));
      }
    } catch (err) {
      setUsers(snapshot);
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setPending(id, false);
    }
  };

  const handleToggleActive = (user: AdminUser) => {
    const nextValue = !(user.isActive ?? true);
    void applyUpdate(user.id, { isActive: nextValue }, () => setActive(user.id, nextValue));
  };

  const handleRoleChange = (user: AdminUser, nextRole: Role | string) => {
    void applyUpdate(user.id, { role: nextRole }, () => updateRole(user.id, nextRole));
  };

  const handleValidate = (user: AdminUser) => {
    void applyUpdate(user.id, { isValidated: true }, () => validateUser(user.id, true));
  };

  const handleAssignMember = (user: AdminUser, memberId: string) => {
    const selectedMember = memberId ? membersById.get(memberId) : undefined;
    const nextMembres = selectedMember ? [selectedMember] : [];
    void applyUpdate(user.id, { membres: nextMembres }, () =>
      assignMembre(user.id, memberId || null, true)
    );
  };

  const handleShowDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    setDetailsError(null);
    fetchAdminUserDetails(user.id)
      .then((details) => {
        setSelectedUser(details);
        setUsers((prev) => prev.map((item) => (item.id === details.id ? { ...item, ...details } : item)));
      })
      .catch((err) => {
        setDetailsError(err instanceof Error ? err.message : "Impossible de charger le détail utilisateur.");
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  };

  const handleUserUpdated = (updated: AdminUser) => {
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    setSelectedUser(updated);
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const normalizedRole = user.role ?? "ADHERENT";
      if (roleFilter !== "ALL" && normalizedRole !== roleFilter) {
        return false;
      }

      const memberId = user.membres?.[0]?.id ?? "";
      if (associationFilter === "NONE" && memberId) {
        return false;
      }
      if (associationFilter !== "ALL" && associationFilter !== "NONE" && memberId !== associationFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchValues = [
        getDisplayName(user),
        user.email ?? "",
        user.telephone ?? "",
        String(normalizedRole),
        ...(user.membres ?? []).map(getMemberLabel),
      ];

      return searchValues.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [associationFilter, roleFilter, searchQuery, users]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Gestion des utilisateurs
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Validez les inscriptions, gerez les roles et attribuez un membre aux adherents.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {membersError && <Alert severity="warning">{membersError}</Alert>}

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mb: 2,
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
              alignItems: "center",
            }}
          >
            <TextField
              label="Rechercher un utilisateur"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nom, email, telephone, role..."
              size="small"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="role-filter">Role</InputLabel>
              <Select
                labelId="role-filter"
                label="Role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <MenuItem value="ALL">Tous les roles</MenuItem>
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="association-filter">Association</InputLabel>
              <Select
                labelId="association-filter"
                label="Association"
                value={associationFilter}
                onChange={(event) => setAssociationFilter(event.target.value)}
              >
                <MenuItem value="ALL">Toutes les associations</MenuItem>
                <MenuItem value="NONE">Sans association</MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {getMemberLabel(member)} {member.type ? `(${member.type})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom complet</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telephone</TableCell>
                  <TableCell>Role</TableCell>
                  {/* <TableCell>Actif</TableCell> */}
                  <TableCell>Validation</TableCell>
                  {/* <TableCell>Membres</TableCell> */}
                  <TableCell>Membre attribue</TableCell>
                  <TableCell>Fiche</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => {
                  const validationState = getValidationState(user);
                  const isUpdating = Boolean(pendingIds[user.id]);
                  const currentMemberId = user.membres?.[0]?.id ?? "";
                  const memberOptions = members;
                  const roleValue = user.role ?? "ADHERENT";
                  const hasRoleOption = ROLE_OPTIONS.includes(roleValue as Role);
                  const userMembers = user.membres ?? [];

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{getDisplayName(user)}</TableCell>
                      <TableCell>{user.email ?? "-"}</TableCell>
                      <TableCell>{user.telephone ?? "-"}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth disabled={isUpdating}>
                          <InputLabel id={`role-${user.id}`}>Role</InputLabel>
                          <Select
                            labelId={`role-${user.id}`}
                            label="Role"
                            value={roleValue}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                          >
                            {!hasRoleOption && (
                              <MenuItem value={roleValue}>{String(roleValue)}</MenuItem>
                            )}
                            {ROLE_OPTIONS.map((role) => (
                              <MenuItem key={role} value={role}>
                                {role}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      {/* <TableCell>
                        <Switch
                          checked={user.isActive ?? true}
                          onChange={() => handleToggleActive(user)}
                          disabled={isUpdating}
                        />
                      </TableCell> */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {validationState === "validated" && <Chip label="Valide" color="success" size="small" />}
                          {validationState === "pending" && <Chip label="En attente" color="warning" size="small" />}
                          {validationState === "unknown" && <Chip label="Inconnu" size="small" />}
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={validationState !== "pending" || isUpdating}
                            onClick={() => handleValidate(user)}
                          >
                            Valider
                          </Button>
                        </Box>
                      </TableCell>
                      {/* <TableCell>
                        {userMembers.length ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {userMembers.map((member, index) => (
                              <Chip
                                key={member.id ?? `${member.nom ?? member.name ?? "membre"}-${index}`}
                                label={getMemberLabel(member)}
                                size="small"
                              />
                            ))}
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell> */}
                      <TableCell>
                        <FormControl size="small" fullWidth disabled={isUpdating || members.length === 0}>
                          <InputLabel id={`member-${user.id}`}>Membre</InputLabel>
                          <Select
                            labelId={`member-${user.id}`}
                            label="Membre"
                            value={currentMemberId}
                            onChange={(event) => handleAssignMember(user, event.target.value)}
                          >
                            <MenuItem value="">Aucun</MenuItem>
                            {currentMemberId && !membersById.has(currentMemberId) && user.membres?.[0] && (
                              <MenuItem value={currentMemberId}>{getMemberLabel(user.membres[0])}</MenuItem>
                            )}
                            {memberOptions.map((member) => (
                              <MenuItem key={member.id} value={member.id}>
                                {getMemberLabel(member)} {member.type ? `(${member.type})` : ""}
                              </MenuItem>
                            ))}
                          </Select>
                          {membersError && <FormHelperText>{membersError}</FormHelperText>}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => handleShowDetails(user)}>
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <UserDetailsDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={handleUserUpdated}
        loading={detailsLoading}
        error={detailsError}
      />
    </Box>
  );
}



