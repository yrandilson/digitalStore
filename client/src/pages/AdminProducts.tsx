import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productsQuery = trpc.products.list.useQuery({
    page: 1,
    limit: 100,
    sortBy: "newest",
  });

  const categoriesQuery = trpc.products.categories.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: async () => {
      await utils.products.list.invalidate();
      setName("");
      setDescription("");
      setLongDescription("");
      setPrice("");
      setImageUrl("");
      setPreviewUrl("");
      setFeatured(false);
      setActive(true);
      setErrorMessage(null);
      setIsFormOpen(false);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Falha ao cadastrar produto.");
    },
  });

  const categories = categoriesQuery.data ?? [];

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const products = productsQuery.data?.data ?? [];

  const handleCreateProduct = () => {
    if (!name.trim() || !description.trim() || !longDescription.trim() || !price.trim() || !categoryId) {
      setErrorMessage("Preencha os campos obrigatórios para cadastrar o produto.");
      return;
    }

    const numericPrice = price.replace(",", ".").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(numericPrice)) {
      setErrorMessage("Preço inválido. Use formato 99.90");
      return;
    }

    setErrorMessage(null);
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      longDescription: longDescription.trim(),
      price: numericPrice,
      categoryId,
      imageUrl: imageUrl.trim(),
      previewUrl: previewUrl.trim(),
      featured,
      active,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Produtos</CardTitle>
              <p className="text-sm text-muted-foreground">Gerencie catálogo, preços e status.</p>
            </div>
            <Button onClick={() => setIsFormOpen((prev) => !prev)}>
              {isFormOpen ? "Fechar" : "Novo produto"}
            </Button>
          </CardHeader>
          <CardContent>
            {productsQuery.isLoading ? <p>Carregando produtos...</p> : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{categoryMap.get(product.categoryId) ?? `#${product.categoryId}`}</TableCell>
                    <TableCell>
                      {Number(product.price).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.active ? "Ativo" : "Inativo"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isFormOpen ? (
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar novo produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Erro ao cadastrar</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pack UI Premium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (99.90) *</Label>
                  <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="149.90" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  value={categoryId ?? ""}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição curta *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Descrição longa *</Label>
                <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da imagem</Label>
                  <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewUrl">URL de preview</Label>
                  <Input id="previewUrl" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={featured} onCheckedChange={(value) => setFeatured(Boolean(value))} />
                  Produto em destaque
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={active} onCheckedChange={(value) => setActive(Boolean(value))} />
                  Produto ativo
                </label>
              </div>

              <Button onClick={handleCreateProduct} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar produto"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
