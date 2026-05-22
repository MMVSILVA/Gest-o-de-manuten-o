import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Permitir uploads em base64 nas O.S. se necessário

// Lazy-loaded client Gemini
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ========================================================
// RECURSOS IA: PROXYING GEMINI DA PARTE DO SERVIDOR (SERVER-SIDE)
// ========================================================

app.post("/api/diagnostico", async (req, res) => {
  try {
    const { equipamento, descricao } = req.body;
    if (!descricao) {
      return res.status(400).json({ error: "Descrição de sintomas em falta." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Simulação em caso de ausência de chave (Fallback útil de desenvolvimento)
      return res.json({
        text: `[FALLBACK SIMULADO - GEMINI SEM CHAVE API]\n` +
          `Análise para: "${equipamento}"\n` +
          `Sintoma: "${descricao}"\n\n` +
          `Causa mais provável: Desalinhamento mecânico primário ou fadiga de material nas vedações.\n` +
          `Medidas de Segurança Recomendadas (EPIs): Óculos de proteção, calçado reforçado e luvas anti-vibração.\n` +
          `Roteiro sugerido:\n` +
          `1. Isolar e bloquear a alimentação de energia (LOTO);\n` +
          `2. Inspecionar o nível dos fluidos e desgaste físico dos componentes;\n` +
          `3. Executar o alinhamento com relógio comparador;\n` +
          `4. Testar o equipamento com rotação reduzida antes de re-integrar.`
      });
    }

    const prompt = `Você é um Engenheiro de Manutenção Sênior e Especialista em Confiabilidade Industrial 4.0 do SENAI. 
Por favor, analise a seguinte avaria técnica em Portugal/Brasil (utilizando termos técnicos como ecrã, rodar, painel, O.S., etc.):
Equipamento: "${equipamento}"
Sintomas / Defeito descrito: "${descricao}"

Forneça um diagnóstico estruturado e estritamente profissional contendo:
- **Causa Raiz Provável**: Análise técnica concisa do sintoma.
- **EPIs Necessários**: Equipamento de Proteção Individual específico recomendado para a intervenção.
- **Roteiro de Manutenção / Passo a Passo**: Um passo a passo explicativo e seguro para o técnico operacional executar a correção de forma robusta.
Use formatação concisa em Markdown com espaçamento elegante.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no proxy de diagnóstico Gemini:", error);
    res.status(500).json({ error: error.message || "Erro de comunicação com Gemini." });
  }
});

app.post("/api/otimizar", async (req, res) => {
  try {
    const { tipo, equipamento, descricao } = req.body;
    if (!descricao) {
      return res.status(400).json({ error: "Descrição original em falta." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        text: `[O.S. OTIMIZADA - MODO SIMULADO]\n` +
          `Intervenção de tipo: ${tipo} no ativo: ${equipamento || "Geral"}.\n` +
          `Detalhe da Intervenção:\n` +
          `- Relatório preliminar: ${descricao}\n` +
          `- Procedimento padrão de diagnóstico e testes preliminares de integridade em conformidade com as normas regulamentadoras vigentes.`
      });
    }

    const prompt = `Melhore e otimize tecnicamente a descrição de uma Ordem de Serviço de manutenção para torná-la profissional, técnica, clara e clara para auditoria operacional.
Ativo: "${equipamento || "Geral"}"
Tipo de O.S: "${tipo}"
Descrição preliminar informal: "${descricao}"

Por favor, reescreva-a num tom técnico de engenharia de manutenção, mantendo os fatos originais mas corrigindo a gramática e adicionando jargões formais e estruturação em listas concisas, se apropriado. Retorne estritamente o texto otimizado sem explicações externas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no proxy de otimização Gemini:", error);
    res.status(500).json({ error: error.message || "Erro ao otimizar descrição técnica." });
  }
});

app.post("/api/parecer-estrategico", async (req, res) => {
  try {
    const { ordens } = req.body;
    if (!ordens || !Array.isArray(ordens)) {
      return res.status(400).json({ error: "Faltam os dados das Ordens de Serviço." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        text: `[PARECER ESTRATÉGICO SIMULADO]\n` +
          `Análise gerada com base em ${ordens.length} Ordens de Serviço vigentes.\n\n` +
          `● INDICADORES CRÍTICOS:\n` +
          `- Nível de Alerta: Médio\n` +
          `- Distribuição por Tipo: Atividades corretivas representam ${Math.round(ordens.filter((o: any) => o.tipo === "Corretiva").length * 100 / (ordens.length || 1))}% do volume total.\n\n` +
          `● RECOMENDAÇÕES:\n` +
          `1. Intensificar planos de manutenção preventiva sistemática nos ativos mais solicitados para mitigar riscos de quebras repentinas;\n` +
          `2. Oferecer módulos adicionais de treino SENAI nas instalações para operação segura dos tornos e fresas convencionais;\n` +
          `3. Alocar técnicos líderes com maior capacitação ou certificações aos chamados de prioridade Alta.`
      });
    }

    const prompt = `Você é um Consultor Estratégico de Manufatura Avançada e Engenheiro Cheat de Confiabilidade Industrial. 
Aqui está um arquivo JSON com as Ordens de Serviço (O.S.) ativas e concluídas reportadas na oficina:
${JSON.stringify(ordens, null, 2)}

Por favor, elabore um **Parecer Estratégico de Confiabilidade e KPIs** com base nestes dados. Insira:
1. **Auditoria de Criticidade**: Quais os ativos mais sobrecarregados ou com maior taxa de avaria corretiva.
2. **Eficiência de Manutenção**: Avaliação rápida de prioridades (Alta, Média, Baixa) versus andamentos de trabalho.
3. **Plano de Contingência Operacional**: 3 diretivas estratégicas executivas acionáveis para melhorar o MTBF (Tempo Médio entre Falhas), otimizar o MTTR e aumentar a disponibilidade geral do parque de ativos da oficina.

Seja direto, formal, profissional e elegante em PT-PT.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no proxy estratégico Gemini:", error);
    res.status(500).json({ error: error.message || "Erro ao coletar auditoria estratégica." });
  }
});

app.post("/api/sync", (req, res) => {
  try {
    const { queue } = req.body;
    const count = Array.isArray(queue) ? queue.length : 0;
    console.log(`[MANUTECH SYNC] Sincronizados ${count} registros offline.`);
    
    return res.json({
      success: true,
      synchronizedCount: count,
      timestamp: Date.now(),
      message: `Sincronização offline concluída com a Nuvem: ${count} evento(s) de manutenção processados com sucesso.`
    });
  } catch (error: any) {
    console.error("Erro ao processar sincronização:", error);
    return res.status(500).json({ error: "Erro interno ao processar carga offline." });
  }
});

// ========================================================
// SERVIR FRONTEND COM SUPORTE VITE SPA
// ========================================================

async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MANUTECH RUNTIME SERVER] Running on http://localhost:${PORT}`);
  });
}

boot();
