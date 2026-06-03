/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlusSquare, Hammer, Wind, Cpu, Settings, User, LayoutGrid, List, Download, Search, Eye, FileText } from "lucide-react";
import { Equipamento, Colaborador } from "../types";
import { exportToCSV } from "../lib/export";

interface Props {
  equipamentos: Equipamento[];
  colaboradorLogado: Colaborador | null;
  onSelectEquipamento: (id: string) => void;
  onAdicionarEquipamento: (novo: Omit<Equipamento, 'docs' | 'fotos'>) => void;
}

export const EquipmentsView: React.FC<Props> = ({
  equipamentos,
  colaboradorLogado,
  onSelectEquipamento,
  onAdicionarEquipamento
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState("");
  const [setor, setSetor] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [busca, setBusca] = useState("");

  const equipamentosFiltrados = React.useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return equipamentos;
    return equipamentos.filter(eq => 
      eq.nome.toLowerCase().includes(termo) ||
      eq.modelo.toLowerCase().includes(termo) ||
      eq.setor.toLowerCase().includes(termo) ||
      (eq.id && eq.id.toLowerCase().includes(termo))
    );
  }, [equipamentos, busca]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !setor.trim()) return;

    onAdicionarEquipamento({
      id: "eq_" + Date.now(),
      nome: nome.trim(),
      modelo: modelo.trim() || "N/A",
      setor: setor.trim(),
      status: "Operacional",
      responsavel: colaboradorLogado ? colaboradorLogado.nome : "Geral"
    });

    // Reset
    setNome("");
    setModelo("");
    setSetor("");
    setModalAberto(false);
  };

  const isInstrutor = colaboradorLogado?.cargo === 'Instrutor';

  const handleExportCSV = () => {
    const headers = [
      { key: "id", label: "ID/Patrimônio" },
      { key: "nome", label: "Nome do Equipamento" },
      { key: "modelo", label: "Modelo" },
      { key: "setor", label: "Setor" },
      { key: "status", label: "Status" },
      { key: "responsavel", label: "Responsável" }
    ];
    exportToCSV(equipamentos, headers, "inventario_equipamentos_senai");
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Parque de Equipamentos</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Inventário regulamentar com registro técnico de manuais, documentação e fichas de conformidade.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Botão de Exportar CSV */}
          <div className="relative group/tooltip">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow-xs border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Lista</span>
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-150">
              Gerar planilha Excel (.csv) do inventário
              <span className="absolute bottom-full right-6 border-4 border-transparent border-b-slate-900" />
            </div>
          </div>

          {/* Adicionar apenas para Gestor ou Técnico */}
          {!isInstrutor && (
            <div className="relative group/tooltip">
              <button
                onClick={() => setModalAberto(true)}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow-sm cursor-pointer"
              >
                <PlusSquare className="w-4 h-4" />
                <span>Cadastrar Equipamento</span>
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-150">
                Adicionar novo ativo industrial ao SENAI
                <span className="absolute bottom-full right-6 border-4 border-transparent border-b-slate-900" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros / Toggles de Lista */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por equipamento, modelo, setor ou patrimônio..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-xs text-slate-800 placeholder-slate-400 font-medium transition"
          />
        </div>

        {/* Informações de Status e Modo de Visualização */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500">
            {busca.length > 0 ? (
              <>
                Filtrados: <span className="font-bold text-slate-800">{equipamentosFiltrados.length}</span> de <span className="text-slate-400">{equipamentos.length}</span>
              </>
            ) : (
              <>
                Total: <span className="font-bold text-slate-800">{equipamentos.length}</span> ativos
              </>
            )}
          </span>
          
          {/* Toggles de Visualização de Lista / Grid */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200/50">
            <div className="relative group/tooltip">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  viewMode === 'grid' ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visual Carrossel / Grid</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-150">
                Visualização em grade de cards gráficos
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  viewMode === 'list' ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista / Tabela</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-150">
                Visualização estruturada em tabela de auditoria
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Condicional Render: Grid layout ou List layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipamentosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-5">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
              <h5 className="font-bold text-xs text-slate-700">Nenhum equipamento correspondente</h5>
              <p className="text-[10px] text-slate-500 mt-1">Refine seus termos de busca para encontrar o ativo desejado.</p>
            </div>
          ) : (
            equipamentosFiltrados.map((eq) => {
            let statusCor = eq.status === "Operacional" 
              ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
              : eq.status === "Em Manutenção" 
                ? "text-amber-700 bg-amber-50 border-amber-200" 
                : "text-red-700 bg-red-50 border-red-200";

            // Seleção iconográfica baseada no nome
            const nomeLower = eq.nome.toLowerCase();
            const IconComponent = nomeLower.includes("morsa") || nomeLower.includes("ajustagem") || nomeLower.includes("bancada")
              ? Hammer
              : nomeLower.includes("compressor") || nomeLower.includes("pneumática")
                ? Wind
                : nomeLower.includes("cnc") || nomeLower.includes("esteira")
                  ? Cpu
                  : Settings;

            return (
              <div
                key={eq.id}
                onClick={() => onSelectEquipamento(eq.id)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group hover:border-blue-200 animate-in fade-in duration-200"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-widest ${statusCor}`}>
                      {eq.status}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {eq.nome}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Modelo: <span className="font-semibold text-slate-700">{eq.modelo}</span></p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Setor: <span className="text-slate-600 font-medium">{eq.setor}</span></p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eq.responsavel}</span>
                  </span>
                  
                  <span className="text-blue-600 text-[11px] font-bold flex items-center space-x-1 group-hover:underline">
                    <span>Gerenciar Documentação &rarr;</span>
                  </span>
                </div>
              </div>
            );
          }))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[10px]">Identificação ID</th>
                  <th className="px-5 py-4 font-semibold text-[10px]">Equipamento</th>
                  <th className="px-5 py-4 font-semibold text-[10px]">Modelo</th>
                  <th className="px-5 py-4 font-semibold text-[10px]">Setor / Divisão</th>
                  <th className="px-5 py-4 font-semibold text-[10px]">Responsável Técnico</th>
                  <th className="px-5 py-4 font-semibold text-[10px] text-center">Status Operacional</th>
                  <th className="px-5 py-4 font-semibold text-[10px] text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {equipamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic">
                      Nenhum equipamento correspondente encontrado.
                    </td>
                  </tr>
                ) : (
                  equipamentosFiltrados.map((eq) => {
                    let statusCores = eq.status === "Operacional" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : eq.status === "Em Manutenção" 
                        ? "bg-amber-50 text-amber-700 border-amber-100" 
                        : "bg-red-50 text-red-700 border-red-100";

                    return (
                      <tr 
                        key={eq.id} 
                        onClick={() => onSelectEquipamento(eq.id)}
                        className="hover:bg-slate-50/70 transition duration-150 cursor-pointer"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">{eq.id}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{eq.nome}</td>
                        <td className="px-5 py-4 text-slate-500 font-medium">{eq.modelo}</td>
                        <td className="px-5 py-4 text-slate-500">{eq.setor}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-1.5 py-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-600 truncate max-w-[120px]">{eq.responsavel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${statusCores}`}>
                            {eq.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            {/* Ação 1: Consultar / Detalhes com Dica Flutuante */}
                            <div className="relative group/tooltip inline-block">
                              <button 
                                onClick={() => onSelectEquipamento(eq.id)}
                                className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition active:scale-95 cursor-pointer border border-blue-100"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-100">
                                Ver Ficha, QR Code &amp; Manuais
                                <span className="absolute top-full right-3 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>

                            {/* Ação 2: Diagnosticar / Manutenção com Dica Flutuante */}
                            <div className="relative group/tooltip inline-block">
                              <button 
                                onClick={() => onSelectEquipamento(eq.id)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition active:scale-95 cursor-pointer border border-slate-200"
                              >
                                <Hammer className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 animate-in fade-in duration-100">
                                Abrir Ordens de Serviço &amp; Manutenção
                                <span className="absolute top-full right-3 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>
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
      )}

      {/* Modal de Cadastrar Equipamento */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
                <PlusSquare className="text-blue-500 w-5 h-5" />
                <span>Registrar Novo Equipamento</span>
              </h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Nome do Equipamento *</label>
                <input
                  required
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                  placeholder="Ex: Serra Circular de Bancada Romi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Modelo</label>
                  <input
                    type="text"
                    value={modelo}
                    onChange={e => setModelo(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                    placeholder="Ex: SC-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Setor / Local *</label>
                  <input
                    required
                    type="text"
                    value={setor}
                    onChange={e => setSetor(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                    placeholder="Ex: Usinagem"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-100"
                >
                  Salvar Equipamento
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
