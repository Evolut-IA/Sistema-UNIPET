import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, User, Edit, Save, X, Camera } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  state?: string;
  city?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  basePrice: string;
  billingFrequency: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  sex: string;
  castrated: boolean;
  color?: string;
  weight?: string;
  imageUrl?: string;
  plan?: Plan;
}

export default function CustomerProfile() {
  const [, navigate] = useLocation();
  const [client, setClient] = useState<Client | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      try {
        // Check authentication first
        const clientResponse = await fetch('/api/clients/me', {
          credentials: 'include'
        });

        if (!clientResponse.ok) {
          navigate('/customer/login');
          return;
        }

        const clientResult = await clientResponse.json();
        setClient(clientResult.client);

        // Load pets data in parallel (already authenticated)
        const petsResponse = await fetch('/api/clients/pets', {
          credentials: 'include'
        });

        if (petsResponse.ok) {
          const petsResult = await petsResponse.json();
          setPets(petsResult.pets || []);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Erro ao carregar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const startEditing = () => {
    setIsEditing(true);
    setEditFormData({ ...client });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFormData({});
    setError(null);
  };

  const updateFormField = (field: keyof Client, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    if (!editFormData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clients/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const result = await response.json();
        setClient({ ...client, ...result.client });
        setIsEditing(false);
        setEditFormData({});
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao salvar alterações');
      }
    } catch (error) {
      console.error('Error saving client changes:', error);
      setError('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    setError(null);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          
          const response = await fetch('/api/clients/profile/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ image: base64String })
          });

          if (response.ok) {
            const result = await response.json();
            setClient({ ...client, ...result.client });
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Erro ao fazer upload da imagem');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Erro ao fazer upload da imagem');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Erro ao processar arquivo');
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo 5MB');
        return;
      }
      
      uploadImage(file);
    }
  };

  const formatInfo = (label: string, value?: string | null): string => {
    if (value === null || value === undefined || value === '') {
      return `${label}: Não informado`;
    }
    return `${label}: ${value}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const getSpeciesIcon = (species: string) => {
    const lowerSpecies = species?.toLowerCase();
    if (lowerSpecies?.includes('cat') || lowerSpecies?.includes('gato')) {
      return '🐱';
    } else if (lowerSpecies?.includes('dog') || lowerSpecies?.includes('cão') || lowerSpecies?.includes('cachorro')) {
      return '🐶';
    }
    return '🐾';
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--bg-cream-light)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4" 
              style={{borderColor: 'var(--text-teal)', borderTopColor: 'transparent'}}></div>
            <p style={{ color: 'var(--text-dark-secondary)' }}>Carregando perfil...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !client) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--bg-cream-light)' }}>
          <div className="text-center">
            <p className="mb-4" style={{ color: 'var(--text-dark-primary)' }}>{error}</p>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-6 py-2 rounded-lg"
              style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16" style={{ background: 'var(--bg-cream-light)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg mb-4"
                style={{ background: 'var(--bg-beige)', color: 'var(--text-dark-secondary)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                Meu Perfil
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-dark-secondary)' }}>
                Gerencie suas informações pessoais e veja os planos dos seus pets
              </p>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50"
            >
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            {/* Profile Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-dark-primary)' }}>
                Informações Pessoais
              </h2>
              <div>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark-secondary)' }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={saveChanges}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                      style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
                      style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark-secondary)' }}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information with Profile Image */}
              <div className="space-y-3">
                {/* Profile Image */}
                <div className="flex flex-col items-start space-y-3 mb-4">
                  <div 
                    className="relative cursor-pointer" 
                    onClick={() => {
                      const fileInput = document.querySelector('#profile-file-input') as HTMLInputElement;
                      fileInput?.click();
                    }}
                  >
                    {client?.imageUrl ? (
                      <img 
                        src={client.imageUrl} 
                        alt={client.full_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: 'var(--bg-cream-light)', color: 'var(--text-teal)' }}>
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    
                    {/* Image Upload Button */}
                    <div className="absolute -bottom-1 -right-1">
                      <label className="cursor-pointer">
                        <input
                          id="profile-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                          style={{ border: '2px solid var(--text-teal)' }}>
                          {uploadingImage ? (
                            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera className="w-3 h-3" style={{ color: 'var(--text-teal)' }} />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-dark-secondary)' }}>
                    Clique para alterar
                  </p>
                </div>
                
                <h4 className="font-semibold" style={{ color: 'var(--text-dark-primary)' }}>Dados Pessoais</h4>
                <div className="space-y-2 text-sm">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Nome Completo</label>
                        <input
                          type="text"
                          value={editFormData.full_name || ''}
                          onChange={(e) => updateFormField('full_name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Email</label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => updateFormField('email', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Telefone</label>
                        <input
                          type="text"
                          value={editFormData.phone || ''}
                          onChange={(e) => updateFormField('phone', e.target.value)}
                          placeholder="Não informado"
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>CPF</label>
                        <input
                          type="text"
                          value={editFormData.cpf || 'Não informado'}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg cursor-not-allowed"
                          style={{ 
                            borderColor: 'var(--border-gray)', 
                            backgroundColor: 'var(--bg-cream-light)', 
                            color: 'var(--text-dark-secondary)',
                            opacity: 0.8
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Nome', client?.full_name)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Email', client?.email)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Telefone', client?.phone)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('CPF', client?.cpf)}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-3">
                <h4 className="font-semibold" style={{ color: 'var(--text-dark-primary)' }}>Endereço</h4>
                <div className="space-y-2 text-sm">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>CEP</label>
                        <input
                          type="text"
                          value={editFormData.cep || ''}
                          onChange={(e) => updateFormField('cep', e.target.value)}
                          placeholder="Não informado"
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Endereço</label>
                        <input
                          type="text"
                          value={editFormData.address || ''}
                          onChange={(e) => updateFormField('address', e.target.value)}
                          placeholder="Não informado"
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Número</label>
                          <input
                            type="text"
                            value={editFormData.number || ''}
                            onChange={(e) => updateFormField('number', e.target.value)}
                            placeholder="Não informado"
                            className="w-full px-3 py-2 border rounded-lg"
                            style={{ borderColor: 'var(--border-gray)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Complemento</label>
                          <input
                            type="text"
                            value={editFormData.complement || ''}
                            onChange={(e) => updateFormField('complement', e.target.value)}
                            placeholder="Não informado"
                            className="w-full px-3 py-2 border rounded-lg"
                            style={{ borderColor: 'var(--border-gray)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Bairro</label>
                        <input
                          type="text"
                          value={editFormData.district || ''}
                          onChange={(e) => updateFormField('district', e.target.value)}
                          placeholder="Não informado"
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: 'var(--border-gray)' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Cidade</label>
                          <input
                            type="text"
                            value={editFormData.city || ''}
                            onChange={(e) => updateFormField('city', e.target.value)}
                            placeholder="Não informado"
                            className="w-full px-3 py-2 border rounded-lg"
                            style={{ borderColor: 'var(--border-gray)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-dark-primary)' }}>Estado</label>
                          <input
                            type="text"
                            value={editFormData.state || ''}
                            onChange={(e) => updateFormField('state', e.target.value)}
                            placeholder="Não informado"
                            className="w-full px-3 py-2 border rounded-lg"
                            style={{ borderColor: 'var(--border-gray)' }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('CEP', client?.cep)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Endereço', client?.address)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Número', client?.number)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Complemento', client?.complement)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Bairro', client?.district)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Cidade', client?.city)}</p>
                      <p style={{ color: 'var(--text-dark-secondary)' }}>{formatInfo('Estado', client?.state)}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="border-t pt-4" style={{ borderColor: 'var(--border-gray)' }}>
              <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                <p><span className="font-medium">Cadastrado em:</span> {formatDate(client?.createdAt)}</p>
                <p><span className="font-medium">Última atualização:</span> {formatDate(client?.updatedAt)}</p>
              </div>
            </div>
          </motion.div>

          {/* Pets and Plans Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-dark-primary)' }}>
              Meus Pets e Planos
            </h2>

            {pets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--bg-cream-light)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="var(--text-teal)"><path d="M718-313 604-426l57-56 57 56 141-141 57 56-198 198ZM440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Z"/></svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark-primary)' }}>
                  Nenhum pet cadastrado
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-dark-secondary)' }}>
                  Você ainda não possui pets cadastrados em sua conta.
                </p>
                <button
                  onClick={() => navigate('/customer/pets')}
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
                >
                  Gerenciar Pets
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <div key={pet.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                    <div className="flex items-center space-x-4 mb-4">
                      {pet.imageUrl ? (
                        <img 
                          src={pet.imageUrl} 
                          alt={pet.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                          style={{ background: 'var(--bg-cream-light)' }}>
                          {getSpeciesIcon(pet.species)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--text-dark-primary)' }}>
                          {pet.name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-teal)' }}>
                          {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    {pet.plan ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-dark-primary)' }}>
                            Plano Ativo:
                          </span>
                          <span className="text-sm px-2 py-1 rounded"
                            style={{ background: 'var(--bg-cream-light)', color: 'var(--text-teal)' }}>
                            {pet.plan.name}
                          </span>
                        </div>
                        {pet.plan.basePrice && (
                          <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                            Valor: R$ {parseFloat(pet.plan.basePrice).toFixed(2).replace('.', ',')}
                            {pet.plan.billingFrequency === 'monthly' ? '/mês' : '/ano'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm" style={{ color: 'var(--text-dark-secondary)' }}>
                          Nenhum plano ativo
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pets.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/customer/pets')}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{ background: 'var(--btn-ver-planos-bg)', color: 'var(--btn-ver-planos-text)' }}
                >
                  Gerenciar Pets
                </button>
              </div>
            )}
          </motion.div>

        </div>
      </div>
      <Footer />
    </>
  );
}