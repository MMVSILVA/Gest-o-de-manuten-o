/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Wrench, LayoutDashboard, Server, ClipboardList, CalendarDays, PlusCircle, 
  BarChart2, Users, User, ChevronRight, LogOut, Database, ShieldCheck, 
  X, Check, Play, Volume2, Lock, Sparkles, HelpCircle 
} from "lucide-react";

import { Colaborador, Equipamento, OrdemServico, AccessibilityConfig, Chamado } from "./types";
import { carregarSimulacaoLocalStorage } from "./data/mockData";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardView } from "./components/DashboardView";
import { EquipmentsView } from "./components/EquipmentsView";
import { EquipmentDetailModal } from "./components/EquipmentDetailModal";
import { OrdensView } from "./components/OrdensView";
import { CalendarView } from "./components/CalendarView";
import { NovaOsView } from "./components/NovaOsView";
import { RelatoriosView } from "./components/RelatoriosView";
import { ColaboradoresView } from "./components/ColaboradoresView";
import { PerfilView } from "./components/PerfilView";
import { AccessibilityToggle } from "./components/AccessibilityToggle";
import { ChamadosView } from "./components/ChamadosView";

export default function App() {
  // Inicializa localStorage com sementes padronizadas antes de montar
  useEffect(() => {
    carregarSimulacaoLocalStorage();
  }, []);

  // Estados principais
  const [colaboradorLogado, setColaboradorLogado] = useState<Colaborador | null>(() => {
    const salvo = localStorage.getItem("manutech_colaborador");
    return salvo ? JSON.parse(salvo) : null;
  });

  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => {
    const sColabs = localStorage.getItem("manutech_colaboradores");
    return sColabs ? JSON.parse(sColabs) : [];
  });

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => {
    const sEq = localStorage.getItem("manutech_equipamentos");
    return sEq ? JSON.parse(sEq) : [];
  });

  const [ordens, setOrdens] = useState<OrdemServico[]>(() => {
    const sOrd = localStorage.getItem("manutech_ordens");
    return sOrd ? JSON.parse(sOrd) : [];
  });

  const [chamados, setChamados] = useState<Chamado[]>(() => {
    const sCham = localStorage.getItem("manutech_chamados");
    if (sCham) return JSON.parse(sCham);
    return [
      {
        id: "cham_1",
        equipamento: "Retífica Plana Mello",
        solicitante: "Roberto Almeida",
        prioridade: "Média",
        tipo: "Corretiva",
        status: "Pendente",
        descricao: "Vazamento localizado de óleo lubrificante no cabeçote motorizado da mesa. Necessita de reinspeção de vedantes.",
        data: "21/05/2026 - 15:30",
        timestamp: Date.now() - 36000000,
        rawDate: new Date(Date.now() - 36000000).toISOString()
      },
      {
        id: "cham_2",
        equipamento: "Fresa CNC Haas TM-1",
        solicitante: "Nicole Caroline",
        prioridade: "Alta",
        tipo: "Calibração",
        status: "Pendente",
        descricao: "Sensor de vibração indica distorções acima de 5% no fuso principal. Requer calibração urgente.",
        data: "22/05/2026 - 08:45",
        timestamp: Date.now() - 10000000,
        rawDate: new Date(Date.now() - 10000000).toISOString()
      }
    ];
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'ordens' | 'calendario' | 'nova-os' | 'relatorios' | 'colaboradores' | 'perfil' | 'equipamentos' | 'chamados'>('dashboard');
  const [eqSelecionadoId, setEqSelecionadoId] = useState<string | null>(null);
  
  // Estados do Simulador de Emergência IoT
  const [simulacaoAtiva, setSimulacaoAtiva] = useState<boolean>(() => {
    return localStorage.getItem("manutech_simulacao_ativa") === "true";
  });
  const [simulacaoPressao, setSimulacaoPressao] = useState<number>(() => {
    const val = localStorage.getItem("manutech_simulacao_pressao");
    return val ? parseFloat(val) : 14.5;
  });
  const [simulacaoTempe, setSimulacaoTempe] = useState<number>(() => {
    const val = localStorage.getItem("manutech_simulacao_tempe");
    return val ? parseFloat(val) : 115;
  });
  const [simulacaoStatus, setSimulacaoStatus] = useState<'Aviso' | 'Resolvido' | 'Urgente'>(() => {
    return (localStorage.getItem("manutech_simulacao_status") as any) || 'Urgente';
  });

  const [configAcessibilidade, setConfigAcessibilidade] = useState<AccessibilityConfig>(() => {
    const salvo = localStorage.getItem("manutech_acessibilidade");
    return salvo ? JSON.parse(salvo) : { vozAtiva: false, tamanhoFonte: 'padrao' };
  });

  const [imageFullSrc, setImageFullSrc] = useState<string | null>(null);
  const [dataHoraString, setDataHoraString] = useState("");

  // Estados de conectividade e sincronização offline-online
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Auxiliares para fila de ações offline
  const queueOfflineAction = (type: string, data: any) => {
    try {
      const stored = localStorage.getItem("manutech_offline_queue");
      const currentQueue = stored ? JSON.parse(stored) : [];
      currentQueue.push({ id: "action_" + Date.now(), type, data, timestamp: Date.now() });
      localStorage.setItem("manutech_offline_queue", JSON.stringify(currentQueue));
    } catch (e) {
      console.error("Erro ao enfileirar ação offline:", e);
    }
  };

  const triggerSyncOfflineQueue = async () => {
    const stored = localStorage.getItem("manutech_offline_queue");
    if (!stored) return;
    try {
      const currentQueue = JSON.parse(stored);
      if (currentQueue.length === 0) return;

      setIsSyncing(true);
      setSyncMessage("🔄 Sincronizando dados offline com os servidores centrais...");

      const resp = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue: currentQueue })
      });

      if (resp.ok) {
        localStorage.removeItem("manutech_offline_queue");
        setSyncMessage(`✨ Sincronização concluída! ${currentQueue.length} operações offline aplicadas.`);
        setTimeout(() => setSyncMessage(null), 6000);
      } else {
        setSyncMessage("⚠️ Erro ao sincronizar dados offline com o servidor.");
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (e) {
      console.error("Erro na sincronização:", e);
      setSyncMessage("⚠️ Erro de comunicação durante a sincronização.");
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSyncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sincroniza se inicializar online
    if (navigator.onLine) {
      triggerSyncOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Relógio digital em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date();
      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const dataStr = `${diasSemana[agora.getDay()]} - ${agora.toLocaleDateString('pt-PT')}`;
      const horaStr = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDataHoraString(`${dataStr} • ${horaStr}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sincronizações para localStorage
  useEffect(() => {
    localStorage.setItem("manutech_colaboradores", JSON.stringify(colaboradores));
  }, [colaboradores]);

  useEffect(() => {
    localStorage.setItem("manutech_equipamentos", JSON.stringify(equipamentos));
  }, [equipamentos]);

  useEffect(() => {
    localStorage.setItem("manutech_ordens", JSON.stringify(ordens));
  }, [ordens]);

  useEffect(() => {
    localStorage.setItem("manutech_chamados", JSON.stringify(chamados));
  }, [chamados]);

  useEffect(() => {
    localStorage.setItem("manutech_simulacao_ativa", simulacaoAtiva ? "true" : "false");
  }, [simulacaoAtiva]);

  useEffect(() => {
    localStorage.setItem("manutech_simulacao_pressao", String(simulacaoPressao));
  }, [simulacaoPressao]);

  useEffect(() => {
    localStorage.setItem("manutech_simulacao_tempe", String(simulacaoTempe));
  }, [simulacaoTempe]);

  useEffect(() => {
    localStorage.setItem("manutech_simulacao_status", simulacaoStatus);
  }, [simulacaoStatus]);

  useEffect(() => {
    localStorage.setItem("manutech_acessibilidade", JSON.stringify(configAcessibilidade));
  }, [configAcessibilidade]);

  // Click readers para acessibilidade de voz ativa
  const handleElementClickVoice = (e: React.MouseEvent) => {
    if (!configAcessibilidade.vozAtiva || !('speechSynthesis' in window)) return;
    
    // Evita ler tudo repetidamente se clicar em caixas filhas
    e.stopPropagation();

    const target = e.target as HTMLElement;
    // Tenta encontrar o texto mais próximo ou conteúdo
    const textToRead = target.innerText || target.getAttribute("placeholder") || target.getAttribute("title");
    if (textToRead && textToRead.length < 250) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "pt-PT";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Login handler
  const handleLogin = (user: Colaborador) => {
    setColaboradorLogado(user);
    localStorage.setItem("manutech_colaborador", JSON.stringify(user));
    
    // Garante que o usuário logado existe no banco fictício
    if (!colaboradores.some(c => c.matricula === user.matricula)) {
      setColaboradores(prev => [user, ...prev]);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setColaboradorLogado(null);
    localStorage.removeItem("manutech_colaborador");
    setEqSelecionadoId(null);
    setActiveView('dashboard');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // O.S. Handlers
  const handleCriarOS = (nova: Omit<OrdemServico, 'id' | 'data' | 'timestamp'>) => {
    const dataObj = new Date(nova.rawDate);
    const diaPad = String(dataObj.getDate()).padStart(2, '0');
    const mesPad = String(dataObj.getMonth() + 1).padStart(2, '0');
    const horaPad = String(dataObj.getHours()).padStart(2, '0');
    const minPad = String(dataObj.getMinutes()).padStart(2, '0');
    const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

    const novaOS: OrdemServico = {
      ...nova,
      id: "os_" + Date.now(),
      data: dataFormatada,
      timestamp: dataObj.getTime() || Date.now()
    };

    setOrdens(prev => [novaOS, ...prev]);

    if (!navigator.onLine) {
      queueOfflineAction("CRIAR_OS", novaOS);
      alert("Ordem de Serviço criada localmente! Você está offline; os dados serão sincronizados quando a conexão retornar.");
    } else {
      alert("Ordem de Serviço emitida com sucesso!");
    }
  };

  // Chamados handlers
  const handleAdicionarChamado = (dados: Omit<Chamado, "id" | "data" | "timestamp" | "status">) => {
    const dataObj = new Date();
    const diaPad = String(dataObj.getDate()).padStart(2, "0");
    const mesPad = String(dataObj.getMonth() + 1).padStart(2, "0");
    const horaPad = String(dataObj.getHours()).padStart(2, "0");
    const minPad = String(dataObj.getMinutes()).padStart(2, "0");
    const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

    const novo: Chamado = {
      ...dados,
      id: "cham_" + Date.now(),
      status: "Pendente",
      data: dataFormatada,
      timestamp: Date.now()
    };

    setChamados(prev => [novo, ...prev]);

    // Dispara Notificação Push para Alerta de Urgência
    if (dados.prioridade === "Alta" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification("🚨 Novo Chamado de Urgência Aberto!", {
            body: `Ativo: ${dados.equipamento}\nProblema: ${dados.descricao}`,
            tag: "urgencia_chamado",
            requireInteraction: true
          });
        } catch (e) {
          console.warn("Notificação nativa falhou:", e);
        }
      }
    }
  };

  const handleAlterarStatusChamado = (id: string, novoStatus: "Aprovado" | "Rejeitado") => {
    setChamados(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
  };

  const handleAprovarEGerarOS = (chamado: Chamado) => {
    // 1. Aprova o chamado
    handleAlterarStatusChamado(chamado.id, "Aprovado");

    // 2. Gera O.S. Padrão na Nuvem
    const dataObj = new Date();
    const diaPad = String(dataObj.getDate()).padStart(2, "0");
    const mesPad = String(dataObj.getMonth() + 1).padStart(2, "0");
    const horaPad = String(dataObj.getHours()).padStart(2, "0");
    const minPad = String(dataObj.getMinutes()).padStart(2, "0");
    const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

    const novaOS: OrdemServico = {
      id: "os_" + Date.now(),
      equipamento: chamado.equipamento,
      solicitante: chamado.solicitante,
      prioridade: chamado.prioridade,
      tipo: chamado.tipo,
      status: "Pendente",
      descricao: `[GERADA A PARTIR DE CHAMADO INDUSTRIAL APROVADO] — ` + chamado.descricao,
      data: dataFormatada,
      timestamp: Date.now(),
      rawDate: new Date().toISOString().slice(0, 16)
    };

    setOrdens(prev => [novaOS, ...prev]);
    alert(`O Chamado do Instrutor ${chamado.solicitante} foi aprovado! A Ordem de Serviço foi gerada com sucesso e colocada na fila de intervenções.`);
  };

  const handleAlterarStatus = (id: string, novo: "Em Andamento" | "Concluído") => {
    setOrdens(prev => prev.map(o => o.id === id ? { ...o, status: novo } : o));
    if (!navigator.onLine) {
      queueOfflineAction("ALTERAR_STATUS", { id, status: novo });
    }
  };

  const handleExcluirOS = (id: string) => {
    // Dupla verificação regulamentar contra exclusão indevida (Mecânico e Instrutor)
    if (colaboradorLogado?.cargo === "Instrutor") {
      alert("Ação Proibida: Perfil de Instrutor não possui atribuição regulamentar para excluir O.S.");
      return;
    }

    const confirmar = window.confirm("Deseja realmente arquivar/excluir permanentemente esta Ordem de Serviço?");
    if (confirmar) {
      setOrdens(prev => prev.filter(o => o.id !== id));
      if (!navigator.onLine) {
        queueOfflineAction("EXCLUIR_OS", id);
      }
    }
  };

  // Equipe Handlers
  const handleAdicionarColaborador = (novo: Colaborador) => {
    setColaboradores(prev => {
      const idx = prev.findIndex(c => c.id === novo.id);
      if (idx !== -1) {
        // Editando existente
        const copia = [...prev];
        copia[idx] = novo;
        return copia;
      } else {
        // Criando novo
        return [novo, ...prev];
      }
    });

    if (!navigator.onLine) {
      queueOfflineAction("ADICIONAR_COLABORADOR", novo);
    }

    // Se o colaborador editado for o usuário logado correntemente, atualiza sessao
    if (colaboradorLogado && colaboradorLogado.id === novo.id) {
      setColaboradorLogado(novo);
      localStorage.setItem("manutech_colaborador", JSON.stringify(novo));
    }
  };

  const handleExcluirColaborador = (id: string) => {
    if (colaboradorLogado?.id === id) {
      alert("Erro: Você não pode remover seu próprio cadastro ativo.");
      return;
    }
    const confirmar = window.confirm("Deseja remover os privilégios deste colaborador?");
    if (confirmar) {
      setColaboradores(prev => prev.filter(c => c.id !== id));
      if (!navigator.onLine) {
        queueOfflineAction("EXCLUIR_COLABORADOR", id);
      }
    }
  };

  // Equipamentos Handlers
  const handleAdicionarEquipamento = (novo: Omit<Equipamento, 'docs' | 'fotos'>) => {
    const eqCompleto: Equipamento = {
      ...novo,
      docs: {},
      fotos: []
    };
    setEquipamentos(prev => [eqCompleto, ...prev]);

    if (!navigator.onLine) {
      queueOfflineAction("ADICIONAR_EQUIPAMENTO", eqCompleto);
      alert("Equipamento cadastrado offline! Os dados foram salvos no LocalStorage e serão registrados na nuvem quando a conexão retornar.");
    } else {
      alert("Equipamento cadastrado com sucesso no inventário!");
    }
  };

  const handleUpdateEquipamento = (updated: Equipamento) => {
    setEquipamentos(prev => prev.map(e => e.id === updated.id ? updated : e));
    if (!navigator.onLine) {
      queueOfflineAction("UPDATE_EQUIPAMENTO", updated);
    }
  };

  // Simular Falha de Urgência
  const handleSimularFalha = () => {
    // Ativa simulador IoT
    setSimulacaoAtiva(true);
    setSimulacaoStatus('Urgente');
    setSimulacaoPressao(14.5);
    setSimulacaoTempe(115);

    // Adiciona o chamado de triagem industrial
    const dataObj = new Date();
    const diaPad = String(dataObj.getDate()).padStart(2, "0");
    const mesPad = String(dataObj.getMonth() + 1).padStart(2, "0");
    const horaPad = String(dataObj.getHours()).padStart(2, "0");
    const minPad = String(dataObj.getMinutes()).padStart(2, "0");
    const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

    const chamadoFalha: Chamado = {
      id: "cham_sim_999",
      equipamento: "Compressor Radial 03",
      solicitante: "Telemetria Preditiva IoT (Sensor vibrX)",
      prioridade: "Alta",
      tipo: "Corretiva",
      status: "Pendente",
      descricao: "🚨 CONDIÇÃO DE RISCO SEVERO: Obstrução mecânica da serpentina gerou sobrepressão crítica de 14.5 bar (Segurança limite de 10.0 bar) e superaquecimento crítico a 115°C.",
      data: dataFormatada,
      timestamp: Date.now(),
      rawDate: new Date().toISOString()
    };

    // Remove anterior se existia duplicidade e adiciona
    setChamados(prev => [chamadoFalha, ...prev.filter(c => c.id !== "cham_sim_999")]);

    // Altera Compressor Radial 03 (id: eq7) para status Crítico no inventário
    setEquipamentos(prev => prev.map(e => e.id === "eq7" ? { ...e, status: "Crítico" } : e));

    // Dispara Notificação Push para a Simulação de Falha IoT
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification("🚨 Alerta IoT: Falha de Urgência Ativada!", {
            body: "Sensor vibrX detectou sobrepressão de 14.5 bar no Compressor Radial 03. Clique para ver detalhes.",
            tag: "urgencia_simulada",
            requireInteraction: true
          });
        } catch (e) {
          console.warn("Notificação de simulação falhou:", e);
        }
      }
    }

    if (configAcessibilidade.vozAtiva && ('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Alerta de urgência: Alta pressão detectada no compressor de ar. Verifique o painel.");
      utterance.lang = "pt-PT";
      window.speechSynthesis.speak(utterance);
    }

    alert("🚨 SIMULAÇÃO OPERACIONAL ATIVADA!\n\nUm chamado crítico IoT acaba de ser gerado no Compressor Radial 03 (Setor de Pneumática). O Painel de Controle de Telemetria foi ativado e está disponível na tela principal da gestão do Manutech!");
  };

  const handleAcoesSimulacao = (acao: 'aprovar_gerar' | 'cancelar_aliviar') => {
    if (acao === 'cancelar_aliviar') {
      // Cancela a simulação de ponta a ponta
      setSimulacaoAtiva(false);
      setSimulacaoStatus('Urgente');
      setSimulacaoPressao(14.5);
      setSimulacaoTempe(115);
      // Remove o chamado fictício se existir
      setChamados(prev => prev.filter(c => c.id !== "cham_sim_999"));
      // Restaura o equipamento "eq7" (Compressor Radial 03) para Operacional
      setEquipamentos(prev => prev.map(e => e.id === "eq7" ? { ...e, status: "Operacional" } : e));
    } else if (acao === 'aprovar_gerar') {
      // Converte o chamado em O.S. e resolve o estado da simulação
      const dataObj = new Date();
      const diaPad = String(dataObj.getDate()).padStart(2, "0");
      const mesPad = String(dataObj.getMonth() + 1).padStart(2, "0");
      const horaPad = String(dataObj.getHours()).padStart(2, "0");
      const minPad = String(dataObj.getMinutes()).padStart(2, "0");
      const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

      // Cria a O.S.
      const novaOS: OrdemServico = {
        id: "os_" + Date.now(),
        equipamento: "Compressor Radial 03",
        solicitante: "Telemetria Preditiva IoT (Sensor vibrX)",
        prioridade: "Alta",
        tipo: "Corretiva",
        status: "Pendente",
        descricao: "[GERADA DENTRE PAINEL DO SIMULADOR] — Troca de válvula travada e alívio de pulmão pneumático.",
        data: dataFormatada,
        timestamp: Date.now(),
        rawDate: new Date().toISOString().slice(0, 16)
      };

      setOrdens(prev => [novaOS, ...prev]);

      // Altera o chamado fictício se ele estiver na fila de chamados
      setChamados(prev => prev.map(c => c.id === "cham_sim_999" ? { ...c, status: "Aprovado" } : c));

      // Atualiza o compressor de ar em equipamentos para Em Manutenção
      setEquipamentos(prev => prev.map(e => e.id === "eq7" ? { ...e, status: "Em Manutenção" } : e));

      // Alivia sensores virtuais
      setSimulacaoPressao(6.0);
      setSimulacaoTempe(32);
      setSimulacaoStatus('Resolvido');

      // Avisa por voz se ativo
      if (configAcessibilidade.vozAtiva && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Alerta de emergência solucionado. Ordem de serviço enviada e compressor colocado em manutenção de emergência.");
        utterance.lang = "pt-PT";
        window.speechSynthesis.speak(utterance);
      }

      alert("✅ COMANDO RECEBIDO!\n\n1. O chamado IoT foi aprovado regulamentarmente!\n2. Uma Ordem de Serviço Crítica foi incluída na Fila Operacional.\n3. O Compressor de Ar foi mudado para o estado 'Em Manutenção'.\n4. A pressão simulada foi aliviada para padrões seguros (6.0 bar).");
    }
  };

  // Config do menu
  const isMecanico = false;
  const isInstrutor = colaboradorLogado?.cargo === "Instrutor";
  const isGestor = colaboradorLogado?.cargo === "Gestor";

  // Se não logado, renderiza tela de login
  if (!colaboradorLogado) {
    return (
      <LoginScreen 
        colaboradores={colaboradores}
        onLogin={handleLogin}
      />
    );
  }

  // Título e sub do cabeçalho da view ativa
  const menuInfo = {
    dashboard: "Painel Operacional",
    equipamentos: "Equipamentos",
    ordens: "Ordens de Serviço",
    calendario: "Agenda & Calendário",
    "nova-os": "Criar O.S.",
    relatorios: "Relatórios & KPIs",
    colaboradores: "Equipe / Colaboradores",
    perfil: "Meu Perfil",
    chamados: colaboradorLogado?.cargo === "Instrutor" ? "Abrir Chamado" : "Triagem de Chamados"
  };

  // Busca o equipamento aberto para detalhes (se selecionado)
  const eqAberto = eqSelecionadoId ? equipamentos.find(e => e.id === eqSelecionadoId) : null;

  return (
    <div 
      onClick={handleElementClickVoice}
      className={`min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans transition-all duration-300 ${
        configAcessibilidade.vozAtiva ? "ring-4 ring-green-100 inset-0" : ""
      }`}
    >
      
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-800 shrink-0 select-none">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow shadow-blue-500/10">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-wider text-slate-100 font-sans leading-none">MANUTECH</h1>
              <p className="text-[9px] text-blue-400 font-extrabold tracking-widest mt-1">INDUSTRIA 4.0 SENAI</p>
            </div>
          </div>
          
          {/* Menu de Navegação Interativo */}
          <nav className="p-4 space-y-1.5 shrink-0">
            {/* Visível para todos */}
            <button 
              onClick={() => { setActiveView('dashboard'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'dashboard' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button 
              onClick={() => { setActiveView('equipamentos'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'equipamentos' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Equipamentos</span>
            </button>

            <button 
              onClick={() => { setActiveView('ordens'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'ordens' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Ordens O.S.</span>
            </button>

            <button 
              onClick={() => { setActiveView('calendario'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'calendario' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Agenda</span>
            </button>

            {/* Chamados Técnicos de Manutenção */}
            <button 
              onClick={() => { setActiveView('chamados'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'chamados' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center space-x-3">
                <Wrench className="w-4 h-4" />
                <span>{isInstrutor ? "Abrir Chamado" : "Chamados"}</span>
              </span>
              {!isInstrutor && chamados.filter(c => c.status === 'Pendente').length > 0 && (
                <span className="bg-amber-500 text-slate-900 font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse shrink-0">
                  {chamados.filter(c => c.status === 'Pendente').length}
                </span>
              )}
            </button>

            {/* Criar O.S - Esconde para Mecânico */}
            {!isMecanico && !isInstrutor && (
              <button 
                onClick={() => { setActiveView('nova-os'); setEqSelecionadoId(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                  activeView === 'nova-os' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova O.S.</span>
              </button>
            )}

            {/* Relatórios - Gestor e Instrutor possuem acesso */}
            {(isGestor || isInstrutor) && (
              <button 
                onClick={() => { setActiveView('relatorios'); setEqSelecionadoId(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                  activeView === 'relatorios' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Relatórios</span>
              </button>
            )}

            {/* Equipe - Exclusivo para Gestores */}
            {isGestor && (
              <button 
                onClick={() => { setActiveView('colaboradores'); setEqSelecionadoId(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                  activeView === 'colaboradores' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Equipe</span>
              </button>
            )}

          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          <button 
            onClick={() => { setActiveView('perfil'); setEqSelecionadoId(null); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition text-xs font-semibold cursor-pointer ${
              activeView === 'perfil' ? "bg-blue-600 text-white shadow" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <span className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Meu Perfil</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            {isOnline ? (
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Nuvem Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-amber-500 font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Modo Offline Local</span>
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Bar Header */}
        <header className="bg-white h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-150 shrink-0 font-sans shadow-xs">
          
          <div className="flex items-center space-x-2.5">
            <span className="bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-xl text-xs sm:text-xs">
              SENAI - OFICINA CONECTADA
            </span>
            {isOnline ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 font-extrabold px-2.5 py-1 rounded-xl text-[9px] uppercase flex items-center space-x-1.5 shadow-xs select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span>Online</span>
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 border border-amber-250 font-extrabold px-2.5 py-1 rounded-xl text-[9px] uppercase flex items-center space-x-1.5 shadow-xs select-none animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>Offline local</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 ml-auto text-slate-700">
            {/* Indicador de Perfil Ativo */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase animate-pulse">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>MODO {colaboradorLogado.cargo.toUpperCase()} ATIVO</span>
            </div>

            {/* Acessibilidade de Voz: Componente Ativável/Desativável Exigido */}
            <AccessibilityToggle 
              config={configAcessibilidade}
              onChange={setConfigAcessibilidade}
            />

            {/* Data/Hora de Trabalho em tempo real */}
            <div className="hidden xl:block text-right border-l border-slate-100 pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Relógio Técnico</p>
              <p className="text-[10px] text-slate-500 font-bold font-mono mt-1 whitespace-nowrap">{dataHoraString}</p>
            </div>

            {/* Informações da Conta */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 select-none">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 shadow-inner">
                {colaboradorLogado.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">{colaboradorLogado.nome}</p>
                <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider block mt-0.5">{colaboradorLogado.cargo}</span>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50/50 rounded-lg transition active:scale-90 cursor-pointer"
                title="Terminar Sessão Regulamentar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </header>

        {/* Content Render Container */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          
          {/* Banner de Sincronização offline-online */}
          {syncMessage && (
            <div className="mb-4 bg-blue-600 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-4 duration-300 shadow-md shadow-blue-500/10">
              <span className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{syncMessage}</span>
              </span>
            </div>
          )}

          {/* Banner explicativo quando áudio está ativo */}
          {configAcessibilidade.vozAtiva && (
            <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded-2xl flex items-center space-x-2 text-green-800 text-xs font-semibold animate-bounce shrink-0 shadow-sm">
              <Volume2 className="w-4 h-4 text-green-600 animate-pulse shrink-0" />
              <span><b>ASSISTENTE DE VOZ ATIVO:</b> Clique em qualquer texto técnico da tela para escutar a audiodescrição expressa.</span>
            </div>
          )}

          {/* Renderização condicional das abas */}
          {activeView === 'dashboard' && (
            <DashboardView 
              ordens={ordens}
              equipamentos={equipamentos}
              colaboradorLogado={colaboradorLogado}
              onNavigate={setActiveView}
              onAlterarStatus={handleAlterarStatus}
              onSimularFalha={handleSimularFalha}
              simulacaoAtiva={simulacaoAtiva}
              simulacaoPressao={simulacaoPressao}
              simulacaoTempe={simulacaoTempe}
              simulacaoStatus={simulacaoStatus}
              onAcoesSimulacao={handleAcoesSimulacao}
            />
          )}

          {activeView === 'equipamentos' && (
            <EquipmentsView 
              equipamentos={equipamentos}
              colaboradorLogado={colaboradorLogado}
              onSelectEquipamento={setEqSelecionadoId}
              onAdicionarEquipamento={handleAdicionarEquipamento}
            />
          )}

          {activeView === 'ordens' && (
            <OrdensView 
              ordens={ordens}
              colaboradorLogado={colaboradorLogado}
              onNavigate={setActiveView}
              onAlterarStatus={handleAlterarStatus}
              onExcluirOS={handleExcluirOS}
            />
          )}

          {activeView === 'calendario' && (
            <CalendarView 
              ordens={ordens}
              colaboradorLogado={colaboradorLogado}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'nova-os' && (
            <NovaOsView 
              colaboradorLogado={colaboradorLogado}
              onNavigate={setActiveView}
              onCriarOS={handleCriarOS}
            />
          )}

          {activeView === 'chamados' && (
            <ChamadosView 
              chamados={chamados}
              equipamentos={equipamentos}
              colaboradorLogado={colaboradorLogado}
              onAdicionarChamado={handleAdicionarChamado}
              onAlterarStatusChamado={handleAlterarStatusChamado}
              onAprovarEGerarOS={handleAprovarEGerarOS}
            />
          )}

          {activeView === 'relatorios' && (
            <RelatoriosView 
              ordens={ordens}
              equipamentos={equipamentos}
            />
          )}

          {activeView === 'colaboradores' && (
            <ColaboradoresView 
              colaboradores={colaboradores}
              onAdicionarColaborador={handleAdicionarColaborador}
              onExcluirColaborador={handleExcluirColaborador}
            />
          )}

          {activeView === 'perfil' && (
            <PerfilView 
              colaboradorLogado={colaboradorLogado}
              onUpdatePerfil={(dados) => {
                const u = { ...colaboradorLogado, ...dados };
                handleLogin(u);
              }}
            />
          )}

        </section>

      </main>

      {/* Overlay Modal para os Detalhes da Máquina e o corretor de "o botão de voltar não estava funcionando;" */}
      {eqAberto && (
        <EquipmentDetailModal
          eq={eqAberto}
          ordens={ordens}
          colaboradorLogado={colaboradorLogado}
          onBack={() => setEqSelecionadoId(null)}
          onUpdateEquipamento={handleUpdateEquipamento}
          onShowImageFull={setImageFullSrc}
        />
      )}

      {/* Visualizador de Imagens Técnico Fullscreen Overlay */}
      {imageFullSrc && (
        <div 
          className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md"
          onClick={() => setImageFullSrc(null)}
        >
          <button 
            onClick={() => setImageFullSrc(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition active:scale-90 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={imageFullSrc} 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-800" 
            alt="Mídia Técnica Real"
          />
        </div>
      )}

    </div>
  );
}
