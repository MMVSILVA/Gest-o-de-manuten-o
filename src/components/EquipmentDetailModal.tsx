/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, ArrowLeft, Server, FileText, CheckCircle, UploadCloud, Eye, BookOpen, 
  PlayCircle, Camera, Sparkles, Wand2, BrainCircuit, Printer,
  ChevronLeft, ChevronRight, PlusCircle, MinusCircle,
  Clock, Calendar, AlertTriangle, Activity, UserCheck,
  ChevronDown, ChevronUp, Trash2, Edit3, Save, RotateCcw, Wrench
} from "lucide-react";
import { Equipamento, OrdemServico, Colaborador, DefeitoFoto, GrupoPeca } from "../types";

interface Props {
  eq: Equipamento;
  ordens: OrdemServico[];
  colaboradorLogado: Colaborador | null;
  onBack: () => void;
  onUpdateEquipamento: (updated: Equipamento) => void;
  onShowImageFull: (src: string) => void;
  onExcluirEquipamento?: (id: string) => void;
}

export const EquipmentDetailModal: React.FC<Props> = ({
  eq,
  ordens,
  colaboradorLogado,
  onBack,
  onUpdateEquipamento,
  onShowImageFull,
  onExcluirEquipamento
}) => {
  const [nomeInterno, setNomeInterno] = useState(eq.nome);
  const [sintomasIA, setSintomasIA] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<'docs-ia' | 'historico' | 'pecas'>('docs-ia');
  const [parecerIA, setParecerIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // States para Edição Completa (Gestor)
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState(eq.nome);
  const [editModelo, setEditModelo] = useState(eq.modelo);
  const [editSetor, setEditSetor] = useState(eq.setor);
  const [editStatus, setEditStatus] = useState(eq.status);
  const [editResponsavel, setEditResponsavel] = useState(eq.responsavel);

  // States para Divisão de Grupos de Peças
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [novaPecaNome, setNovaPecaNome] = useState<Record<string, string>>({}); // gp_id -> peca_nome

  // Filtra as O.S. correspondentes a esta máquina
  const historicoOS = ordens.filter(o => 
    o.equipamento.toLowerCase().includes(eq.nome.split(" ")[0].toLowerCase()) ||
    o.equipamento.toLowerCase().includes(eq.modelo.toLowerCase())
  );

  const handleUpdateNome = () => {
    if (!nomeInterno.trim()) return;
    onUpdateEquipamento({
      ...eq,
      nome: nomeInterno.trim()
    });
  };

  // Funções de Edição Completa para Gestor
  const handleSalvarEdicaoCompleta = () => {
    if (!editNome.trim()) {
      alert("O nome do equipamento é obrigatório para atualização.");
      return;
    }
    onUpdateEquipamento({
      ...eq,
      nome: editNome.trim(),
      modelo: editModelo.trim() || "N/A",
      setor: editSetor.trim(),
      status: editStatus,
      responsavel: editResponsavel.trim() || "Geral"
    });
    setIsEditing(false);
  };

  const handleExcluirEquipamentoInterno = () => {
    if (window.confirm(`Deseja realmente excluir permanentemente o equipamento "${eq.nome}"? Esta ação interromperá todo o rastreamento técnico do ativo!`)) {
      if (onExcluirEquipamento) {
        onExcluirEquipamento(eq.id);
      } else {
        alert("Erro ao excluir: Callback de exclusão não definido.");
      }
    }
  };

  // Funções de Gestão de Grupos de Peças e Peças
  const handleAdicionarGrupoPeca = () => {
    if (!novoGrupoNome.trim()) return;
    const novoGP: GrupoPeca = {
      id: "gp_" + Date.now(),
      nome: novoGrupoNome.trim(),
      pecas: []
    };
    const nextGrupos = [...(eq.gruposPecas || []), novoGP];
    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });
    setNovoGrupoNome("");
    setGruposExpandidos(prev => ({ ...prev, [novoGP.id]: true }));
  };

  const handleRemoverGrupoPeca = (gpId: string) => {
    if (window.confirm("Deseja realmente remover este grupo de peças por completo?")) {
      const nextGrupos = (eq.gruposPecas || []).filter(g => g.id !== gpId);
      onUpdateEquipamento({
        ...eq,
        gruposPecas: nextGrupos
      });
    }
  };

  const handleAdicionarPeca = (gpId: string) => {
    const nomePeca = novaPecaNome[gpId]?.trim();
    if (!nomePeca) return;

    const nextGrupos = (eq.gruposPecas || []).map(g => {
      if (g.id === gpId) {
        return {
          ...g,
          pecas: [...g.pecas, nomePeca]
        };
      }
      return g;
    });

    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });

    setNovaPecaNome(prev => ({ ...prev, [gpId]: "" }));
  };

  const handleRemoverPeca = (gpId: string, pecaIndex: number) => {
    const nextGrupos = (eq.gruposPecas || []).map(g => {
      if (g.id === gpId) {
        return {
          ...g,
          pecas: g.pecas.filter((_, idx) => idx !== pecaIndex)
        };
      }
      return g;
    });

    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });
  };

  const handleUploadDoc = (tipo: 'ficha' | 'manual' | 'treino', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const nextDocs = { ...eq.docs, [tipo]: base64 };
      onUpdateEquipamento({
        ...eq,
        docs: nextDocs
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFotoDefeito = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const novaFoto: DefeitoFoto = {
        src: base64,
        tipo: file.type === "application/pdf" ? "pdf" : "img",
        descricao: sintomasIA.trim() || "Registro fotográfico técnico de anomalia.",
        data: new Date().toLocaleDateString("pt-PT")
      };

      onUpdateEquipamento({
        ...eq,
        fotos: [novaFoto, ...eq.fotos]
      });
      setSintomasIA("");
    };
    reader.readAsDataURL(file);
  };

  const analisarIA = async () => {
    if (!sintomasIA.trim()) {
      alert("Por favor, descreva sintomas ou defeito antes de analisar com IA.");
      return;
    }

    setCarregandoIA(true);
    setParecerIA("");

    try {
      const resp = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipamento: eq.nome,
          descricao: sintomasIA
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        setParecerIA(data.text);
      } else {
        setParecerIA("Erro no processador de IA: " + (data.error || "Tente novamente."));
      }
    } catch (e: any) {
      setParecerIA("Erro de comunicação com o servidor de IA. fallback simulado.");
    } finally {
      setCarregandoIA(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-40 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header com os Botões de Voltar Exigidos */}
        <div className="bg-slate-900 p-4 md:p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3 w-full">
            {/* Botão de Voltar Redesenhado e Funcionando */}
            <button
              onClick={onBack}
              className="p-2 md:px-4 md:py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl text-slate-300 text-xs font-bold transition flex items-center space-x-2 border border-slate-700 active:scale-95 cursor-pointer"
              title="Voltar para a lista de equipamentos"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <span className="w-[1.5px] h-6 bg-slate-800 hidden sm:inline"></span>

            <div className="flex-1 flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-400 hidden inline-block shrink-0" />
              <div className="flex items-center border-b border-dashed border-slate-600 focus-within:border-blue-400 pb-0.5 max-w-xs md:max-w-md">
                <input
                  type="text"
                  value={nomeInterno}
                  onChange={e => setNomeInterno(e.target.value)}
                  onBlur={handleUpdateNome}
                  className="bg-transparent font-bold text-sm md:text-lg text-white outline-none w-full placeholder-slate-400 font-sans"
                  placeholder="Nome do Equipamento"
                />
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition ml-2 cursor-pointer shrink-0"
            title="Fechar detelhes"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Coluna Esquerda: Detalhes, Status e Histórico */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box de Status do Ativo */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Informações Técnicas</h4>
                  {!isEditing && (
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      eq.status === 'Operacional' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : eq.status === 'Em Manutenção' 
                          ? 'bg-amber-50 text-amber-700 border-amber-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {eq.status}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Nome do Equipamento</label>
                      <input 
                        type="text" 
                        value={editNome} 
                        onChange={e => setEditNome(e.target.value)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Modelo</label>
                      <input 
                        type="text" 
                        value={editModelo} 
                        onChange={e => setEditModelo(e.target.value)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Setor / Localização</label>
                      <input 
                        type="text" 
                        value={editSetor} 
                        onChange={e => setEditSetor(e.target.value)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Líder Responsável</label>
                      <input 
                        type="text" 
                        value={editResponsavel} 
                        onChange={e => setEditResponsavel(e.target.value)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Status Operacional</label>
                      <select 
                        value={editStatus} 
                        onChange={e => setEditStatus(e.target.value as any)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
                      >
                        <option value="Operacional">Operacional</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                        <option value="Crítico">Crítico</option>
                      </select>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleSalvarEdicaoCompleta}
                        className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer flex-1 justify-center shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditNome(eq.nome);
                          setEditModelo(eq.modelo);
                          setEditSetor(eq.setor);
                          setEditResponsavel(eq.responsavel);
                          setEditStatus(eq.status);
                          setIsEditing(false);
                        }}
                        className="p-1.5 px-3 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer flex-1 justify-center"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Modelo:</span>
                      <span className="font-bold text-slate-800">{eq.modelo}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Setor/Localização:</span>
                      <span className="font-bold text-slate-800">{eq.setor}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Instalações Líder:</span>
                      <span className="font-bold text-slate-800">{eq.responsavel}</span>
                    </div>

                    {/* Botões de Ação Exclusivos do Gestor */}
                    {colaboradorLogado?.cargo === 'Gestor' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditNome(eq.nome);
                            setEditModelo(eq.modelo);
                            setEditSetor(eq.setor);
                            setEditResponsavel(eq.responsavel);
                            setEditStatus(eq.status);
                            setIsEditing(true);
                          }}
                          className="py-1.5 bg-blue-50 hover:bg-blue-105 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition cursor-pointer border border-blue-100"
                        >
                          <Edit3 className="w-3 h-3 text-blue-500" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={handleExcluirEquipamentoInterno}
                          className="py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition cursor-pointer border border-red-100"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Visualização de QR Code */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setModalQR(true)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-blue-600 rounded-lg inline-flex items-center space-x-1.5 active:scale-95"
                    >
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=Manutech-${eq.id}`} 
                        alt="Mini QR" 
                        className="w-4 h-4"
                      />
                      <span>Gerar Placa QR Regulamentar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Histórico Recorrente de Ordens de Serviço */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Atividades Vinculadas</h4>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                    {historicoOS.length} registro(s)
                  </span>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-xl max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Data</th>
                        <th className="px-3 py-2 font-semibold">Tipo</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                      {historicoOS.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-slate-400 italic">
                            Sem registros recentes.
                          </td>
                        </tr>
                      ) : (
                        historicoOS.map(os => (
                          <tr key={os.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-3 py-2.5 font-mono text-slate-500">{os.data.split(" - ")[0]}</td>
                            <td className="px-3 py-2.5 font-bold">{os.tipo}</td>
                            <td className="px-3 py-2.5 shrink-0">
                              <span className={`font-bold ${
                                os.status === "Concluído" ? "text-emerald-600" : "text-amber-500"
                              }`}>
                                {os.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Arquivar Documentos, Anexos e IA Gemini */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Abas Superiores da Coluna Direita */}
                <div className="flex border-b border-slate-200 mb-5 overflow-x-auto whitespace-nowrap scrollbar-none">
                  <button
                    onClick={() => setAbaAtiva('docs-ia')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 mr-6 flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                      abaAtiva === 'docs-ia' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-inherit" />
                    <span>Conformidade & IA</span>
                  </button>
                  
                  <button
                    onClick={() => setAbaAtiva('historico')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 mr-6 flex items-center space-x-1.5 cursor-pointer shrink-0 relative ${
                      abaAtiva === 'historico' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-inherit" />
                    <span>Histórico Completo</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 border border-slate-200">
                      {historicoOS.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAbaAtiva('pecas')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center space-x-1.5 cursor-pointer shrink-0 relative ${
                      abaAtiva === 'pecas' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-inherit" />
                    <span>Grupo de Peças</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 border border-slate-200">
                      {(eq.gruposPecas || []).length}
                    </span>
                  </button>
                </div>

                {abaAtiva === 'docs-ia' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Documentação de Conformidade</h4>
                      
                      {/* File Inputs para Manuais */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Ficha Técnica */}
                        <div className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:border-slate-200 transition">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-snug">Ficha Técnica</p>
                              <p className={`text-[9px] ${eq.docs.ficha ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                                {eq.docs.ficha ? "✓ Arquivado" : "Não anexada"}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-1.5 mt-3">
                            {eq.docs.ficha && (
                              <button 
                                onClick={() => onShowImageFull(eq.docs.ficha!)}
                                className="p-1 text-slate-600 hover:text-blue-600 bg-white border rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <label className="p-1 px-2 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded text-blue-600 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Subir</span>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadDoc('ficha', e)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        </div>

                        {/* Manual */}
                        <div className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:border-slate-200 transition">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-snug animate-none">Manual de Fábrica</p>
                              <p className={`text-[9px] ${eq.docs.manual ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                                {eq.docs.manual ? "✓ Arquivado" : "Não anexado"}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-1.5 mt-3">
                            {eq.docs.manual && (
                              <button 
                                onClick={() => onShowImageFull(eq.docs.manual!)}
                                className="p-1 text-slate-600 hover:text-amber-600 bg-white border rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <label className="p-1 px-2 bg-amber-50 border border-amber-100 hover:bg-amber-500 hover:text-white rounded text-amber-600 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Subir</span>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadDoc('manual', e)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        </div>

                        {/* Manual de Treino */}
                        <div className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:border-slate-200 transition">
                          <div className="flex items-center space-x-2">
                            <PlayCircle className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-snug">Roteiro Treino</p>
                              <p className={`text-[9px] ${eq.docs.treino ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                                {eq.docs.treino ? "✓ Arquivado" : "Não anexado"}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-1.5 mt-3">
                            {eq.docs.treino && (
                              <button 
                                onClick={() => onShowImageFull(eq.docs.treino!)}
                                className="p-1 text-slate-600 hover:text-emerald-600 bg-white border rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <label className="p-1 px-2 bg-emerald-50 border border-emerald-100 hover:bg-emerald-500 hover:text-white rounded text-emerald-600 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Subir</span>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadDoc('treino', e)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Registro Real de Anomalias & Diagnóstico Gemini AI ✨ */}
                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Registrar Parecer ou Diagnosticar Anomalias
                        </h4>
                        <div className="space-y-3 border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                          <textarea
                            value={sintomasIA}
                            onChange={e => setSintomasIA(e.target.value)}
                            rows={3}
                            className="w-full text-xs md:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white resize-none animate-none"
                            placeholder="Descreva o sintoma anômalo físico encontrado. Aceita imagens para auditoria. Use o botão abaixo ou clique em 'Gerar Parecer IA' para obter um boletim técnico."
                          />
                          
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-[11px] bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow cursor-pointer transition">
                              <Camera className="w-3.5 h-3.5" />
                              <span>Anexar Foto de Defeito</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleUploadFotoDefeito}
                                className="hidden" 
                              />
                            </label>

                            <button
                              onClick={analisarIA}
                              disabled={carregandoIA}
                              className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl flex items-center space-x-1 shadow transition cursor-pointer"
                            >
                              <Wand2 className="w-3.5 h-3.5 text-white" />
                              <span>{carregandoIA ? "Procurando..." : "Gerar Parecer IA ✨"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gemini Parecer Terminal */}
                      {parecerIA && (
                        <div className="mt-4 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2 max-h-56 overflow-y-auto animate-in fade-in duration-300">
                          <div className="flex items-center space-x-2 text-[10px] font-extrabold text-blue-900 uppercase tracking-wider pb-1.5 border-b border-blue-100">
                            <BrainCircuit className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span>Diagnóstico Inteligente Recomendado (Gemini 3.5)</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium pr-1">
                            {parecerIA}
                          </p>
                        </div>
                      )}

                      {/* Galeria Real de fotos anexadas */}
                      {eq.fotos && eq.fotos.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Imagens Anexadas Pelo Técnico ({eq.fotos.length})</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {eq.fotos.map((foto, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setLightboxIndex(idx)}
                                className="group relative bg-slate-100 rounded-xl overflow-hidden aspect-video cursor-zoom-in shadow-xs hover:ring-2 hover:ring-blue-500 transition border border-slate-100"
                              >
                                <img src={foto.src} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="Anomalia" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-1.5 flex flex-col justify-end">
                                  <p className="text-[9px] font-bold text-slate-100 leading-none truncate">{foto.descricao}</p>
                                  <span className="text-[8px] text-slate-300">{foto.data}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {abaAtiva === 'historico' && (
                  /* LINHA DO TEMPO VERTICAL do Histórico Completo de Intervenções Pastas */
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="border-b pb-3 border-slate-155 pb-1 mb-2">
                      <h4 className="text-sm font-bold text-slate-900">Linha do Tempo de Intervenções Operacionais</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Rastreabilidade geral e histórico completo de engenharia e confiabilidade vinculados à máquina.</p>
                    </div>

                    {historicoOS.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2.5 animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-700">Sem registros no histórico</h5>
                        <p className="text-[10.5px] text-slate-450 mt-1">Nenhuma Ordem de Serviço foi emitida ou associada aos termos de buscas deste ativo ainda.</p>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                        {historicoOS.map((os) => {
                          const isConcluido = os.status === "Concluído";
                          const isAndamento = os.status === "Em Andamento";
                          return (
                            <div key={os.id} className="relative group/time">
                              {/* Bolinha da Linha do Tempo */}
                              <div className={`absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full border-2 transition group-hover/time:scale-125 duration-150 z-10 ${
                                isConcluido 
                                  ? 'bg-emerald-500 border-emerald-100' 
                                  : isAndamento 
                                    ? 'bg-blue-500 border-blue-150 animate-bounce' 
                                    : 'bg-amber-500 border-amber-100'
                              }`} />

                              {/* Conteúdo do Card */}
                              <div className="bg-slate-50/40 hover:bg-slate-55 p-4 rounded-xl border border-slate-200/80 transition group-hover/time:border-slate-300 duration-200 space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-dashed border-slate-200">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                                      os.prioridade === 'Alta' 
                                        ? 'bg-rose-100 text-rose-800' 
                                        : os.prioridade === 'Média' 
                                          ? 'bg-amber-100 text-amber-800' 
                                          : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {os.tipo}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold text-slate-450">#{os.id}</span>
                                  </div>

                                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold font-mono">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{os.data}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                                    {os.descricao.length > 50 ? os.descricao.substring(0, 50) + "..." : "Intervenção Técnica Geral"}
                                  </h5>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                                    {os.descricao}
                                  </p>
                                </div>

                                <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/30">
                                  <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-bold">
                                    <UserCheck className="w-3.5 h-3.5 text-zinc-450" />
                                    <span>Técnico: <span className="text-zinc-750 font-black">{os.solicitante}</span></span>
                                  </div>

                                  <div className="flex flex-col items-end text-right">
                                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                      isConcluido 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : isAndamento 
                                          ? 'bg-blue-105 text-blue-800' 
                                          : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {os.status}
                                    </span>
                                    {isConcluido && os.dataConclusao && (
                                      <span className="text-[8px] text-emerald-600 font-bold mt-1">
                                        Concluído em: {os.dataConclusao}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {abaAtiva === 'pecas' && (
                  <div className="space-y-6 animate-in fade-in duration-250">
                    <div className="border-b pb-3 border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        <span>Mapeamento de Peças & Componentes</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Divisão estrutural dos subgrupos e sobressalentes vinculados ao ativo para rapidez diagnóstica e auditoria.
                      </p>
                    </div>

                    {/* Cadastrar Novo Grupo de Peças (Disponível para Gestores / Técnicos) */}
                    {(colaboradorLogado?.cargo === 'Gestor' || colaboradorLogado?.cargo === 'Técnico') && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Criar Novo Grupo Mecânico</label>
                        <div className="flex space-x-2">
                          <input 
                            type="text"
                            placeholder="Ex: Sistema Hidráulico, Transmissão por Polia..."
                            value={novoGrupoNome}
                            onChange={e => setNovoGrupoNome(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAdicionarGrupoPeca(); }}
                            className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleAdicionarGrupoPeca}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                          >
                            + Criar Grupo
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista Suspeita/Suspensa de Grupos Cadastrados (Acordeão) */}
                    {(!eq.gruposPecas || eq.gruposPecas.length === 0) ? (
                      <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-5">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-700">Nenhum grupo de peças cadastrado</h5>
                        <p className="text-[10px] text-slate-500 mt-1">Crie um grupo acima para começar a mapear as peças internas que compõem este equipamento.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {eq.gruposPecas.map((grupo) => {
                          const isExpandido = !!gruposExpandidos[grupo.id];
                          return (
                            <div key={grupo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                              
                              {/* Elemento de Gatilho / Header com lista suspensa */}
                              <div 
                                onClick={() => {
                                  setGruposExpandidos(prev => ({ ...prev, [grupo.id]: !isExpandido }));
                                }}
                                className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition border-b border-transparent"
                              >
                                <div className="flex items-center space-x-2 flex-grow">
                                  {isExpandido ? (
                                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                  )}
                                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">{grupo.nome}</span>
                                  <span className="font-mono text-[9px] text-slate-400 bg-slate-100 p-1 px-1.5 rounded-full border">
                                    {grupo.pecas.length} {grupo.pecas.length === 1 ? 'peça' : 'peças'}
                                  </span>
                                </div>

                                {/* Botão exclusão de grupo para Gestores */}
                                {colaboradorLogado?.cargo === 'Gestor' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Evita expandir/retrair a linha ao clique
                                      handleRemoverGrupoPeca(grupo.id);
                                    }}
                                    className="p-1 hover:bg-red-50 text-slate-450 hover:text-red-600 rounded transition shrink-0 cursor-pointer"
                                    title="Excluir este grupo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Conteúdo Expansível (Lista Suspensa que abre com as peças) */}
                              {isExpandido && (
                                <div className="p-4 bg-white space-y-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150">
                                  
                                  {/* Sublista de peças */}
                                  {grupo.pecas.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Sem peças cadastradas nesta seção de componentes.</p>
                                  ) : (
                                    <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                                      {grupo.pecas.map((peca, idx) => (
                                        <li key={idx} className="flex items-center justify-between p-2 px-3 hover:bg-slate-50/40 text-xs">
                                          <div className="flex items-center space-x-2 text-slate-700">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                            <span className="font-medium">{peca}</span>
                                          </div>
                                          
                                          {/* Excluir Peça */}
                                          {colaboradorLogado?.cargo === 'Gestor' && (
                                            <button
                                              onClick={() => handleRemoverPeca(grupo.id, idx)}
                                              className="p-0.5 text-slate-350 hover:text-red-500 transition cursor-pointer"
                                              title="Excluir Peça"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Input para adicionar peça (Gestores e Técnicos) */}
                                  {(colaboradorLogado?.cargo === 'Gestor' || colaboradorLogado?.cargo === 'Técnico') && (
                                    <div className="flex items-center space-x-2 pt-2 border-t border-dashed border-slate-100">
                                      <input 
                                        type="text"
                                        placeholder="Nova peça (ex: Rolamento SKF 6204)..."
                                        value={novaPecaNome[grupo.id] || ""}
                                        onChange={e => {
                                          const val = e.target.value;
                                          setNovaPecaNome(prev => ({ ...prev, [grupo.id]: val }));
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') handleAdicionarPeca(grupo.id);
                                        }}
                                        className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs focus:outline-none text-slate-800"
                                      />
                                      <button
                                        onClick={() => handleAdicionarPeca(grupo.id)}
                                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0"
                                      >
                                        + Adicionar
                                      </button>
                                    </div>
                                  )}

                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Modal QR Code Grande Impressão */}
      {modalQR && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalQR(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Identificador QR Placa</h3>
            <p className="text-xs text-slate-500 mb-6">Etiqueta de fixação física de máquinas para o ecrã regulamentar na oficina.</p>
            <div className="bg-white p-4 border-2 border-dashed border-slate-200 rounded-2xl inline-block mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Manutech-${eq.id}`} 
                alt="QR Code Ativo" 
                className="w-44 h-44 mx-auto" 
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={() => window.print()} 
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cartaz com QR Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Galeria Lightbox de Defeitos Sistemáticos com Navegação e Zoom */}
      {lightboxIndex !== null && eq.fotos && eq.fotos.length > 0 && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[110] flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          
          {/* Header de Ações */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-3 z-10 shrink-0 select-none pb-4 border-b border-slate-800/80">
            <div>
              <h4 className="font-bold text-sm text-slate-100 uppercase tracking-widest">{eq.nome}</h4>
              <p className="text-[10px] text-slate-400 font-medium font-mono">
                FOTO {lightboxIndex + 1} DE {eq.fotos.length} — {eq.fotos[lightboxIndex].descricao || "Sem observação"}
              </p>
            </div>
            
            {/* Controles de Zoom */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setZoomScale(z => Math.max(z - 0.25, 0.5))} 
                className="p-1.5 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-blue-400 rounded-xl transition cursor-pointer"
                title="Ampliar Menos"
              >
                <MinusCircle className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-bold w-12 text-center text-slate-300">
                {Math.round(zoomScale * 100)}%
              </span>
              
              <button 
                onClick={() => setZoomScale(z => Math.min(z + 0.25, 3.5))} 
                className="p-1.5 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-blue-400 rounded-xl transition cursor-pointer"
                title="Ampliar Mais"
              >
                <PlusCircle className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setZoomScale(1)} 
                className="p-1 px-2.5 border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 rounded-xl text-[9px] font-extrabold uppercase text-slate-400 transition cursor-pointer"
              >
                Original
              </button>

              <button 
                onClick={() => { setLightboxIndex(null); setZoomScale(1); }} 
                className="p-1.5 border border-red-950 bg-red-950/50 hover:bg-red-650 text-red-200 hover:text-white rounded-xl transition cursor-pointer"
                title="Fechar Galeria"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área Principal: Botões de Navegação Lateral + Visualizador Central de Alta Fidelidade */}
          <div className="flex-1 flex items-center justify-between relative overflow-hidden my-4 gap-2">
            
            {/* Botão de Slide Anterior */}
            <button
              onClick={() => {
                setZoomScale(1);
                setLightboxIndex(prev => (prev === null || prev === 0) ? (eq.fotos!.length - 1) : prev - 1);
              }}
              className="p-3 rounded-full border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-blue-400 hover:scale-105 active:scale-95 transition z-10 cursor-pointer shrink-0"
              title="Foto Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Imagem Ampliável */}
            <div className="flex-1 flex items-center justify-center p-2 h-full relative overflow-auto">
              <div className="max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200">
                <img 
                  src={eq.fotos[lightboxIndex].src} 
                  alt="Anomalia Ampliada Luva Manutech"
                  className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-300 select-none"
                  style={{ transform: `scale(${zoomScale})` }}
                />
              </div>
            </div>

            {/* Botão de Slide Próximo */}
            <button
              onClick={() => {
                setZoomScale(1);
                setLightboxIndex(prev => (prev === null || prev === eq.fotos!.length - 1) ? 0 : prev + 1);
              }}
              className="p-3 rounded-full border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-blue-400 hover:scale-105 active:scale-95 transition z-10 cursor-pointer shrink-0"
              title="Próxima Foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Rodapé da Galeria: Metadados Expressos + Carrossel de Miniaturas */}
          <div className="pb-2 flex flex-col items-center space-y-3 shrink-0 select-none border-t border-slate-800/80 pt-4">
            <p className="text-[10px] font-mono text-slate-400 leading-none">
              ANOTADO EM: <span className="text-slate-200 font-bold">{eq.fotos[lightboxIndex].data}</span> • AUDITORIA OFICIAL MANUTECH
            </p>
            
            {/* Miniaturas */}
            <div className="flex justify-center items-center gap-2 max-w-full overflow-x-auto pb-1 px-4">
              {eq.fotos.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => { setZoomScale(1); setLightboxIndex(idx); }}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    idx === lightboxIndex ? "border-blue-500 scale-105 ring-4 ring-blue-500/20" : "border-slate-800 opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={f.src} className="w-full h-full object-cover" alt="Defeito Mini" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
