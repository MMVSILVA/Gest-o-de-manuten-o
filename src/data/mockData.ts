/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Colaborador, Equipamento, OrdemServico } from "../types";

export const COLABORADORES_PADRAO: Colaborador[] = [
  { id: "1001", nome: "Letícia Cabral", matricula: "1001", cargo: "Gestor", senhaText: "senai123", timestampCadastro: Date.now() - 50000000 },
  { id: "1002", nome: "Isabelle Nunes", matricula: "1002", cargo: "Técnico", senhaText: "tecnico12", timestampCadastro: Date.now() - 40000000 },
  { id: "1003", nome: "Maria Victória", matricula: "1003", cargo: "Técnico", senhaText: "tecnico34", timestampCadastro: Date.now() - 30000000 },
  { id: "1004", nome: "Nicole Caroline", matricula: "1004", cargo: "Instrutor", senhaText: "mecanico1", timestampCadastro: Date.now() - 20000000 },
  { id: "1005", nome: "Débora Letícia", matricula: "1005", cargo: "Gestor", senhaText: "gestor10", timestampCadastro: Date.now() - 10000000 },
  { id: "1006", nome: "Carlos Mendes", matricula: "1006", cargo: "Instrutor", senhaText: "mecanico2", timestampCadastro: Date.now() - 5000000 },
  { id: "1007", nome: "Ana Beatriz Sousa", matricula: "1007", cargo: "Técnico", senhaText: "tecnico07", timestampCadastro: Date.now() - 4000000 },
  { id: "1008", nome: "Roberto Almeida", matricula: "1008", cargo: "Instrutor", senhaText: "instrutor1", timestampCadastro: Date.now() - 3000000 },
  { id: "1009", nome: "Fernanda Costa", matricula: "1009", cargo: "Técnico", senhaText: "tecnico3", timestampCadastro: Date.now() - 2000000 },
  { id: "1010", nome: "João Pedro Ramos", matricula: "1010", cargo: "Instrutor", senhaText: "instrutor2", timestampCadastro: Date.now() - 1000000 },
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
    fotos: []
  },
  {
    id: "eq2",
    nome: "Retífica Plana Mello",
    modelo: "Mello 500",
    setor: "Acabamento",
    status: "Operacional",
    responsavel: "Nicole Caroline",
    docs: {},
    fotos: []
  },
  {
    id: "eq3",
    nome: "Torno Convencional T-14",
    modelo: "Romi T-14",
    setor: "Usinagem Básica",
    status: "Operacional",
    responsavel: "Isabelle Nunes",
    docs: {},
    fotos: []
  },
  {
    id: "eq4",
    nome: "Furadeira de Bancada Schulz",
    modelo: "Schulz 16",
    setor: "Montagem",
    status: "Em Manutenção",
    responsavel: "Maria Victória",
    docs: {},
    fotos: []
  },
  {
    id: "eq5",
    nome: "Serra de Fita Starrett",
    modelo: "Starrett S-10",
    setor: "Corte",
    status: "Crítico",
    responsavel: "Nicole Caroline",
    docs: {},
    fotos: []
  },
  {
    id: "eq6",
    nome: "Bancada de Ajustagem 01",
    modelo: "Padrão",
    setor: "Ajustagem",
    status: "Operacional",
    responsavel: "Equipe Geral",
    docs: {},
    fotos: []
  },
  {
    id: "eq7",
    nome: "Compressor Radial 03",
    modelo: "Atlas Copco 50",
    setor: "Pneumática",
    status: "Operacional",
    responsavel: "Letícia Cabral",
    docs: {},
    fotos: []
  },
  {
    id: "eq8",
    nome: "Esteira Industrial K2",
    modelo: "K2-Series",
    setor: "Automação",
    status: "Operacional",
    responsavel: "Isabelle Nunes",
    docs: {},
    fotos: []
  }
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
  if (!localStorage.getItem("manutech_colaboradores")) {
    localStorage.setItem("manutech_colaboradores", JSON.stringify(COLABORADORES_PADRAO));
  }
  if (!localStorage.getItem("manutech_equipamentos")) {
    localStorage.setItem("manutech_equipamentos", JSON.stringify(EQUIPAMENTOS_PADRAO));
  }
  if (!localStorage.getItem("manutech_ordens")) {
    localStorage.setItem("manutech_ordens", JSON.stringify(getOrdensPadrao()));
  }
}
