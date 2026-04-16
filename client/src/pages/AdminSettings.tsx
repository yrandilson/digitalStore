import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const SETTINGS_KEY = "digital-store-admin-settings";

type AdminSettingsState = {
  storeName: string;
  storeBio: string;
  supportEmail: string;
  stripePublicKey: string;
  firebaseProjectId: string;
};

const defaultSettings: AdminSettingsState = {
  storeName: "Digital Store",
  storeBio: "Produtos digitais premium com entrega imediata.",
  supportEmail: "suporte@digitalstore.com",
  stripePublicKey: "",
  firebaseProjectId: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const notifyOwnerMutation = trpc.system.notifyOwner.useMutation({
    onSuccess: () => {
      toast.success("Teste de integração enviado ao proprietário");
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível enviar o teste");
    },
  });

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AdminSettingsState;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      // Ignore malformed local storage and keep defaults.
    }
  }, []);

  const updateField = (field: keyof AdminSettingsState, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Configurações salvas localmente");
  };

  const handleTestIntegration = () => {
    notifyOwnerMutation.mutate({
      title: "Teste de integrações da loja",
      content: `Loja: ${settings.storeName}\nStripe: ${settings.stripePublicKey || "não configurado"}\nFirebase: ${settings.firebaseProjectId || "não configurado"}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identidade da loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nome da loja</Label>
              <Input
                id="store-name"
                value={settings.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-bio">Descrição</Label>
              <Textarea
                id="store-bio"
                value={settings.storeBio}
                onChange={(e) => updateField("storeBio", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Email de suporte</Label>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateField("supportEmail", e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>Salvar alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe">Stripe (chave pública)</Label>
              <Input
                id="stripe"
                placeholder="pk_live_..."
                value={settings.stripePublicKey}
                onChange={(e) => updateField("stripePublicKey", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firebase">Firebase</Label>
              <Input
                id="firebase"
                placeholder="meu-project-id"
                value={settings.firebaseProjectId}
                onChange={(e) => updateField("firebaseProjectId", e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleSave}>Salvar integrações</Button>
              <Button
                variant="secondary"
                onClick={handleTestIntegration}
                disabled={notifyOwnerMutation.isPending}
              >
                {notifyOwnerMutation.isPending ? "Enviando teste..." : "Testar integrações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
