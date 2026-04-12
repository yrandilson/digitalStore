import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package2, Settings2, ShoppingBag, UserCircle2 } from "lucide-react";

const profileStats = [
  { label: "Pedidos", value: "12" },
  { label: "Downloads", value: "24" },
  { label: "Favoritos", value: "8" },
];

export default function Profile() {
  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">YD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Yrandilson</h1>
                <p className="text-sm text-muted-foreground">yrandilson@email.com</p>
              </div>
              <Badge>Cliente Premium</Badge>
              <Button variant="outline" className="w-full">
                <Settings2 className="mr-2 h-4 w-4" />
                Editar perfil
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {profileStats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Atalhos da conta</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Meus pedidos
                </Button>
                <Button variant="outline" className="justify-start">
                  <Package2 className="mr-2 h-4 w-4" />
                  Meus downloads
                </Button>
                <Button variant="outline" className="justify-start">
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Dados pessoais
                </Button>
                <Button variant="outline" className="justify-start">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Preferências
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
