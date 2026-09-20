"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type CurrentUser } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api.me().then((u) => {
      setUser(u);
      setFullName(u.full_name);
      setEmail(u.email);
    });
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await api.updateProfile({ full_name: fullName, email });
      setUser(updated);
      setProfileMessage({ type: "success", text: "Profil mis à jour." });
    } catch (err) {
      setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le nouveau mot de passe doit faire au moins 8 caractères." });
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Mot de passe modifié." });
    } catch (err) {
      setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem("tpmr_access_token");
    router.push("/login");
  }

  if (!user) return <p className="text-sm text-muted">Chargement...</p>;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {user.full_name[0]}
          </div>
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <p className="text-xs text-muted capitalize">{user.role}</p>
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium">Nom complet</span>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        {profileMessage && (
          <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${profileMessage.type === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
            {profileMessage.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold">Changer le mot de passe</h2>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium">Mot de passe actuel</span>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium">Nouveau mot de passe</span>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium">Confirmer le nouveau mot de passe</span>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>

        {passwordMessage && (
          <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${passwordMessage.type === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
            {passwordMessage.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
          >
            {savingPassword ? "Modification..." : "Changer le mot de passe"}
          </Button>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button variant="danger" onClick={handleLogout}>
          <LogOut size={16} />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
