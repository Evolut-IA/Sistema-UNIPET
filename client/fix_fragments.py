#!/usr/bin/env python3
"""
Script para corrigir todos os fragments JSX mal balanceados no checkout.tsx
"""

def fix_fragments():
    # Ler o arquivo
    with open('src/pages/checkout.tsx', 'r') as f:
        lines = f.readlines()
    
    # Definir as correções: linha onde adicionar </> após determinado conteúdo
    corrections = [
        # Seção 1 - Botões loading (Desktop)
        {"after_line": 3199, "content": "                              </>"},  # Fecha fragment linha 3195
        {"after_line": 3210, "content": "                              </>"},  # Fecha fragment linha 3201
        
        # Seção 2 - PIX Payment Results 
        {"after_line": 3263, "content": "                    </>"},  # Fecha fragment linha 3244 (approved)
        {"after_line": 3282, "content": "                    </>"},  # Fecha fragment linha 3268 (rejected)
        {"after_line": 3301, "content": "                    </>"},  # Fecha fragment linha 3286 (pending)
        
        # Seção 3 - Credit Card Payment Results
        {"after_line": 3423, "content": "                    </>"},  # Fecha fragment linha 3406 (rejected)
        {"after_line": 3445, "content": "                    </>"},  # Fecha fragment linha 3427 (pending)
        
        # Seção 4 - Botões loading (Mobile)
        {"after_line": 3504, "content": "                  </>"},  # Fecha fragment linha 3500
        {"after_line": 3515, "content": "                  </>"},  # Fecha fragment linha 3506
    ]
    
    # Aplicar correções em ordem reversa para não afetar números de linha
    corrections.reverse()
    
    for correction in corrections:
        line_idx = correction["after_line"] - 1  # Convert to 0-based index
        if line_idx < len(lines):
            # Inserir a linha de fechamento após a linha especificada
            lines.insert(line_idx + 1, correction["content"] + "\n")
    
    # Escrever o arquivo corrigido
    with open('src/pages/checkout.tsx', 'w') as f:
        f.writelines(lines)
    
    print("Fragmentos JSX corrigidos com sucesso!")

if __name__ == "__main__":
    fix_fragments()