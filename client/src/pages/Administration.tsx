import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { UserCog, Plus, Search, Edit, Trash2, Shield, User, Key, Network, Lock, Eye, EyeOff, Globe, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AVAILABLE_PERMISSIONS = [
  { id: "clients", label: "Clientes", description: "Acesso à seção de clientes" },
  { id: "pets", label: "Pets", description: "Acesso à seção de pets" },
  { id: "guides", label: "Guias", description: "Acesso à seção de guias de atendimento" },
  { id: "plans", label: "Planos", description: "Acesso à seção de planos de saúde" },
  { id: "network", label: "Rede", description: "Acesso à seção de rede credenciada" },
  { id: "faq", label: "FAQ", description: "Acesso à seção de perguntas frequentes" },
  { id: "submissions", label: "Formulários", description: "Acesso à seção de formulários de contato" },
  { id: "settings", label: "Configurações", description: "Acesso à seção de configurações do sistema" },
  { id: "administration", label: "Administração", description: "Acesso à seção de administração de usuários" },
];

export default function Administration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [editingNetworkUnit, setEditingNetworkUnit] = useState<any>(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [editingUrlUnit, setEditingUrlUnit] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: networkUnits = [], isLoading: isLoadingNetworkUnits } = useQuery<any[]>({
    queryKey: ["/api/network-units/credentials"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema.extend({
      permissions: insertUserSchema.shape.permissions.optional(),
    })),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "view",
      permissions: [] as string[],
      isActive: true,
    },
  });

  const credentialForm = useForm({
    resolver: zodResolver(
      z.object({
        login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Senhas não coincidem",
        path: ["confirmPassword"],
      })
    ),
    defaultValues: {
      login: "",
      password: "",
      confirmPassword: "",
    },
  });

  const urlForm = useForm({
    resolver: zodResolver(
      z.object({
        urlSlug: z.string()
          .min(3, "URL deve ter pelo menos 3 caracteres")
          .max(100, "URL não pode ter mais de 100 caracteres")
      })
    ),
    defaultValues: {
      urlSlug: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingUser) {
        await apiRequest("PUT", `/api/users/${editingUser.id}`, data);
      } else {
        await apiRequest("POST", "/api/users", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: editingUser ? "Usuário atualizado" : "Usuário criado",
        description: editingUser ? "Usuário foi atualizado com sucesso." : "Usuário foi criado com sucesso.",
      });
      setDialogOpen(false);
      setEditingUser(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: editingUser ? "Falha ao atualizar usuário." : "Falha ao criar usuário.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover usuário.",
        variant: "destructive",
      });
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: { id: string; login: string; password: string }) => {
      await apiRequest("PUT", `/api/network-units/${data.id}/credentials`, {
        login: data.login,
        password: data.password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units/credentials"] });
      toast({
        title: "Credenciais atualizadas",
        description: "Credenciais da unidade foram atualizadas com sucesso.",
      });
      setCredentialDialogOpen(false);
      setEditingNetworkUnit(null);
      credentialForm.reset();
      setShowPassword(false);
      setShowPasswordConfirm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar credenciais.",
        variant: "destructive",
      });
    },
  });

  const toggleUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Status atualizado",
        description: "Status do usuário foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do usuário.",
        variant: "destructive",
      });
    },
  });

  const regenerateSlugMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const response = await apiRequest("PUT", `/api/network-units/${unitId}/regenerate-slug`);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units/credentials"] });
      toast({
        title: "URL regenerada",
        description: `Nova URL: ${data.newSlug}`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao regenerar URL da unidade.",
        variant: "destructive",
      });
    },
  });

  const updateUrlMutation = useMutation({
    mutationFn: async (data: { id: string; urlSlug: string }) => {
      await apiRequest("PUT", `/api/network-units/${data.id}`, {
        urlSlug: data.urlSlug,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-units/credentials"] });
      toast({
        title: "URL atualizada",
        description: "URL da unidade foi atualizada com sucesso.",
      });
      setUrlDialogOpen(false);
      setEditingUrlUnit(null);
      urlForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar URL da unidade.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: any) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({
      username: user.username || "",
      email: user.email || "",
      password: "", // Don't prefill password for editing
      role: user.role || "view",
      permissions: (user.permissions || []) as string[],
      isActive: user.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleUserMutation.mutate({ id, isActive: !currentStatus });
  };

  const onSubmit = (data: any) => {
    // Remove password field if empty (for editing)
    if (editingUser && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      createMutation.mutate(dataWithoutPassword);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditCredentials = (networkUnit: any) => {
    setEditingNetworkUnit(networkUnit);
    credentialForm.reset({
      login: networkUnit.login || "",
      password: "",
      confirmPassword: "",
    });
    setCredentialDialogOpen(true);
  };

  const handleEditUrl = (networkUnit: any) => {
    setEditingUrlUnit(networkUnit);
    urlForm.reset({
      urlSlug: networkUnit.urlSlug || "",
    });
    setUrlDialogOpen(true);
  };

  const onCredentialSubmit = (data: any) => {
    if (editingNetworkUnit) {
      updateCredentialsMutation.mutate({
        id: editingNetworkUnit.id,
        login: data.login,
        password: data.password,
      });
    }
  };

  const onUrlSubmit = (data: any) => {
    if (editingUrlUnit) {
      updateUrlMutation.mutate({
        id: editingUrlUnit.id,
        urlSlug: data.urlSlug,
      });
    }
  };

  const getCredentialStatus = (unit: any) => {
    if (unit.hasCredentials) {
      return { text: "Configurado", color: "bg-chart-2/20 text-chart-2" };
    }
    return { text: "Não configurado", color: "bg-chart-5/20 text-chart-5" };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "delete": return "bg-chart-5/20 text-chart-5";
      case "edit": return "bg-chart-1/20 text-chart-1";
      case "add": return "bg-chart-2/20 text-chart-2";
      case "view": return "bg-chart-4/20 text-chart-4";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "delete": return "Excluir";
      case "edit": return "Editar";
      case "add": return "Adicionar";
      case "view": return "Visualizar";
      default: return role;
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = (form.getValues("permissions") || []) as string[];
    if (checked) {
      form.setValue("permissions", [...currentPermissions, permission]);
    } else {
      form.setValue("permissions", currentPermissions.filter(p => p !== permission));
    }
  };

  // URL Management helper functions
  const getDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback to environment or localhost
    return 'https://2872e078-80d4-4c88-990e-9aee3a3a947c-00-1t5v7l4nfgg9j.kirk.replit.dev';
  };

  const getFullUrl = (slug: string) => {
    return `${getDomain()}/${slug}`;
  };

  const handleCopyUrl = async (slug: string) => {
    if (!slug) {
      toast({
        title: "Erro",
        description: "URL slug não definido para esta unidade.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fullUrl = getFullUrl(slug);
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL copiada!",
        description: `${fullUrl} foi copiada para o clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar URL para o clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateUrl = (unit: any) => {
    if (confirm(`Tem certeza que deseja regenerar a URL para "${unit.name}"? Isso pode quebrar links existentes.`)) {
      regenerateSlugMutation.mutate(unit.id);
    }
  };

  const getUrlStatus = (unit: any) => {
    if (!unit.urlSlug) {
      return { text: "Não configurado", color: "bg-chart-5/20 text-chart-5" };
    }
    if (unit.isActive) {
      return { text: "Ativo", color: "bg-chart-2/20 text-chart-2" };
    }
    return { text: "Inativo", color: "bg-chart-4/20 text-chart-4" };
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Administração</h1>
          <p className="text-sm text-muted-foreground">Gerencie usuários e permissões do sistema</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingUser(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary w-full xs:w-auto" data-testid="button-new-user">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Dialog Content */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingUser(null);
          form.reset();
        }
      }}>
        <DialogContent className="overflow-y-auto" maxHeightMobile="max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <InputMasked 
                              {...field} 
                              type="email" 
                              mask="email"
                              data-testid="input-user-email" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Senha {editingUser ? "(deixe vazio para manter atual)" : "*"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-user-role">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              { value: "view", label: "Visualizar" },
                              { value: "add", label: "Adicionar" },
                              { value: "edit", label: "Editar" },
                              { value: "delete", label: "Excluir" }
                            ].flatMap((role, index, array) => [
                              <SelectItem key={role.value} value={role.value} className="py-3 pl-10 pr-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                                {role.label}
                              </SelectItem>,
                              ...(index < array.length - 1 ? [<Separator key={`separator-${role.value}`} />] : [])
                            ])}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Usuário Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Usuários ativos podem acessar o sistema
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-user-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Permissions */}
                <div className="space-y-3">
                  <FormLabel>Locais de Acesso</FormLabel>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={(form.getValues("permissions") || []).includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                          data-testid={`checkbox-permission-${permission.id}`}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {permission.label}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={createMutation.isPending}
                    data-testid="button-save"
                  >
                    {createMutation.isPending ? "Salvando..." : editingUser ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: 'var(--input-foreground)'}} />
            <Input
              placeholder="Buscar usuários por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Usuários ({filteredUsers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredUsers?.length ? (
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground" data-testid={`user-name-${user.id}`}>
                          {user.username}
                        </h3>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Criado em:</span> {user.createdAt && format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                        <p><span className="font-medium">Locais:</span> {user.permissions?.length || 0}</p>
                      </div>

                      {user.permissions && user.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {user.permissions.slice(0, 3).map((permission: string) => {
                            const permissionData = AVAILABLE_PERMISSIONS.find(p => p.id === permission);
                            return permissionData ? (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permissionData.label}
                              </Badge>
                            ) : null;
                          })}
                          {user.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleStatus(user.id, user.isActive)}
                          disabled={toggleUserMutation.isPending}
                          data-testid={`switch-user-status-${user.id}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhum usuário encontrado para a busca." 
                  : "Nenhum usuário cadastrado ainda."
                }
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-add-first-user"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Usuário
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Separator between sections */}
      <Separator className="my-8" />

      {/* Network Credentials Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Rede Credenciada</h2>
            <p className="text-sm text-muted-foreground">Gerencie credenciais de acesso das unidades da rede</p>
          </div>
        </div>

        {/* Network Units List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Unidades da Rede ({networkUnits?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingNetworkUnits ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : networkUnits?.length ? (
              <div className="space-y-4">
                {networkUnits.map((unit: any) => {
                  const status = getCredentialStatus(unit);
                  return (
                    <div key={unit.id} className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Network className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              {unit.name}
                            </h3>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <p><span className="font-medium">URL Slug:</span> /{unit.urlSlug || "não-definido"}</p>
                            <p><span className="font-medium">Login:</span> {unit.login || "Não configurado"}</p>
                            
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCredentials(unit)}
                                className="flex items-center space-x-2"
                              >
                                <Key className="h-4 w-4" />
                                <span>Editar Credenciais</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUrl(unit)}
                                className="flex items-center space-x-2"
                              >
                                <Globe className="h-4 w-4" />
                                <span>Editar URL</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma unidade da rede cadastrada ainda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credential Dialog */}
        <Dialog open={credentialDialogOpen} onOpenChange={(open) => {
          setCredentialDialogOpen(open);
          if (!open) {
            setEditingNetworkUnit(null);
            credentialForm.reset();
            setShowPassword(false);
            setShowPasswordConfirm(false);
          }
        }}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingNetworkUnit?.login ? "Editar" : "Definir"} Credenciais
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {editingNetworkUnit?.name}
              </p>
            </DialogHeader>
            <Form {...credentialForm}>
              <form onSubmit={credentialForm.handleSubmit(onCredentialSubmit)} className="space-y-4">
                <FormField
                  control={credentialForm.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPasswordConfirm ? "text" : "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCredentialDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={updateCredentialsMutation.isPending}
                  >
                    {updateCredentialsMutation.isPending ? "Salvando..." : "Salvar Credenciais"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* URL Dialog */}
      <Dialog open={urlDialogOpen} onOpenChange={(open) => {
        setUrlDialogOpen(open);
        if (!open) {
          setEditingUrlUnit(null);
          urlForm.reset();
        }
      }}>
        <DialogContent className="overflow-y-auto" maxHeightMobile="max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Editar URL da Unidade
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editingUrlUnit ? `Editando URL para: ${editingUrlUnit.name}` : ''}
            </p>
          </DialogHeader>
          <Form {...urlForm}>
            <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
              <FormField
                control={urlForm.control}
                name="urlSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Personalizada *</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <InputMasked 
                          {...field} 
                          mask="url-slug"
                          placeholder="minha-clinica-veterinaria"
                          className="font-mono"
                        />
                        <div className="text-xs text-muted-foreground">
                          <p><strong>URL final:</strong> {field.value ? getFullUrl(field.value) : getDomain() + '/sua-url-aqui'}</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUrlDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={updateUrlMutation.isPending}
                >
                  {updateUrlMutation.isPending ? "Salvando..." : "Salvar URL"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Separator before statistics */}
      <Separator className="my-8" />

      {/* Statistics */}
      {filteredUsers && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{filteredUsers.length}</p>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-4">
                {filteredUsers.filter((u: any) => u.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-5">
                {filteredUsers.filter((u: any) => u.role === "delete").length}
              </p>
              <p className="text-sm text-muted-foreground">Excluir</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-1">
                {filteredUsers.filter((u: any) => u.role === "edit").length}
              </p>
              <p className="text-sm text-muted-foreground">Editar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-2">
                {filteredUsers.filter((u: any) => u.role === "add").length}
              </p>
              <p className="text-sm text-muted-foreground">Adicionar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-chart-4">
                {filteredUsers.filter((u: any) => u.role === "view").length}
              </p>
              <p className="text-sm text-muted-foreground">Visualizar</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
