/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ClipboardList, Search, PlusCircle, Trash2, CheckCircle, Clock, Lock, ShieldAlert, Download, Eye, X, Calendar, User, FileText, Printer, AlertTriangle
} from "lucide-react";
import { OrdemServico, Colaborador } from "../types";
import { exportToCSV } from "../lib/export";

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
  const [osDetalhada, setOsDetalhada] = useState<OrdemServico | null>(null);

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
  
  // Apenas Gestores podem excluir O.S. (bloqueado para Técnicos, Mecânicos e Instrutores)
  const bloquearExcluir = colaboradorLogado?.cargo !== "Gestor";

  const handleExportCSV = () => {
    const headers = [
      { key: "id", label: "ID da O.S." },
      { key: "data", label: "Data de Agendamento" },
      { key: "equipamento", label: "Equipamento/Ativo" },
      { key: "solicitante", label: "Solicitante/Operador" },
      { key: "prioridade", label: "Prioridade" },
      { key: "tipo", label: "Tipo" },
      { key: "status", label: "Status Geral" },
      { key: "descricao", label: "Descrição Técnica" },
      { key: "dataConclusao", label: "Data de Conclusão" }
    ];
    exportToCSV(ordens, headers, "ordens_servico_manutech");
  };

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

        <div className="flex flex-wrap gap-2">
          {/* Botão de Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow-xs border border-slate-200 cursor-pointer self-start md:self-auto"
            title="Exportar Todas as Ordens de Serviço em formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Lista</span>
          </button>

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
                        {os.status === 'Concluído' && os.dataConclusao && (
                          <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                            Concluído em: <span className="text-emerald-600 font-bold">{os.dataConclusao}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 justify-center">
                          
                          {/* Botão de Ver O.S. Detalhado */}
                          <button
                            onClick={() => setOsDetalhada(os)}
                            className="p-1 px-2.5 bg-blue-55 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-blue-600 border border-blue-200 text-[10px] font-extrabold transition flex items-center space-x-1 cursor-pointer"
                            title="Visualizar laudo e detalhes completos da O.S."
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Ver O.S.</span>
                          </button>

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

                          {/* REQUISITO: Adicionar o botão de excluir somente para gestor */}
                          {!bloquearExcluir && (
                            <button
                              onClick={() => onExcluirOS(os.id)}
                              className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg border border-red-200 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="Excluir O.S."
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Excluir</span>
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

      {/* Modal de Detalhes Completos da O.S - Ordem de Serviço */}
      {osDetalhada && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Cabeçalho */}
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="text-blue-500 w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center space-x-1">
                    <span>Detalhes da Ordem de Serviço</span>
                    <span className="font-mono font-bold text-blue-400">#{osDetalhada.id}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Documentação técnica oficial - Manutech SENAI</p>
                </div>
              </div>
              <button 
                onClick={() => setOsDetalhada(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Fechar Detalhes"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
              
              {/* Resumo Rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Lado Esquerdo */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Informações Gerais</span>
                  
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500">Equipamento / Ativo:</p>
                    <p className="text-xs font-extrabold text-slate-900 bg-slate-100 p-2 rounded-lg">{osDetalhada.equipamento}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Solicitante Técnico:</p>
                    <p className="text-xs font-bold text-slate-800">{osDetalhada.solicitante}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Tipo de Intervenção:</p>
                    <span className="inline-block text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-sm border">
                      {osDetalhada.tipo}
                    </span>
                  </div>
                </div>

                {/* Lado Direito */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Status & Prazos</span>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Prioridade da Intervenção:</p>
                    <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      osDetalhada.prioridade === 'Alta' 
                        ? 'bg-rose-100 text-rose-800 border-rose-200' 
                        : osDetalhada.prioridade === 'Média' 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {osDetalhada.prioridade}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Status Geral:</p>
                    <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      osDetalhada.status === 'Concluído' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : osDetalhada.status === 'Pendente' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {osDetalhada.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Agendamento Planejado:</p>
                    <p className="text-xs font-mono font-bold text-slate-700 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                      <span>{osDetalhada.data}</span>
                    </p>
                  </div>

                  {osDetalhada.status === 'Concluído' && osDetalhada.dataConclusao && (
                    <div className="space-y-1 pt-1.5 border-t border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold">Término Realizado:</p>
                      <p className="text-xs font-mono font-black text-emerald-600">
                        {osDetalhada.dataConclusao}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Corpo da Descrição */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Laudo de Descrição Técnica & Observações</span>
                </div>
                <div className="text-xs md:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                  {osDetalhada.descricao}
                </div>
              </div>

              {/* Alerta ISO / Normativas Adicionais */}
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-amber-800 leading-normal font-medium">
                  <strong>Padrão de Segurança NR-12:</strong> Certifique-se de que todas as travas mecânicas e bloqueios LOTO (Log Out / Tag Out) estejam operantes nesta máquina antes de iniciar os trabalhos descritos nesta ordem de serviço.
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Botão de Impressão */}
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir O.S.</span>
              </button>

              <div className="flex space-x-2">
                {/* Alterar Status Direto se não for Instrutor */}
                {!isInstrutor && osDetalhada.status !== 'Concluído' && (
                  <>
                    {osDetalhada.status === 'Pendente' && (
                      <button
                        onClick={() => {
                          onAlterarStatus(osDetalhada.id, 'Em Andamento');
                          setOsDetalhada(prev => prev ? { ...prev, status: 'Em Andamento' } : null);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-amber-100"
                      >
                        Iniciar Atividade
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onAlterarStatus(osDetalhada.id, 'Concluído');
                        setOsDetalhada(prev => prev ? { ...prev, status: 'Concluído', dataConclusao: new Date().toLocaleDateString("pt-BR") + " - " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) } : null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-100"
                    >
                      Concluir Trabalho
                    </button>
                  </>
                )}

                <button
                  onClick={() => setOsDetalhada(null)}
                  className="px-4 py-2 border rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                >
                  Fechar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
