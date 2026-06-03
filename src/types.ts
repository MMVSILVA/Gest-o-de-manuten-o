/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Cargo = 'Técnico' | 'Gestor' | 'Instrutor';

export interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
  cargo: Cargo;
  senhaText?: string; // Para autenticação mais robusta
  timestampCadastro: number;
}

export interface DefeitoFoto {
  src: string;
  tipo: 'pdf' | 'img';
  descricao: string;
  data: string;
}

export interface GrupoPeca {
  id: string;
  nome: string; // e.g. "Sistema de Transmissão", "Parte Elétrica"
  pecas: string[]; // e.g. ["Rolamento de Agulhas", "Servo Motor AC"]
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
