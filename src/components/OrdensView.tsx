/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ClipboardList, Search, PlusCircle, Trash2, CheckCircle, Clock, Lock, ShieldAlert 
} from "lucide-react";
import { OrdemServico, Colaborador } from "../types";

interface Props {
  ordens: OrdemServico[];
  colaboradorLogado: Colaborador | null;
  onNavigate: (view: any) => void;
  onAlterarStatus: (id: string, novo: 'Em Andamento' | 'Concluído') => void;
  onExcluirOS: (id: string) => void;
}

export const OrdensView: React.FC<Props> = ({
  ordens,
  colaboradorLogado,
  onNavigate,
  onAlterarStatus,
  onExcluirOS
}) => {
  const [busca, setBusca] = useState("");

  const filtrarOrdens = useMemo(() => {
    const b = busca.toLowerCase().trim();
    if (!b) return ordens;
    return ordens.filter(o => 
      o.equipamento.toLowerCase().includes(b) ||
      o.solicitante.toLowerCase().includes(b) ||
      o.descricao.toLowerCase().includes(b) ||
      o.tipo.toLowerCase().includes(b) ||
      o.status.toLowerCase().includes(b)
    );
  }, [busca, ordens]);

  // Controles de Acesso Granulares por Cargo de Trabalho
  const isInstrutor = colaboradorLogado?.cargo === "Instrutor";
  
  // Usuário Instrutor é estritamente BLOQUEADO de Excluir O.S.!
  const bloquearExcluir = isInstrutor;

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Ordens de Serviço (O.S.)</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Registro histórico completo e digitalizado de preventivas, corretivas e auditorias regulatórias da oficina.
          </p>
        </div>

        {/* Habilita Nova O.S. apenas se não for Instrutor */}
        {!isInstrutor && (
          <button
            onClick={() => onNavigate('nova-os')}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Nova O.S.</span>
          </button>
        )}
      </div>

      {/* Caixa de Pesquisa Geral */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3 max-w-md">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Pesquise por equipamento, mecânico, descrição..."
          className="w-full text-slate-700 outline-none text-xs md:text-sm bg-transparent"
        />
      </div>

      {/* Tabela de Dados Geral */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-[10px]">Agendado para</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Equipamento</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Solicitante</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Prioridade</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Status</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
              {filtrarOrdens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                    Nenhuma ordem de serviço localizada para os parâmetros atuais.
                  </td>
                </tr>
              ) : (
                filtrarOrdens.map((os) => {
                  const corPrioridade = os.prioridade === 'Alta' 
                    ? 'bg-red-50 text-red-700 border border-red-100' 
                    : os.prioridade === 'Média' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100';

                  const badgeStatus = os.status === 'Concluído' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : os.status === 'Pendente' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200';

                  return (
                    <tr key={os.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">{os.data}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{os.equipamento}</td>
                      <td className="px-6 py-4 text-slate-500">{os.solicitante}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${corPrioridade}`}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStatus}`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 justify-center">
                          
                          {/* Botão de Ativar status se não for Instrutor */}
                          <button
                            disabled={isInstrutor}
                            onClick={() => onAlterarStatus(os.id, 'Em Andamento')}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 hover:text-amber-600 rounded-lg text-slate-500 border border-slate-150 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                            title={isInstrutor ? "Sem permissão" : "Definir como Em Andamento"}
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Andamento</span>
                          </button>

                          <button
                            disabled={isInstrutor}
                            onClick={() => onAlterarStatus(os.id, 'Concluído')}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-150 disabled:opacity-50 hover:text-green-650 rounded-lg text-slate-500 border border-slate-150 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                            title={isInstrutor ? "Sem permissão" : "Definir como Concluído"}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Concluir</span>
                          </button>

                          {/* REQUISITO: Bloquear o botão de excluir O.S no modo de Mecânico e Instrutor */}
                          {bloquearExcluir ? (
                            <span 
                              className="p-1.5 bg-slate-100 text-slate-400 rounded-lg border border-slate-200 cursor-not-allowed inline-flex items-center space-x-1 relative group"
                              title="Restrito: Bloqueado para Mecânicos e Instrutores"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[9px] font-extrabold text-slate-400">Lock</span>
                              
                              {/* Overlay de tooltip explicativo */}
                              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-[9px] px-2 py-1.5 rounded shadow whitespace-nowrap z-50">
                                Bloqueado para o cargo atual.
                              </div>
                            </span>
                          ) : (
                            <button
                              onClick={() => onExcluirOS(os.id)}
                              className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-slate-200 transition cursor-pointer"
                              title="Excluir O.S."
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
