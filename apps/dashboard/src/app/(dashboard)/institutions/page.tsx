"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { api, type Institution } from "@/lib/api";
import { isValidFrenchPhone } from "@/lib/phone";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [openingHours, setOpeningHours] = useState("");

  useEffect(() => {
    api
      .listInstitutions()
      .then(setInstitutions)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName("");
    setAddress("");
    setCoords(null);
    setPhone("");
    setPhoneError(null);
    setOpeningHours("");
  }

  async function addInstitution() {
    if (!name.trim() || !address.trim()) return;

    // Téléphone optionnel pour un établissement, mais s'il est renseigné
    // il doit être un numéro français valide.
    if (phone.trim() && !isValidFrenchPhone(phone)) {
      setPhoneError("Numéro invalide (ex. 01 23 45 67 89)");
      return;
    }
    setPhoneError(null);

    setSubmitting(true);
    try {
      const created = await api.createInstitution({
        name,
        address,
        phone: phone || null,
        opening_hours: openingHours || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      });
      setInstitutions((prev) => [...prev, created]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteInstitution(id);
      setInstitutions((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Chargement..." : `${institutions.length} établissements`}
        </p>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          Ajouter un établissement
        </Button>
      </div>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      {showForm && (
        <Card className="max-w-xl">
          <div className="flex flex-col gap-3">
            <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
            <AddressAutocomplete
              value={address}
              onChange={(addr, c) => {
                setAddress(addr);
                if (c) setCoords(c);
              }}
              placeholder="Adresse"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Téléphone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                />
                {phoneError && <span className="mt-1 block text-xs text-danger">{phoneError}</span>}
              </div>
              <Input
                placeholder="Horaires"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={addInstitution} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {institutions.map((inst) => (
          <Card key={inst.id}>
            <div className="mb-2 flex items-start justify-between">
              <Link
                href={`/institutions/${inst.id}/edit`}
                className="focus-ring font-display text-base font-semibold hover:text-primary"
              >
                {inst.name}
              </Link>
              <ConfirmDeleteButton label={`Supprimer ${inst.name}`} onConfirm={() => handleDelete(inst.id)} />
            </div>
            <div className="flex items-start gap-2 text-sm text-muted">
              <MapPin size={14} className="mt-0.5" />
              {inst.address}
            </div>
            {inst.phone && (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Phone size={14} />
                {inst.phone}
              </div>
            )}
            {inst.opening_hours && (
              <p className="mt-2 text-xs text-muted">Horaires : {inst.opening_hours}</p>
            )}
            <Link
              href={`/institutions/${inst.id}/edit`}
              className="focus-ring mt-3 inline-block text-xs font-medium text-primary"
            >
              Modifier →
            </Link>
          </Card>
        ))}
        {!loading && institutions.length === 0 && (
          <p className="text-sm text-muted">Aucun établissement pour le moment.</p>
        )}
      </div>
    </div>
  );
}
