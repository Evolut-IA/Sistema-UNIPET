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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useColumnPreferences } from "@/hooks/use-column-preferences";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { UserCog, Plus, Search, Edit, Trash2, Shield, User, Key, Network, Lock, Eye, EyeOff, Columns3 as Columns, ChevronLeft, ChevronRight, Globe } from "lucide-react";
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

const allColumns = [
  "Nome",
  "Email",
  "Função",
  "Status",
  "Ações",
] as const;

const networkColumns = [
  "Nome",
  "Login",
  "URL",
  "Status",
  "Ações",
] as const;

export default function Administration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [editingNetworkUnit, setEditingNetworkUnit] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const { visibleColumns, toggleColumn } = useColumnPreferences('administration.users.columns', allColumns);
  const { visibleColumns: visibleNetworkColumns, toggleColumn: toggleNetworkColumn } = useColumnPreferences('administration.network.columns', networkColumns);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [networkCurrentPage, setNetworkCurrentPage] = useState(1);
  const userPageSize = 10;
  const networkPageSize = 10;
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



  const filteredUsers = users.filter((user: any) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User pagination logic
  const totalUsers = filteredUsers.length;
  const totalUserPages = Math.ceil(totalUsers / userPageSize);
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * userPageSize,
    userCurrentPage * userPageSize
  );

  // Network Units pagination logic  
  const totalNetworkUnits = networkUnits.length;
  const totalNetworkPages = Math.ceil(totalNetworkUnits / networkPageSize);
  const paginatedNetworkUnits = networkUnits.slice(
    (networkCurrentPage - 1) * networkPageSize,
    networkCurrentPage * networkPageSize
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

  const onCredentialSubmit = (data: any) => {
    if (editingNetworkUnit) {
      updateCredentialsMutation.mutate({
        id: editingNetworkUnit.id,
        login: data.login,
        password: data.password,
      });
    }
  };

  const getCredentialStatus = (unit: any) => {
    if (unit.hasCredentials) {
      return { text: "Configurado", color: "border border-border rounded-lg bg-background text-foreground" };
    }
    return { text: "Não configurado", color: "border border-border rounded-lg bg-background text-foreground" };
  };

  const getRoleColor = (role: string) => {
    return "border border-border rounded-lg bg-background text-foreground";
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



  return (
    <>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Administração</h1>
          <p className="text-sm text-muted-foreground">Gerencie usuários e permissões do sistema</p>
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
                              <SelectItem key={role.value} value={role.value} className="py-3 pl-10 pr-4 data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground">
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

      {/* Search and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários por nome ou email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUserCurrentPage(1); // Reset to page 1 when searching
              }}
              className="pl-10 w-64"
              data-testid="input-search-users"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingUser(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary" size="sm" data-testid="button-new-user">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                  className="data-[state=checked]:bg-transparent focus:bg-muted/50"
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Usuários
      </h2>

      {/* Modern Table Container */}
      <div className="container my-10 space-y-4 border border-border rounded-lg bg-accent shadow-sm">

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-accent">
                {visibleColumns.includes("Nome") && <TableHead className="w-[200px] bg-accent">Nome</TableHead>}
                {visibleColumns.includes("Email") && <TableHead className="w-[250px] bg-accent">Email</TableHead>}
                {visibleColumns.includes("Função") && <TableHead className="w-[120px] bg-accent">Função</TableHead>}
                {visibleColumns.includes("Status") && <TableHead className="w-[100px] bg-accent">Status</TableHead>}
                {visibleColumns.includes("Ações") && <TableHead className="w-[150px] bg-accent">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={visibleColumns.length} className="text-center py-6">
                      <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers?.length ? (
                paginatedUsers.map((user: any) => (
                  <TableRow key={user.id} className="bg-accent hover:bg-accent/80">
                    {visibleColumns.includes("Nome") && (
                      <TableCell className="font-medium whitespace-nowrap bg-accent" data-testid={`user-name-${user.id}`}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-primary" />
                          <span>{user.username}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.includes("Email") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        {user.email}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Função") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.includes("Status") && (
                      <TableCell className="whitespace-nowrap bg-accent">
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
                      </TableCell>
                    )}
                    {visibleColumns.includes("Ações") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        <div className="flex items-center space-x-1">
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
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow className="bg-accent">
                  <TableCell colSpan={visibleColumns.length} className="text-center py-12 bg-accent">
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
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Users Pagination */}
        {totalUsers > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando {(userCurrentPage - 1) * userPageSize + 1} a {Math.min(userCurrentPage * userPageSize, totalUsers)} de {totalUsers} usuários
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={userCurrentPage === 1 || isLoading}
                data-testid="button-users-previous-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalUserPages))].map((_, i) => {
                  let pageNumber;
                  if (totalUserPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    const start = Math.max(1, userCurrentPage - 2);
                    const end = Math.min(totalUserPages, start + 4);
                    pageNumber = start + i;
                    if (pageNumber > end) return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={userCurrentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUserCurrentPage(pageNumber)}
                      disabled={isLoading}
                      data-testid={`button-users-page-${pageNumber}`}
                      className="w-10"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
                disabled={userCurrentPage === totalUserPages || isLoading}
                data-testid="button-users-next-page"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Página {userCurrentPage} de {totalUserPages}
            </div>
          </div>
        )}
      </div>

      {/* Separator between sections */}
      <Separator className="my-8" />

      {/* Network Credentials Section Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Rede Credenciada
        </h2>
        
        {/* Controle de Colunas da Rede */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {networkColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleNetworkColumns.includes(col)}
                onCheckedChange={() => toggleNetworkColumn(col)}
              >
                {col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Network Credentials Table Container */}
      <div className="container my-10 space-y-4 border border-border rounded-lg bg-accent shadow-sm">
        
        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          {isLoadingNetworkUnits ? (
            <div className="p-4">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/6 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/8 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/6 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : paginatedNetworkUnits?.length ? (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-accent">
                  {visibleNetworkColumns.includes("Nome") && (
                    <TableHead className="bg-accent">Nome</TableHead>
                  )}
                  {visibleNetworkColumns.includes("Login") && (
                    <TableHead className="bg-accent">Login</TableHead>
                  )}
                  {visibleNetworkColumns.includes("URL") && (
                    <TableHead className="bg-accent">URL</TableHead>
                  )}
                  {visibleNetworkColumns.includes("Status") && (
                    <TableHead className="bg-accent">Status</TableHead>
                  )}
                  {visibleNetworkColumns.includes("Ações") && (
                    <TableHead className="bg-accent">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
              {paginatedNetworkUnits.map((unit: any) => {
                const status = getCredentialStatus(unit);
                return (
                  <TableRow key={unit.id} className="bg-accent hover:bg-accent/80">
                    {visibleNetworkColumns.includes("Nome") && (
                      <TableCell className="font-medium whitespace-nowrap bg-accent">
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4 text-primary" />
                          <span>{unit.name}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleNetworkColumns.includes("Login") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        {unit.login || "Não configurado"}
                      </TableCell>
                    )}
                    {visibleNetworkColumns.includes("URL") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        /{unit.urlSlug || "não-definido"}
                      </TableCell>
                    )}
                    {visibleNetworkColumns.includes("Status") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        <Badge className={status.color}>
                          {status.text}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleNetworkColumns.includes("Ações") && (
                      <TableCell className="whitespace-nowrap bg-accent">
                        <div className="flex items-center space-x-1">
                          {unit.urlSlug && unit.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-access-unit-${unit.id}`}
                              title={`Acessar página da unidade: ${unit.name}`}
                            >
                              <a href={`/${unit.urlSlug}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCredentials(unit)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Table className="w-full">
            <TableBody>
              <TableRow className="bg-accent">
                <TableCell colSpan={visibleNetworkColumns.length} className="text-center py-12 bg-accent">
                  <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma unidade da rede cadastrada ainda.
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        </div>
        
        {/* Network Units Pagination */}
        {networkUnits?.length > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando {(networkCurrentPage - 1) * networkPageSize + 1} a {Math.min(networkCurrentPage * networkPageSize, totalNetworkUnits)} de {totalNetworkUnits} unidades
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNetworkCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={networkCurrentPage === 1 || isLoadingNetworkUnits}
                data-testid="button-network-previous-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalNetworkPages))].map((_, i) => {
                  let pageNumber;
                  if (totalNetworkPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    const start = Math.max(1, networkCurrentPage - 2);
                    const end = Math.min(totalNetworkPages, start + 4);
                    pageNumber = start + i;
                    if (pageNumber > end) return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={networkCurrentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNetworkCurrentPage(pageNumber)}
                      disabled={isLoadingNetworkUnits}
                      data-testid={`button-network-page-${pageNumber}`}
                      className="w-10"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNetworkCurrentPage(prev => Math.min(prev + 1, totalNetworkPages))}
                disabled={networkCurrentPage === totalNetworkPages || isLoadingNetworkUnits}
                data-testid="button-network-next-page"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Página {networkCurrentPage} de {totalNetworkPages}
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}
