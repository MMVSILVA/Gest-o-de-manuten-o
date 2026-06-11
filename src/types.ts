/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Cargo = 'Técnico' | 'Instrutor';

export interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
  cargo: Cargo;
  cargoDetalhado?: string; // e.g. "TECNICO EDUCACAO"
  unidade?: string; // e.g. "FIRJAN SENAI VOLTA REDONDA AERO CLUBE"
  senhaText?: string; // Para autenticação mais robusta
  timestampCadastro: number;
}

export interface DefeitoFoto {
  src: string;
  tipo: 'pdf' | 'img';
  descricao: string;
  data: string;
}

export interface PecaItem {
  id: string;
  nome: string;
  quantidade: number; // Estoque atual
  nivelMinimo: number; // Nível mínimo
}

export interface GrupoPeca {
  id: string;
  nome: string; // e.g. "Sistema de Transmissão", "Parte Elétrica"
  pecas: string[]; // e.g. ["Rolamento de Agulhas", "Servo Motor AC"]
  pecasDetalhes?: PecaItem[];
}

export interface Equipamento {
  id: string;
  nome: string;
  modelo: string;
  setor: string;
  status: 'Operacional' | 'Em Manutenção' | 'Crítico';
  responsavel: string;
  docs: {
    ficha?: string;
    manual?: string;
    treino?: string;
    [key: string]: string | undefined;
  };
  fotos: DefeitoFoto[];
  gruposPecas?: GrupoPeca[];
  mtbf?: number; // em horas
  mttr?: number; // em horas
  dataEntrada?: string; // data de entrada do equipamento
  pecaMaisProblematica?: string; // parte que dá mais problema
  criticidadePeca?: 'Baixa' | 'Média' | 'Alta' | 'Crítica'; // análise criticidade
}

export interface OrdemServico {
  id: string;
  equipamento: string;
  solicitante: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  tipo: 'Preventiva' | 'Corretiva' | 'Preditiva' | 'Treinamento' | 'Calibração';
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  descricao: string;
  data: string;
  timestamp: number;
  rawDate: string;
  dataConclusao?: string;
  timestampConclusao?: number;
}

export interface Chamado {
  id: string;
  equipamento: string;
  solicitante: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  tipo: 'Preventiva' | 'Corretiva' | 'Preditiva' | 'Treinamento' | 'Calibração';
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  descricao: string;
  data: string;
  timestamp: number;
  rawDate: string;
}

export interface AccessibilityConfig {
  vozAtiva: boolean;
  tamanhoFonte: 'padrao' | 'grande' | 'extra';
}
