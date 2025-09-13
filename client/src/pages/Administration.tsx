import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { UserCog, Plus, Search, Edit, Trash2, Shield, User, Key } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AVAILABLE_PERMISSIONS = [
  { id: "clients", label: "Gerenciar Clientes", description: "Criar, editar e remover clientes" },
  { id: "pets", label: "Gerenciar Pets", description: "Cadastrar e editar pets" },
  { id: "guides", label: "Gerenciar Guias", description: "Criar e gerenciar guias de atendimento" },
  { id: "plans", label: "Gerenciar Planos", description: "Configurar planos de saúde" },
  { id: "network", label: "Gerenciar Rede", description: "Administrar rede credenciada" },
  { id: "faq", label: "Gerenciar FAQ", description: "Editar perguntas frequentes" },
  { id: "submissions", label: "Ver Formulários", description: "Visualizar formulários de contato" },
  { id: "settings", label: "Configurações", description: "Alterar configurações do sistema" },
  { id: "administration", label: "Administração", description: "Gerenciar outros usuários" },
];

export default function Administration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema.extend({
      permissions: insertUserSchema.shape.permissions.optional(),
    })),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      permissions: [],
      isActive: true,
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

  const filteredUsers = users?.filter((user: any) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({
      username: user.username || "",
      email: user.email || "",
      password: "", // Don't prefill password for editing
      role: user.role || "user",
      permissions: user.permissions || [],
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "user": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "manager": return "Gerente";
      case "user": return "Usuário";
      default: return role;
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = form.getValues("permissions") || [];
    if (checked) {
      form.setValue("permissions", [...currentPermissions, permission]);
    } else {
      form.setValue("permissions", currentPermissions.filter(p => p !== permission));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <UserCog className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administração</h1>
            <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="button-new-user">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
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
                  <FormLabel>Permissões</FormLabel>
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
                    variant="outline"
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
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredUsers?.length ? (
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Criado em:</span> {user.createdAt && format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                        <p><span className="font-medium">Permissões:</span> {user.permissions?.length || 0}</p>
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
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
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <p className="text-2xl font-bold text-green-600">
                {filteredUsers.filter((u: any) => u.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredUsers.filter((u: any) => u.role === "admin").length}
              </p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter((u: any) => u.role === "manager").length}
              </p>
              <p className="text-sm text-muted-foreground">Gerentes</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
