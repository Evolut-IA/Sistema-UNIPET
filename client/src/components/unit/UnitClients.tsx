import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, User, Heart, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  clientId: string;
}

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  pets: Pet[];
}

export default function UnitClients({ unitSlug }: { unitSlug: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clients');

  useEffect(() => {
    fetchClients();
  }, [unitSlug]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('unit-token');
      const response = await fetch(`/api/unit/${unitSlug}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allPets = clients.flatMap(client => 
    client.pets.map(pet => ({ ...pet, clientName: client.name }))
  );

  const filteredPets = allPets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet as any).clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clientes & Pets</h2>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="clients" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Clientes ({filteredClients.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Pets ({filteredPets.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-lg">{client.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>CPF:</strong> {client.cpf}</p>
                          <p><strong>Telefone:</strong> {client.phone}</p>
                          <p><strong>Email:</strong> {client.email}</p>
                          <p><strong>Pets:</strong> {client.pets.length} {client.pets.length === 1 ? 'pet' : 'pets'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pets Tab */}
        <TabsContent value="pets">
          {filteredPets.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum pet encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPets.map((pet) => (
                <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-lg">{pet.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Tutor:</strong> {(pet as any).clientName}</p>
                          <p><strong>Espécie:</strong> {pet.species}</p>
                          <p><strong>Raça:</strong> {pet.breed}</p>
                          <p><strong>Data de Nascimento:</strong> {format(new Date(pet.birthDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}