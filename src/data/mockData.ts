/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Colaborador, Equipamento, OrdemServico } from "../types";
import { EQUIPAMENTOS_DO_ANEXO } from "./equipamentosAnexo";

export const COLABORADORES_PADRAO: Colaborador[] = [
  { id: "1001", nome: "Letícia Cabral", matricula: "1001", cargo: "Gestor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "senai123", timestampCadastro: Date.now() - 50000000 },
  { id: "1002", nome: "Isabelle Nunes", matricula: "1002", cargo: "Técnico", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "tecnico12", timestampCadastro: Date.now() - 40000000 },
  { id: "1003", nome: "Maria Victória", matricula: "1003", cargo: "Técnico", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "tecnico34", timestampCadastro: Date.now() - 30000000 },
  { id: "1004", nome: "Nicole Caroline", matricula: "1004", cargo: "Instrutor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "mecanico1", timestampCadastro: Date.now() - 20000000 },
  { id: "1005", nome: "Débora Letícia", matricula: "1005", cargo: "Gestor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "gestor10", timestampCadastro: Date.now() - 10000000 },
  { id: "1006", nome: "Carlos Mendes", matricula: "1006", cargo: "Instrutor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "mecanico2", timestampCadastro: Date.now() - 5000000 },
  { id: "1007", nome: "Ana Beatriz Sousa", matricula: "1007", cargo: "Técnico", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "tecnico07", timestampCadastro: Date.now() - 4000000 },
  { id: "1008", nome: "Roberto Almeida", matricula: "1008", cargo: "Instrutor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "instrutor1", timestampCadastro: Date.now() - 3000000 },
  { id: "1009", nome: "Fernanda Costa", matricula: "1009", cargo: "Técnico", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "tecnico3", timestampCadastro: Date.now() - 2000000 },
  { id: "1010", nome: "João Pedro Ramos", matricula: "1010", cargo: "Instrutor", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "instrutor2", timestampCadastro: Date.now() - 1000000 },
  { id: "1011", nome: "Alexandre da Silva", matricula: "1011", cargo: "Gestor", cargoDetalhado: "TECNICO EDUCACAO", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "alexandre123", timestampCadastro: Date.now() - 500000 },
  { id: "1012", nome: "Wesley de Souza Faria", matricula: "1012", cargo: "Gestor", cargoDetalhado: "TECNICO(A) EDUCACAO", unidade: "FIRJAN SENAI VOLTA REDONDA AERO CLUBE", senhaText: "wesley123", timestampCadastro: Date.now() - 450000 },
];

export const EQUIPAMENTOS_PADRAO: Equipamento[] = [
  {
    id: "eq1",
    nome: "Fresa CNC Haas TM-1",
    modelo: "Haas TM-1",
    setor: "Usinagem",
    status: "Operacional",
    responsavel: "Letícia Cabral",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp1_1", nome: "⚡ Painel Elétrico e CNC", pecas: ["Módulo PLC Siemens S7", "Disjuntor Bipolar 20A", "Contatores de Potência", "Fonte de Alimentação 24V DC"] },
      { id: "gp1_2", nome: "⚙️ Cabeçote Spindle e Fuso", pecas: ["Rolamentos Superprecisão Axial", "Motor de Indução 7.5HP", "Cone de Fixação BT40", "Retentores Viton"] },
      { id: "gp1_3", nome: "🛣️ Eixos Lineares (X, Y, Z)", pecas: ["Guias Lineares Retificadas", "Fuso de Esferas Recirculantes", "Servomotores Brushless Yaskawa", "Sensores de Fim de Curso Regulamentares"] }
    ]
  },
  {
    id: "eq2",
    nome: "Retífica Plana Mello",
    modelo: "Mello 500",
    setor: "Acabamento",
    status: "Operacional",
    responsavel: "Nicole Caroline",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp2_1", nome: "💧 Sistema Hidráulico", pecas: ["Bomba Hidráulica de Palhetas", "Filtro de Retorno 10 Microns", "Válvulas Direcionais Solenoides", "Pistão de Translação Lateral"] },
      { id: "gp2_2", nome: "🧲 Mesa Magnética de Fixação", pecas: ["Bobinas Eletromagnéticas Internas", "Chave Seletora Liga/Desliga", "Retificador de Corrente Integrado"] }
    ]
  },
  {
    id: "eq3",
    nome: "Torno Convencional T-14",
    modelo: "Romi T-14",
    setor: "Usinagem Básica",
    status: "Operacional",
    responsavel: "Isabelle Nunes",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp3_1", nome: "⚙️ Caixa Norton de Engrenagens", pecas: ["Conjunto de Engrenagens Retas", "Eixo ranhurado Sem-fim", "Retentor Principal de Óleo", "Alavanca de Mudança de Passo"] },
      { id: "gp3_2", nome: "🔩 Barramento e Placa Tratora", pecas: ["Placa de 3 Castanhas Autocentrantes", "Pinhões de Cremalheira", "Régua Cônica de Ajuste do Carro", "Parafuso Spindle do Escudo"] }
    ]
  },
  {
    id: "eq4",
    nome: "Furadeira de Bancada Schulz",
    modelo: "Schulz 16",
    setor: "Montagem",
    status: "Em Manutenção",
    responsavel: "Maria Victória",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp4_1", nome: "🔴 Transmissão por Polia e Correia", pecas: ["Correia Trapezoidal A-34", "Polias Variadoras de Velocidade", "Mecanismo Tensionador do Motor", "Proteção de Chapa de Aço Contra Acidentes"] },
      { id: "gp4_2", nome: "🔧 Eixo Árvore e Mandril", pecas: ["Mandril de Aperto Rápido 1/2\"", "Haste Cônica Morse 2", "Rolamentos de Rolos Cônicos Superior/Inferior"] }
    ]
  },
  {
    id: "eq5",
    nome: "Serra de Fita Starrett",
    modelo: "Starrett S-10",
    setor: "Corte",
    status: "Crítico",
    responsavel: "Nicole Caroline",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp5_1", nome: "📐 Guias e Volantes do Tensionador", pecas: ["Volante Tracionador Superior", "Volante Livre Inferior", "Guias Traseiros de Metal Duro (Vídea)", "Dispositivo de Mola Tensionadora de Fita"] },
      { id: "gp5_2", nome: "🧴 Refrigeração de Corte", pecas: ["Bomba Centrifuga de Fluido", "Bocal Duplo Regulador de Vazão", "Reservatório de Fluido Solúvel"] }
    ]
  },
  {
    id: "eq6",
    nome: "Bancada de Ajustagem 01",
    modelo: "Padrão",
    setor: "Ajustagem",
    status: "Operacional",
    responsavel: "Equipe Geral",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp6_1", nome: "🔩 Mecanismo da Morsa Giratória", pecas: ["Mordentes Estriados de Aço Liga", "Parafuso Rosca Quadrada de Avanço", "Porca de Bronze Fundido Coaxial", "Base Rotativa Sincronizada 360°"] }
    ]
  },
  {
    id: "eq7",
    nome: "Compressor Radial 03",
    modelo: "Atlas Copco 50",
    setor: "Pneumática",
    status: "Operacional",
    responsavel: "Letícia Cabral",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp7_1", nome: "🌬️ Bloco Compressor Alternativo", pecas: ["Pistão e Anel Segmentador", "Válvulas Lamelares de Palheta", "Mancal Deslizante Bipartido", "Filtro Selador Anti-partícula"] },
      { id: "gp7_2", nome: "🎛️ Dispositivos de Linha e Segurança", pecas: ["Pressostato de Operação Danfoss", "Válvula Reguladora de Pressão com Filtro", "Visor de Nível da Cuba de Lubrificante", "Purgador Mecânico de Purga Diária"] }
    ]
  },
  {
    id: "gp8_default",
    nome: "Esteira Industrial K2",
    modelo: "K2-Series",
    setor: "Automação",
    status: "Operacional",
    responsavel: "Isabelle Nunes",
    docs: {},
    fotos: [],
    gruposPecas: [
      { id: "gp8_1", nome: "⚙️ Motoredutor e Acionamento", pecas: ["Motoredutor SEW Eurodrive Heloidal", "Rolo Tracionador Emborrachado", "Mancais Autocompensadores Terminais", "Corrente de Transmissão Dupla"] },
      { id: "gp8_2", nome: "🏷️ Sensores e Lógica de Comando", pecas: ["Sensor Indutivo PNP M18", "Sensores Ópticos de Reflexão", "Módulo de Segurança Parada de Emergência", "Painel de Botoeiras Terminais"] }
    ]
  },
  ...EQUIPAMENTOS_DO_ANEXO
];

export function getOrdensPadrao(): OrdemServico[] {
  const agora = new Date();
  
  const formatD = (offsetDias: number, horas: number, minutos: number) => {
    const d = new Date(agora);
    d.setDate(d.getDate() + offsetDias);
    d.setHours(horas, minutos, 0, 0);
    const diaPad = String(d.getDate()).padStart(2, "0");
    const mesPad = String(d.getMonth() + 1).padStart(2, "0");
    const horaPad = String(d.getHours()).padStart(2, "0");
    const minPad = String(d.getMinutes()).padStart(2, "0");
    return `${diaPad}/${mesPad}/${d.getFullYear()} - ${horaPad}:${minPad}`;
  };

  return [
    {
      id: "os1",
      equipamento: "Fresa CNC Haas TM-1",
      solicitante: "Letícia Cabral",
      prioridade: "Alta",
      tipo: "Corretiva",
      status: "Em Andamento",
      descricao: "Falha no fuso principal detetada. Ruído incompatível ao rodar o cabeçote. Desgate primário dos rolamentos.",
      data: formatD(-1, 9, 30),
      timestamp: Date.now() - 86400000,
      rawDate: new Date(Date.now() - 86400000).toISOString().slice(0, 16)
    },
    {
      id: "os2",
      equipamento: "Retífica Plana Mello",
      solicitante: "Nicole Caroline",
      prioridade: "Média",
      tipo: "Preventiva",
      status: "Concluído",
      descricao: "Troca periódica de óleo hidráulico, substituição de filtros de sucção e calibração de batentes mecânicos.",
      data: formatD(0, 11, 0),
      timestamp: Date.now() - 36000000,
      rawDate: new Date(Date.now() - 36000000).toISOString().slice(0, 16)
    },
    {
      id: "os4",
      equipamento: "Furadeira de Bancada Schulz",
      solicitante: "Maria Victória",
      prioridade: "Baixa",
      tipo: "Calibração",
      status: "Pendente",
      descricao: "Aferição e calibração milimétrica do batente de curso do eixo Z por desalinhamento em lote de produção.",
      data: formatD(2, 10, 0),
      timestamp: Date.now() + 172800000,
      rawDate: new Date(Date.now() + 172800000).toISOString().slice(0, 16)
    },
    {
      id: "os5",
      equipamento: "Serra de Fita Starrett",
      solicitante: "Débora Letícia",
      prioridade: "Média",
      tipo: "Treinamento",
      status: "Concluído",
      descricao: "Treinamento prático sob supervisão do Instrutor SENAI. Instrução de segurança operacional e prevenção contra acidentes.",
      data: formatD(-3, 13, 0),
      timestamp: Date.now() - 250000000,
      rawDate: new Date(Date.now() - 250000000).toISOString().slice(0, 16)
    },
    {
      id: "os6",
      equipamento: "Bancada de Ajustagem 01",
      solicitante: "Carlos Mendes",
      prioridade: "Baixa",
      tipo: "Preventiva",
      status: "Em Andamento",
      descricao: "Instalação e alinhamento de novos mordentes de aço rápido nas morsas mecânicas n.º 2 e n.º 5.",
      data: formatD(0, 15, 0),
      timestamp: Date.now() - 100000,
      rawDate: new Date(Date.now() - 100000).toISOString().slice(0, 16)
    },
    {
      id: "os7",
      equipamento: "Compressor Radial 03",
      solicitante: "Ana Beatriz Sousa",
      prioridade: "Média",
      tipo: "Preditiva",
      status: "Pendente",
      descricao: "Varredura por termografia infravermelha agendada para detecção antecipada de hot-spots em mancal principal.",
      data: formatD(3, 8, 0),
      timestamp: Date.now() + 250000000,
      rawDate: new Date(Date.now() + 250000000).toISOString().slice(0, 16)
    },
    {
      id: "os9",
      equipamento: "Fresa CNC Haas TM-1",
      solicitante: "Fernanda Costa",
      prioridade: "Média",
      tipo: "Calibração",
      status: "Pendente",
      descricao: "Calibração anual dos transdutores lineares ópticos nos eixos cartesianos X, Y e Z.",
      data: formatD(6, 9, 0),
      timestamp: Date.now() + 510000000,
      rawDate: new Date(Date.now() + 510000000).toISOString().slice(0, 16)
    }
  ];
}

export function carregarSimulacaoLocalStorage() {
  const salvoColab = localStorage.getItem("manutech_colaboradores");
  if (!salvoColab || salvoColab.includes("Alexandre Rodrigues") || salvoColab.includes("Wesley Silva") || !salvoColab.includes("Alexandre da Silva")) {
    localStorage.setItem("manutech_colaboradores", JSON.stringify(COLABORADORES_PADRAO));
  }
  
  // Força re-inicialização caso a lista de equipamentos antiga esteja incompleta ou desatualizada
  const salvo = localStorage.getItem("manutech_equipamentos");
  if (!salvo || JSON.parse(salvo).length < 20 || salvo.includes("Alexandre Rodrigues") || salvo.includes("Wesley Silva")) {
    localStorage.setItem("manutech_equipamentos", JSON.stringify(EQUIPAMENTOS_PADRAO));
  }
  
  if (!localStorage.getItem("manutech_ordens")) {
    localStorage.setItem("manutech_ordens", JSON.stringify(getOrdensPadrao()));
  }
}
