import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMasked } from "@/components/ui/input-masked";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema, insertPlanProcedureSchema } from "@shared/schema";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PLAN_TYPES } from "@/lib/constants";

export default function PlanForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEdit = Boolean(params.id);
  const [benefitProcedures, setBenefitProcedures] = useState<Record<string, any[]>>({});

  const { data: plan, isLoading } = useQuery({
    queryKey: ["/api/plans", params.id],
    enabled: isEdit,
  });

  const form = useForm({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      price: "",
      planType: "com_coparticipacao",
      features: [],
      description: "",
      image: "",
      buttonText: "Contratar Plano",
      displayOrder: 0,
      isActive: true,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Função para obter procedimentos do relatório baseado no nome do benefício
  const getProceduresFromReport = (benefitName: string) => {
    // Mapear variações de nomes para os dados do relatório
    const benefitMapping: Record<string, string> = {
      "consultas": "Consultas",
      "consulta": "Consultas",
      "exames de imagem": "Exames de Imagem",
      "exames de sangue": "Exames Laboratoriais",
      "exames laboratoriais": "Exames Laboratoriais",
      "exames laboratoriais simples": "Exames Laboratoriais Simples",
      "exames laboratoriais complexos": "Exames Laboratoriais Complexos",
      "procedimentos e anestesia": "Procedimentos e Anestesia",
      "procedimentos": "Procedimentos e Anestesia",
      "anestesia": "Procedimentos e Anestesia",
      "procedimentos e vacinas": "Procedimentos e Vacinas",
      "vacinas": "Vacinas",
      "especialistas": "Especialistas",
      "cirurgia eletiva": "Cirurgia Eletiva",
      "cirurgias": "Cirurgia Eletiva",
      "benefícios especiais": "Benefícios Especiais",
      "procedimentos ambulatoriais": "Procedimentos Ambulatoriais"
    };

    const normalizedBenefitName = benefitName.toLowerCase().trim();
    const mappedBenefitName = benefitMapping[normalizedBenefitName];

    // Procurar em todos os planos do relatório
    for (const planData of Object.values(PREDEFINED_PLANS)) {
      if (planData[mappedBenefitName] || planData[benefitName]) {
        return planData[mappedBenefitName] || planData[benefitName] || [];
      }
    }

    return [];
  };

  // Funções para gerenciar procedimentos por benefício
  const addProcedureToBenefit = (benefitName: string) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: [
        ...(prev[benefitName] || []),
        { procedureName: "", description: "", price: 0, isIncluded: true }
      ]
    }));
  };

  const removeProcedureFromBenefit = (benefitName: string, index: number) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: prev[benefitName]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateProcedureInBenefit = (benefitName: string, index: number, field: string, value: any) => {
    setBenefitProcedures(prev => ({
      ...prev,
      [benefitName]: prev[benefitName]?.map((proc, i) => 
        i === index ? { ...proc, [field]: value } : proc
      ) || []
    }));
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case "com_coparticipacao": return "Com Coparticipação";
      case "sem_coparticipacao": return "Sem Coparticipação";
      default: return type;
    }
  };

  // Dados dos planos do relatório
  const PREDEFINED_PLANS = {
    "BASIC": {
      "Consultas": [
        { procedureName: "Consulta Clínica Geral", price: 0, isIncluded: true },
        { procedureName: "Retorno Clínico", price: 0, isIncluded: true }
      ],
      "Procedimentos e Anestesia": [
        { procedureName: "Coleta de Exames de Sangue", price: 0, isIncluded: true },
        { procedureName: "Anestesia local / Tranquilização", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais": [
        { procedureName: "Alanina Aminotransferase (TGP/ALT)", price: 0, isIncluded: true },
        { procedureName: "Albumina", price: 0, isIncluded: true },
        { procedureName: "Aspartato Aminotransferase (TGO/AST)", price: 0, isIncluded: true },
        { procedureName: "Bilirrubinas - totais e frações", price: 0, isIncluded: true },
        { procedureName: "Creatinina", price: 0, isIncluded: true },
        { procedureName: "Fosfatase Alcalina", price: 0, isIncluded: true },
        { procedureName: "Fósforo UV", price: 0, isIncluded: true },
        { procedureName: "Gama Glutamil Transferase (GGT)", price: 0, isIncluded: true },
        { procedureName: "Hemograma", price: 0, isIncluded: true },
        { procedureName: "Parasitológico de Fezes", price: 0, isIncluded: true },
        { procedureName: "Proteínas Totais", price: 0, isIncluded: true },
        { procedureName: "Relação Proteína / Creatinina Urinária (UPC)", price: 0, isIncluded: true },
        { procedureName: "Sumário de Urina", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia (Aparelho)", price: 0, isIncluded: true },
        { procedureName: "Uréia", price: 0, isIncluded: true }
      ],
      "Vacinas": [
        { procedureName: "Vacina de Raiva", price: 0, isIncluded: true },
        { procedureName: "Vacina Polivalente (V7, V8, V10)", price: 0, isIncluded: true },
        { procedureName: "Vacina Quádrupla V4", price: 0, isIncluded: true },
        { procedureName: "Vacina Tríplice (V3)", price: 0, isIncluded: true }
      ],
      "Benefícios Especiais": [
        { procedureName: "Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário normal (segunda a sábado de 08 às 20h)", price: 0, isIncluded: true },
        { procedureName: "Vacinas (consultar cobertura)", price: 0, isIncluded: true }
      ]
    },
    "COMFORT": {
      "Consultas": [
        { procedureName: "Consulta Clínica Geral", price: 0, isIncluded: true },
        { procedureName: "Retorno Clínico", price: 0, isIncluded: true }
      ],
      "Exames de Imagem": [
        { procedureName: "Ultrassonografia", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Guiada", price: 0, isIncluded: true },
        { procedureName: "Cistocentese guiada para coleta de urina", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais": [
        { procedureName: "Alanina Aminotransferase (TGP/ALT)", price: 0, isIncluded: true },
        { procedureName: "Albumina", price: 0, isIncluded: true },
        { procedureName: "Aspartato Aminotransferase (TGO/AST)", price: 0, isIncluded: true },
        { procedureName: "Bilirrubinas - totais e frações", price: 0, isIncluded: true },
        { procedureName: "Creatinina", price: 0, isIncluded: true },
        { procedureName: "Fosfatase Alcalina", price: 0, isIncluded: true },
        { procedureName: "Fósforo UV", price: 0, isIncluded: true },
        { procedureName: "Gama Glutamil Transferase (GGT)", price: 0, isIncluded: true },
        { procedureName: "Hemograma", price: 0, isIncluded: true },
        { procedureName: "Parasitológico de Fezes", price: 0, isIncluded: true },
        { procedureName: "Proteínas Totais", price: 0, isIncluded: true },
        { procedureName: "Relação Proteína / Creatinina Urinária (UPC)", price: 0, isIncluded: true },
        { procedureName: "Sumário de Urina", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia (Aparelho)", price: 0, isIncluded: true },
        { procedureName: "Uréia", price: 0, isIncluded: true }
      ],
      "Procedimentos e Vacinas": [
        { procedureName: "Coleta de Exames de sangue", price: 0, isIncluded: true },
        { procedureName: "Anestesia local / Tranquilização", price: 0, isIncluded: true },
        { procedureName: "Vacina de Raiva", price: 0, isIncluded: true },
        { procedureName: "Vacina Polivalente (V7, V8, V10)", price: 0, isIncluded: true },
        { procedureName: "Vacina Quádrupla V4", price: 0, isIncluded: true },
        { procedureName: "Vacina Tríplice (V3)", price: 0, isIncluded: true }
      ],
      "Benefícios Especiais": [
        { procedureName: "Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário normal (segunda a sábado de 08 às 20h)", price: 0, isIncluded: true },
        { procedureName: "Vacinas (consultar cobertura)", price: 0, isIncluded: true },
        { procedureName: "Exames de sangue e imagem (consultar cobertura)", price: 0, isIncluded: true }
      ]
    },
    "PLATINUM": {
      "Consultas": [
        { procedureName: "Consulta Clínica Geral", price: 0, isIncluded: true },
        { procedureName: "Retorno Clínico", price: 0, isIncluded: true }
      ],
      "Especialistas": [
        { procedureName: "Atestado de Saúde", price: 0, isIncluded: true },
        { procedureName: "Consulta Cardiologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Dentista", price: 0, isIncluded: true },
        { procedureName: "Consulta Dermatologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Oncologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Ortopedista", price: 0, isIncluded: true },
        { procedureName: "Consulta Plantão", price: 0, isIncluded: true }
      ],
      "Cirurgia Eletiva": [
        { procedureName: "Drenagem de Abscesso/Hematoma", price: 0, isIncluded: true },
        { procedureName: "Drenagem de Otohematoma Unilateral", price: 0, isIncluded: true },
        { procedureName: "Orquiectomia (até 15kg)", price: 0, isIncluded: true },
        { procedureName: "Orquiectomia (gato)", price: 0, isIncluded: true },
        { procedureName: "Orquiectomia/Ablação (acima de 15kg)", price: 0, isIncluded: true },
        { procedureName: "OSH / Ovariohisterectomia (acima de 15kg)", price: 0, isIncluded: true },
        { procedureName: "OSH / Ovariohisterectomia (gata)", price: 0, isIncluded: true },
        { procedureName: "OSH / Ovariohisterectomia (coelhos e similares)", price: 0, isIncluded: true },
        { procedureName: "OSH / Ovariohisterectomia (até 15kg)", price: 0, isIncluded: true }
      ],
      "Exames de Imagem": [
        { procedureName: "Ultrassonografia", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Guiada", price: 0, isIncluded: true },
        { procedureName: "ECG Canino/Felino", price: 0, isIncluded: true },
        { procedureName: "Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)", price: 0, isIncluded: true },
        { procedureName: "Estudo de Pelve", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiológico de Traqueia", price: 0, isIncluded: true },
        { procedureName: "Estudo do Pescoço", price: 0, isIncluded: true },
        { procedureName: "Estudos de Membros Pélvicos e Torácicos (diversos segmentos)", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Abdômen", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Crânio", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Tórax", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiológico de Esôfago", price: 0, isIncluded: true },
        { procedureName: "Ultrassom Guiada p/ CAAF", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Controle", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Ocular", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Animal Silvestre", price: 0, isIncluded: true }
      ],
      "Procedimentos e Anestesia": [
        { procedureName: "Coleta de Exames de Sangue", price: 0, isIncluded: true },
        { procedureName: "Aplicação IM, SC, IV (sem material)", price: 0, isIncluded: true },
        { procedureName: "Aplicação IM, SC, IV (sem material/domicílio)", price: 0, isIncluded: true },
        { procedureName: "Aferição de Pressão Arterial", price: 0, isIncluded: true },
        { procedureName: "Consulta para Cirurgia", price: 0, isIncluded: true },
        { procedureName: "Consulta p/ Internação", price: 0, isIncluded: true },
        { procedureName: "Limpeza de Pós-Operatório", price: 0, isIncluded: true },
        { procedureName: "Nebulização", price: 0, isIncluded: true },
        { procedureName: "Oxigenioterapia", price: 0, isIncluded: true },
        { procedureName: "Teste de Fluoresceína", price: 0, isIncluded: true },
        { procedureName: "Teste de Shirmer", price: 0, isIncluded: true },
        { procedureName: "Tratamento Miíase (remoção grande)", price: 0, isIncluded: true },
        { procedureName: "Tratamento Miíase (remoção pequena)", price: 0, isIncluded: true },
        { procedureName: "Anestesia Local / Tranquilização", price: 0, isIncluded: true },
        { procedureName: "Adicional Hora Cirúrgica", price: 0, isIncluded: true },
        { procedureName: "Anestesia Epidural", price: 0, isIncluded: true },
        { procedureName: "Anestesia Geral Endovenosa", price: 0, isIncluded: true },
        { procedureName: "Anestesia Inalatória (até 5kg)", price: 0, isIncluded: true },
        { procedureName: "Anestesia Inalatória (5 a 15kg)", price: 0, isIncluded: true },
        { procedureName: "Anestesia Inalatória (acima de 15kg)", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais Simples": [
        { procedureName: "Alanina Aminotransferase (TGP/ALT)", price: 0, isIncluded: true },
        { procedureName: "Albumina", price: 0, isIncluded: true },
        { procedureName: "Aspartato Aminotransferase (TGO/AST)", price: 0, isIncluded: true },
        { procedureName: "Bilirrubinas – totais e frações", price: 0, isIncluded: true },
        { procedureName: "Creatinina", price: 0, isIncluded: true },
        { procedureName: "Fosfatase Alcalina", price: 0, isIncluded: true },
        { procedureName: "Fósforo UV", price: 0, isIncluded: true },
        { procedureName: "Gama Glutamil Transferase (GGT)", price: 0, isIncluded: true },
        { procedureName: "Hemograma", price: 0, isIncluded: true },
        { procedureName: "Parasitológico de Fezes", price: 0, isIncluded: true },
        { procedureName: "Proteínas Totais", price: 0, isIncluded: true },
        { procedureName: "Relação Proteína/Creatinina Urinária (UPC)", price: 0, isIncluded: true },
        { procedureName: "Sumário de Urina", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia (Aparelho)", price: 0, isIncluded: true },
        { procedureName: "Uréia", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais Complexos": [
        { procedureName: "Cálcio sérico ou urinário", price: 0, isIncluded: true },
        { procedureName: "Cálculo Renal – Análise físico-química", price: 0, isIncluded: true },
        { procedureName: "Citologia do Ouvido", price: 0, isIncluded: true },
        { procedureName: "Citologia Vaginal", price: 0, isIncluded: true },
        { procedureName: "Colesterol Total", price: 0, isIncluded: true },
        { procedureName: "Curva Glicêmica", price: 0, isIncluded: true },
        { procedureName: "Dosagem de Cálcio Iônico", price: 0, isIncluded: true },
        { procedureName: "Fibrinogênio", price: 0, isIncluded: true },
        { procedureName: "Função Hepática", price: 0, isIncluded: true },
        { procedureName: "Função Renal", price: 0, isIncluded: true },
        { procedureName: "Hemograma c/ Reticulócitos", price: 0, isIncluded: true },
        { procedureName: "Lipidograma (Colesterol + HDL + LDL + Triglicerídeos)", price: 0, isIncluded: true },
        { procedureName: "Microscopia para Sarna", price: 0, isIncluded: true },
        { procedureName: "Pesquisa de Hemoparasitas", price: 0, isIncluded: true },
        { procedureName: "Pesquisa de Microfilárias", price: 0, isIncluded: true },
        { procedureName: "Tricograma", price: 0, isIncluded: true },
        { procedureName: "Triglicerídeos", price: 0, isIncluded: true }
      ],
      "Vacinas": [
        { procedureName: "Vacina de Raiva", price: 0, isIncluded: true },
        { procedureName: "Vacina Polivalente (V7, V8, V10)", price: 0, isIncluded: true },
        { procedureName: "Vacina Quádrupla (V4)", price: 0, isIncluded: true },
        { procedureName: "Vacina Tríplice (V3)", price: 0, isIncluded: true },
        { procedureName: "Vacina de Gripe", price: 0, isIncluded: true }
      ],
      "Benefícios Especiais": [
        { procedureName: "Desconto de 20% em serviços, medicamentos e materiais não cobertos pelo plano", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário normal: segunda a sábado, 08h–20h", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário de plantão: segunda a sábado, 20h–08h + domingos e feriados", price: 0, isIncluded: true },
        { procedureName: "Consultas com especialistas: verificar especialidades disponíveis", price: 0, isIncluded: true },
        { procedureName: "Vacinas, exames de sangue, exames de imagem e cirurgias eletivas: consultar cobertura", price: 0, isIncluded: true }
      ]
    },
    "INFINITY": {
      "Consultas": [
        { procedureName: "Consulta Clínica Geral", price: 0, isIncluded: true },
        { procedureName: "Retorno Clínico", price: 0, isIncluded: true }
      ],
      "Especialistas": [
        { procedureName: "Atestado de Saúde", price: 0, isIncluded: true },
        { procedureName: "Consulta Cardiologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Dentista", price: 0, isIncluded: true },
        { procedureName: "Consulta Dermatologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Oncologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Ortopedista", price: 0, isIncluded: true },
        { procedureName: "Consulta Plantão", price: 0, isIncluded: true },
        { procedureName: "Consulta Nefrologista", price: 0, isIncluded: true },
        { procedureName: "Consulta Neurologista", price: 0, isIncluded: true },
        { procedureName: "Taxa de Retorno", price: 0, isIncluded: true }
      ],
      "Vacinas": [
        { procedureName: "Vacina de Raiva", price: 0, isIncluded: true },
        { procedureName: "Vacina Polivalente (V7, V8, V10)", price: 0, isIncluded: true },
        { procedureName: "Vacina Quádrupla v4", price: 0, isIncluded: true },
        { procedureName: "Vacina Tríplice (V3)", price: 0, isIncluded: true },
        { procedureName: "Vacina de Gripe", price: 0, isIncluded: true },
        { procedureName: "Vacina Giardia", price: 0, isIncluded: true },
        { procedureName: "Vacina Quíntupla (V5, v3 ou v4+felv)", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais": [
        { procedureName: "Alanina Aminotransferase (TGP/ALT)", price: 0, isIncluded: true },
        { procedureName: "Albumina", price: 0, isIncluded: true },
        { procedureName: "Aspartato Aminotransferase (TGO/AST)", price: 0, isIncluded: true },
        { procedureName: "Bilirrubinas - totais e frações", price: 0, isIncluded: true },
        { procedureName: "Creatinina", price: 0, isIncluded: true },
        { procedureName: "Fosfatase Alcalina", price: 0, isIncluded: true },
        { procedureName: "Fósforo UV", price: 0, isIncluded: true },
        { procedureName: "Gama Glutamil Transferase (GGT)", price: 0, isIncluded: true },
        { procedureName: "Hemograma", price: 0, isIncluded: true },
        { procedureName: "Parasitológico de Fezes", price: 0, isIncluded: true },
        { procedureName: "Proteínas Totais", price: 0, isIncluded: true },
        { procedureName: "Relação Proteína / Creatinina Urinária (UPC)", price: 0, isIncluded: true },
        { procedureName: "Sumário de Urina", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia", price: 0, isIncluded: true },
        { procedureName: "Teste de Glicemia (Aparelho)", price: 0, isIncluded: true },
        { procedureName: "Uréia", price: 0, isIncluded: true },
        { procedureName: "Cálcio sérico ou urinário", price: 0, isIncluded: true },
        { procedureName: "Cálculo renal Análise físico química", price: 0, isIncluded: true },
        { procedureName: "Citologia do Ouvido", price: 0, isIncluded: true },
        { procedureName: "Citologia Vaginal", price: 0, isIncluded: true },
        { procedureName: "Colesterol total", price: 0, isIncluded: true },
        { procedureName: "Curva Glicêmica", price: 0, isIncluded: true },
        { procedureName: "Dosagem de Cálcio Iônico", price: 0, isIncluded: true },
        { procedureName: "FIBRINOGÊNIO", price: 0, isIncluded: true },
        { procedureName: "Função hepática", price: 0, isIncluded: true },
        { procedureName: "Função renal", price: 0, isIncluded: true },
        { procedureName: "Hemograma com contagem de reticulócitos", price: 0, isIncluded: true },
        { procedureName: "Lipidograma (Colesterol + HDL + LDL + Triglicerídeos)", price: 0, isIncluded: true },
        { procedureName: "Microscopia para Sarna", price: 0, isIncluded: true },
        { procedureName: "Pesquisa de hemoparasitas", price: 0, isIncluded: true },
        { procedureName: "Pesquisa de Microfilárias", price: 0, isIncluded: true },
        { procedureName: "Tricograma", price: 0, isIncluded: true },
        { procedureName: "Triglicerídeos", price: 0, isIncluded: true }
      ],
      "Exames Laboratoriais Complexos": [
        { procedureName: "Análise de Líquido Cavitário", price: 0, isIncluded: true },
        { procedureName: "Análise de líquor (LCR)", price: 0, isIncluded: true },
        { procedureName: "Biópsia / histopatológico", price: 0, isIncluded: true },
        { procedureName: "Biópsia de pele", price: 0, isIncluded: true },
        { procedureName: "Citologia / CAAF - nódulo superficial", price: 0, isIncluded: true },
        { procedureName: "CITOLOGIA DE LAVADO BRONCOALVEOLAR", price: 0, isIncluded: true },
        { procedureName: "Citologia de pele (Fungo e Bactéria)", price: 0, isIncluded: true },
        { procedureName: "Compatibilidade sanguínea (doador adicional)", price: 0, isIncluded: true },
        { procedureName: "Cortisol Pós Supressão Dexametasona", price: 0, isIncluded: true },
        { procedureName: "Cortisol Pré e Pós Dexametasona", price: 0, isIncluded: true },
        { procedureName: "ELISA (LEISHMANIOSE CANINA) LEISH IDEXX", price: 0, isIncluded: true },
        { procedureName: "Lactato", price: 0, isIncluded: true },
        { procedureName: "Mielograma", price: 0, isIncluded: true },
        { procedureName: "Necropsia (05 até 15kg)", price: 0, isIncluded: true },
        { procedureName: "Necropsia (acima de 15kg)", price: 0, isIncluded: true },
        { procedureName: "Necropsia (até 05kg)", price: 0, isIncluded: true },
        { procedureName: "Necropsia Estética (05kg até 15kg)", price: 0, isIncluded: true },
        { procedureName: "Necropsia Estética (acima de 15kg)", price: 0, isIncluded: true },
        { procedureName: "Necropsia Estética (até 05kg)", price: 0, isIncluded: true },
        { procedureName: "NT PROBNP CANINO", price: 0, isIncluded: true },
        { procedureName: "PCR PARA LEISHMANIA", price: 0, isIncluded: true },
        { procedureName: "Pesquisa/parasitológico para Leishmania (pele, medula e linfonodo)", price: 0, isIncluded: true },
        { procedureName: "Procalcitonina", price: 0, isIncluded: true },
        { procedureName: "Teste de compatibilidade sanguínea", price: 0, isIncluded: true },
        { procedureName: "Teste de Coombs", price: 0, isIncluded: true },
        { procedureName: "TESTE FIV FELV PRODVET/BIOCLIN", price: 0, isIncluded: true },
        { procedureName: "TESTE RÁPIDO CINOMOSE E PARVOVIROSE ACCUVET", price: 0, isIncluded: true },
        { procedureName: "Teste rápido de cinomose/antígeno (ALERE)", price: 0, isIncluded: true },
        { procedureName: "Teste Rápido de Erliquiose (Immunocombo IGG)", price: 0, isIncluded: true },
        { procedureName: "Teste Rápido de Erliquiose SNAP 4DX (IDEXX)", price: 0, isIncluded: true },
        { procedureName: "Teste Rápido de Fiv/Felv (IDEXX)", price: 0, isIncluded: true },
        { procedureName: "TESTE RÁPIDO LEISHMANIOSE AC ACCUVET", price: 0, isIncluded: true },
        { procedureName: "Teste rápido para cinomose e parvovirose (IGM)", price: 0, isIncluded: true },
        { procedureName: "Teste Rápido Parvo/Corona (ALERE)", price: 0, isIncluded: true },
        { procedureName: "TESTE RÁPIDO TOXOPLASMOSE IGG/IGM ACCUVET", price: 0, isIncluded: true }
      ],
      "Exames de Imagem": [
        { procedureName: "Ultrassonografia", price: 0, isIncluded: true },
        { procedureName: "ECG (Eletrocardiograma) canino / felino", price: 0, isIncluded: true },
        { procedureName: "Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)", price: 0, isIncluded: true },
        { procedureName: "Estudo de Pelve", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiológico de Traqueia", price: 0, isIncluded: true },
        { procedureName: "Estudo do Pescoço", price: 0, isIncluded: true },
        { procedureName: "Estudos de Membros Pélvicos", price: 0, isIncluded: true },
        { procedureName: "Estudos de Membros Torácicos", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Abdômen", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Crânio", price: 0, isIncluded: true },
        { procedureName: "Estudo Radiográfico de Tórax", price: 0, isIncluded: true },
        { procedureName: "Ultrassom Guiada para CAAF", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Controle", price: 0, isIncluded: true },
        { procedureName: "Ultrassonografia Ocular", price: 0, isIncluded: true },
        { procedureName: "BRONCOSCOPIA E LAVADO BRONQUEOALVEOLAR", price: 0, isIncluded: true },
        { procedureName: "COLONOSCOPIA DIAGNÓSTICA", price: 0, isIncluded: true },
        { procedureName: "ECO (Ecocardiograma)", price: 0, isIncluded: true },
        { procedureName: "ELETROQUIMIOTERAPIA", price: 0, isIncluded: true },
        { procedureName: "Eletroretinograma", price: 0, isIncluded: true },
        { procedureName: "Tomografia Computadorizada", price: 0, isIncluded: true },
        { procedureName: "Mielografia Contrastada", price: 0, isIncluded: true }
      ],
      "Procedimentos Ambulatoriais": [
        { procedureName: "Coleta de Exames de Sangue", price: 0, isIncluded: true },
        { procedureName: "Aplicações IM, SC, IV", price: 0, isIncluded: true },
        { procedureName: "Aferição da Pressão arterial", price: 0, isIncluded: true },
        { procedureName: "Nebulização", price: 0, isIncluded: true },
        { procedureName: "Oxigenioterapia", price: 0, isIncluded: true },
        { procedureName: "Acupuntura", price: 0, isIncluded: true },
        { procedureName: "Bomba de infusão", price: 0, isIncluded: true },
        { procedureName: "Fluidoterapia", price: 0, isIncluded: true },
        { procedureName: "Transfusão de sangue", price: 0, isIncluded: true }
      ],
      "Benefícios Especiais": [
        { procedureName: "Desconto de 30% em medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário normal (segunda a sábado de 08 às 20h)", price: 0, isIncluded: true },
        { procedureName: "Consulta em horário plantão (segunda a sábado de 20 às 08h, domingos e feriados)", price: 0, isIncluded: true },
        { procedureName: "Consulta especialista (consultar especialidades)", price: 0, isIncluded: true },
        { procedureName: "Vacinas, exames de sangue, exames de imagem, cirurgias eletivas e complexas (consultar cobertura)", price: 0, isIncluded: true }
      ]
    }
  };



  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name || "",
        price: plan.price || "",
        planType: plan.planType || "com_coparticipacao",
        features: plan.features || [],
        description: plan.description || "",
        image: plan.image || "",
        buttonText: plan.buttonText || "Contratar Plano",
        displayOrder: plan.displayOrder || 0,
        isActive: plan.isActive ?? true,
      });
    }
  }, [plan, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiRequest("PUT", `/api/plans/${params.id}`, data);
      } else {
        await apiRequest("POST", "/api/plans", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: isEdit ? "Plano atualizado" : "Plano criado",
        description: isEdit ? "Plano foi atualizado com sucesso." : "Plano foi criado com sucesso.",
      });
      setLocation("/planos");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar plano." : "Falha ao criar plano.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Primeiro, salva o plano
      const planData = {
        ...data,
        price: parseFloat(data.price).toString(),
      };

      let planId;
      if (isEdit) {
        await apiRequest("PUT", `/api/plans/${params.id}`, planData);
        planId = params.id;
      } else {
        const response = await apiRequest("POST", "/api/plans", planData);
        planId = response.id;
      }

      // Depois, salva os procedimentos para cada benefício
      for (const [benefitName, procedures] of Object.entries(benefitProcedures)) {
        for (const procedure of procedures as any[]) {
          if (procedure.procedureName.trim()) {
            await apiRequest("POST", "/api/plan-procedures", {
              planId,
              benefitName,
              procedureName: procedure.procedureName,
              description: procedure.description || "",
              price: Math.round((procedure.price || 0) * 100), // converte para centavos
              isIncluded: procedure.isIncluded,
              displayOrder: 0
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: isEdit ? "Plano atualizado" : "Plano criado",
        description: isEdit ? "Plano foi atualizado com sucesso." : "Plano foi criado com sucesso.",
      });
      setLocation("/planos");
    } catch (error) {
      toast({
        title: "Erro",
        description: isEdit ? "Falha ao atualizar plano." : "Falha ao criar plano.",
        variant: "destructive",
      });
    }
  };


  if (isEdit && isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/planos")}
          data-testid="button-back-to-plans"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Editar Plano" : "Novo Plano"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Atualize as informações do plano" : "Crie um novo plano de saúde"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-plan-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Mensal (R$) *</FormLabel>
                      <FormControl>
                        <InputMasked 
                          {...field} 
                          mask="price"
                          placeholder="0,00"
                          data-testid="input-price" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Plano *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-plan-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAN_TYPES.flatMap((type, index) => [
                            <SelectItem key={type} value={type} className="py-3 pl-10 pr-4">
                              {getPlanTypeLabel(type)}
                            </SelectItem>,
                            ...(index < PLAN_TYPES.length - 1 ? [<Separator key={`separator-${type}`} />] : [])
                          ])}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Plano Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Planos ativos podem ser contratados por clientes
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-plan-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Benefícios do Plano</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFeature("")}
                data-testid="button-add-feature"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Descreva o benefício"
                              data-testid={`input-feature-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      data-testid={`button-remove-feature-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {featureFields.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum benefício adicionado ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Procedimentos por Benefício */}
          {featureFields.map((field, index) => {
            const benefitName = form.getValues(`features.${index}`) || "";
            const procedures = benefitProcedures[benefitName] || [];
            
            return (
              <Card key={field.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground">
                    {benefitName || `Benefício ${index + 1}`}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addProcedureToBenefit(benefitName)}
                    data-testid={`button-add-procedure-${index}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Procedimento
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {procedures.map((procedure, procIndex) => (
                      <div key={procIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Nome do Procedimento
                          </label>
                          <Input
                            value={procedure.procedureName}
                            onChange={(e) => updateProcedureInBenefit(benefitName, procIndex, "procedureName", e.target.value)}
                            placeholder="Ex: Consulta Clínica"
                            data-testid={`input-procedure-name-${index}-${procIndex}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Preço (R$)
                          </label>
                          <InputMasked
                            mask="price"
                            value={procedure.price}
                            onChange={(e) => updateProcedureInBenefit(benefitName, procIndex, "price", parseFloat(e.target.value.replace(",", ".")) || 0)}
                            placeholder="0,00"
                            data-testid={`input-procedure-price-${index}-${procIndex}`}
                          />
                        </div>

                        <div className="flex items-end space-x-2" style={{ marginTop: '1.5rem' }}>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={procedure.isIncluded}
                              onCheckedChange={(checked) => updateProcedureInBenefit(benefitName, procIndex, "isIncluded", checked)}
                              data-testid={`switch-procedure-included-${index}-${procIndex}`}
                            />
                            <label className="text-sm text-foreground">Incluído</label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProcedureFromBenefit(benefitName, procIndex)}
                            data-testid={`button-remove-procedure-${index}-${procIndex}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {procedures.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum procedimento adicionado para este benefício.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/planos")}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending}
              data-testid="button-save"
            >
              {mutation.isPending ? "Salvando..." : isEdit ? "Atualizar" : "Criar Plano"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
