/**
 * Serviço para busca de endereços por CEP
 * Utiliza a API ViaCEP (gratuita e confiável)
 */
export class CepService {
    /**
     * Busca dados do endereço por CEP
     */
    static async lookup(cep) {
        try {
            console.log(`🔍 [CEP] Buscando dados para CEP: ${cep}`);
            // Limpar e validar CEP
            const cleanCep = this.cleanCep(cep);
            if (!this.isValidCep(cleanCep)) {
                console.log(`❌ [CEP] CEP inválido: ${cep}`);
                return null;
            }
            // Fazer requisição para ViaCEP
            const response = await fetch(`${this.BASE_URL}/${cleanCep}/json/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'UNIPET-Plan/1.0'
                },
                signal: AbortSignal.timeout(this.TIMEOUT)
            });
            if (!response.ok) {
                console.log(`❌ [CEP] Erro na API: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            // Verificar se houve erro na resposta
            if (data.erro) {
                console.log(`❌ [CEP] CEP não encontrado: ${cleanCep}`);
                return null;
            }
            // Mapear dados para formato padronizado
            const addressData = {
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
                cep: cleanCep
            };
            console.log(`✅ [CEP] Dados encontrados:`, addressData);
            return addressData;
        }
        catch (error) {
            console.error(`🚨 [CEP] Erro ao buscar CEP ${cep}:`, error);
            return null;
        }
    }
    /**
     * Limpar CEP removendo caracteres especiais
     */
    static cleanCep(cep) {
        return cep.replace(/\D/g, '');
    }
    /**
     * Validar formato do CEP (8 dígitos)
     */
    static isValidCep(cep) {
        return /^\d{8}$/.test(cep);
    }
    /**
     * Formatar CEP para exibição (12345-678)
     */
    static formatCep(cep) {
        const cleanCep = this.cleanCep(cep);
        if (cleanCep.length !== 8)
            return cep;
        return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
}
CepService.BASE_URL = 'https://viacep.com.br/ws';
CepService.TIMEOUT = 5000; // 5 segundos
