/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Volume2, VolumeX, Eye, HelpCircle } from "lucide-react";
import { AccessibilityConfig } from "../types";

interface Props {
  config: AccessibilityConfig;
  onChange: (newConfig: AccessibilityConfig) => void;
}

export const AccessibilityToggle: React.FC<Props> = ({ config, onChange }) => {
  const toggleVoz = () => {
    const nextState = !config.vozAtiva;
    onChange({ ...config, vozAtiva: nextState });
    
    // Feedback de voz imediato
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = nextState 
        ? "Audiodescrição e Acessibilidade por voz ativados. Clique em qualquer texto técnico para ouvi-lo." 
        : "Audiodescrição desativada.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-PT";
      window.speechSynthesis.speak(utterance);
    }
  };

  const mudarFonte = (tamanho: 'padrao' | 'grande' | 'extra') => {
    onChange({ ...config, tamanhoFonte: tamanho });
    if (config.vozAtiva && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Tamanho da letra alterado para ${tamanho === 'padrao' ? 'padrão' : tamanho === 'grande' ? 'letra grande' : 'letra extra grande'}`;
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = "pt-PT";
      window.speechSynthesis.speak(ut);
    }
  };

  // Efeito global de tamanho de letra na tag HTML/body
  useEffect(() => {
    const body = document.body;
    body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    
    if (config.tamanhoFonte === 'grande') {
      body.classList.add('text-lg');
    } else if (config.tamanhoFonte === 'extra') {
      body.classList.add('text-xl');
    } else {
      body.classList.add('text-base');
    }
  }, [config.tamanhoFonte]);

  return (
    <div className="flex items-center space-x-1 border-r border-slate-200 pr-3 mr-1">
      {/* Botão de Voz */}
      <button
        onClick={toggleVoz}
        className={`p-2 rounded-full transition-all relative group flex items-center justify-center ${
          config.vozAtiva 
            ? "bg-green-100 text-green-700 ring-2 ring-green-300" 
            : "text-slate-500 hover:bg-slate-100"
        }`}
        title={config.vozAtiva ? "Desativar Leitura por Voz" : "Ativar Leitura por Voz"}
      >
        {config.vozAtiva ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-slate-400" />
        )}
        
        {config.vozAtiva && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Seletores de Letra */}
      <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 space-x-1 ml-1 text-xs font-semibold">
        <button
          onClick={() => mudarFonte('padrao')}
          className={`px-2 py-1 rounded transition-all ${
            config.tamanhoFonte === 'padrao' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
          title="Letra Padrão"
        >
          A
        </button>
        <button
          onClick={() => mudarFonte('grande')}
          className={`px-2 py-1 rounded transition-all ${
            config.tamanhoFonte === 'grande' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
          title="Letra Grande"
        >
          A+
        </button>
        <button
          onClick={() => mudarFonte('extra')}
          className={`px-2 py-1 rounded transition-all ${
            config.tamanhoFonte === 'extra' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
          title="Letra Extra"
        >
          A++
        </button>
      </div>
    </div>
  );
};
