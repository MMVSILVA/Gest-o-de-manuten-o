/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, User, PlusCircle, HelpCircle, AlertCircle 
} from "lucide-react";
import { OrdemServico, Colaborador } from "../types";

interface Props {
  ordens: OrdemServico[];
  colaboradorLogado: Colaborador | null;
  onNavigate: (view: any) => void;
}

export const CalendarView: React.FC<Props> = ({
  ordens,
  colaboradorLogado,
  onNavigate
}) => {
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mudarMes = (direcao: number) => {
    let proximoMes = mes + direcao;
    let proximoAno = ano;

    if (proximoMes < 0) {
      proximoMes = 11;
      proximoAno -= 1;
    } else if (proximoMes > 11) {
      proximoMes = 0;
      proximoAno += 1;
    }

    setMes(proximoMes);
    setAno(proximoAno);
    setDiaSelecionado(1); // Reset dia
  };

  const calendarGrid = useMemo(() => {
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    const vaziosPrev: null[] = Array(primeiroDiaSemana).fill(null);
    const diasArray: number[] = Array.from({ length: totalDiasMes }, (_, i) => i + 1);

    return [...vaziosPrev, ...diasArray];
  }, [mes, ano]);

  const ordensDoDiaSeleccionado = useMemo(() => {
    const diaPad = String(diaSelecionado).padStart(2, '0');
    const mesPad = String(mes + 1).padStart(2, '0');
    const dataChave = `${diaPad}/${mesPad}/${ano}`;

    return ordens.filter(os => os.data && os.data.includes(dataChave));
  }, [diaSelecionado, mes, ano, ordens]);

  // Checa se há ordens em um dia específico do mês ativo
  const getOrdensEstiloNoDia = (dia: number) => {
    const diaPad = String(dia).padStart(2, '0');
    const mesPad = String(mes + 1).padStart(2, '0');
    const dataChave = `${diaPad}/${mesPad}/${ano}`;

    return ordens.filter(os => os.data && os.data.includes(dataChave));
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Programação de Atividades</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Planeje sistematicamente as intervenções com base na legenda cronológica por categoria e nível de urgência.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Painel Esquerdo: Bloco de Calendário */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-650" />
              <span>{nomesMeses[mes]} de {ano}</span>
            </h3>
            
            <div className="flex space-x-1.5">
              <button 
                onClick={() => mudarMes(-1)}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => mudarMes(1)}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Dias da Semana */}
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, index) => (
              <div key={index} className="font-extrabold text-slate-400 py-2 uppercase tracking-wider">{d}</div>
            ))}

            {/* Dias do Mês */}
            {calendarGrid.map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} className="py-3 text-transparent">-</div>;
              }

              const ativo = dia === diaSelecionado;
              const ordensDia = getOrdensEstiloNoDia(dia);
              const temOrdens = ordensDia.length > 0;

              return (
                <div
                  key={`day-${dia}`}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition relative flex flex-col items-center justify-center border h-12 ${
                    ativo 
                      ? "bg-blue-600 text-white border-blue-600 shadow shadow-blue-300" 
                      : "bg-slate-50/50 text-slate-700 border-transparent hover:border-slate-200"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{dia}</span>
                  
                  {temOrdens && (
                    <div className="flex space-x-0.5 mt-1 justify-center max-w-full overflow-hidden">
                      {/* Pontos de cores regulando categorias */}
                      {Array.from(new Set(ordensDia.map(o => o.tipo))).slice(0, 3).map((tipo, idx) => {
                        let dotCor = "bg-blue-500";
                        if (tipo === 'Corretiva') dotCor = "bg-red-500";
                        else if (tipo === 'Preditiva') dotCor = "bg-green-500";
                        else if (tipo === 'Treinamento') dotCor = "bg-amber-400";
                        else if (tipo === 'Calibração') dotCor = "bg-purple-500";

                        return (
                          <span 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full border border-white shrink-0 ${dotCor}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda de Tipos e Cores */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center items-center mt-6 pt-4 border-t border-slate-200 text-[10px] font-extrabold uppercase tracking-wide">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow-xs"></span>
              <span className="text-slate-500">Corretiva</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-xs"></span>
              <span className="text-slate-500">Preventiva</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white shadow-xs"></span>
              <span className="text-slate-500">Preditiva</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-xs"></span>
              <span className="text-slate-500">Treino SENAI</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white shadow-xs"></span>
              <span className="text-slate-500">Calibração</span>
            </span>
          </div>

        </div>

        {/* Painel Direito: Lista de atividades do dia selecionado */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
            <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Programação para o Dia</span>
            </h3>
            <p className="text-base font-bold mt-1">
              {String(diaSelecionado).padStart(2, '0')} de {nomesMeses[mes]} de {ano}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 min-h-[280px] max-h-[460px] overflow-y-auto">
            {ordensDoDiaSeleccionado.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                <AlertCircle className="w-10 h-10 text-emerald-500 shrink-0" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ativos em Operação Plena</p>
                <p className="text-[11px] text-center max-w-[200px] text-slate-400 select-all">
                  Nenhuma manutenção ou intervenção agendada para hoje.
                </p>
              </div>
            ) : (
              ordensDoDiaSeleccionado.map(os => {
                let bordaTipo = "border-l-blue-500 bg-blue-50/10";
                let tipoCor = "text-blue-700 border-blue-200 bg-blue-50";

                if (os.tipo === 'Corretiva') {
                  bordaTipo = "border-l-red-500 bg-red-50/10";
                  tipoCor = "text-red-700 border-red-200 bg-red-50";
                } else if (os.tipo === 'Preditiva') {
                  bordaTipo = "border-l-green-500 bg-green-50/10";
                  tipoCor = "text-green-700 border-green-200 bg-green-50";
                } else if (os.tipo === 'Treinamento') {
                  bordaTipo = "border-l-amber-500 bg-amber-50/10";
                  tipoCor = "text-amber-700 border-amber-200 bg-amber-50";
                } else if (os.tipo === 'Calibração') {
                  bordaTipo = "border-l-purple-500 bg-purple-50/10";
                  tipoCor = "text-purple-700 border-purple-200 bg-purple-50";
                }

                const partes = os.data.split(" - ");
                const hora = partes[1] || "Sem Hora";

                return (
                  <div 
                    key={os.id}
                    className={`border border-slate-200 border-l-4 ${bordaTipo} p-4 rounded-r-xl space-y-2 hover:shadow transition`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{hora}</span>
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-widest ${tipoCor}`}>
                        {os.tipo}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs md:text-sm">{os.equipamento}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{os.descricao}</p>

                    <div className="flex justify-between items-center text-[10px] border-t border-slate-100/50 pt-1.5 mt-2 font-semibold text-slate-400">
                      <span>Ref: ${os.id.toUpperCase()}</span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{os.solicitante}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
