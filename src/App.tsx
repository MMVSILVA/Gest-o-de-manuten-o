/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Wrench, LayoutDashboard, Server, ClipboardList, CalendarDays, PlusCircle, 
  BarChart2, Users, User, ChevronRight, LogOut, Database, ShieldCheck, 
  X, Check, Play, Volume2, Lock, Sparkles, HelpCircle, Flame 
} from "lucide-react";

import { Colaborador, Equipamento, OrdemServico, AccessibilityConfig, Chamado } from "./types";
import { carregarSimulacaoLocalStorage, COLABORADORES_PADRAO } from "./data/mockData";
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
import { IncendioView } from "./components/IncendioView";

export default function App() {
  // Inicializa localStorage com sementes padronizadas antes de montar
  useEffect(() => {
    carregarSimulacaoLocalStorage();
  }, []);

  // Estados principais
  const [colaboradorLogado, setColaboradorLogado] = useState<Colaborador | null>(() => {
    const salvo = localStorage.getItem("manutech_colaborador");
    if (salvo) {
      try {
        const user = JSON.parse(salvo);
        const padrao = COLABORADORES_PADRAO.find(p => p.matricula === user.matricula);
        if (padrao) {
          user.cargo = padrao.cargo; // restaura cargo regulamentar se for um colaborador padrão
        }
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => {
    const sColabs = localStorage.getItem("manutech_colaboradores");
    let parseadas: Colaborador[] = sColabs ? JSON.parse(sColabs) : [];
    if (parseadas.length === 0) {
      return COLABORADORES_PADRAO.map(p => ({ ...p }));
    }
    // Garante que sementes importantes (como Alexandre e Wesley) existam se ausentes
    COLABORADORES_PADRAO.forEach(p => {
      const idx = parseadas.findIndex(c => c.matricula === p.matricula);
      if (idx !== -1) {
        // Enforça o cargo original das sementes regulamentares
        parseadas[idx].cargo = p.cargo;
      } else {
        parseadas.push({ ...p });
      }
    });
    return parseadas;
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

  const [activeView, setActiveView] = useState<'dashboard' | 'ordens' | 'calendario' | 'nova-os' | 'relatorios' | 'colaboradores' | 'perfil' | 'equipamentos' | 'chamados' | 'incendio'>('dashboard');
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

  // Estados para notificações reais do celular do gestor (Alexandre/Wesley)
  const [mobileNotifications, setMobileNotifications] = useState<any[]>(() => {
    const salvo = localStorage.getItem("manutech_mobile_notif");
    if (salvo) return JSON.parse(salvo);
    return [
      {
        id: "notif_1",
        title: "Dispositivo Conectado",
        body: "Celular do gestor (Alexandre/Wesley) sincronizado com a rede IoT de emergência do SENAI.",
        time: "12:30",
        type: "regular"
      }
    ];
  });
  const [showPhoneWidget, setShowPhoneWidget] = useState(false);
  const [newNotifPulse, setNewNotifPulse] = useState(false);

  // Estados dos ganchos PWA de Instalação e Notificações Reais no segundo plano
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [realNotifStatus, setRealNotifStatus] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Listener para capturar o prompt de instalação disponível do PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Handler para acionar prompt nativo de baixar sistema no celular/computador
  const handlePwaInstallClick = () => {
    if (!deferredPrompt) {
      alert(
        "📲 COMO BAIXAR E INSTALAR O MANUTECH NO SEU CELULAR:\n\n" +
        "• No iOS (Safari):\n" +
        "1. Toque no ícone de Compartilhar (quadrado com seta para cima)\n" +
        "2. Role e selecione a opção 'Adicionar à Tela de Início'.\n" +
        "3. Toque em 'Adicionar' no canto superior direito.\n\n" +
        "• No Android ou PC (Chrome / Edge):\n" +
        "1. Abra as configurações (ícone de 3 pontos no navegador de internet)\n" +
        "2. Toque em 'Adicionar à Tela de início', 'Instalar aplicativo' ou equivalente.\n\n" +
        "Isso fixará o ícone oficial na gaveta de aplicativos, permitindo abri-lo offline com carregamento instantâneo!"
      );
      return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Usuário confirmou a instalação do Manutech");
      }
      setDeferredPrompt(null);
      setPwaInstallable(false);
    });
  };

  // Solicita permissões de Alerta em Tempo Real
  const requestRealNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("Seu celular ou navegador corrente não suporta notificações HTML5 nativas.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      setRealNotifStatus(permission);
      if (permission === "granted") {
        // Disparar uma notificação de teste imediata usando Service Worker se disponível
        const testTitle = "Conexão Estabelecida !";
        const testBody = "As notificações reais do Manutech foram conectadas ao seu celular com sucesso!";
        
        if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(testTitle, {
              body: testBody,
              vibrate: [200, 100, 200],
              tag: "manutech-alert"
            } as any);
          });
        } else {
          new Notification(testTitle, { body: testBody });
        }
      } else if (permission === "denied") {
        alert("Permissão negada. Ative as permissões nas configurações do navegador do seu celular para receber os alertas em tempo real.");
      }
    });
  };

  // Função centralizada para desencadear as notificações do celular do gestor
  const triggerNotification = (title: string, body: string, type: string = "regular") => {
    const agora = new Date();
    const hora = String(agora.getHours()).padStart(2, '0');
    const min = String(agora.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hora}:${min}`;

    const novaNotif = {
      id: "notif_" + Date.now(),
      title,
      body,
      time: timeFormatted,
      type
    };

    setMobileNotifications(prev => {
      const novaLista = [novaNotif, ...prev].slice(0, 50); // cap a 50 itens
      localStorage.setItem("manutech_mobile_notif", JSON.stringify(novaLista));
      return novaLista;
    });

    setNewNotifPulse(true);
    setTimeout(() => setNewNotifPulse(false), 2000);

    // Reprodução sutil de aviso sonoro sintetizado
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // nota D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // nota A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.40);
    } catch (e) {
      // AudioCtx silenciado em alguns navegadores até interação do usuário
    }

    // Trigger de notificação nativa HTML5 Web Push se houver permissão (Ativo em segundo plano 2º plano)
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const notifOptions = {
          body,
          tag: "manutech-alert",
          vibrate: [200, 100, 200]
        } as any;

        // Fallback robusto de Service Worker para permitir execução real em segundo plano no celular
        if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, notifOptions).catch(() => {
              new Notification(title, { body });
            });
          });
        } else {
          new Notification(title, { body });
        }
      }
    }
  };

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

    // O.S. Criada / Agendada - Dispara Notificação Celular do Gestor
    triggerNotification(
      "Nova O.S. Registrada",
      `Aberta O.S. de tipo ${nova.tipo} para o equipamento ${nova.equipamento}. Prioridade: ${nova.prioridade}.`,
      "os"
    );

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
      descricao: `[O.S. RECEBIDA E CONTRATADA POR GESTOR: ${colaboradorLogado ? colaboradorLogado.nome : "Alexandre Rodrigues"}] — ` + chamado.descricao,
      data: dataFormatada,
      timestamp: Date.now(),
      rawDate: new Date().toISOString().slice(0, 16)
    };

    setOrdens(prev => [novaOS, ...prev]);

    // Dispara alerta no celular do gestor
    triggerNotification(
      "O.S. Gerada por Triagem",
      `Chamado do instrutor ${chamado.solicitante} aprovado. O.S. criada para o equipamento ${chamado.equipamento}.`,
      "os"
    );

    alert(`O Chamado do Instrutor ${chamado.solicitante} foi aprovado! A Ordem de Serviço foi gerada com sucesso e colocada na fila de intervenções.`);
  };

  const handleAlterarStatus = (id: string, novo: "Em Andamento" | "Concluído") => {
    const dataObj = new Date();
    const diaPad = String(dataObj.getDate()).padStart(2, "0");
    const mesPad = String(dataObj.getMonth() + 1).padStart(2, "0");
    const horaPad = String(dataObj.getHours()).padStart(2, "0");
    const minPad = String(dataObj.getMinutes()).padStart(2, "0");
    const dataFormatada = `${diaPad}/${mesPad}/${dataObj.getFullYear()} - ${horaPad}:${minPad}`;

    const oAlt = ordens.find(o => o.id === id);
    if (oAlt) {
      triggerNotification(
        `O.S. alterada para ${novo}`,
        `Equipamento "${oAlt.equipamento}" está agora em status de: ${novo}.`,
        novo === 'Concluído' ? 'regular' : 'os'
      );
    }

    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        if (novo === "Concluído") {
          return {
            ...o,
            status: novo,
            dataConclusao: dataFormatada,
            timestampConclusao: dataObj.getTime()
          };
        } else {
          return {
            ...o,
            status: novo,
            dataConclusao: undefined,
            timestampConclusao: undefined
          };
        }
      }
      return o;
    }));

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
        onRegistrarColaborador={handleAdicionarColaborador}
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
    chamados: colaboradorLogado?.cargo === "Instrutor" ? "Abrir Chamado" : "Triagem de Chamados",
    incendio: "Brigada & Prevenção de Incêndios"
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

            {/* Equipamentos contra Incêndio */}
            <button 
              onClick={() => { setActiveView('incendio'); setEqSelecionadoId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeView === 'incendio' ? "bg-red-650 text-white shadow-md shadow-red-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4 text-red-500" />
              <span>Brigada Incêndio</span>
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

            {/* Requisito: Possibilidade do usuário baixar no celular o sistema */}
            <button
              onClick={handlePwaInstallClick}
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold px-3 py-2 rounded-xl text-[10px] uppercase flex items-center space-x-1.5 shadow transition-all duration-150 cursor-pointer self-center"
              title="Instalar Manutech no Celular ou Desktop (PWA)"
            >
              <span className="text-[11px]">📲</span>
              <span>Baixar App</span>
            </button>

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
              onAgendarOS={handleCriarOS}
              triggerNotification={triggerNotification}
            />
          )}

          {activeView === 'incendio' && (
            <IncendioView 
              colaboradorLogado={colaboradorLogado}
              onEmitirOS={handleCriarOS}
              triggerNotification={triggerNotification}
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

      {/* Simulador de Celular do Gestor */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!showPhoneWidget && (
          <button
            onClick={() => setShowPhoneWidget(true)}
            className={`bg-slate-900 border border-slate-700 text-white p-3 rounded-full shadow-2xl flex items-center space-x-2 transition duration-200 hover:scale-105 active:scale-95 cursor-pointer relative ${
              newNotifPulse ? "animate-bounce ring-4 ring-rose-500/30" : ""
            }`}
          >
            <div className="relative">
              <span className="text-lg">📱</span>
              {mobileNotifications.length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-rose-650 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {mobileNotifications.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider pr-1 text-amber-400">Celular do Gestor</span>
          </button>
        )}

        {showPhoneWidget && (
          <div className="w-[300px] h-[480px] bg-slate-950 rounded-[36px] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-10 duration-300">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
            </div>

            {/* status-bar */}
            <div className="h-6 bg-slate-950 px-5 flex items-center justify-between text-[9px] text-slate-400 font-mono font-bold select-none pt-1">
              <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center space-x-1.5">
                <span>SENAI-SIM</span>
                <span className="text-[7px]">⚡ LTE</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Cabecalho interna do celular */}
            <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-base">🔔</span>
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Central de Alertas</h4>
                  <p className="text-[8px] text-slate-400"> Wesley & Alexandre (Gestão)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPhoneWidget(false)}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 font-bold px-2 py-1 rounded-lg text-slate-300 transition"
              >
                Minimizar
              </button>
            </div>

            {/* Ativador de Notificações Reais no Celular Físico */}
            <div className="bg-purple-950/45 border-b border-slate-800 px-3 py-2 flex items-center justify-between shrink-0 text-left">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block leading-none">Notificações Reais</span>
                <span className="text-[7px] text-slate-300 block leading-tight">
                  {realNotifStatus === "granted" ? "🔔 Ativas no aparelho real" : "🔕 Desconectadas no dispositivo"}
                </span>
              </div>
              {realNotifStatus !== "granted" ? (
                <button
                  onClick={requestRealNotificationPermission}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[7.5px] font-black uppercase px-2 py-1 rounded-md transition cursor-pointer"
                >
                  Conectar
                </button>
              ) : (
                <span className="text-emerald-400 font-extrabold text-[8px] uppercase tracking-wider">Conectado</span>
              )}
            </div>

            {/* Banner de Instalação PWA Real */}
            <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between shrink-0 text-left">
              <span className="text-[7.5px] text-slate-300 leading-none">Deseja fixar o sistema no celular comercial?</span>
              <button
                onClick={handlePwaInstallClick}
                className="bg-purple-700 hover:bg-purple-650 text-white text-[7.5px] font-bold uppercase px-2 py-1 rounded-md transition cursor-pointer"
              >
                Instalar
              </button>
            </div>

            {/* Corpo de Notificacoes */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/95">
              {mobileNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12 text-center space-y-2.5">
                  <span className="text-2xl">💤</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tudo Sob Controle</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed max-w-[180px]">
                    Nenhum alerta pendente. Aberturas de O.S., inspeções brigadistas e preventivas aparecerão aqui.
                  </p>
                </div>
              ) : (
                mobileNotifications.map((notif: any) => {
                  let badgeIcon = "⚙️";
                  let borderCor = "border-l-blue-500";
                  if (notif.type === "os") {
                    badgeIcon = "⚙️";
                    borderCor = "border-l-rose-500";
                  } else if (notif.type === "calendar") {
                    badgeIcon = "📅";
                    borderCor = "border-l-amber-500";
                  } else if (notif.type === "fire") {
                    badgeIcon = "🚨";
                    borderCor = "border-l-red-500";
                  }

                  return (
                    <div 
                      key={notif.id} 
                      className={`bg-slate-900 border-l-4 ${borderCor} p-2.5 rounded-r-xl space-y-1 text-left animate-in fade-in slide-in-from-top-2 duration-200`}
                    >
                      <div className="flex justify-between items-center text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                        <span className="flex items-center space-x-1">
                          <span>{badgeIcon}</span>
                          <span>{notif.type === 'fire' ? 'BRIGADA INCÊNDIO' : notif.type === 'calendar' ? 'AGENDAMENTO' : 'SISTEMA O.S.'}</span>
                        </span>
                        <span>{notif.time}</span>
                      </div>
                      <h5 className="text-[10px] font-bold text-rose-100/90 leading-tight">{notif.title}</h5>
                      <p className="text-[9.5px] text-slate-300 leading-normal">{notif.body}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé Interno */}
            {mobileNotifications.length > 0 && (
              <div className="p-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    setMobileNotifications([]);
                    localStorage.setItem("manutech_mobile_notif", "[]");
                  }}
                  className="text-[9px] font-extrabold uppercase text-slate-400 hover:text-white transition w-full text-center py-1 bg-slate-950/40 hover:bg-slate-950 rounded-lg"
                >
                  Limpar Todas
                </button>
              </div>
            )}
            
            {/* Home Indicator */}
            <div className="h-3 bg-slate-950 shrink-0 flex items-center justify-center">
              <div className="w-20 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
