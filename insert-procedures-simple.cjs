const { Client } = require('pg');

// Dados dos planos e seus procedimentos
const planProceduresData = {
  "BASIC": {
    "Consultas": [
      "Consulta Clínica Geral",
      "Retorno Clínico"
    ],
    "Procedimentos e Anestesia": [
      "Coleta de Exames de Sangue",
      "Anestesia local / Tranquilização"
    ],
    "Exames Laboratoriais": [
      "Alanina Aminotransferase (TGP/ALT)",
      "Albumina",
      "Aspartato Aminotransferase (TGO/AST)",
      "Bilirrubinas - totais e frações",
      "Creatinina",
      "Fosfatase Alcalina",
      "Fósforo UV",
      "Gama Glutamil Transferase (GGT)",
      "Hemograma",
      "Parasitológico de Fezes",
      "Proteínas Totais",
      "Relação Proteína / Creatinina Urinária (UPC)",
      "Sumário de Urina",
      "Teste de Glicemia",
      "Teste de Glicemia (Aparelho)",
      "Uréia"
    ],
    "Vacinas": [
      "Vacina de Raiva",
      "Vacina Polivalente (V7, V8, V10)",
      "Vacina Quádrupla V4",
      "Vacina Tríplice (V3)"
    ],
    "Benefícios Especiais": [
      "Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano",
      "Consulta em horário normal (segunda a sábado de 08 às 20h)",
      "Vacinas (consultar cobertura)"
    ]
  },
  "COMFORT": {
    "Consultas": [
      "Consulta Clínica Geral",
      "Retorno Clínico"
    ],
    "Exames de Imagem": [
      "Ultrassonografia",
      "Ultrassonografia Guiada",
      "Cistocentese guiada para coleta de urina"
    ],
    "Exames Laboratoriais": [
      "Alanina Aminotransferase (TGP/ALT)",
      "Albumina",
      "Aspartato Aminotransferase (TGO/AST)",
      "Bilirrubinas - totais e frações",
      "Creatinina",
      "Fosfatase Alcalina",
      "Fósforo UV",
      "Gama Glutamil Transferase (GGT)",
      "Hemograma",
      "Parasitológico de Fezes",
      "Proteínas Totais",
      "Relação Proteína / Creatinina Urinária (UPC)",
      "Sumário de Urina",
      "Teste de Glicemia",
      "Teste de Glicemia (Aparelho)",
      "Uréia"
    ],
    "Procedimentos e Vacinas": [
      "Coleta de Exames de sangue",
      "Anestesia local / Tranquilização",
      "Vacina de Raiva",
      "Vacina Polivalente (V7, V8, V10)",
      "Vacina Quádrupla V4",
      "Vacina Tríplice (V3)"
    ],
    "Benefícios Especiais": [
      "Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano",
      "Consulta em horário normal (segunda a sábado de 08 às 20h)",
      "Vacinas (consultar cobertura)",
      "Exames de sangue e imagem (consultar cobertura)"
    ]
  },
  "PLATINUM": {
    "Consultas": [
      "Consulta Clínica Geral",
      "Retorno Clínico"
    ],
    "Especialistas": [
      "Atestado de Saúde",
      "Consulta Cardiologista",
      "Consulta Dentista",
      "Consulta Dermatologista",
      "Consulta Oncologista",
      "Consulta Ortopedista",
      "Consulta Plantão"
    ],
    "Cirurgia Eletiva": [
      "Drenagem de Abscesso/Hematoma",
      "Drenagem de Otohematoma Unilateral",
      "Orquiectomia (até 15kg)",
      "Orquiectomia (gato)",
      "Orquiectomia/Ablação (acima de 15kg)",
      "OSH / Ovariohisterectomia (acima de 15kg)",
      "OSH / Ovariohisterectomia (gata)",
      "OSH / Ovariohisterectomia (coelhos e similares)",
      "OSH / Ovariohisterectomia (até 15kg)"
    ],
    "Exames de Imagem": [
      "Ultrassonografia",
      "Ultrassonografia Guiada",
      "ECG Canino/Felino",
      "Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)",
      "Estudo de Pelve",
      "Estudo Radiológico de Traqueia",
      "Estudo do Pescoço",
      "Estudos de Membros Pélvicos e Torácicos (diversos segmentos)",
      "Estudo Radiográfico de Abdômen",
      "Estudo Radiográfico de Crânio",
      "Estudo Radiográfico de Tórax",
      "Estudo Radiológico de Esôfago",
      "Ultrassom Guiada p/ CAAF",
      "Ultrassonografia Controle",
      "Ultrassonografia Ocular",
      "Estudo Radiográfico de Animal Silvestre"
    ],
    "Procedimentos e Anestesia": [
      "Coleta de Exames de Sangue",
      "Aplicação IM, SC, IV (sem material)",
      "Aplicação IM, SC, IV (sem material/domicílio)",
      "Aferição de Pressão Arterial",
      "Consulta para Cirurgia",
      "Consulta p/ Internação",
      "Limpeza de Pós-Operatório",
      "Nebulização",
      "Oxigenioterapia",
      "Teste de Fluoresceína",
      "Teste de Shirmer",
      "Tratamento Miíase (remoção grande)",
      "Tratamento Miíase (remoção pequena)",
      "Anestesia Local / Tranquilização",
      "Adicional Hora Cirúrgica",
      "Anestesia Epidural",
      "Anestesia Geral Endovenosa",
      "Anestesia Inalatória (até 5kg)",
      "Anestesia Inalatória (5 a 15kg)",
      "Anestesia Inalatória (acima de 15kg)"
    ],
    "Exames Laboratoriais Simples": [
      "Alanina Aminotransferase (TGP/ALT)",
      "Albumina",
      "Aspartato Aminotransferase (TGO/AST)",
      "Bilirrubinas – totais e frações",
      "Creatinina",
      "Fosfatase Alcalina",
      "Fósforo UV",
      "Gama Glutamil Transferase (GGT)",
      "Hemograma",
      "Parasitológico de Fezes",
      "Proteínas Totais",
      "Relação Proteína/Creatinina Urinária (UPC)",
      "Sumário de Urina",
      "Teste de Glicemia",
      "Teste de Glicemia (Aparelho)",
      "Uréia"
    ],
    "Exames Laboratoriais Complexos": [
      "Cálcio sérico ou urinário",
      "Cálculo Renal – Análise físico-química",
      "Citologia do Ouvido",
      "Citologia Vaginal",
      "Colesterol Total",
      "Curva Glicêmica",
      "Dosagem de Cálcio Iônico",
      "Fibrinogênio",
      "Função Hepática",
      "Função Renal",
      "Hemograma c/ Reticulócitos",
      "Lipidograma (Colesterol + HDL + LDL + Triglicerídeos)",
      "Microscopia para Sarna",
      "Pesquisa de Hemoparasitas",
      "Pesquisa de Microfilárias",
      "Tricograma",
      "Triglicerídeos"
    ],
    "Vacinas": [
      "Vacina de Raiva",
      "Vacina Polivalente (V7, V8, V10)",
      "Vacina Quádrupla (V4)",
      "Vacina Tríplice (V3)",
      "Vacina de Gripe"
    ],
    "Benefícios Especiais": [
      "Desconto de 20% em serviços, medicamentos e materiais não cobertos pelo plano",
      "Consulta em horário normal: segunda a sábado, 08h–20h",
      "Consulta em horário de plantão: segunda a sábado, 20h–08h + domingos e feriados",
      "Consultas com especialistas: verificar especialidades disponíveis",
      "Vacinas, exames de sangue, exames de imagem e cirurgias eletivas: consultar cobertura"
    ]
  },
  "INFINITY": {
    "Consultas": [
      "Consulta Clínica Geral",
      "Retorno Clínico"
    ],
    "Especialistas": [
      "Atestado de Saúde",
      "Consulta Cardiologista",
      "Consulta Dentista",
      "Consulta Dermatologista",
      "Consulta Oncologista",
      "Consulta Ortopedista",
      "Consulta Plantão",
      "Consulta Nefrologista",
      "Consulta Neurologista",
      "Taxa de Retorno"
    ],
    "Vacinas": [
      "Vacina de Raiva",
      "Vacina Polivalente (V7, V8, V10)",
      "Vacina Quádrupla v4",
      "Vacina Tríplice (V3)",
      "Vacina de Gripe",
      "Vacina Giardia",
      "Vacina Quíntupla (V5, v3 ou v4+felv)"
    ],
    "Exames Laboratoriais Complexos": [
      "Análise de Líquido Cavitário",
      "Análise de líquor (LCR)",
      "Biópsia / histopatológico",
      "Biópsia de pele",
      "Citologia / CAAF - nódulo superficial",
      "CITOLOGIA DE LAVADO BRONCOALVEOLAR",
      "Citologia de pele (Fungo e Bactéria)",
      "Compatibilidade sanguínea (doador adicional)",
      "Cortisol Pós Supressão Dexametasona",
      "Cortisol Pré e Pós Dexametasona",
      "ELISA (LEISHMANIOSE CANINA) LEISH IDEXX",
      "Lactato",
      "Mielograma",
      "Necropsia (05 até 15kg)",
      "Necropsia (acima de 15kg)",
      "Necropsia (até 05kg)",
      "Necropsia Estética (05kg até 15kg)",
      "Necropsia Estética (acima de 15kg)",
      "Necropsia Estética (até 05kg)",
      "NT PROBNP CANINO",
      "PCR PARA LEISHMANIA",
      "Pesquisa/parasitológico para Leishmania (pele, medula e linfonodo)",
      "Procalcitonina",
      "Teste de compatibilidade sanguínea",
      "Teste de Coombs",
      "TESTE FIV FELV PRODVET/BIOCLIN",
      "TESTE RÁPIDO CINOMOSE E PARVOVIROSE ACCUVET",
      "Teste rápido de cinomose/antígeno (ALERE)",
      "Teste Rápido de Erliquiose (Immunocombo IGG)",
      "Teste Rápido de Erliquiose SNAP 4DX (IDEXX)",
      "Teste Rápido de Fiv/Felv (IDEXX)",
      "TESTE RÁPIDO LEISHMANIOSE AC ACCUVET",
      "Teste rápido para cinomose e parvovirose (IGM)",
      "Teste Rápido Parvo/Corona (ALERE)",
      "TESTE RÁPIDO TOXOPLASMOSE IGG/IGM ACCUVET"
    ],
    "Exames Laboratoriais": [
      "Alanina Aminotransferase (TGP/ALT)",
      "Albumina",
      "Aspartato Aminotransferase (TGO/AST)",
      "Bilirrubinas - totais e frações",
      "Creatinina",
      "Fosfatase Alcalina",
      "Fósforo UV",
      "Gama Glutamil Transferase (GGT)",
      "Hemograma",
      "Parasitológico de Fezes",
      "Proteínas Totais",
      "Relação Proteína / Creatinina Urinária (UPC)",
      "Sumário de Urina",
      "Teste de Glicemia",
      "Teste de Glicemia (Aparelho)",
      "Uréia",
      "Cálcio sérico ou urinário",
      "Cálculo renal Análise físico química",
      "Citologia do Ouvido",
      "Citologia Vaginal",
      "Colesterol total",
      "Curva Glicêmica",
      "Dosagem de Cálcio Iônico",
      "FIBRINOGÊNIO",
      "Função hepática",
      "Função renal",
      "Hemograma com contagem de reticulócitos",
      "Lipidograma (Colesterol + HDL + LDL + Triglicerídeos)",
      "Microscopia para Sarna",
      "Pesquisa de hemoparasitas",
      "Pesquisa de Microfilárias",
      "Tricograma",
      "Triglicerídeos"
    ],
    "Exames de Imagem": [
      "Ultrassonografia",
      "ECG (Eletrocardiograma) canino / felino",
      "Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)",
      "Estudo de Pelve",
      "Estudo Radiológico de Traqueia",
      "Estudo do Pescoço",
      "Estudos de Membros Pélvicos",
      "Estudos de Membros Torácicos",
      "Estudo Radiográfico de Abdômen",
      "Estudo Radiográfico de Crânio",
      "Estudo Radiográfico de Tórax",
      "Ultrassom Guiada para CAAF",
      "Ultrassonografia Controle",
      "Ultrassonografia Ocular",
      "BRONCOSCOPIA E LAVADO BRONQUEOALVEOLAR",
      "COLONOSCOPIA DIAGNÓSTICA",
      "ECO (Ecocardiograma)",
      "ELETROQUIMIOTERAPIA",
      "Eletroretinograma",
      "Tomografia Computadorizada",
      "Mielografia Contrastada",
      "E muitos outros exames especializados"
    ],
    "Procedimentos Ambulatoriais": [
      "Coleta de Exames de Sangue",
      "Aplicações IM, SC, IV",
      "Aferição da Pressão arterial",
      "Nebulização",
      "Oxigenioterapia",
      "Acupuntura",
      "Bomba de infusão",
      "Fluidoterapia",
      "Transfusão de sangue",
      "E muitos outros procedimentos"
    ],
    "Benefícios Especiais": [
      "Desconto de 30% em medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano",
      "Consulta em horário normal (segunda a sábado de 08 às 20h)",
      "Consulta em horário plantão (segunda a sábado de 20 às 08h, domingos e feriados)",
      "Consulta especialista (consultar especialidades)",
      "Vacinas, exames de sangue, exames de imagem, cirurgias eletivas e complexas (consultar cobertura)"
    ]
  }
};

async function insertProcedures() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/unipet',
    ssl: false
  });

  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    
    // Buscar os planos existentes
    const result = await client.query('SELECT id, name FROM plans');
    const existingPlans = result.rows;
    console.log('Planos encontrados:', existingPlans);
    
    // Para cada plano, inserir os procedimentos
    for (const plan of existingPlans) {
      const planName = plan.name.toUpperCase();
      console.log(`\nProcessando plano: ${planName} (ID: ${plan.id})`);
      
      if (planProceduresData[planName]) {
        // Limpar procedimentos existentes
        try {
          await client.query('DELETE FROM plan_procedures WHERE plan_id = $1', [plan.id]);
          console.log(`Procedimentos existentes removidos para ${planName}`);
        } catch (error) {
          console.log(`Nenhum procedimento existente para ${planName}`);
        }
        
        // Inserir novos procedimentos
        let procedureCount = 0;
        for (const [benefitName, procedures] of Object.entries(planProceduresData[planName])) {
          for (const procedureName of procedures) {
            if (procedureName.trim()) {
              try {
                await client.query(
                  'INSERT INTO plan_procedures (plan_id, benefit_name, procedure_name, description, price, is_included, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                  [plan.id, benefitName, procedureName, '', 0, true, 0]
                );
                procedureCount++;
              } catch (error) {
                console.error(`Erro ao inserir procedimento ${procedureName}:`, error.message);
              }
            }
          }
        }
        console.log(`${procedureCount} procedimentos inseridos para ${planName}`);
      } else {
        console.log(`Plano ${planName} não encontrado nos dados`);
      }
    }
    
    console.log('\nInserção concluída!');
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await client.end();
  }
}

insertProcedures();
