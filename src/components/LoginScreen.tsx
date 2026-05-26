/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Wrench, 
  User, 
  Hash, 
  Lock, 
  ArrowRight, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  UserPlus, 
  Key, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";
import { Colaborador, Cargo } from "../types";

interface Props {
  colaboradores: Colaborador[];
  onLogin: (colaborador: Colaborador) => void;
  onRegistrarColaborador: (colaborador: Colaborador) => void;
}

type TelaAtiva = "login" | "cadastro" | "esqueci-senha";

export const LoginScreen: React.FC<Props> = ({ 
  colaboradores, 
  onLogin, 
  onRegistrarColaborador 
}) => {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>("login");

  // Estados - Login
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");

  // Estados - Cadastro de Usuário
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [matriculaCadastro, setMatriculaCadastro] = useState("");
  const [cargoCadastro, setCargoCadastro] = useState<Cargo>("Técnico");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [showSenhaCadastro, setShowSenhaCadastro] = useState(false);
  const [sucessoCadastro, setSucessoCadastro] = useState(false);

  // Estados - Esqueci Senha
  const [recuperarMatricula, setRecuperarMatricula] = useState("");
  const [colaboradorLocalizado, setColaboradorLocalizado] = useState<Colaborador | null>(null);
  const [novasenhasegura, setNovaSenhaSegura] = useState("");
  const [pinAtualMostrar, setPinAtualMostrar] = useState(false);
  const [sucessoReset, setSucessoReset] = useState(false);

  // Para simulação
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);

  // Submissão do Login
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Solicita permissão de notificações push do navegador na primeira interação de login
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(err => console.error("Erro permissão notificacao:", err));
      }
    }

    const mat = matricula.trim();
    const pin = senha.trim();
    if (!mat || !pin) {
      setErro("Por favor, preencha a Matrícula e a Senha.");
      return;
    }

    // Busca o colaborador pela matrícula para ver se já existe e confere senha
    const existente = colaboradores.find(c => c.matricula === mat);

    if (existente) {
      // Se houver senha gravada e não coincidir, alerta erro
      if (existente.senhaText && existente.senhaText !== pin) {
        setErro("Senha de acesso incorreta.");
        return;
      }
      onLogin(existente);
    } else {
      setErro("Matrícula não cadastrada no sistema ou incorreta.");
    }
  };

  // Submissão de Cadastro
  const handleSubmitCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const nome = nomeCadastro.trim();
    const mat = matriculaCadastro.trim();
    const pin = senhaCadastro.trim();

    if (!nome || !mat || !pin) {
      setErro("Por favor, preencha todos os campos do cadastro.");
      return;
    }

    // Valida se já existe colaborador com essa matrícula
    const duplicado = colaboradores.some(c => c.matricula === mat);
    if (duplicado) {
      setErro(`A matrícula ${mat} já está cadastrada por outro colaborador.`);
      return;
    }

    const novoColab: Colaborador = {
      id: "col_" + Date.now(),
      nome,
      matricula: mat,
      cargo: cargoCadastro,
      senhaText: pin,
      timestampCadastro: Date.now()
    };

    // Salva na lista global
    onRegistrarColaborador(novoColab);
    setSucessoCadastro(true);
    setErro("");

    // Redireciona ou autologa após 1,5 segundos
    setTimeout(() => {
      onLogin(novoColab);
    }, 1500);
  };

  // Recuperação / Reset de Senha
  const handleLocalizarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucessoReset(false);

    const mat = recuperarMatricula.trim();
    if (!mat) {
      setErro("Por favor, informe o número de matrícula.");
      return;
    }

    const localizado = colaboradores.find(c => c.matricula === mat);
    if (!localizado) {
      setErro("Matrícula não localizada no banco de dados.");
      setColaboradorLocalizado(null);
    } else {
      setColaboradorLocalizado(localizado);
      setNovaSenhaSegura("");
    }
  };

  const handleSalvarNovaSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorLocalizado) return;
    setErro("");

    const nova = novasenhasegura.trim();
    if (!nova) {
      setErro("Por favor, insira uma nova senha de acesso.");
      return;
    }

    // Cria o colaborador atualizado com a nova senha
    const atualizado: Colaborador = {
      ...colaboradorLocalizado,
      senhaText: nova
    };

    onRegistrarColaborador(atualizado);
    setSucessoReset(true);
    
    // Sucesso temporário e limpa estados para voltar
    setTimeout(() => {
      setColaboradorLocalizado(null);
      setRecuperarMatricula("");
      setTelaAtiva("login");
      setSucessoReset(false);
    }, 2000);
  };

  const preencherCredencial = (matEx: string, senhaEx: string) => {
    setTelaAtiva("login");
    setMatricula(matEx);
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

              <div className="space-y-1.5 mt-6">
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
                  onClick={() => { preencherCredencial("1011", "alexandre123"); setMostrarSimulacao(false); }}
                  className="text-left bg-blue-950/40 hover:bg-slate-800 p-2 rounded border border-blue-800/60 transition cursor-pointer text-xs"
                >
                  <span className="font-semibold text-blue-450 block text-[9.5px]">ALEXANDRE RODRIGUES (Gestor de O.S.)</span>
                  Matrícula: <code className="text-slate-200 font-mono text-[10px]">1011</code> | Senha: <code className="text-slate-200 font-mono text-[10px]">alexandre123</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("1012", "wesley123"); setMostrarSimulacao(false); }}
                  className="text-left bg-emerald-950/40 hover:bg-slate-800 p-2 rounded border border-emerald-800/60 transition cursor-pointer text-xs"
                >
                  <span className="font-semibold text-emerald-450 block text-[9.5px]">WESLEY SILVA (Gestor de O.S.)</span>
                  Matrícula: <code className="text-slate-200 font-mono text-[10px]">1012</code> | Senha: <code className="text-slate-200 font-mono text-[10px]">wesley123</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("1002", "tecnico12"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer text-xs"
                >
                  <span className="font-semibold text-yellow-500 block text-[9.5px]">TÉCNICO DE MANUTENÇÃO (Isabelle)</span>
                  Matrícula: <code className="text-slate-200 font-mono text-[10px]">1002</code> | Senha: <code className="text-slate-200 font-mono text-[10px]">tecnico12</code>
                </button>
                <button
                  type="button"
                  onClick={() => { preencherCredencial("1004", "mecanico1"); setMostrarSimulacao(false); }}
                  className="text-left bg-slate-800/60 hover:bg-slate-800 p-2 rounded border border-slate-700 transition cursor-pointer text-xs"
                >
                  <span className="font-semibold text-blue-400 block text-[9.5px]">INSTRUTOR SENAI (Nicole Caroline)</span>
                  Matrícula: <code className="text-slate-200 font-mono text-[10px]">1004</code> | Senha: <code className="text-slate-200 font-mono text-[10px]">mecanico1</code>
                </button>
              </div>
            </div>
          </div>

          {/* Painel Direito - Formulários Dinâmicos */}
          <div className="p-5 sm:p-8 md:w-7/12 flex flex-col justify-center bg-white">
            
            {/* TELA 1: LOGIN STANDARD */}
            {telaAtiva === "login" && (
              <form onSubmit={handleSubmitLogin} className="space-y-5">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">Iniciar Sessão</h1>
                  <p className="text-slate-500 text-xs">Acesso restrito. Identifique-se com sua matrícula e senha de colaborador.</p>
                </div>

                {erro && (
                  <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-lg border border-red-100 font-semibold animate-shake">
                    {erro}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Matrícula */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Número de Matrícula</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        required
                        type="text"
                        value={matricula}
                        onChange={e => setMatricula(e.target.value)}
                        placeholder="Sua matrícula (ex: 1011)"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Código PIN/Senha */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Senha de Acesso</label>
                      <button
                        type="button"
                        onClick={() => setTelaAtiva("esqueci-senha")}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        required
                        type={showSenha ? "text" : "password"}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        placeholder="Insira sua senha de colaborador"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
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
                  <span>Iniciar Sessão Regulamentada</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-slate-500 text-xs">
                    Novo colaborador na oficina?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTelaAtiva("cadastro");
                        setErro("");
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TELA 2: CADASTRO DE COLABORADOR */}
            {telaAtiva === "cadastro" && (
              <form onSubmit={handleSubmitCadastro} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <UserPlus className="w-5 h-5" />
                    <h1 className="text-2xl font-bold text-slate-900">Novo Cadastro</h1>
                  </div>
                  <p className="text-slate-500 text-xs">Registre-se para obter permissões de preenchimento e triagem sistemática de O.S.</p>
                </div>

                {erro && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-semibold animate-shake">
                    {erro}
                  </div>
                )}

                {sucessoCadastro && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-lg border border-emerald-100 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cadastro efetuado! Conectando automaticamente...</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        required
                        type="text"
                        value={nomeCadastro}
                        onChange={e => setNomeCadastro(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Número de Matrícula */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Número de Matrícula</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        required
                        type="text"
                        value={matriculaCadastro}
                        onChange={e => setMatriculaCadastro(e.target.value)}
                        placeholder="Exemplo: 1540"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Cargo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cargo Regulamentar</label>
                    <select
                      value={cargoCadastro}
                      onChange={e => setCargoCadastro(e.target.value as Cargo)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 transition text-sm text-slate-800 font-medium focus:bg-white cursor-pointer"
                    >
                      <option value="Técnico">Técnico de Manutenção (Ações de O.S. & Equipamentos)</option>
                      <option value="Instrutor">Instrutor SENAI (Abertura de Chamados & Gráficos)</option>
                      <option value="Gestor">Gestor / Supervisor (Receber, Contratar & Excluir)</option>
                    </select>
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Definir Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        required
                        type={showSenhaCadastro ? "text" : "password"}
                        value={senhaCadastro}
                        onChange={e => setSenhaCadastro(e.target.value)}
                        placeholder="Defina sua senha de colaborador"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenhaCadastro(!showSenhaCadastro)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showSenhaCadastro ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-col space-y-2">
                  <button
                    type="submit"
                    disabled={sucessoCadastro}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Criar Cadastro Oficial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTelaAtiva("login");
                      setErro("");
                    }}
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* TELA 3: ESQUECI A SENHA */}
            {telaAtiva === "esqueci-senha" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Key className="w-5 h-5" />
                    <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
                  </div>
                  <p className="text-slate-500 text-xs">Informe sua matrícula operacional para localizar suas credenciais de segurança.</p>
                </div>

                {erro && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-semibold animate-shake">
                    {erro}
                  </div>
                )}

                {sucessoReset && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-lg border border-emerald-100 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nova senha registrada! Retornando ao login...</span>
                  </div>
                )}

                {!colaboradorLocalizado ? (
                  // Passo 1: Localizar por Matrícula
                  <form onSubmit={handleLocalizarColaborador} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Matrícula Operacional</label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          required
                          type="text"
                          value={recuperarMatricula}
                          onChange={e => setRecuperarMatricula(e.target.value)}
                          placeholder="Digite seu nº de matrícula (ex: 1011)"
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Localizar Colaborador</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTelaAtiva("login");
                          setErro("");
                          setRecuperarMatricula("");
                        }}
                        className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao Login</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  // Passo 2: Mostrar credenciais atuais e permitir reset imediato
                  <form onSubmit={handleSalvarNovaSenha} className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center space-x-2 text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Colaborador Localizado</span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-700">
                        <p><strong>Nome:</strong> {colaboradorLocalizado.nome}</p>
                        <p><strong>Matrícula:</strong> {colaboradorLocalizado.matricula}</p>
                        <p><strong>Cargo:</strong> {colaboradorLocalizado.cargo}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex flex-col space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Senha Atual Encontrada:</span>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-800">
                          <span>{pinAtualMostrar ? colaboradorLocalizado.senhaText || "Sem senha cadastrada" : "••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => setPinAtualMostrar(!pinAtualMostrar)}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 font-sans font-bold cursor-pointer"
                          >
                            {pinAtualMostrar ? "Ocultar" : "Revelar"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Registrar Nova Senha (Opcional)</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          required
                          type="text"
                          value={novasenhasegura}
                          onChange={e => setNovaSenhaSegura(e.target.value)}
                          placeholder="Digite a nova senha desejada"
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 pt-2">
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Salvar Nova Senha</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setColaboradorLocalizado(null);
                        }}
                        className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Trocar Matrícula</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
