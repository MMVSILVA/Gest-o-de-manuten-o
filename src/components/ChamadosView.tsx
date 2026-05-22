/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ClipboardList, PlusCircle, AlertCircle, CheckCircle, XCircle, 
  Trash2, Sparkles, Send, ShieldCheck, Wrench, Clock, FileText 
} from "lucide-react";
import { Chamado, Colaborador, Equipamento, OrdemServico } from "../types";

interface Props {
  chamados: Chamado[];
  equipamentos: Equipamento[];
  colaboradorLogado: Colaborador | null;
  onAdicionarChamado: (dados: Omit<Chamado, 'id' | 'data' | 'timestamp' | 'status'>) => void;
  onAlterarStatusChamado: (id: string, novoStatus: 'Aprovado' | 'Rejeitado') => void;
  onAprovarEGerarOS: (chamado: Chamado) => void;
}

export const ChamadosView: React.FC<Props> = ({
  chamados,
  equipamentos,
  colaboradorLogado,
  onAdicionarChamado,
  onAlterarStatusChamado,
  onAprovarEGerarOS
}) => {
  // Estados para formulação do Chamado (apenas Instrutor)
  const [equipamento, setEquipamento] = useState("");
  const [tipo, setTipo] = useState<Chamado['tipo']>("Corretiva");
  const [prioridade, setPrioridade] = useState<Chamado['prioridade']>("Média");
  const [descricao, setDescricao] = useState("");
  const [otimizando, setOtimizando] = useState(false);
  const [envioSucesso, setEnvioSucesso] = useState(false);

  const isInstrutor = colaboradorLogado?.cargo === "Instrutor";

  // Função para enviar chamado (Instrutor)
  const handleSubmitChamado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamento || !descricao.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    onAdicionarChamado({
      equipamento,
      solicitante: colaboradorLogado?.nome || "Instrutor",
      tipo,
      prioridade,
      descricao: descricao.trim(),
      rawDate: new Date().toISOString()
    });

    setEquipamento("");
    setDescricao("");
    setEnvioSucesso(true);
    setTimeout(() => setEnvioSucesso(false), 5000);
  };

  // IA Gemini integrada para polimento de relatórios
  const otimizarChamadoComIA = async () => {
    if (!descricao.trim()) {
      alert("Escreva um relato mínimo de sintomas ou anomalias primeiro.");
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
        alert("Erro ao otimizar relato com IA: " + (data.error || "Tente de novo mais tarde."));
      }
    } catch (err) {
      alert("Erro de conexão com o módulo IA.");
    } finally {
      setOtimizando(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* Top Banner Informativo */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 animate-in fade-in duration-300">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Canais de Abertura de Chamados</h2>
        <p className="text-slate-300 text-xs md:text-sm mt-1">
          {isInstrutor 
            ? "Abra chamados para novas avarias ou manutenções planejadas. Suas solicitações serão enviadas em tempo real aos Técnicos e Gestores."
            : "Avalie e aprove chamados de manutenção emitidos pela equipe de Instrutores SENAI para convertê-los em ordens oficiais."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Painel Esquerdo: Formulário de Envio (Apenas para Instrutores) */}
        {isInstrutor ? (
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-5 animate-in slide-in-from-left-4 duration-300">
            <div className="border-b border-slate-150 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Registrar Chamado de Manutenção</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Envie sintomas de anomalias para aprovação técnica regulamentar.</p>
            </div>

            {envioSucesso && (
              <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs p-3.5 rounded-xl font-bold flex items-center space-x-2 animate-bounce">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chamado enviado com sucesso para a fila de triagem!</span>
              </div>
            )}

            <form onSubmit={handleSubmitChamado} className="space-y-4">
              {/* Equipamento */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Ativo / Máquina Relacionada *</label>
                <select
                  required
                  value={equipamento}
                  onChange={e => setEquipamento(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs md:text-sm bg-slate-50"
                >
                  <option value="">Selecione o ativo...</option>
                  {equipamentos.map(eq => (
                    <option key={eq.id} value={eq.nome}>{eq.nome} ({eq.setor})</option>
                  ))}
                  <option value="Outro Equivalente">Outro / Equipamento Não Listado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de Intervenção */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Tipo Sugerido</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as Chamado['tipo'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white"
                  >
                    <option value="Corretiva">Corretiva (Avaria)</option>
                    <option value="Preventiva">Preventiva (Ajuste)</option>
                    <option value="Calibração">Calibração</option>
                    <option value="Preditiva">Preditiva</option>
                    <option value="Treinamento">Treino SENAI</option>
                  </select>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Gravidade / Urgência</label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as Chamado['prioridade'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Descrição Técnica do Problema *</label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva ruídos, quebras, folgas ou anomalias observadas..."
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs md:text-sm bg-slate-50 resize-none pr-10"
                  />
                  
                  {/* Otimizador IA para chamado */}
                  <button
                    type="button"
                    disabled={otimizando}
                    onClick={otimizarChamadoComIA}
                    title="Polir texto com IA 🌟"
                    className="absolute right-2 bottom-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full p-1.5 h-8 w-8 flex items-center justify-center shadow transition active:scale-90 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-white ${otimizando ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow hover:shadow-blue-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Enviar Chamado de Trabalho</span>
              </button>
            </form>
          </div>
        ) : (
          /* Se for Gestor ou Técnico, mostramos explicações gerais e KPIs de triagem no painel esquerdo */
          <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-left-4 duration-300">
            {/* Bloco de Atalhos Técnicos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Status da Triagem 4.0</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Chamados em Aberto</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    {chamados.filter(c => c.status === 'Pendente').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Chamados Aprovados</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {chamados.filter(c => c.status === 'Aprovado').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Chamados Rejeitados</span>
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                    {chamados.filter(c => c.status === 'Rejeitado').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Guia de Gestão de Confiabilidade regulamentar */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-150 space-y-3">
              <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Auditoria Regulamentar</span>
              </h4>
              <p className="text-[11px] text-blue-800 leading-relaxed font-semibold">
                Qualquer chamado aprovado gera uma <b>Ordem de Serviço na hora</b>, a qual se integra instantaneamente à agenda técnica e ao diário de bordo da oficina industrial. Use com critério para manter a fila de trabalho saneada.
              </p>
            </div>
          </div>
        )}

        {/* Painel Direito: Histórico de Chamados / Fila de Triagem de Chamados */}
        <div className={isInstrutor ? "lg:col-span-7 space-y-5" : "lg:col-span-8 space-y-5"}>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {isInstrutor ? "Meus Chamados de Manutenção" : "Fila Geral de Chamados do SENAI"}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Triagem de eventos e sinistros industriais</p>
              </div>
              <span className="bg-slate-100 text-slate-600 font-extrabold px-2.5 py-1 rounded-full text-[9px] uppercase">
                {isInstrutor ? "Registrado por você" : "Controle de aprovação"}
              </span>
            </div>

            <div className="space-y-4">
              {chamados.length === 0 ? (
                <div className="text-center p-10 text-slate-400 italic text-xs">
                  Nenhum chamado pendente ou registrado no momento.
                </div>
              ) : (
                chamados.map(c => {
                  const badgeStatus = c.status === 'Pendente' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : c.status === 'Aprovado'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                      : 'bg-red-50 text-red-700 border border-red-200';

                  const badgeStatusVal = c.status === 'Pendente' 
                    ? 'Pendente Triagem' 
                    : c.status === 'Aprovado' 
                      ? 'Aprovado / O.S. Aberta' 
                      : 'Rejeitado / Arquivado';

                  const corPrioridade = c.prioridade === 'Alta' 
                    ? 'text-red-650 bg-red-50 border-red-105' 
                    : c.prioridade === 'Média' 
                      ? 'text-amber-600 bg-amber-50 border-amber-105' 
                      : 'text-blue-600 bg-blue-50 border-blue-105';

                  return (
                    <div 
                      key={c.id} 
                      className={`p-4 rounded-xl border transition hover:border-slate-350 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        c.status === 'Pendente' ? "border-l-4 border-l-amber-500" : ""
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">{c.data}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-lg">
                            {c.tipo}
                          </span>
                          <span className={`text-[9px] border font-extrabold px-2 py-0.5 rounded-lg uppercase ${corPrioridade}`}>
                            Prioridade {c.prioridade}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">{c.equipamento}</h4>
                        
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-150 leading-relaxed">
                          {c.descricao}
                        </p>

                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                          <span>Por:</span>
                          <span className="font-bold text-slate-700">{c.solicitante}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 w-full md:w-auto space-y-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-150">
                        {/* Indicador de Status */}
                        <span className={`px-2.5 py-1 text-[9px] rounded-full font-bold uppercase tracking-wider ${badgeStatus}`}>
                          {badgeStatusVal}
                        </span>

                        {/* Botões de Triagem Rápidos - Apenas para Gestores e Técnicos, e somente se Estiver Pendente */}
                        {!isInstrutor && c.status === 'Pendente' && (
                          <div className="flex space-x-2 w-full md:w-auto justify-end pt-1">
                            <button
                              onClick={() => onAlterarStatusChamado(c.id, 'Rejeitado')}
                              className="p-1 px-2.5 border border-red-200 bg-red-50 hover:bg-red-500 text-red-700 hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="Rejeitar Chamado"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>

                            <button
                              onClick={() => onAprovarEGerarOS(c)}
                              className="p-1 px-2.5 border border-emerald-250 bg-emerald-50 hover:bg-emerald-500 text-emerald-800 hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                              title="Aprovar e Gerar Ordem de Serviço"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Aprovar & Gerar O.S.</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
