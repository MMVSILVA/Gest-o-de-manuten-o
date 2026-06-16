/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, ArrowLeft, Server, FileText, CheckCircle, UploadCloud, Eye, BookOpen, 
  PlayCircle, Camera, Sparkles, Wand2, BrainCircuit, Printer,
  ChevronLeft, ChevronRight, PlusCircle, MinusCircle,
  Clock, Calendar, AlertTriangle, Activity, UserCheck, ClipboardCheck,
  ChevronDown, ChevronUp, Trash2, Edit3, Save, RotateCcw, Wrench,
  Search, Filter, Check, ListTodo
} from "lucide-react";
import { Equipamento, OrdemServico, Colaborador, DefeitoFoto, GrupoPeca, PecaItem } from "../types";

interface Props {
  eq: Equipamento;
  ordens: OrdemServico[];
  colaboradorLogado: Colaborador | null;
  onBack: () => void;
  onUpdateEquipamento: (updated: Equipamento) => void;
  onShowImageFull: (src: string) => void;
  onExcluirEquipamento?: (id: string) => void;
  onAbrirNovaOs?: (nomeEquipamento: string) => void;
}

interface ChecklistItem {
  id: string;
  categoria: string;
  item: string;
  status: 'conforme' | 'nao-conforme' | 'critico' | 'na' | 'pendente';
  observacao: string;
}

interface ChecklistSalvo {
  id: string;
  data: string;
  timestamp: number;
  usuario: string;
  inconformidadesCount: number;
  criticosCount: number;
  itens: ChecklistItem[];
  notaGeral: string;
}

const obterCoresCategoria = (categoria: string) => {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("segur")) {
    return {
      badgeBg: "bg-rose-100 text-rose-850 border-rose-200",
      cardBg: "bg-rose-50/20 hover:bg-rose-50/40 border-rose-200",
      textSide: "border-l-4 border-rose-500",
      colorText: "text-rose-950",
      emoji: "🛡️"
    };
  }
  if (cat.includes("lubrif")) {
    return {
      badgeBg: "bg-amber-100 text-amber-850 border-amber-200",
      cardBg: "bg-amber-50/25 hover:bg-amber-50/50 border-amber-200",
      textSide: "border-l-4 border-amber-500",
      colorText: "text-amber-950",
      emoji: "🛢️"
    };
  }
  if (cat.includes("mecan")) {
    return {
      badgeBg: "bg-blue-100 text-blue-850 border-blue-200",
      cardBg: "bg-blue-50/20 hover:bg-blue-50/45 border-blue-200",
      textSide: "border-l-4 border-blue-500",
      colorText: "text-blue-950",
      emoji: "⚙️"
    };
  }
  if (cat.includes("eletr")) {
    return {
      badgeBg: "bg-purple-100 text-purple-850 border-purple-200",
      cardBg: "bg-purple-50/20 hover:bg-purple-50/45 border-purple-200",
      textSide: "border-l-4 border-purple-500",
      colorText: "text-purple-950",
      emoji: "⚡"
    };
  }
  if (cat.includes("veda") || cat.includes("vaza")) {
    return {
      badgeBg: "bg-cyan-100 text-cyan-850 border-cyan-200",
      cardBg: "bg-cyan-50/20 hover:bg-cyan-50/45 border-cyan-200",
      textSide: "border-l-4 border-cyan-500",
      colorText: "text-cyan-950",
      emoji: "💧"
    };
  }
  if (cat.includes("med") || cat.includes("ajust") || cat.includes("calib")) {
    return {
      badgeBg: "bg-fuchsia-100 text-fuchsia-850 border-fuchsia-200",
      cardBg: "bg-fuchsia-50/20 hover:bg-fuchsia-50/45 border-fuchsia-200",
      textSide: "border-l-4 border-fuchsia-500",
      colorText: "text-fuchsia-950",
      emoji: "📐"
    };
  }
  if (cat.includes("refrig")) {
    return {
      badgeBg: "bg-sky-100 text-sky-850 border-sky-200",
      cardBg: "bg-sky-50/20 hover:bg-sky-50/45 border-sky-200",
      textSide: "border-l-4 border-sky-500",
      colorText: "text-sky-950",
      emoji: "❄️"
    };
  }
  if (cat.includes("usin") || cat.includes("ferram")) {
    return {
      badgeBg: "bg-indigo-100 text-indigo-850 border-indigo-200",
      cardBg: "bg-indigo-50/20 hover:bg-indigo-50/45 border-indigo-205",
      textSide: "border-l-4 border-indigo-500",
      colorText: "text-indigo-950",
      emoji: "🎯"
    };
  }
  return {
    badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
    cardBg: "bg-slate-50/40 hover:bg-slate-50/70 border-slate-200",
    textSide: "border-l-4 border-slate-450",
    colorText: "text-slate-905",
    emoji: "📋"
  };
};

export const EquipmentDetailModal: React.FC<Props> = ({
  eq,
  ordens,
  colaboradorLogado,
  onBack,
  onUpdateEquipamento,
  onShowImageFull,
  onExcluirEquipamento,
  onAbrirNovaOs
}) => {
  const [nomeInterno, setNomeInterno] = useState(eq.nome);
  const [sintomasIA, setSintomasIA] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<'docs-ia' | 'historico' | 'pecas' | 'checklist'>('docs-ia');
  const [parecerIA, setParecerIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemServico | null>(null);

  // States auxiliares de Checklist
  const obterItensIniciaisChecklist = (): ChecklistItem[] => {
    const nomeEqLow = eq.nome.toLowerCase();
    let itensBasicos: { categoria: string; item: string }[] = [];

    if (nomeEqLow.includes("compressor")) {
      itensBasicos = [
        { categoria: "Segurança", item: "Testar válvula de alívio e pressostato de limite" },
        { categoria: "Lubrificação", item: "Verificar nível de óleo do compressor no visor de vidro" },
        { categoria: "Mecânica", item: "Inspecionar tensão e alinhamento das correias de polia" },
        { categoria: "Sistemas", item: "Drenar condensado acumulado no reservatório (purgador)" },
        { categoria: "Vedação", item: "Inspecionar conexões para identificar possíveis vazamentos de ar" },
        { categoria: "Elétrica", item: "Verificar fiação de alimentação e aterramento elétrico estático" },
        { categoria: "Operacional", item: "Monitorar ruído, vibração ou aquecimento excessivo na partida" }
      ];
    } else if (nomeEqLow.includes("fresa") || nomeEqLow.includes("fresadora") || nomeEqLow.includes("torno") || nomeEqLow.includes("cnc") || nomeEqLow.includes("usinagem") || nomeEqLow.includes("furadeira")) {
      itensBasicos = [
        { categoria: "Segurança", item: "Verificar funcionamento do Botão de Emergência e travas" },
        { categoria: "Lubrificação", item: "Verificar lubrificação hidráulica das guias e fusos de esferas" },
        { categoria: "Refrigeração", item: "Verificar nível e consistência do líquido refrigerante/óleo de corte" },
        { categoria: "Mecânica", item: "Eliminar cavacos acumulados na mesa e nos barramentos lineares" },
        { categoria: "Usinagem", item: "Avaliar o desgaste dos insertos, pinças e suporte de ferramentas" },
        { categoria: "Elétrica", item: "Inspecionar painel de comando e integridade elétrica dos servo-motores" },
        { categoria: "Medição", item: "Verificar tolerância mecânica e zeramento dos eixos mecânicos/sensores" }
      ];
    } else {
      itensBasicos = [
        { categoria: "Segurança", item: "Testar botão de parada emergencial e proteções mecânicas ativas" },
        { categoria: "Elétrica", item: "Inspecionar cabo de alimentação elétrico, blindagem e conectores" },
        { categoria: "Mecânica", item: "Avaliar reaperto de parafusos de sustentação, polias, engrenagens e eixos" },
        { categoria: "Sistemas", item: "Limpar filtros e verificar entradas e saídas de ar de refrigeração" },
        { categoria: "Operacional", item: "Monitorar se há calor excessivo, vibrações sonoras ou odores estranhos" },
        { categoria: "Sinalização", item: "Verificar indicadores visuais de status, displays ou lâmpadas piloto" }
      ];
    }

    return itensBasicos.map((it, idx) => ({
      id: `chk-${idx}`,
      categoria: it.categoria,
      item: it.item,
      status: 'pendente',
      observacao: ''
    }));
  };

  const [itensChecklist, setItensChecklist] = useState<ChecklistItem[]>(obterItensIniciaisChecklist);
  const [novoItemDesc, setNovoItemDesc] = useState("");
  const [novoItemCat, setNovoItemCat] = useState("Especificidades");

  // Filtros do Checklist
  const [filtroTextoChecklist, setFiltroTextoChecklist] = useState("");
  const [filtroStatusChecklist, setFiltroStatusChecklist] = useState("Todos");
  const [filtroCategoriaChecklist, setFiltroCategoriaChecklist] = useState("Todos");

  const [historicoChecklist, setHistoricoChecklist] = useState<ChecklistSalvo[]>(() => {
    const saved = localStorage.getItem(`manutech_checklist_history_${eq.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleAdicionarItemChecklist = () => {
    if (!novoItemDesc.trim()) return;
    const novo: ChecklistItem = {
      id: `chk-${Date.now()}`,
      categoria: novoItemCat,
      item: novoItemDesc.trim(),
      status: 'pendente',
      observacao: ''
    };
    setItensChecklist(prev => [...prev, novo]);
    setNovoItemDesc("");
  };

  const handleMudarStatusItem = (itemId: string, status: 'pendente' | 'conforme' | 'nao-conforme' | 'critico' | 'na') => {
    setItensChecklist(prev => prev.map(it => it.id === itemId ? { ...it, status } : it));
  };

  const handleMudarObservacaoItem = (itemId: string, observacao: string) => {
    setItensChecklist(prev => prev.map(it => it.id === itemId ? { ...it, observacao } : it));
  };

  const handleResetChecklist = () => {
    setItensChecklist(obterItensIniciaisChecklist());
  };

  const handleExcluirRegistroChecklist = (recId: string) => {
    if (!window.confirm("Deseja realmente remover esta verificação histórica?")) return;
    const novoHist = historicoChecklist.filter(h => h.id !== recId);
    setHistoricoChecklist(novoHist);
    localStorage.setItem(`manutech_checklist_history_${eq.id}`, JSON.stringify(novoHist));
  };

  const handleSalvarChecklist = () => {
    const pendentesCount = itensChecklist.filter(it => it.status === 'pendente').length;
    if (pendentesCount > 0) {
      const prosseguir = window.confirm(
        `Atenção: Existem ainda ${pendentesCount} itens sem verificação (pendentes).\nDeseja salvar e registrar o checklist com estes itens pendentes de vistoria?`
      );
      if (!prosseguir) return;
    }

    const nomeInsp = colaboradorLogado ? colaboradorLogado.nome : "Técnico Visitante";
    const incorformidades = itensChecklist.filter(it => it.status === 'nao-conforme').length;
    const criticos = itensChecklist.filter(it => it.status === 'critico').length;
    
    let nota = "Excelente";
    if (criticos > 0) {
      nota = "Intervenção Urgente!";
    } else if (incorformidades > 0) {
      nota = "Atenção Requerida";
    }

    const novoRegistro: ChecklistSalvo = {
      id: `chk-salvo-${Date.now()}`,
      data: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      usuario: nomeInsp,
      inconformidadesCount: incorformidades,
      criticosCount: criticos,
      itens: [...itensChecklist],
      notaGeral: nota
    };

    const novoHist = [novoRegistro, ...historicoChecklist];
    setHistoricoChecklist(novoHist);
    localStorage.setItem(`manutech_checklist_history_${eq.id}`, JSON.stringify(novoHist));

    alert(`Checklist registrado com sucesso!\nStatus Geral: ${nota}\n\nO histórico de inspeção deste ativo foi atualizado.`);

    if (criticos > 0 || incorformidades > 0) {
      const issues = itensChecklist
        .filter(it => it.status === 'critico' || it.status === 'nao-conforme')
        .map(it => `- [${it.status.slice(0, 3).toUpperCase()}] ${it.item} (${it.categoria}): ${it.observacao || 'Sem observação detalhada'}`)
        .join("\n");

      const confirmOs = window.confirm(
        `Atenção: Foram encontradas ${criticos + incorformidades} desconformidades na máquina!\n\nDeseja gerar uma Ordem de Serviço Corretiva imediata no sistema preenchida com estes defeitos?`
      );

      if (confirmOs && onAbrirNovaOs) {
        const prefilledDesc = `Checklist de Inspeção preventiva identificou as seguintes anomalias no equipamento:\n\n${issues}\n\nResponsável pela verificação: ${nomeInsp}.`;
        localStorage.setItem("manutech_prefilled_os_desc", prefilledDesc);
        localStorage.setItem("manutech_prefilled_os_tipo", "Corretiva");
        localStorage.setItem("manutech_prefilled_os_prio", criticos > 0 ? "Alta" : "Média");
        onAbrirNovaOs(eq.nome);
      }
    }
  };

  // States para Edição Completa (Gestor / Técnico com Permissões)
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState(eq.nome);
  const [editModelo, setEditModelo] = useState(eq.modelo);
  const [editSetor, setEditSetor] = useState(eq.setor);
  const [editStatus, setEditStatus] = useState(eq.status);
  const [editResponsavel, setEditResponsavel] = useState(eq.responsavel);
  const [editMtbf, setEditMtbf] = useState(eq.mtbf !== undefined ? eq.mtbf : 0);
  const [editMttr, setEditMttr] = useState(eq.mttr !== undefined ? eq.mttr : 0);
  const [editDataEntrada, setEditDataEntrada] = useState(eq.dataEntrada || "");
  const [editPecaMaisProblematica, setEditPecaMaisProblematica] = useState(eq.pecaMaisProblematica || "");
  const [editCriticidadePeca, setEditCriticidadePeca] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>(eq.criticidadePeca || "Média");

  // States para Divisão de Grupos de Peças
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [novaPecaNome, setNovaPecaNome] = useState<Record<string, string>>({}); // gp_id -> peca_nome
  const [novaPecaQtd, setNovaPecaQtd] = useState<Record<string, number>>({});
  const [novaPecaMin, setNovaPecaMin] = useState<Record<string, number>>({});

  const [apenasConcluidas, setApenasConcluidas] = useState(true);

  // Filtra as O.S. correspondentes a esta máquina
  const historicoOS = ordens.filter(o => 
    o.equipamento.toLowerCase().includes(eq.nome.split(" ")[0].toLowerCase()) ||
    o.equipamento.toLowerCase().includes(eq.modelo.toLowerCase())
  );

  const historicoOSExibidas = apenasConcluidas
    ? historicoOS.filter(o => o.status === "Concluído")
    : historicoOS;

  const handleUpdateNome = () => {
    if (!nomeInterno.trim()) return;
    onUpdateEquipamento({
      ...eq,
      nome: nomeInterno.trim()
    });
  };

  // Funções de Edição Completa para Gestor / Técnico
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
      responsavel: editResponsavel.trim() || "Geral",
      mtbf: Number(editMtbf) || undefined,
      mttr: Number(editMttr) || undefined,
      dataEntrada: editDataEntrada || undefined,
      pecaMaisProblematica: editPecaMaisProblematica || undefined,
      criticidadePeca: editCriticidadePeca
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
  const obterGruposPecasLogica = (): GrupoPeca[] => {
    return (eq.gruposPecas || []).map(g => {
      if (!g.pecasDetalhes) {
        const pecasDetalhes: PecaItem[] = g.pecas.map((nome, idx) => ({
          id: `${g.id}_p_${idx}_${nome}`,
          nome,
          quantidade: 5,
          nivelMinimo: 2
        }));
        return { ...g, pecasDetalhes };
      }
      return g;
    });
  };

  const handleAdicionarGrupoPeca = () => {
    if (!novoGrupoNome.trim()) return;
    const novoGP: GrupoPeca = {
      id: "gp_" + Date.now(),
      nome: novoGrupoNome.trim(),
      pecas: [],
      pecasDetalhes: []
    };
    const nextGrupos = [...obterGruposPecasLogica(), novoGP];
    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });
    setNovoGrupoNome("");
    setGruposExpandidos(prev => ({ ...prev, [novoGP.id]: true }));
  };

  const handleRemoverGrupoPeca = (gpId: string) => {
    if (window.confirm("Deseja realmente remover este grupo de peças por completo?")) {
      const nextGrupos = obterGruposPecasLogica().filter(g => g.id !== gpId);
      onUpdateEquipamento({
        ...eq,
        gruposPecas: nextGrupos
      });
    }
  };

  const handleAdicionarPeca = (gpId: string) => {
    const nomePeca = novaPecaNome[gpId]?.trim();
    if (!nomePeca) return;

    const qtd = novaPecaQtd[gpId] !== undefined ? novaPecaQtd[gpId] : 5;
    const min = novaPecaMin[gpId] !== undefined ? novaPecaMin[gpId] : 2;

    const novaPecaItem: PecaItem = {
      id: "p_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      nome: nomePeca,
      quantidade: qtd,
      nivelMinimo: min
    };

    const nextGrupos = obterGruposPecasLogica().map(g => {
      if (g.id === gpId) {
        const pecasDetalhes = [...(g.pecasDetalhes || []), novaPecaItem];
        return {
          ...g,
          pecas: [...g.pecas, nomePeca],
          pecasDetalhes
        };
      }
      return g;
    });

    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });

    setNovaPecaNome(prev => ({ ...prev, [gpId]: "" }));
    setNovaPecaQtd(prev => ({ ...prev, [gpId]: 5 }));
    setNovaPecaMin(prev => ({ ...prev, [gpId]: 2 }));
  };

  const handleRemoverPeca = (gpId: string, pecaIndex: number) => {
    const nextGrupos = obterGruposPecasLogica().map(g => {
      if (g.id === gpId) {
        const pecasDetalhes = (g.pecasDetalhes || []).filter((_, idx) => idx !== pecaIndex);
        return {
          ...g,
          pecas: g.pecas.filter((_, idx) => idx !== pecaIndex),
          pecasDetalhes
        };
      }
      return g;
    });

    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });
  };

  const handleUpdateEstoque = (gpId: string, pecaId: string, delta: number) => {
    const nextGrupos = obterGruposPecasLogica().map(g => {
      if (g.id === gpId) {
        const pecasDetalhes = (g.pecasDetalhes || []).map(p => {
          if (p.id === pecaId) {
            return { ...p, quantidade: Math.max(0, p.quantidade + delta) };
          }
          return p;
        });
        return { ...g, pecasDetalhes };
      }
      return g;
    });

    onUpdateEquipamento({
      ...eq,
      gruposPecas: nextGrupos
    });
  };

  const handleUpdateNivelMinimo = (gpId: string, pecaId: string, delta: number) => {
    const nextGrupos = obterGruposPecasLogica().map(g => {
      if (g.id === gpId) {
        const pecasDetalhes = (g.pecasDetalhes || []).map(p => {
          if (p.id === pecaId) {
            return { ...p, nivelMinimo: Math.max(0, p.nivelMinimo + delta) };
          }
          return p;
        });
        return { ...g, pecasDetalhes };
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

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Data de Entrada</label>
                      <input 
                        type="text" 
                        value={editDataEntrada} 
                        onChange={e => setEditDataEntrada(e.target.value)} 
                        placeholder="Ex: 11/06/2026"
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">MTBF (Horas)</label>
                      <input 
                        type="number" 
                        value={editMtbf} 
                        onChange={e => setEditMtbf(Number(e.target.value))} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">MTTR (Horas)</label>
                      <input 
                        type="number" 
                        value={editMttr} 
                        onChange={e => setEditMttr(Number(e.target.value))} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Peça Mais Problemática</label>
                      <input 
                        type="text" 
                        value={editPecaMaisProblematica} 
                        onChange={e => setEditPecaMaisProblematica(e.target.value)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        placeholder="Parte/componente que mais falha"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Análise Criticidade da Peça</label>
                      <select 
                        value={editCriticidadePeca} 
                        onChange={e => setEditCriticidadePeca(e.target.value as any)} 
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
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
                          setEditMtbf(eq.mtbf !== undefined ? eq.mtbf : 0);
                          setEditMttr(eq.mttr !== undefined ? eq.mttr : 0);
                          setEditDataEntrada(eq.dataEntrada || "");
                          setEditPecaMaisProblematica(eq.pecaMaisProblematica || "");
                          setEditCriticidadePeca(eq.criticidadePeca || "Média");
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

                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Data de Entrada:</span>
                      <span className="font-bold text-slate-800">{eq.dataEntrada || "Não informada"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>MTBF Operacional:</span>
                      <span className="font-mono font-bold text-slate-800">{eq.mtbf !== undefined ? `${eq.mtbf}h` : "N/D"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>MTTR Corretiva:</span>
                      <span className="font-mono font-bold text-slate-800">{eq.mttr !== undefined ? `${eq.mttr}h` : "N/D"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Parte Mais Problemática:</span>
                      <span className="font-bold text-slate-800">{eq.pecaMaisProblematica || "Não mapeado"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Criticidade da Peça:</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md tracking-wider ${
                        eq.criticidadePeca === 'Crítica' ? 'bg-red-50 text-red-700 border border-red-105' :
                        eq.criticidadePeca === 'Alta' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        eq.criticidadePeca === 'Baixa' ? 'bg-slate-50 text-slate-700 border border-slate-150' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-150'
                      }`}>{eq.criticidadePeca || "Média"}</span>
                    </div>

                    {/* Botões de Ação Exclusivos do Gestor / Técnico */}
                    {colaboradorLogado?.cargo === 'Técnico' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditNome(eq.nome);
                            setEditModelo(eq.modelo);
                            setEditSetor(eq.setor);
                            setEditResponsavel(eq.responsavel);
                            setEditStatus(eq.status);
                            setEditMtbf(eq.mtbf !== undefined ? eq.mtbf : 0);
                            setEditMttr(eq.mttr !== undefined ? eq.mttr : 0);
                            setEditDataEntrada(eq.dataEntrada || "");
                            setEditPecaMaisProblematica(eq.pecaMaisProblematica || "");
                            setEditCriticidadePeca(eq.criticidadePeca || "Média");
                            setIsEditing(true);
                          }}
                          className="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-605 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition cursor-pointer border border-blue-100"
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
                          <tr 
                            key={os.id} 
                            onClick={() => setOrdemSelecionada(os)}
                            className="hover:bg-blue-50/45 hover:text-blue-700 transition cursor-pointer"
                            title="Clique para ver os detalhes completos desta Ordem de Serviço"
                          >
                            <td className="px-3 py-2.5 font-mono text-slate-500 font-medium">{os.data.split(" - ")[0]}</td>
                            <td className="px-3 py-2.5 font-bold">{os.tipo}</td>
                            <td className="px-3 py-2.5 shrink-0">
                              <span className={`font-black ${
                                os.status === "Concluído" ? "text-emerald-700" : "text-amber-600"
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

                {/* Botão de Atalho para Criar O.S. vinculada */}
                {colaboradorLogado?.cargo !== "Instrutor" && onAbrirNovaOs && (
                  <button
                    onClick={() => onAbrirNovaOs(eq.nome)}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-blue-100/80 active:scale-98"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Solicitar Manutenção para {eq.nome.split(" ")[0]}</span>
                  </button>
                )}
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
                    onClick={() => setAbaAtiva('checklist')}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 mr-6 flex items-center space-x-1.5 cursor-pointer shrink-0 relative ${
                      abaAtiva === 'checklist' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4 text-inherit" />
                    <span>Checklist Inspeção</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 border border-slate-200" title="Itens de verificação técnica">
                      {itensChecklist.length}
                    </span>
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
                    <span>Histórico de Intervenções</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 border border-slate-200" title="Históricos finalizados para este ativo">
                      {historicoOS.filter(o => o.status === "Concluído").length}
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
                    <div className="border-b pb-3 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Histórico de Intervenções Técnicas</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Rastreabilidade geral e histórico de ordens de serviço finalizadas neste ativo.</p>
                      </div>

                      {/* Toggle para filtrar apenas as finalizadas */}
                      <label className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition select-none shrink-0">
                        <input 
                          type="checkbox"
                          checked={apenasConcluidas}
                          onChange={e => setApenasConcluidas(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-extrabold text-slate-650">Apenas Finalizadas</span>
                      </label>
                    </div>

                    {historicoOSExibidas.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2.5 animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-700">Sem registros condizentes</h5>
                        <p className="text-[10.5px] text-slate-450 mt-1">
                          {apenasConcluidas 
                            ? "Nenhuma Ordem de Serviço foi concluída/finalizada para este ativo ainda." 
                            : "Nenhuma Ordem de Serviço foi emitida ou associada a este ativo ainda."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                        {historicoOSExibidas.map((os) => {
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
                              <div className="bg-slate-50/40 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 transition group-hover/time:border-slate-300 duration-200 space-y-2.5">
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

                    {/* Cadastrar Novo Grupo de Peças (Disponível para Técnicos com Permissões) */}
                    {colaboradorLogado?.cargo === 'Técnico' && (
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
                        {obterGruposPecasLogica().map((grupo) => {
                          const isExpandido = !!gruposExpandidos[grupo.id];
                          const piecesList = grupo.pecasDetalhes || [];
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
                                    {piecesList.length} {piecesList.length === 1 ? 'peça' : 'peças'}
                                  </span>
                                </div>

                                {/* Botão exclusão de grupo para Técnicos */}
                                {colaboradorLogado?.cargo === 'Técnico' && (
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
                                  {piecesList.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Sem peças cadastradas nesta seção de componentes.</p>
                                  ) : (
                                    <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                                      {piecesList.map((peca, idx) => {
                                        const isCritico = peca.quantidade < peca.nivelMinimo;
                                        return (
                                          <li key={peca.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 hover:bg-slate-50/40 text-xs gap-3">
                                            <div className="flex items-center space-x-2 text-slate-700 min-w-0 flex-1">
                                              <div className={`w-2 h-2 rounded-full shrink-0 ${isCritico ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                              <span className="font-extrabold text-slate-850 truncate">{peca.nome}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 shrink-0">
                                              {/* Estoque Atual */}
                                              <div className="flex items-center space-x-1">
                                                <span className="text-[10px] text-slate-450 font-bold uppercase mr-1">Qtd:</span>
                                                {colaboradorLogado?.cargo === 'Técnico' ? (
                                                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1 py-0.5">
                                                    <button 
                                                      onClick={() => handleUpdateEstoque(grupo.id, peca.id, -1)}
                                                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
                                                    >-</button>
                                                    <span className={`font-mono font-black text-xs px-2 min-w-[20px] text-center ${isCritico ? 'text-red-650' : 'text-slate-850'}`}>
                                                      {peca.quantidade}
                                                    </span>
                                                    <button 
                                                      onClick={() => handleUpdateEstoque(grupo.id, peca.id, 1)}
                                                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
                                                    >+</button>
                                                  </div>
                                                ) : (
                                                  <span className={`font-mono font-black text-xs ${isCritico ? 'text-red-655' : 'text-slate-800'}`}>
                                                    {peca.quantidade}
                                                  </span>
                                                )}
                                              </div>

                                              {/* Nível Mínimo */}
                                              <div className="flex items-center space-x-1">
                                                <span className="text-[10px] text-slate-455 font-bold uppercase mr-1">Mínimo:</span>
                                                {colaboradorLogado?.cargo === 'Técnico' ? (
                                                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1 py-0.5">
                                                    <button 
                                                      onClick={() => handleUpdateNivelMinimo(grupo.id, peca.id, -1)}
                                                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
                                                    >-</button>
                                                    <span className="font-mono text-slate-700 font-extrabold px-2 min-w-[18px] text-center">{peca.nivelMinimo}</span>
                                                    <button 
                                                      onClick={() => handleUpdateNivelMinimo(grupo.id, peca.id, 1)}
                                                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
                                                    >+</button>
                                                  </div>
                                                ) : (
                                                  <span className="font-mono text-slate-700 font-bold">{peca.nivelMinimo}</span>
                                                )}
                                              </div>

                                              {isCritico && (
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-red-100">
                                                  Crítico ⚠️
                                                </span>
                                              )}

                                              {/* Excluir Peça */}
                                              {colaboradorLogado?.cargo === 'Técnico' && (
                                                <button
                                                  onClick={() => handleRemoverPeca(grupo.id, idx)}
                                                  className="p-1 text-slate-350 hover:text-red-500 hover:bg-slate-100 rounded transition cursor-pointer"
                                                  title="Excluir Peça"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}

                                  {/* Formulário Rich para Adição de Peça com Níveis de Estoque (Disponível para Técnicos) */}
                                  {colaboradorLogado?.cargo === 'Técnico' && (
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mt-3 space-y-3.5">
                                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cadastrar Peça Sobressalente</div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome do Componente</label>
                                          <input 
                                            type="text"
                                            placeholder="Ex: Correia Dentada V-Belt..."
                                            value={novaPecaNome[grupo.id] || ""}
                                            onChange={e => setNovaPecaNome(prev => ({ ...prev, [grupo.id]: e.target.value }))}
                                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estoque Inicial</label>
                                          <input 
                                            type="number"
                                            placeholder="5"
                                            value={novaPecaQtd[grupo.id] !== undefined ? novaPecaQtd[grupo.id] : ""}
                                            onChange={e => setNovaPecaQtd(prev => ({ ...prev, [grupo.id]: Number(e.target.value) }))}
                                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nível Mínimo Alerta</label>
                                          <input 
                                            type="number"
                                            placeholder="2"
                                            value={novaPecaMin[grupo.id] !== undefined ? novaPecaMin[grupo.id] : ""}
                                            onChange={e => setNovaPecaMin(prev => ({ ...prev, [grupo.id]: Number(e.target.value) }))}
                                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end pt-1">
                                        <button
                                          onClick={() => handleAdicionarPeca(grupo.id)}
                                          className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                        >
                                          + Registrar Componente
                                        </button>
                                      </div>
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

                {abaAtiva === 'checklist' && (
                  <div className="space-y-6 animate-in fade-in duration-250">
                    <div className="border-b pb-3 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                          <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                          <span>Checklist de Segurança & Qualidade (Inspeção Técnica)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Efetue vistorias preventivas para garantir a conformidade mecânica, elétrica e funcional deste ativo.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={handleResetChecklist}
                          className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-[10px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reiniciar Checklist</span>
                        </button>
                        <button
                          onClick={handleSalvarChecklist}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Finalizar & Registrar</span>
                        </button>
                      </div>
                    </div>

                    {/* FILTROS E PROGRESSO */}
                    <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-xl space-y-4 shadow-3xs">
                      {/* Barra de Progresso com Métricas */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                            <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                            <span>Status de Verificação Técnica</span>
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 border border-slate-250/60 px-2.5 py-0.5 rounded-full font-mono">
                            {itensChecklist.filter(it => it.status !== 'pendente').length} de {itensChecklist.length} itens respondidos ({itensChecklist.length > 0 ? Math.round((itensChecklist.filter(it => it.status !== 'pendente').length / itensChecklist.length) * 100) : 0}%)
                          </span>
                        </div>

                        {/* Progresso visual */}
                        <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner flex">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 transition-all duration-500 relative flex items-center justify-end"
                            style={{ 
                              width: `${itensChecklist.length > 0 ? (itensChecklist.filter(it => it.status !== 'pendente').length / itensChecklist.length) * 100 : 0}%` 
                            }}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 animate-pulse" />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-500 pt-0.5">
                          <span className="flex items-center space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block" />
                            <span>Pendente ({itensChecklist.filter(i => i.status === 'pendente').length})</span>
                          </span>
                          <span className="flex items-center space-x-1 text-emerald-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            <span>Conforme ({itensChecklist.filter(i => i.status === 'conforme').length})</span>
                          </span>
                          <span className="flex items-center space-x-1 text-amber-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            <span>Aviso ({itensChecklist.filter(i => i.status === 'nao-conforme').length})</span>
                          </span>
                          <span className="flex items-center space-x-1 text-rose-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                            <span>Crítico ({itensChecklist.filter(i => i.status === 'critico').length})</span>
                          </span>
                          <span className="flex items-center space-x-1 text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                            <span>N/A ({itensChecklist.filter(i => i.status === 'na').length})</span>
                          </span>
                        </div>
                      </div>

                      {/* Filtros em Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-200/60">
                        {/* 1. Busca por texto */}
                        <div className="md:col-span-5 relative">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1 block">Pesquisar Diretrizes</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={filtroTextoChecklist}
                              onChange={e => setFiltroTextoChecklist(e.target.value)}
                              placeholder="Filtre as avaliações técnica..."
                              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-250 text-xs font-semibold text-slate-805 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {filtroTextoChecklist && (
                              <button
                                onClick={() => setFiltroTextoChecklist("")}
                                className="absolute right-2.5 top-2.5 text-[11px] font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2. Filtro de Categoria/Segmento */}
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1 block">Segmento do Equipamento</label>
                          <div className="relative">
                            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select
                              value={filtroCategoriaChecklist}
                              onChange={e => setFiltroCategoriaChecklist(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-250 text-xs font-bold text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                              <option value="Todos">All Segmentos ({itensChecklist.length})</option>
                              <option value="Segurança">🛡️ Segurança ({itensChecklist.filter(i => i.categoria === "Segurança").length})</option>
                              <option value="Lubrificação">🛢️ Lubrificação ({itensChecklist.filter(i => i.categoria === "Lubrificação").length})</option>
                              <option value="Mecânica">⚙️ Mecânica ({itensChecklist.filter(i => i.categoria === "Mecânica").length})</option>
                              <option value="Elétrica">⚡ Elétrica ({itensChecklist.filter(i => i.categoria === "Elétrica").length})</option>
                              <option value="Vedação">💧 Vedação / Vazamento ({itensChecklist.filter(i => i.categoria === "Vedação").length})</option>
                              <option value="Medição">📐 Ajustes e Calibração ({itensChecklist.filter(i => i.categoria === "Medição").length})</option>
                              <option value="Especificidades">🎯 Especificidades / Outros ({itensChecklist.filter(i => i.categoria === "Especificidades").length})</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <ChevronDown className="h-3.5 w-3.5 text-slate-450" />
                            </div>
                          </div>
                        </div>

                        {/* 3. Filtro de Status */}
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1 block">Status de Vistoria</label>
                          <div className="relative">
                            <select
                              value={filtroStatusChecklist}
                              onChange={e => setFiltroStatusChecklist(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-250 text-xs font-bold text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                              <option value="Todos">🏷️ Todos os Status ({itensChecklist.length})</option>
                              <option value="Pendente">⚪ Pendentes ({itensChecklist.filter(i => i.status === 'pendente').length})</option>
                              <option value="Conforme">🟢 Conformes ({itensChecklist.filter(i => i.status === 'conforme').length})</option>
                              <option value="Não Conforme">🟡 Avisos ({itensChecklist.filter(i => i.status === 'nao-conforme').length})</option>
                              <option value="Crítico">🔴 Críticos ({itensChecklist.filter(i => i.status === 'critico').length})</option>
                              <option value="N/A">⚫ N/A ({itensChecklist.filter(i => i.status === 'na').length})</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <ChevronDown className="h-3.5 w-3.5 text-slate-450" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formulário Rich para Adição de Item Personalizado */}
                    <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl space-y-3 shadow-3xs hover:border-slate-300 transition-all">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                        <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                        <span>Adicionar Item Personalizado ao Checklist Regulamentar</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={novoItemCat}
                          onChange={e => setNovoItemCat(e.target.value)}
                          className="bg-white border border-slate-250 text-xs font-bold text-slate-705 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                        >
                          <option value="Segurança">🛡️ Segurança</option>
                          <option value="Lubrificação">🛢️ Lubrificação</option>
                          <option value="Mecânica">⚙️ Mecânica</option>
                          <option value="Elétrica">⚡ Elétrica</option>
                          <option value="Vedação">💧 Vedação / Vazamentos</option>
                          <option value="Medição">📐 Ajustes e Calibração</option>
                          <option value="Especificidades">🎯 Especificidades</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Ex: Monitorar folga no barramento traseiro, barulho sob carga de usinagem..."
                          value={novoItemDesc}
                          onChange={e => setNovoItemDesc(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAdicionarItemChecklist(); }}
                          className="flex-1 px-3 py-1.5 border border-slate-250 bg-white text-xs text-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        />
                        <button
                          onClick={handleAdicionarItemChecklist}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          + Adicionar Item
                        </button>
                      </div>
                    </div>

                    {/* Lista Principal de Itens Filtrados */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto scrollbar-thin pr-1.5">
                      {itensChecklist.filter(item => {
                        const matchesTexto = item.item.toLowerCase().includes(filtroTextoChecklist.toLowerCase()) || 
                                             item.categoria.toLowerCase().includes(filtroTextoChecklist.toLowerCase());
                        
                        let matchesStatus = true;
                        if (filtroStatusChecklist !== "Todos") {
                          if (filtroStatusChecklist === "Pendente") matchesStatus = item.status === "pendente";
                          else if (filtroStatusChecklist === "Conforme") matchesStatus = item.status === "conforme";
                          else if (filtroStatusChecklist === "Não Conforme") matchesStatus = item.status === "nao-conforme";
                          else if (filtroStatusChecklist === "Crítico") matchesStatus = item.status === "critico";
                          else if (filtroStatusChecklist === "N/A") matchesStatus = item.status === "na";
                        }
                        
                        let matchesCategoria = true;
                        if (filtroCategoriaChecklist !== "Todos") {
                          matchesCategoria = item.categoria === filtroCategoriaChecklist;
                        }
                        
                        return matchesTexto && matchesStatus && matchesCategoria;
                      }).map((item) => {
                        const cores = obterCoresCategoria(item.categoria);
                        return (
                          <div 
                            key={item.id} 
                            className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-all duration-300 hover:shadow-2xs ${cores.cardBg} ${cores.textSide}`}
                          >
                            <div className="space-y-1.5 md:max-w-[50%] flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded border font-mono tracking-wider flex items-center space-x-1 ${cores.badgeBg}`}>
                                  <span>{cores.emoji}</span>
                                  <span>{item.categoria}</span>
                                </span>
                              </div>
                              <div className="flex items-start space-x-3">
                                {/* Checkbox redonda interativa */}
                                <button
                                  type="button"
                                  onClick={() => handleMudarStatusItem(item.id, item.status === 'conforme' ? 'pendente' : 'conforme')}
                                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center shrink-0 cursor-pointer mt-0.5 ${
                                    item.status === 'conforme'
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                      : item.status === 'nao-conforme'
                                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                      : item.status === 'critico'
                                      ? 'bg-rose-500 border-rose-500 text-white shadow-xs animate-pulse'
                                      : item.status === 'na'
                                      ? 'bg-slate-400 border-slate-400 text-white shadow-xs'
                                      : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
                                  }`}
                                  title={item.status === 'conforme' ? "Quesito em conforme. Clique para reverter." : "Atende à conformidade técnica? Marcar OK."}
                                >
                                  {item.status === 'conforme' ? (
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  ) : item.status === 'nao-conforme' ? (
                                    <span className="text-[8px] font-black leading-none">!</span>
                                  ) : item.status === 'critico' ? (
                                    <span className="text-[8px] font-black leading-none">🚨</span>
                                  ) : item.status === 'na' ? (
                                    <span className="text-[7px] font-black leading-none">-</span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-100 border border-transparent" />
                                  )}
                                </button>
                                <p className={`text-xs font-bold leading-relaxed transition-all duration-300 ${
                                  item.status === 'conforme'
                                    ? 'line-through text-slate-400 italic decoration-slate-400 decoration-1.5 opacity-65 translate-x-0.5'
                                    : cores.colorText
                                }`}>
                                  {item.item}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 md:justify-end">
                              {/* Seletor de Status Técnico */}
                              <div className="flex items-center space-x-1 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-3xs">
                                <button
                                  type="button"
                                  onClick={() => handleMudarStatusItem(item.id, 'conforme')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer select-none ${
                                    item.status === 'conforme'
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                                  }`}
                                  title="Marcar como Conforme / Aprovado"
                                >
                                  <span>OK</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMudarStatusItem(item.id, 'nao-conforme')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer select-none ${
                                    item.status === 'nao-conforme'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                                  }`}
                                  title="Marcar como Desconformidade Simples (Aviso)"
                                >
                                  <span>Aviso</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMudarStatusItem(item.id, 'critico')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer select-none ${
                                    item.status === 'critico'
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                                  }`}
                                  title="Marcar como Defeito Crítico (Requer reparo imediato)"
                                >
                                  <span>CRÍT</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMudarStatusItem(item.id, 'na')}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer select-none ${
                                    item.status === 'na'
                                      ? 'bg-slate-400 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                                  }`}
                                  title="Não se aplica a esta máquina"
                                >
                                  <span>N/A</span>
                                </button>
                              </div>

                              {/* Observação técnica */}
                              <input
                                type="text"
                                value={item.observacao}
                                onChange={e => handleMudarObservacaoItem(item.id, e.target.value)}
                                placeholder="Anotação técnica..."
                                className="flex-1 min-w-[140px] md:max-w-[200px] bg-slate-50 text-slate-800 px-3 rounded-lg py-1 border border-slate-205 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium placeholder-slate-400"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {itensChecklist.filter(item => {
                        const matchesTexto = item.item.toLowerCase().includes(filtroTextoChecklist.toLowerCase()) || 
                                             item.categoria.toLowerCase().includes(filtroTextoChecklist.toLowerCase());
                        
                        let matchesStatus = true;
                        if (filtroStatusChecklist !== "Todos") {
                          if (filtroStatusChecklist === "Pendente") matchesStatus = item.status === "pendente";
                          else if (filtroStatusChecklist === "Conforme") matchesStatus = item.status === "conforme";
                          else if (filtroStatusChecklist === "Não Conforme") matchesStatus = item.status === "nao-conforme";
                          else if (filtroStatusChecklist === "Crítico") matchesStatus = item.status === "critico";
                          else if (filtroStatusChecklist === "N/A") matchesStatus = item.status === "na";
                        }
                        
                        let matchesCategoria = true;
                        if (filtroCategoriaChecklist !== "Todos") {
                          matchesCategoria = item.categoria === filtroCategoriaChecklist;
                        }
                        
                        return matchesTexto && matchesStatus && matchesCategoria;
                      }).length === 0 && (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-205 rounded-xl">
                          <ClipboardCheck className="w-8 h-8 text-slate-350 mx-auto mb-2 animate-bounce" />
                          <p className="text-xs text-slate-500 font-bold">Nenhum quesito atende aos filtros definidos.</p>
                          <button
                            onClick={() => {
                              setFiltroTextoChecklist("");
                              setFiltroStatusChecklist("Todos");
                              setFiltroCategoriaChecklist("Todos");
                            }}
                            className="mt-3 text-[11px] font-bold text-blue-600 hover:underline hover:text-blue-700 flex items-center space-x-1 mx-auto cursor-pointer"
                          >
                            <span>Limpar todos os filtros</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Histórico de Auditoria */}
                    <div className="border-t pt-5 border-slate-200/90 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Histórico de Inspeções Recentes do Ativo</span>
                        </h4>
                        <p className="text-[10px] text-slate-500">Rastreabilidade metrológica e registros históricos das auditorias preventivas executadas neste ativo.</p>
                      </div>

                      {historicoChecklist.length === 0 ? (
                        <div className="text-center py-7 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                          <p className="text-xs text-slate-400 font-bold">Nenhum checklist foi assinado e salvo ou o histórico está vazio.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {historicoChecklist.map((rec) => {
                            const isExc = rec.notaGeral.includes("Exce");
                            const isCrit = rec.notaGeral.includes("Urg");
                            const cardColor = isExc ? "border-emerald-150 bg-emerald-50/10" : isCrit ? "border-rose-150 bg-rose-50/15" : "border-amber-150 bg-amber-50/15";
                            return (
                              <div key={rec.id} className={`p-4 rounded-xl border ${cardColor} space-y-3 shadow-xs relative group`}>
                                <div className="flex items-center justify-between gap-1">
                                  <div>
                                    <span className="text-[9px] font-black text-slate-400 font-mono tracking-wider">{rec.data}</span>
                                    <h5 className="text-xs font-black text-slate-800 mt-0.5">{rec.usuario}</h5>
                                  </div>
                                  <button
                                    onClick={() => handleExcluirRegistroChecklist(rec.id)}
                                    className="p-1 hover:bg-slate-100/80 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    title="Excluir Auditoria"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                    isExc ? 'bg-emerald-100 text-emerald-850 border border-emerald-200' : isCrit ? 'bg-rose-100 text-rose-850 border border-rose-200' : 'bg-amber-100 text-amber-850 border border-amber-200'
                                  }`}>
                                    Status: {rec.notaGeral}
                                  </span>
                                  {rec.inconformidadesCount > 0 && (
                                    <span className="text-[9px] font-extrabold bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                                      {rec.inconformidadesCount} Avisos
                                    </span>
                                  )}
                                  {rec.criticosCount > 0 && (
                                    <span className="text-[9px] font-extrabold bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-mono">
                                      {rec.criticosCount} Críticos 🚨
                                    </span>
                                  )}
                                </div>

                                {/* Resumo de Erros se houver */}
                                {rec.itens.filter(i => i.status === 'nao-conforme' || i.status === 'critico').length > 0 && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-1">
                                    <span className="text-[8.5px] font-black text-slate-450 uppercase tracking-wider block">Desconformidades Apontadas:</span>
                                    <div className="space-y-1">
                                      {rec.itens.filter(i => i.status === 'nao-conforme' || i.status === 'critico').map((item, idx) => (
                                        <div key={idx} className="text-[10px] leading-snug font-bold">
                                          <span className={item.status === 'critico' ? "text-rose-600" : "text-amber-600"}>
                                            • [{item.status.slice(0, 4).toUpperCase()}]
                                          </span>{" "}
                                          <span className="text-slate-700">{item.item}</span>
                                          {item.observacao && (
                                            <span className="text-slate-450 block pl-3 font-medium">Obs: {item.observacao}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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

      {/* Modal / Popup de Detalhes Completos de uma O.S específica de dentro do Ativo */}
      {ordemSelecionada && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[80] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 text-slate-800">
            
            {/* Header da O.S. no Ativo */}
            <div className="bg-slate-900 p-4.5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="text-blue-400 w-4.5 h-4.5 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-[12px] uppercase tracking-wider flex items-center space-x-1">
                    <span>Ordem de Serviço</span>
                    <span className="font-mono text-blue-400 font-bold">#{ordemSelecionada.id}</span>
                  </h4>
                  <p className="text-[9px] text-slate-400">Rastreabilidade integrada - Manutech SENAI</p>
                </div>
              </div>
              <button 
                onClick={() => setOrdemSelecionada(null)}
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Técnico */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto bg-slate-50/50 text-xs">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Informações do Ativo</span>
                  <p className="text-[10px] text-slate-500">Máquina:</p>
                  <p className="font-extrabold text-slate-900 bg-slate-50 p-1 rounded font-sans leading-tight border border-slate-100">{ordemSelecionada.equipamento}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Solicitante:</p>
                  <p className="font-bold text-slate-800">{ordemSelecionada.solicitante}</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status & Nível</span>
                  <p className="text-[10px] text-slate-500">Prioridade:</p>
                  <p className="font-extrabold text-slate-800">{ordemSelecionada.prioridade}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Status atual:</p>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      ordemSelecionada.status === 'Concluído' ? 'bg-emerald-50 text-emerald-750 border border-emerald-200' : 'bg-amber-50 text-amber-750 border border-amber-200'
                    }`}>
                      {ordemSelecionada.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Sintomas / Laudo de Intervenção</span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-200/60 font-medium">
                  {ordemSelecionada.descricao}
                </p>
              </div>

              {ordemSelecionada.status === 'Concluído' && ordemSelecionada.dataConclusao && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-[10px] font-semibold text-emerald-800 flex justify-between items-center">
                  <span>Conclusão homologada em:</span>
                  <span className="font-mono font-bold text-emerald-700">{ordemSelecionada.dataConclusao}</span>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-105 p-3 rounded-xl text-[10px] flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-blue-850 leading-normal font-medium">
                  <strong>NR-12 & NR-10:</strong> Atenda às normas regulamentadoras nacionais de segurança sob auditoria do gestor técnico.
                </div>
              </div>

            </div>

            {/* Rodapé */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setOrdemSelecionada(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Voltar ao Ativo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
