import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Search, Eye, MoreHorizontal, ChevronLeft, ChevronRight, File } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDate } from "@internationalized/date";
import { useColumnPreferences } from "@/hooks/admin/use-column-preferences";
import { DateFilterComponent } from "@/components/admin/DateFilterComponent";

interface ContractWithDetails {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string;
  billingPeriod: string;
  monthlyAmount: string;
  annualAmount?: string;
  paymentMethod: string;
  hasCoparticipation: boolean;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  petName?: string;
  petSpecies?: string;
  planName?: string;
  createdAt: string;
}

const allColumns = [
  "Contrato",
  "Cliente",
  "Pet",
  "Plano",
  "Status",
  "Valor Mensal",
  "Data Início",
  "Ações",
] as const;

const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
  cancelled: "Cancelado",
  pending: "Pendente",
};

const statusStyle = "border border-border rounded-lg bg-background text-foreground";

const billingPeriodLabels: Record<string, string> = {
  monthly: "Mensal",
  annual: "Anual",
};

const paymentMethodLabels: Record<string, string> = {
  credit_card: "Cartão de Crédito",
  pix: "PIX",
  cartao: "Cartão",
};

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { visibleColumns, toggleColumn } = useColumnPreferences('contracts.columns', allColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [dateFilter, setDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  const [debouncedDateFilter, setDebouncedDateFilter] = useState<{
    startDate: CalendarDate | null;
    endDate: CalendarDate | null;
  }>({ startDate: null, endDate: null });

  // Debounce date filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateFilter(dateFilter);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [dateFilter]);

  const handleDateRangeChange = (startDate: CalendarDate | null, endDate: CalendarDate | null) => {
    setDateFilter({ startDate, endDate });
    setCurrentPage(1); // Reset para página 1 ao filtrar por data
  };

  const { data: contracts = [], isLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ["/admin/api/contracts"],
  });

  const filteredContracts = contracts.filter((contract) => {
    // Text search filter
    const matchesSearch = !searchQuery || 
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.petName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (debouncedDateFilter.startDate || debouncedDateFilter.endDate) {
      const contractDate = new Date(contract.startDate);
      
      if (debouncedDateFilter.startDate) {
        const startDate = new Date(
          debouncedDateFilter.startDate.year,
          debouncedDateFilter.startDate.month - 1,
          debouncedDateFilter.startDate.day
        );
        if (contractDate < startDate) matchesDate = false;
      }
      
      if (debouncedDateFilter.endDate) {
        const endDate = new Date(
          debouncedDateFilter.endDate.year,
          debouncedDateFilter.endDate.month - 1,
          debouncedDateFilter.endDate.day
        );
        endDate.setHours(23, 59, 59, 999);
        if (contractDate > endDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalContracts = filteredContracts.length;
  const totalPages = Math.ceil(totalContracts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayContracts = filteredContracts.slice(startIndex, endIndex);

  const handleViewDetails = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    setDetailsOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">Contratos</h1>
          <p className="text-sm text-muted-foreground">Gestão de contratos de planos de saúde</p>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilterComponent 
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading ||
          (dateFilter.startDate !== debouncedDateFilter.startDate ||
            dateFilter.endDate !== debouncedDateFilter.endDate)}
        initialRange={dateFilter}
      />

      {/* Filters and Column Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por contrato, cliente ou pet..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-80"
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger 
              className="w-48"
              style={{
                borderColor: 'var(--border-gray)',
                background: 'white'
              }}
            >
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: 'var(--border-gray)',
                  background: 'white'
                }}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {allColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                  className="mb-1"
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="container my-10 space-y-4 border border-[#eaeaea] rounded-lg bg-white shadow-sm">
        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-white border-b border-[#eaeaea]">
                {visibleColumns.includes("Contrato") && <TableHead className="w-[140px] bg-white">Nº Contrato</TableHead>}
                {visibleColumns.includes("Cliente") && <TableHead className="w-[200px] bg-white">Cliente</TableHead>}
                {visibleColumns.includes("Pet") && <TableHead className="w-[150px] bg-white">Pet</TableHead>}
                {visibleColumns.includes("Plano") && <TableHead className="w-[150px] bg-white">Plano</TableHead>}
                {visibleColumns.includes("Status") && <TableHead className="w-[120px] bg-white">Status</TableHead>}
                {visibleColumns.includes("Valor Mensal") && <TableHead className="w-[120px] bg-white">Valor Mensal</TableHead>}
                {visibleColumns.includes("Data Início") && <TableHead className="w-[120px] bg-white">Data Início</TableHead>}
                {visibleColumns.includes("Ações") && <TableHead className="w-[100px] bg-white">Ações</TableHead>}
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
              ) : displayContracts && displayContracts.length > 0 ? (
                displayContracts.map((contract: ContractWithDetails) => (
                  <TableRow key={contract.id} className="bg-white border-b border-[#eaeaea]">
                    {visibleColumns.includes("Contrato") && (
                      <TableCell className="font-medium whitespace-nowrap bg-white">
                        {contract.contractNumber}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Cliente") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        {contract.clientName || "N/A"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Pet") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        {contract.petName || "N/A"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Plano") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        {contract.planName || "N/A"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Status") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        <Badge className={statusStyle}>
                          {statusLabels[contract.status] || contract.status}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.includes("Valor Mensal") && (
                      <TableCell className="whitespace-nowrap bg-white font-bold text-foreground">
                        {formatCurrency(contract.monthlyAmount)}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Data Início") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                    )}
                    {visibleColumns.includes("Ações") && (
                      <TableCell className="whitespace-nowrap bg-white">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(contract)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow className="bg-white border-b border-[#eaeaea]">
                  <TableCell colSpan={visibleColumns.length} className="text-center py-12 bg-white">
                    <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Nenhum contrato encontrado para a busca."
                        : "Nenhum contrato cadastrado ainda."
                      }
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalContracts > 10 && (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  {totalContracts > 0 ? (
                    <>Mostrando {startIndex + 1} a {Math.min(endIndex, totalContracts)} de {totalContracts} contratos</>
                  ) : (
                    "Nenhum contrato encontrado"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              <Button
                variant="admin-action"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent hideCloseButton>
          <DialogHeader className="flex flex-row items-center justify-between pr-2">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Detalhes do Contrato</span>
            </DialogTitle>
            <Button
              variant="outline" 
              onClick={() => setDetailsOpen(false)}
              className="h-8"
            >
              Fechar
            </Button>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações do Contrato</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Nº Contrato:</strong> <span className="text-foreground">{selectedContract.contractNumber}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Status:</strong> <Badge className={statusStyle}>{statusLabels[selectedContract.status] || selectedContract.status}</Badge></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Data de Início:</strong> <span className="text-foreground">{format(new Date(selectedContract.startDate), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                    </div>
                    {selectedContract.endDate && (
                      <div className="flex items-center space-x-2">
                        <span><strong className="text-primary">Data de Término:</strong> <span className="text-foreground">{format(new Date(selectedContract.endDate), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Nome:</strong> <span className="text-foreground">{selectedContract.clientName || "N/A"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Email:</strong> <span className="text-foreground">{selectedContract.clientEmail || "N/A"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Telefone:</strong> <span className="text-foreground">{selectedContract.clientPhone || "N/A"}</span></span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações do Pet</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Nome:</strong> <span className="text-foreground">{selectedContract.petName || "N/A"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Espécie:</strong> <span className="text-foreground">{selectedContract.petSpecies || "N/A"}</span></span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Informações do Plano</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Plano:</strong> <span className="text-foreground">{selectedContract.planName || "N/A"}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Período de Cobrança:</strong> <span className="text-foreground">{billingPeriodLabels[selectedContract.billingPeriod] || selectedContract.billingPeriod}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Valor Mensal:</strong> <span className="font-bold text-foreground">{formatCurrency(selectedContract.monthlyAmount)}</span></span>
                    </div>
                    {selectedContract.annualAmount && (
                      <div className="flex items-center space-x-2">
                        <span><strong className="text-primary">Valor Anual:</strong> <span className="font-bold text-foreground">{formatCurrency(selectedContract.annualAmount)}</span></span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Método de Pagamento:</strong> <span className="text-foreground">{paymentMethodLabels[selectedContract.paymentMethod] || selectedContract.paymentMethod}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span><strong className="text-primary">Coparticipação:</strong> <span className="text-foreground">{selectedContract.hasCoparticipation ? "Sim" : "Não"}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
