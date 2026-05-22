/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wrench, User, Hash, Lock, ArrowRight, HelpCircle, Eye, EyeOff } from "lucide-react";
import { Colaborador, Cargo } from "../types";

interface Props {
  colaboradores: Colaborador[];
  onLogin: (colaborador: Colaborador) => void;
}

export const LoginScreen: React.FC<Props> = ({ colaboradores, onLogin }) => {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cargo, setCargo] = useState<Cargo>("Instrutor");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Solicita permissão de notificações push do navegador na primeira interação de login
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(err => console.error("Erro permissão notificacao:", err));
      }
    }

    const mat = matricula.trim();
    if (!mat || !nome.trim()) {
      setErro("Por favor, preencha o Nome e a Matrícula.");
      return;
    }

    // Busca o colaborador pela matrícula para ver se já existe e confere senha
    const existente = colaboradores.find(c => c.matricula === mat);

    if (existente) {
      // Se houver senha gravada e não coincidir, alerta erro
      if (existente.senhaText && senha && existente.senhaText !== senha) {
        setErro("Código PIN / Senha incorreto para esta matrícula.");
        return;
      }
      
      // Update cargo ou nome se necessário ou mantém existente
      const atualizado: Colaborador = {
        ...existente,
        nome: nome.trim(),
        cargo: cargo,
      };
      onLogin(atualizado);
    } else {
      // Se não existir, cadastra no local
      const novo: Colaborador = {
        id: "col_" + Date.now(),
        nome: nome.trim(),
        matricula: mat,
        cargo: cargo,
        senhaText: senha || "senai123", // Senha default caso vazia
        timestampCadastro: Date.now()
      };
      onLogin(novo);
    }
  };

  const preencherCredencial = (nomeEx: string, matEx: string, cargoEx: Cargo, senhaEx: string) => {
    setNome(nomeEx);
    setMatricula(matEx);
    setCargo(cargoEx);
    setSenha(senhaEx);
    setErro("");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[999] overflow-y-auto p-3 sm:p-6 font-sans">
      <div className="min-h-full w-full flex items-center justify-center py-4 md:py-10">
        {/* Container Principal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Painel Esquerdo - Branding & SENAI Info */}
          <div className="bg-slate-900 p-5 sm:p-8 md:w-5/12 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-wider">MANUTECH</h2>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Oficina Conectada 4.0</p>
                </div>
              </div>

              <div className="space-y-1 mt-6">
                <h3 className="text-lg font-bold text-slate-100">Controle de Intervenções</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sistema avançado de agendamento sistemático, histórico digitalizado e auxílio de manutenção preditiva auxiliado por Inteligência Artificial.
                </p>
              </div>
            </div>

            {/* Dicas de Testes com Níveis de Acesso */}
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Simular Perfis de Cargo:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setMostrarSimulacao(!mostrarSimulacao)}
                  className="md:hidden text-[10px] font-bold uppercase bg-slate-800 text-blue-400 hover:bg-slate-750 px-2.5 py-1 rounded transition border border-slate-700 cursor-pointer select-none"
                >
                  {mostrarSimulacao ? "Esconder" : "Mostrar"}
                </button>
              </div>

              <div className={`${mostrarSimulacao ? "block" : "hidden md:grid"} grid-cols-1 gap-2 animate-in slide-in-from-top-1 duration-200`}>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("Nicole Caroline", "1004", "Instrutor", "mecanico1"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer"
                >
                  <span className="font-semibold text-blue-400 block text-[10px]">INSTRUTOR SENAI (Abertura de Chamados)</span>
                  Nicole • Matrícula: <code className="text-slate-200 font-mono">1004</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("Isabelle Nunes", "1002", "Técnico", "tecnico12"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer"
                >
                  <span className="font-semibold text-yellow-500 block text-[10px]">TÉCNICO (Gerar O.S.)</span>
                  Isabelle • Matrícula: <code className="text-slate-200 font-mono">1002</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("Letícia Cabral", "1001", "Gestor", "senai123"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer"
                >
                  <span className="font-semibold text-red-500 block text-[10px]">GESTOR (Controle Total)</span>
                  Letícia • Matrícula: <code className="text-slate-200 font-mono">1001</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("Roberto Almeida", "1008", "Instrutor", "instrutor1"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer"
                >
                  <span className="font-semibold text-green-400 block text-[10px]">INSTRUTOR SENAI (Visualização)</span>
                  Roberto • Matrícula: <code className="text-slate-200 font-mono">1008</code>
                </button>
              </div>
            </div>
          </div>

          {/* Painel Direito - Formulário de Login */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 md:w-7/12 flex flex-col justify-center space-y-5 bg-white">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Iniciar Sessão</h1>
              <p className="text-slate-500 text-xs">Identifique-se para carregar suas permissões regulamentares de trabalho.</p>
            </div>

          {erro && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-lg border border-red-100 font-semibold animate-shake">
              {erro}
            </div>
          )}

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome Completo do Colaborador</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  required
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50"
                />
              </div>
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Número de Registro / Matrícula</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  required
                  type="text"
                  value={matricula}
                  onChange={e => setMatricula(e.target.value)}
                  placeholder="Insira sua matrícula (ex: 1001)"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50"
                />
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Função / Cargo Regulamentar</label>
              <select
                value={cargo}
                onChange={e => setCargo(e.target.value as Cargo)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 transition text-sm"
              >
                <option value="Instrutor">Instrutor SENAI (Abrir Chamado, Relatórios & KPIs)</option>
                <option value="Técnico">Técnico de Manutenção (Aprovar Chamado & Emitir O.S.)</option>
                <option value="Gestor">Gestor / Supervisor (Permissão Plena)</option>
              </select>
            </div>

            {/* Código PIN/Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">PIN / Código de Acesso (Opcional)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="ex: senai123"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center space-x-2 mt-4 cursor-pointer"
          >
            <span>Iniciar Sessão na Nuvem</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
