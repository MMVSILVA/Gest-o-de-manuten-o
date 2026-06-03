/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { OrdemServico, Colaborador, Equipamento } from "../types";

interface Props {
  colaboradorLogado: Colaborador | null;
  onNavigate: (view: any) => void;
  onCriarOS: (nova: Omit<OrdemServico, 'id' | 'data' | 'timestamp'>) => void;
  equipamentos: Equipamento[];
}

export const NovaOsView: React.FC<Props> = ({
  colaboradorLogado,
  onNavigate,
  onCriarOS,
  equipamentos = []
}) => {
  const [equipamento, setEquipamento] = useState("");
  const [escreverManualmente, setEscreverManualmente] = useState(false);
  const [solicitante, setSolicitante] = useState(colaboradorLogado ? colaboradorLogado.nome : "");
  const [tipo, setTipo] = useState<OrdemServico['tipo']>("Preventiva");
  const [prioridade, setPrioridade] = useState<OrdemServico['prioridade']>("Média");
  const [dataHora, setDataHora] = useState("");
  const [descricao, setDescricao] = useState("");
  const [otimizando, setOtimizando] = useState(false);

  const handleSubmete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamento.trim() || !solicitante.trim() || !dataHora || !descricao.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    onCriarOS({
      equipamento: equipamento.trim(),
      solicitante: solicitante.trim(),
      tipo,
      prioridade,
      descricao: descricao.trim(),
      rawDate: dataHora
    });

    onNavigate('dashboard');
  };

  const otimizarComIA = async () => {
    if (!descricao.trim()) {
      alert("Escreva uma descrição informal preliminar de sintomas primeiro.");
      return;
    }

    setOtimizando(true);
    try {
      const resp = await fetch("/api/otimizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          equipamento,
          descricao
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        setDescricao(data.text);
      } else {
        alert("Erro ao otimizar com IA: " + (data.error || "Tente de novo mais tarde."));
      }
    } catch (err) {
      alert("Erro ao otimizar: Falha de conexão.");
    } finally {
      setOtimizando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-slate-800">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Abrir Ordem de Serviço / Chamado</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Formulário técnico para agendamento sistemático e auditoria mecânica. Use auxílio de IA para otimizar boletins.
          </p>
        </div>

        <form onSubmit={handleSubmete} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Equipamento / Ativo *</label>
              {!escreverManualmente ? (
                <div className="space-y-2">
                  <select
                    required
                    value={equipamento}
                    onChange={e => {
                      if (e.target.value === "__WRITE_MANUAL__") {
                        setEscreverManualmente(true);
                        setEquipamento("");
                      } else {
                        setEquipamento(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="">Selecione um equipamento...</option>
                    {equipamentos.map(eq => (
                      <option key={eq.id} value={eq.nome}>
                        {eq.nome} &nbsp; ({eq.modelo} - {eq.setor})
                      </option>
                    ))}
                    <option value="__WRITE_MANUAL__">✍️ Outro (Escrever manualmente...)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <input
                      required
                      type="text"
                      value={equipamento}
                      onChange={e => setEquipamento(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50 flex-1"
                      placeholder="Ex: Torno Romi T-14"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEscreverManualmente(false);
                        setEquipamento("");
                      }}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 border border-slate-200"
                      title="Voltar para a seleção por lista"
                    >
                      Ver Lista
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Solicitante Técnico *</label>
              <input
                required
                type="text"
                value={solicitante}
                onChange={e => setSolicitante(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-slate-50"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Tipo de Intervenção</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as OrdemServico['tipo'])}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="Preventiva">🔵 Preventiva (Rotina)</option>
                <option value="Corretiva">🔴 Corretiva (Avaria)</option>
                <option value="Preditiva">🟢 Preditiva (Termo/Vibr)</option>
                <option value="Treinamento">🟡 Treino SENAI</option>
                <option value="Calibração">🟣 Calibração / Ajuste</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Nível de Prioridade</label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value as OrdemServico['prioridade'])}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Data & Hora Planeada *</label>
              <input
                required
                type="datetime-local"
                value={dataHora}
                onChange={e => setDataHora(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">
              Descrição de Sintomas / Manual Operacional (Laudo Técnico) *
            </label>
            <div className="relative">
              <textarea
                required
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-sm resize-none pr-12"
                placeholder="Descreva detalhadamente a falha física ou procedimento rotineiro solicitado..."
              />
              
              {/* Botão para Otimizar O.S. com IA Gemini */}
              <button
                type="button"
                disabled={otimizando}
                onClick={otimizarComIA}
                title="Otimizar Termos com IA ✨"
                className="absolute right-3.5 bottom-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center shadow transition-all active:scale-90 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 text-white ${otimizando ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-100"
            >
              Cadastrar O.S. na Nuvem
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
