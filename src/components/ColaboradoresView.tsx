/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserPlus, Trash2, Edit3, ShieldAlert, Key } from "lucide-react";
import { Colaborador, Cargo } from "../types";

interface Props {
  colaboradores: Colaborador[];
  onAdicionarColaborador: (novo: Colaborador) => void;
  onExcluirColaborador: (id: string) => void;
}

export const ColaboradoresView: React.FC<Props> = ({
  colaboradores,
  onAdicionarColaborador,
  onExcluirColaborador
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cargo, setCargo] = useState<Cargo>("Mecânico");
  const [senha, setSenha] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matricula.trim()) return;

    onAdicionarColaborador({
      id: editId || "col_" + Date.now(),
      nome: nome.trim(),
      matricula: matricula.trim(),
      cargo,
      senhaText: senha || "senai123",
      timestampCadastro: Date.now()
    });

    // Reset
    setNome("");
    setMatricula("");
    setCargo("Mecânico");
    setSenha("");
    setEditId(null);
    setModalAberto(false);
  };

  const iniciarEdicao = (c: Colaborador) => {
    setEditId(c.id);
    setNome(c.nome);
    setMatricula(c.matricula);
    setCargo(c.cargo);
    setSenha(c.senhaText || "");
    setModalAberto(true);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Gestão de Equipe & Controle de Acessos</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Permissões refinadas e controle granular por perfil profissional de cargo de manutenção.
          </p>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setNome("");
            setMatricula("");
            setCargo("Mecânico");
            setSenha("");
            setModalAberto(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Adicionar Colaborador</span>
        </button>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold text-[10px]">Nome Completo</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Matrícula</th>
                <th className="px-6 py-4 font-semibold text-[10px]">Cargo / Função</th>
                <th className="px-6 py-4 font-semibold text-[10px]">PIN Acesso</th>
                <th className="px-6 py-4 font-semibold text-center text-[10px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
              {colaboradores.map((c) => {
                let badgeCargo = "bg-slate-100 text-slate-800";
                if (c.cargo === "Gestor") badgeCargo = "bg-red-50 text-red-700 border border-red-100";
                else if (c.cargo === "Técnico") badgeCargo = "bg-yellow-50 text-yellow-700 border border-yellow-100";
                else if (c.cargo === "Instrutor") badgeCargo = "bg-green-50 text-green-700 border border-green-100";
                else if (c.cargo === "Mecânico") badgeCargo = "bg-blue-50 text-blue-700 border border-blue-100";

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition animate-in fade-in duration-150">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 leading-tight">{c.nome}</div>
                      {c.unidade && (
                        <div className="text-[9.5px] font-semibold text-zinc-400 mt-0.5 leading-snug">
                          {c.unidade}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-500">{c.matricula}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col space-y-1.5 items-start">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeCargo}`}>
                          {c.cargo}
                        </span>
                        {c.cargoDetalhado && (
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/40 tracking-wider">
                            {c.cargoDetalhado}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                      <code>{c.senhaText || "senai123"}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 justify-center">
                        <button
                          onClick={() => iniciarEdicao(c)}
                          className="p-1 px-2 hover:bg-slate-100 rounded text-blue-600 border border-slate-200 transition cursor-pointer flex items-center space-x-1 text-[10px] font-bold"
                          title="Melhorar acesso"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        
                        <button
                          onClick={() => onExcluirColaborador(c.id)}
                          className="p-1.5 hover:bg-red-50 text-red-650 rounded border border-slate-200 transition cursor-pointer"
                          title="Remover Colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
                <UserPlus className="text-blue-500 w-5 h-5" />
                <span>{editId ? "Atualizar Colaborador" : "Adicionar Colaborador"}</span>
              </h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Nome Completo *</label>
                <input
                  required
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                  placeholder="Ex: Carlos Mendes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Nº Matrícula *</label>
                  <input
                    required
                    type="text"
                    disabled={!!editId}
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50 disabled:opacity-50"
                    placeholder="Ex: 1006"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">PIN de Acesso</label>
                  <input
                    type="text"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                    placeholder="Ex: senai123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Cargo / Perfil</label>
                <select
                  value={cargo}
                  onChange={e => setCargo(e.target.value as Cargo)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                >
                  <option value="Mecânico">Mecânico (Apenas Executar O.S.)</option>
                  <option value="Técnico">Técnico de Manutenção (Gerar O.S.)</option>
                  <option value="Gestor">Gestor / Supervisor (Permissão Plena)</option>
                  <option value="Instrutor">Instrutor SENAI (Apenas Visualizar)</option>
                </select>
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
                  Confirmar Salvar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
