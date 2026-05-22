/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlusSquare, Hammer, Wind, Cpu, Settings, User } from "lucide-react";
import { Equipamento, Colaborador } from "../types";

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

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Parque de Equipamentos</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Inventário regulamentar com registro técnico de manuais, documentação e fichas de conformidade.</p>
        </div>
        
        {/* Adicionar apenas para Gestor ou Técnico */}
        {!isInstrutor && (
          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow cursor-pointer self-start"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Cadastrar Equipamento</span>
          </button>
        )}
      </div>

      {/* Grid Bento-style de Equipamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentos.map((eq) => {
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
        })}
      </div>

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
