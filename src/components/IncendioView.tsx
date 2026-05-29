/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, Search, ShieldAlert, PlusCircle, PenTool, CheckCircle2, AlertTriangle, 
  RefreshCw, FileText, ChevronDown, Trash2, Heart, HeartCrack, BarChart, X
} from "lucide-react";
import { Colaborador, OrdemServico, Equipamento } from "../types";

export interface EquipamentoIncendio {
  id: string;
  tipo: "Extintor CO2" | "Extintor Pó Químico" | "Extintor Água Gasosa" | "Hidrante Parede" | "Detector Fumaça" | "Alarme Incêndio" | "Porta Corta-Fogo" | "Sinalização de Emergência";
  codigo: string;
  setor: string;
  capacidade: string;
  dataRecarga: string; // DD/MM/AAAA
  dataVencimento: string; // DD/MM/AAAA
  pressaoStatus: "Regular" | "Baixa" | "Crítica" | "N/A";
  estadoFisico: "Excelente" | "Regular" | "Irregular";
  statusGeral: "Aprovado" | "Necessita Carga" | "Vencido" | "Interditado";
}

interface Props {
  colaboradorLogado: Colaborador | null;
  onEmitirOS: (nova: any) => void;
  triggerNotification: (title: string, body: string, type?: string) => void;
}

const ITENS_INCENDIO_PADRAO: EquipamentoIncendio[] = [
  {
    id: "fire_01",
    tipo: "Extintor CO2",
    codigo: "EXT-CO2-01",
    setor: "Oficina de Usinagem CNC",
    capacidade: "6 kg",
    dataRecarga: "12/03/2026",
    dataVencimento: "12/03/2027",
    pressaoStatus: "Regular",
    estadoFisico: "Excelente",
    statusGeral: "Aprovado"
  },
  {
    id: "fire_02",
    tipo: "Extintor Pó Químico",
    codigo: "EXT-PQS-03",
    setor: "Laboratório de Elétrica",
    capacidade: "4 kg",
    dataRecarga: "10/01/2025",
    dataVencimento: "10/01/2026", // VENCIDO
    pressaoStatus: "Baixa",
    estadoFisico: "Regular",
    statusGeral: "Vencido"
  },
  {
    id: "fire_03",
    tipo: "Hidrante Parede",
    codigo: "HID-P-02",
    setor: "Instalações de Alvenaria",
    capacidade: "30 m (Mangueira)",
    dataRecarga: "22/11/2025",
    dataVencimento: "22/11/2026",
    pressaoStatus: "Regular",
    estadoFisico: "Excelente",
    statusGeral: "Aprovado"
  },
  {
    id: "fire_04",
    tipo: "Detector Fumaça",
    codigo: "DET-FUM-12",
    setor: "Almoxarifado Central",
    capacidade: "Bateria 9V",
    dataRecarga: "15/02/2026",
    dataVencimento: "15/02/2027",
    pressaoStatus: "N/A",
    estadoFisico: "Excelente",
    statusGeral: "Aprovado"
  },
  {
    id: "fire_05",
    tipo: "Extintor Pó Químico",
    codigo: "EXT-PQS-08",
    setor: "Laboratório de Hidráulica",
    capacidade: "8 kg",
    dataRecarga: "30/08/2025",
    dataVencimento: "30/08/2026",
    pressaoStatus: "Crítica",
    estadoFisico: "Irregular",
    statusGeral: "Necessita Carga"
  },
  {
    id: "fire_06",
    tipo: "Porta Corta-Fogo",
    codigo: "PCF-COR-01",
    setor: "Escadaria de Emergência Norte",
    capacidade: "Mola de Retorno",
    dataRecarga: "05/05/2025",
    dataVencimento: "05/05/2027",
    pressaoStatus: "N/A",
    estadoFisico: "Regular",
    statusGeral: "Aprovado"
  }
];

export const IncendioView: React.FC<Props> = ({
  colaboradorLogado,
  onEmitirOS,
  triggerNotification
}) => {
  const [lista, setLista] = useState<EquipamentoIncendio[]>(() => {
    const salvo = localStorage.getItem("manutech_incendio");
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        return ITENS_INCENDIO_PADRAO;
      }
    }
    return ITENS_INCENDIO_PADRAO;
  });

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [itemSelecionado, setItemSelecionado] = useState<EquipamentoIncendio | null>(null);
  
  // Form para novo equipamento
  const [showNovoForm, setShowNovoForm] = useState(false);
  const [novoTipo, setNovoTipo] = useState<EquipamentoIncendio["tipo"]>("Extintor CO2");
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
  const [novaCapacidade, setNovaCapacidade] = useState("");
  const [vencimentoText, setVencimentoText] = useState("");
  const [novoEstadoFisico, setNovoEstadoFisico] = useState<EquipamentoIncendio["estadoFisico"]>("Excelente");
  const [novaPressaoStatus, setNovaPressaoStatus] = useState<EquipamentoIncendio["pressaoStatus"]>("Regular");

  useEffect(() => {
    localStorage.setItem("manutech_incendio", JSON.stringify(lista));
  }, [lista]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = lista.length;
    const aprovados = lista.filter(i => i.statusGeral === "Aprovado").length;
    const vencidos = lista.filter(i => i.statusGeral === "Vencido").length;
    const recarga = lista.filter(i => i.statusGeral === "Necessita Carga" || i.pressaoStatus === "Baixa").length;
    const criticos = lista.filter(i => i.statusGeral === "Interditado" || i.pressaoStatus === "Crítica").length;

    return { total, aprovados, vencidos, recarga, criticos };
  }, [lista]);

  // Filtragem
  const itensFiltrados = useMemo(() => {
    let res = lista;
    if (filtroStatus !== "Todos") {
      res = res.filter(i => i.statusGeral === filtroStatus);
    }
    const b = busca.toLowerCase().trim();
    if (b) {
      res = res.filter(i => 
        i.codigo.toLowerCase().includes(b) ||
        i.setor.toLowerCase().includes(b) ||
        i.tipo.toLowerCase().includes(b)
      );
    }
    return res;
  }, [lista, busca, filtroStatus]);

  // Gerar O.S. automatizada de manutenção contra incêndio
  const handleGerarOsInspecao = (item: EquipamentoIncendio) => {
    const rawDate = new Date().toISOString().slice(0, 16);
    const solicitante = colaboradorLogado?.nome || "Brigada de Incêndio";
    
    const novaOS = {
      equipamento: `SISTEMA DE INCÊNDIO: ${item.tipo} (${item.codigo})`,
      solicitante,
      prioridade: item.statusGeral === 'Vencido' || item.pressaoStatus === 'Crítica' ? 'Alta' : 'Média',
      tipo: 'Corretiva' as const,
      status: 'Pendente' as const,
      descricao: `Corrigir irregularidades no equipamento de incêndio do setor ${item.setor}. Código do item: ${item.codigo}. Detalhes: Estado físico classificado como ${item.estadoFisico}, pressão ${item.pressaoStatus}. Requer vistoria, testes técnicos regulamentares e possível substituição de carga.`,
      rawDate
    };

    onEmitirOS(novaOS);
    
    // Mudar o status do equipamento para interditado/em manutenção se não estava
    setLista(prev => prev.map(i => {
      if (i.id === item.id) {
        return { ...i, statusGeral: "Interditado" };
      }
      return i;
    }));

    // Trigger de notificação
    triggerNotification(
      "Alerta de Incêndio Emitido", 
      `Nova Ordem de Serviço de Correção aberta para o Extintor/Hidrante de código ${item.codigo} no setor ${item.setor}.`,
      "fire"
    );
  };

  const handleInspecaoRapida = (id: string, regularPressao: "Regular" | "Baixa" | "Crítica") => {
    const hoje = new Date();
    const diaPad = String(hoje.getDate()).padStart(2, '0');
    const mesPad = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataAtual = `${diaPad}/${mesPad}/${ano}`;
    const dataVenc = `${diaPad}/${mesPad}/${ano + 1}`; // Validade de 1 ano

    let statusCalculado: EquipamentoIncendio["statusGeral"] = "Aprovado";
    if (regularPressao === 'Baixa') statusCalculado = "Necessita Carga";
    if (regularPressao === 'Crítica') statusCalculado = "Interditado";

    setLista(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          dataRecarga: dataAtual,
          dataVencimento: dataVenc,
          pressaoStatus: regularPressao,
          estadoFisico: "Excelente",
          statusGeral: statusCalculado
        };
      }
      return i;
    }));

    triggerNotification(
      "Inspeção Efetuada", 
      `Equipamento ${id.toUpperCase()} verificado com sucesso pelo operador. Status atualizado para: ${statusCalculado.toUpperCase()}.`,
      "regular"
    );

    if (itemSelecionado?.id === id) {
      setItemSelecionado(prev => prev ? {
        ...prev,
        dataRecarga: dataAtual,
        dataVencimento: dataVenc,
        pressaoStatus: regularPressao,
        estadoFisico: "Excelente",
        statusGeral: statusCalculado
      } : null);
    }
  };

  const handleCriarNovoEquipamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCodigo || !novoSetor) {
      alert("Por favor, preencha o código/tag identificadora e o setor!");
      return;
    }

    const hoje = new Date();
    const diaPad = String(hoje.getDate()).padStart(2, '0');
    const mesPad = String(hoje.getMonth() + 1).padStart(2, '0');
    const dataAtual = `${diaPad}/${mesPad}/${hoje.getFullYear()}`;

    let dataVenc = vencimentoText;
    if (!dataVenc) {
      dataVenc = `${diaPad}/${mesPad}/${hoje.getFullYear() + 1}`;
    } else {
      // converte YYYY-MM-DD para DD/MM/AAAA
      const partes = dataVenc.split("-");
      if (partes.length === 3) {
        dataVenc = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }

    let statusCalculado: EquipamentoIncendio["statusGeral"] = "Aprovado";
    if (novaPressaoStatus === 'Baixa') statusCalculado = "Necessita Carga";
    if (novaPressaoStatus === 'Crítica') statusCalculado = "Interditado";
    if (novoEstadoFisico === 'Irregular') statusCalculado = "Interditado";

    const novoItem: EquipamentoIncendio = {
      id: "fire_" + Date.now(),
      tipo: novoTipo,
      codigo: novoCodigo,
      setor: novoSetor,
      capacidade: novaCapacidade || "Padronizado",
      dataRecarga: dataAtual,
      dataVencimento: dataVenc,
      pressaoStatus: novaPressaoStatus,
      estadoFisico: novoEstadoFisico,
      statusGeral: statusCalculado
    };

    setLista(prev => [novoItem, ...prev]);
    setShowNovoForm(false);
    
    // Zera form
    setNovoCodigo("");
    setNovoSetor("");
    setNovaCapacidade("");
    setVencimentoText("");

    triggerNotification(
      "Dispositivo Cadastrado",
      `Novo equipamento industrial contra incêndio (${novoTipo}) posicionado com sucesso no setor ${novoSetor}.`,
      "fire"
    );
  };

  const handleExcluirEquipamento = (id: string) => {
    if (colaboradorLogado?.cargo !== "Gestor") {
      alert("Apenas Gestores oficiais de infraestrutura têm autorização regulamentar para excluir dispositivos.");
      return;
    }
    const confirmar = window.confirm("Deseja realmente remover permanentemente este item do inventário contra incêndio?");
    if (confirmar) {
      setLista(prev => prev.filter(i => i.id !== id));
      setItemSelecionado(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 blur-xs">
          <Flame className="w-64 h-64" style={{ transform: 'rotate(15deg)' }} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="bg-red-900/40 text-rose-100 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full tracking-widest border border-rose-400/20 shadow-xs inline-flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Brigada Contra Incêndio - SENAI</span>
            </span>
            <h2 className="text-xl md:text-3xl font-black tracking-tight">Gestão de Equipamentos de Emergência</h2>
            <p className="text-rose-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              Mapeamento, monitoramento de validade da carga e pressão hidrostática dos extintores, hidrantes e sistemas de proteção catódica estrutural.
            </p>
          </div>

          <button
            onClick={() => setShowNovoForm(!showNovoForm)}
            className="bg-white/10 hover:bg-white text-rose-600 sm:text-white hover:text-red-700 bg-white hover:opacity-100 font-extrabold px-5 py-3 rounded-2xl flex items-center space-x-2 text-xs uppercase tracking-wider transition-all self-start md:self-auto shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Dispositivo</span>
          </button>
        </div>

        {/* Bento Grid Estatístico */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-3 border border-white/5">
            <span className="block text-[9.5px] uppercase font-bold text-rose-100/80 tracking-wide">Invetário Total</span>
            <span className="block text-xl font-extrabold mt-1">{stats.total} itens</span>
          </div>
          <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-400/20">
            <span className="block text-[9.5px] uppercase font-bold text-emerald-100 tracking-wide">Status Regular</span>
            <span className="block text-xl font-extrabold text-emerald-300 mt-1">{stats.aprovados} regular</span>
          </div>
          <div className="bg-amber-950/20 rounded-xl p-3 border border-amber-400/20">
            <span className="block text-[9.5px] uppercase font-bold text-amber-200 tracking-wide">Baixa Pressão</span>
            <span className="block text-xl font-extrabold text-amber-300 mt-1">{stats.recarga} recarga</span>
          </div>
          <div className="bg-red-950/30 rounded-xl p-3 border border-red-400/20">
            <span className="block text-[9.5px] uppercase font-bold text-red-200 tracking-wide">Carga Vencida</span>
            <span className="block text-xl font-extrabold text-red-400 mt-1">{stats.vencidos} itens</span>
          </div>
          <div className="bg-slate-950/30 rounded-xl p-3 border border-slate-400/20 col-span-2 md:col-span-1">
            <span className="block text-[9.5px] uppercase font-bold text-slate-200 tracking-wide">Irregulares/Bloq.</span>
            <span className="block text-xl font-extrabold text-red-200 mt-1">{stats.criticos} interd.</span>
          </div>
        </div>
      </div>

      {/* Formulário de cadastro de novo equipamento */}
      {showNovoForm && (
        <form onSubmit={handleCriarNovoEquipamento} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-red-650" />
              <span>Instalar Novo Dispositivo contra Incêndio</span>
            </h3>
            <button 
              type="button" 
              onClick={() => setShowNovoForm(false)}
              className="p-1 hover:bg-slate-150 rounded-lg text-slate-400"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">ID/Código Único</label>
              <input
                type="text"
                required
                value={novoCodigo}
                onChange={e => setNovoCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: EXT-PQS-10"
                className="w-full text-xs font-semibold uppercase p-3 rounded-xl border border-slate-200 outline-hidden focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Classe / Dispositivo</label>
              <select
                value={novoTipo}
                onChange={e => setNovoTipo(e.target.value as any)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-hidden bg-slate-50/50"
              >
                <option value="Extintor CO2">Extintor CO2 (Gás Dióxido de Carbono)</option>
                <option value="Extintor Pó Químico">Extintor Pó Químico (B/C ou A/B/C)</option>
                <option value="Extintor Água Gasosa">Extintor de Água Pressurizada/Gasosa</option>
                <option value="Hidrante Parede">Hidrante de Parede (Registro + Mangueira)</option>
                <option value="Detector Fumaça">Detector de Fumaça (Acústico-Óptico)</option>
                <option value="Alarme Incêndio">Botoeira de Alarme de Incêndio / Sirene</option>
                <option value="Porta Corta-Fogo">Porta Corta-Fogo de Emergência</option>
                <option value="Sinalização de Emergência">Placa de Sinalização / Luz Emergência</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Setor / Local exato</label>
              <input
                type="text"
                required
                value={novoSetor}
                onChange={e => setNovoSetor(e.target.value)}
                placeholder="Ex: Sala de CLP / CNC Lab"
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-hidden focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Capacidade / Carga</label>
              <input
                type="text"
                value={novaCapacidade}
                onChange={e => setNovaCapacidade(e.target.value)}
                placeholder="Ex: 6 kg, 8 kg, 30 metros"
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-hidden focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Data Próximo Vencimento</label>
              <input
                type="date"
                value={vencimentoText}
                onChange={e => setVencimentoText(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-hidden focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Status Pressão (SE DISPONÍVEL)</label>
              <select
                value={novaPressaoStatus}
                onChange={e => setNovaPressaoStatus(e.target.value as any)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-hidden bg-slate-50/50"
              >
                <option value="Regular">Regular (Faixa Verde do Manômetro)</option>
                <option value="Baixa">Abaixo do Recomendado (Ponteiro à Esquerda)</option>
                <option value="Crítica">Irregular/Sem Pressão (Ponteiro no Vermelho)</option>
                <option value="N/A">Não Aplicável (Hidrantes, Portas e Detectores)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNovoForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-650 hover:bg-red-750 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition shadow-md shadow-red-500/15"
            >
              Gravar Dispositivo
            </button>
          </div>
        </form>
      )}

      {/* Caixa de Pesquisa e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Barra de Pesquisa */}
        <div className="flex items-center space-x-3 w-full md:max-w-md border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/30">
          <Search className="w-4 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Procure por tag (ex: EXT-CO2), setor ou classe..."
            className="w-full text-slate-700 outline-hidden text-xs bg-transparent"
          />
        </div>

        {/* Abas Rápidas de status */}
        <div className="flex space-x-1.5 overflow-x-auto w-full md:w-auto">
          {["Todos", "Aprovado", "Necessita Carga", "Vencido", "Interditado"].map((status) => {
            const ativo = filtroStatus === status;
            let coresEstilo = ativo ? "bg-red-600 text-white" : "bg-slate-100 text-slate-650 hover:bg-slate-200";
            if (status === "Aprovado") coresEstilo = ativo ? "bg-emerald-600 text-white shadow shadow-emerald-500/20" : "bg-slate-100 text-slate-650 hover:bg-slate-200";

            return (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition ${coresEstilo}`}
              >
                {status === "Todos" ? "Todos os Equipamentos" : status}
              </button>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista de Dispositivos */}
        <div className={`space-y-4 ${itemSelecionado ? "lg:col-span-7" : "lg:col-span-12"}`}>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-[10px]">Tag / Código</th>
                    <th className="px-5 py-4 font-semibold text-[10px]">Dispositivo</th>
                    <th className="px-5 py-4 font-semibold text-[10px]">Setor</th>
                    <th className="px-5 py-4 font-semibold text-[10px]">Próx Vencimento</th>
                    <th className="px-5 py-4 font-semibold text-[10px]">Medição Manômetro</th>
                    <th className="px-5 py-4 font-semibold text-[10px] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {itensFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic font-medium">
                        Nenhum dispositivo contra incêndio com estas características no sistema.
                      </td>
                    </tr>
                  ) : (
                    itensFiltrados.map((item) => {
                      const selecionado = itemSelecionado?.id === item.id;
                      
                      let badgeEstilo = "bg-rose-50 text-rose-700 border-rose-100";
                      if (item.statusGeral === "Aprovado") badgeEstilo = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      else if (item.statusGeral === "Necessita Carga") badgeEstilo = "bg-amber-50 text-amber-700 border-amber-150";
                      else if (item.statusGeral === "Vencido") badgeEstilo = "bg-red-50 text-red-700 border-red-100 animate-pulse";
                      else if (item.statusGeral === "Interditado") badgeEstilo = "bg-slate-900 text-white border-slate-800";

                      let pressaoEstilo = "text-emerald-600 font-bold";
                      if (item.pressaoStatus === "Baixa") pressaoEstilo = "text-amber-600 font-bold";
                      else if (item.pressaoStatus === "Crítica") pressaoEstilo = "text-red-600 font-bold animate-pulse";

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setItemSelecionado(item)}
                          className={`hover:bg-slate-50 cursor-pointer transition duration-150 ${selecionado ? "bg-red-50/5 border-l-4 border-l-red-500" : ""}`}
                        >
                          <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">{item.codigo}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold block text-slate-800">{item.tipo}</span>
                            <span className="text-[10px] text-slate-400">{item.capacidade}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 truncate max-w-[150px]" title={item.setor}>{item.setor}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`font-semibold ${item.statusGeral === "Vencido" ? "text-red-600 font-bold" : "text-slate-600"}`}>
                              {item.dataVencimento}
                            </span>
                            {item.statusGeral === "Vencido" && (
                              <span className="text-[9px] block text-red-500 font-bold uppercase tracking-wider">RECARGA EXIGIDA</span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={pressaoEstilo}>{item.pressaoStatus}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${badgeEstilo}`}>
                              {item.statusGeral}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detalhes do item selecionado */}
        {itemSelecionado && (
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-5 animate-in slide-in-from-right-10 duration-200 relative">
            <button 
              onClick={() => setItemSelecionado(null)} 
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 text-slate-400 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Flame className="w-5 h-5 text-red-650" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {itemSelecionado.codigo}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{itemSelecionado.tipo}</h3>
              </div>
            </div>

            {/* Informações Bento */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Setor Operacional</span>
                <span className="block font-bold text-slate-800 mt-1">{itemSelecionado.setor}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Capacidade Regulada</span>
                <span className="block font-bold text-slate-800 mt-1">{itemSelecionado.capacidade}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Data de Fabricação/Carga</span>
                <span className="block font-bold text-slate-800 mt-1">{itemSelecionado.dataRecarga}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Vencimento da Carga</span>
                <span className={`block font-bold mt-1 ${itemSelecionado.statusGeral === "Vencido" ? "text-red-600 underline font-black" : "text-slate-800"}`}>
                  {itemSelecionado.dataVencimento}
                </span>
              </div>
            </div>

            {/* Visual Manômetro Pressão */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-wider font-mono">
                <span className="text-slate-450">Indicador do Manômetro</span>
                {itemSelecionado.pressaoStatus === "Regular" && <span className="text-emerald-400">FAIXA DE SEGURANÇA</span>}
                {itemSelecionado.pressaoStatus === "Baixa" && <span className="text-amber-400">CARGA COMPROMETIDA</span>}
                {itemSelecionado.pressaoStatus === "Crítica" && <span className="text-red-400">RISCO DE NÃO ATUAÇÃO</span>}
                {itemSelecionado.pressaoStatus === "N/A" && <span className="text-slate-400">PRESENCIAL MANUAL</span>}
              </div>

              {itemSelecionado.pressaoStatus !== "N/A" ? (
                <div className="space-y-2">
                  <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 flex">
                    {/* Baixa pressure color zone */}
                    <div className="w-[30%] h-full bg-red-500/80"></div>
                    {/* Regular zone */}
                    <div className="w-[45%] h-full bg-emerald-500 border-x border-slate-950/20"></div>
                    {/* Alta pressure zone */}
                    <div className="w-[25%] h-full bg-red-600"></div>

                    {/* Ponteiro representativo */}
                    <span 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-45 border border-slate-850" 
                      style={{ 
                        left: itemSelecionado.pressaoStatus === "Regular" ? "52%" : itemSelecionado.pressaoStatus === "Baixa" ? "20%" : "88%",
                        transition: "left 0.8s ease-in-out"
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                    <span>BAIXA (RECARREGUE)</span>
                    <span className="text-emerald-400">IDEAL (REGULAR)</span>
                    <span>ALTA (SOBREPRESSÃO)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 italic">
                  <span>Equipamento não passível de controle manométrico contínuo. Inspeção física integral requerida.</span>
                </div>
              )}
            </div>

            {/* Painel de inspeção rápida e O.S. */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest block">Inspeção Geral e Auditoria Física</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  onClick={() => handleInspecaoRapida(itemSelecionado.id, 'Regular')}
                  className="px-2.5 py-1.5 border border-emerald-250 hover:bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[10px] uppercase tracking-wide transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 object-contain shrink-0 text-emerald-600" />
                  <span>Gravar Regular</span>
                </button>
                <button
                  onClick={() => handleInspecaoRapida(itemSelecionado.id, 'Baixa')}
                  className="px-2.5 py-1.5 border border-amber-250 hover:bg-amber-50 text-amber-800 font-bold rounded-lg text-[10px] uppercase tracking-wide transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 object-contain shrink-0 text-amber-550" />
                  <span>Baixa Pressão</span>
                </button>
                <button
                  onClick={() => handleGerarOsInspecao(itemSelecionado)}
                  className="p-1 px-1.5 text-center col-span-2 md:col-span-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-[9.5px] uppercase tracking-wide transition shadow-xs hover:shadow flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <PenTool className="w-3 shrink-0 text-amber-300" />
                  <span>Emitir O.S.</span>
                </button>
              </div>

              {colaboradorLogado?.cargo === 'Gestor' && (
                <button
                  onClick={() => handleExcluirEquipamento(itemSelecionado.id)}
                  className="w-full py-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 font-bold border border-slate-200 hover:border-red-200 transition text-[10px] rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover do Inventário Escolar</span>
                </button>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
