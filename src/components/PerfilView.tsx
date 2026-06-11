/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserCog, Award, User, Hash } from "lucide-react";
import { Colaborador, Cargo } from "../types";

interface Props {
  colaboradorLogado: Colaborador | null;
  onUpdatePerfil: (dados: { nome: string; matricula: string; cargo: Cargo; senhaText?: string }) => void;
}

export const PerfilView: React.FC<Props> = ({
  colaboradorLogado,
  onUpdatePerfil
}) => {
  const [nome, setNome] = useState(colaboradorLogado ? colaboradorLogado.nome : "");
  const [matricula, setMatricula] = useState(colaboradorLogado ? colaboradorLogado.matricula : "");
  const [cargo, setCargo] = useState<Cargo>(colaboradorLogado ? colaboradorLogado.cargo : "Mecânico");
  const [senha, setSenha] = useState(colaboradorLogado?.senhaText || "senai123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matricula.trim()) {
      alert("Nome e matrícula não podem ficar em branco.");
      return;
    }

    onUpdatePerfil({
      nome: nome.trim(),
      matricula: matricula.trim(),
      cargo,
      senhaText: senha
    });

    alert("Perfil de acesso regulamentar modificado com êxito!");
  };

  const iniciaSigla = colaboradorLogado
    ? colaboradorLogado.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "MT";

  return (
    <div className="max-w-xl mx-auto text-slate-800">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
        
        {/* Avatar Card */}
        <div className="text-center mb-6 border-b border-slate-200 pb-5">
          <div className="mx-auto w-20 h-20 rounded-full bg-blue-150 flex items-center justify-center text-blue-600 font-extrabold border-4 border-blue-100 text-2xl mb-3 shadow-inner">
            <span>{iniciaSigla}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{colaboradorLogado?.nome}</h2>
          <div className="flex flex-col items-center justify-center space-y-1 mt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100">
              {colaboradorLogado?.cargo}
            </span>
            {colaboradorLogado?.cargoDetalhado && (
              <span className="text-[11px] font-black tracking-wider text-slate-600 uppercase">
                {colaboradorLogado.cargoDetalhado}
              </span>
            )}
            {colaboradorLogado?.unidade && (
              <span className="text-[9.5px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded">
                🏢 {colaboradorLogado.unidade}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Nome Completo do Colaborador</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                required
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Número de Matrícula</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  required
                  type="text"
                  value={matricula}
                  onChange={e => setMatricula(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Código PIN de Acesso</label>
              <input
                required
                type="text"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Cargo / Qualificação Regulamentar</label>
            <select
              value={cargo}
              onChange={e => setCargo(e.target.value as Cargo)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
            >
              <option value="Técnico">Técnico (Permissão Plena / Gestor)</option>
              <option value="Instrutor">Instrutor SENAI (Apenas Visualizar)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              Confirmar Atualização de Cadastro
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
