import React, { useState } from "react";
import { UserPlus, Trash2, Edit3, ShieldAlert, Key, Copy, Check, Lock, ShieldCheck, Plus, CheckCircle } from "lucide-react";
import { Colaborador, Cargo } from "../types";

interface Props {
  colaboradores: Colaborador[];
  colaboradorLogado?: Colaborador;
  onAdicionarColaborador: (novo: Colaborador) => void;
  onExcluirColaborador: (id: string) => void;
}

export interface TokenCadastro {
  codigo: string;
  criadoPor: string;
  timestampCriacao: number;
  tipo: "unico" | "multiplo";
}

export const ColaboradoresView: React.FC<Props> = ({
  colaboradores,
  colaboradorLogado,
  onAdicionarColaborador,
  onExcluirColaborador
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cargo, setCargo] = useState<Cargo>("Técnico"); // Default elegante para técnico
  const [senha, setSenha] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // Sistema de Token de Gestores
  const [tokens, setTokens] = useState<TokenCadastro[]>(() => {
    const saved = localStorage.getItem("manutech_tokens");
    if (saved) return JSON.parse(saved);
    const defaultTokens: TokenCadastro[] = [
      { codigo: "SENAI-1011-A", criadoPor: "Alexandre da Silva", timestampCriacao: Date.now() - 3600000, tipo: "multiplo" },
      { codigo: "SENAI-1012-W", criadoPor: "Wesley de Souza Faria", timestampCriacao: Date.now() - 1800000, tipo: "unico" }
    ];
    localStorage.setItem("manutech_tokens", JSON.stringify(defaultTokens));
    return defaultTokens;
  });

  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [novoTokenTipo, setNovoTokenTipo] = useState<"unico" | "multiplo">("unico");

  // Nome dos Gestores autorizados para cadastrar novos usuários ou gerar tokens
  const isGestorAutorizado = colaboradorLogado?.cargo === "Técnico";

  // Persistir tokens
  const salvarTokens = (novosTokens: TokenCadastro[]) => {
    setTokens(novosTokens);
    localStorage.setItem("manutech_tokens", JSON.stringify(novosTokens));
  };

  // Gerador de Token elegante: SENAI-XXXX-Y
  const handleGerarToken = () => {
    if (!isGestorAutorizado) return;
    const num = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letra = letras[Math.floor(Math.random() * letras.length)];
    const codigo = `SENAI-${num}-${letra}`;

    const novo: TokenCadastro = {
      codigo,
      criadoPor: colaboradorLogado?.nome || "Gestor Autorizado",
      timestampCriacao: Date.now(),
      tipo: novoTokenTipo
    };

    salvarTokens([novo, ...tokens]);
  };

  const handleDeletarToken = (codigo: string) => {
    if (!isGestorAutorizado) return;
    const filtrados = tokens.filter(t => t.codigo !== codigo);
    salvarTokens(filtrados);
  };

  const copiarParaTransferencia = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiadoId(text);
      setTimeout(() => setCopiadoId(null), 1500);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matricula.trim()) return;

    // Se NÃO for gestor autorizado, bloquear o cadastro interno
    if (!isGestorAutorizado) {
      alert("Acesso Negado: Você não possui autorização regulamentar para cadastrar ou modificar usuários.");
      return;
    }

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
    setCargo("Técnico");
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
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-200">
      
      {/* Banner de Status de Autorização de Gestão */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isGestorAutorizado 
          ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
          : "bg-amber-50 text-amber-800 border-amber-100"
      }`}>
        <div className="flex items-start space-x-3.5">
          {isGestorAutorizado ? (
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 shrink-0" />
            </div>
          ) : (
            <div className="bg-amber-500 text-white p-2 rounded-xl">
              <Lock className="w-5 h-5 shrink-0" />
            </div>
          )}
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider">
              {isGestorAutorizado ? "Nível de Acesso: Supervisor Geral Autorizado" : "Nível de Acesso: Somente Visualização"}
            </h4>
            <p className="text-xs leading-relaxed font-semibold text-slate-600">
              {isGestorAutorizado 
                ? `Bem-vindo, ${colaboradorLogado?.nome}. Você possui privilégios de administrador para emitir tokens de cadastro e gerenciar colaboradores.`
                : "Sistema de Token ativo. Somente Alexandre da Silva e Wesley de Souza Faria possuem chancela para criar tokens ou cadastrar colaboradores."
              }
            </p>
          </div>
        </div>

        {isGestorAutorizado && (
          <div className="flex items-center space-x-2 text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-full shadow-xs border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Chaves Ativas Habilitadas</span>
          </div>
        )}
      </div>

      {/* Grid de Conteúdo: Colaboradores + Painel de Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo/Centro: Listagem de Colaboradores */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Colaboradores Cadastrados</h3>
              <p className="text-[10px] text-slate-450 font-medium">Controle de credenciais de PIN e auditoria de perfil regulamentar.</p>
            </div>
            
            {isGestorAutorizado && (
              <button
                onClick={() => {
                  setEditId(null);
                  setNome("");
                  setMatricula("");
                  setCargo("Técnico");
                  setSenha("");
                  setModalAberto(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition text-xs shadow-sm cursor-pointer self-start md:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar Colaborador</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="px-5 py-4">Nome Completo</th>
                    <th className="px-5 py-4">Matrícula</th>
                    <th className="px-5 py-4">Cargo / Função</th>
                    <th className="px-5 py-4">PIN Acesso</th>
                    {isGestorAutorizado && <th className="px-5 py-4 text-center">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-755">
                  {colaboradores.map((c) => {
                    let badgeCargo = "bg-slate-100 text-slate-800";
                    if (c.cargo === "Gestor") badgeCargo = "bg-red-50 text-red-700 border border-red-100";
                    else if (c.cargo === "Técnico") badgeCargo = "bg-yellow-50 text-yellow-700 border border-yellow-105";
                    else if (c.cargo === "Instrutor") badgeCargo = "bg-emerald-50 text-emerald-700 border border-emerald-100";

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 leading-tight">{c.nome}</div>
                          {c.unidade && (
                            <div className="text-[9.5px] font-semibold text-zinc-400 mt-0.5 leading-snug">
                              {c.unidade}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-500">{c.matricula}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col space-y-1.5 items-start">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${badgeCargo}`}>
                              {c.cargo}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-400">
                          <code>{c.senhaText || "senai123"}</code>
                        </td>
                        {isGestorAutorizado && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center space-x-1.5 justify-center">
                              <button
                                onClick={() => iniciarEdicao(c)}
                                className="p-1 px-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-blue-600 border border-slate-200 transition cursor-pointer flex items-center space-x-1 text-[10px] font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              
                              <button
                                onClick={() => onExcluirColaborador(c.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded border border-slate-200 transition cursor-pointer"
                                title="Remover Colaborador"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado Direito: Widget do Sistema de Tokens */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Chaves de Registro (Tokens)</h3>
            </div>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
              Emita chaves únicas ou multiuso para novos colaboradores efetuarem o cadastro com segurança no sistema.
            </p>

            {isGestorAutorizado ? (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Seleção de Tipo de Novo Token */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Tipo da Nova Chave</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNovoTokenTipo("unico")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        novoTokenTipo === "unico"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-slate-50/50"
                      }`}
                    >
                      Uso Único
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovoTokenTipo("multiplo")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        novoTokenTipo === "multiplo"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-slate-50/50"
                      }`}
                    >
                      Multiuso
                    </button>
                  </div>
                </div>

                {/* Botão para Gerar Token */}
                <button
                  type="button"
                  onClick={handleGerarToken}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-100 active:scale-98 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gerar Código SENAI</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-center space-y-2.5">
                <Lock className="w-5 h-5 text-slate-450 mx-auto" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                  Gerador travado. Chaves válidas só podem ser criadas pelos gestores Alexandre da Silva e Wesley de Souza Faria.
                </p>
              </div>
            )}

            {/* Listagem de Chaves / Ativos */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Chaves Ativas no Banco</h4>
              
              {tokens.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-2">Sem tokens ativos. Crie um acima.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {tokens.map((t) => {
                    const isCopiado = copiadoId === t.codigo;
                    return (
                      <div key={t.codigo} className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-3xs hover:border-slate-250 transition-colors">
                        <div className="space-y-1">
                          <code className="text-xs font-bold text-indigo-750 font-mono tracking-wider">{t.codigo}</code>
                          <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-semibold">
                            <span className={`w-1.5 h-1.5 rounded-full ${t.tipo === 'unico' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className="uppercase">{t.tipo === 'unico' ? 'Uso Único' : 'Multiuso'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[80px]" title={`Gerado por ${t.criadoPor}`}>{t.criadoPor.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Botão de copiar */}
                          <button
                            onClick={() => copiarParaTransferencia(t.codigo)}
                            className={`p-1.5 rounded-lg border transition ${
                              isCopiado 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                : "bg-white text-slate-500 border-slate-205 hover:bg-slate-100"
                            }`}
                            title="Copiar Token"
                          >
                            {isCopiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>

                          {/* Botão de excluir */}
                          {isGestorAutorizado && (
                            <button
                              onClick={() => handleDeletarToken(t.codigo)}
                              className="p-1.5 rounded-lg border bg-white border-slate-205 text-slate-400 hover:text-red-650 hover:bg-red-50 transition"
                              title="Banir Token"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Add / Edit (Exclusivo para Gestores Autorizados) */}
      {modalAberto && isGestorAutorizado && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
                <UserPlus className="text-blue-500 w-5 h-5" />
                <span>{editId ? "Atualizar Colaborador" : "Adicionar Colaborador"}</span>
              </h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xl font-bold"
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
                  <option value="Técnico">Técnico (Permissão Plena / Gestor)</option>
                  <option value="Instrutor">Instrutor SENAI (Apenas Visualizar)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-150 cursor-pointer"
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
