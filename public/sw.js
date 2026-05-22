/**
 * Service Worker - Manutech Gestão de Ativos Offline
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = "manutech-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css"
];

// Instalação do Service Worker e caching de recursos essenciais
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        // Ignora erros normais em desv se alguns caminhos do devserver não estiverem disponíveis imediatamente
        console.log("Aviso: Falha ao pré-carregar recursos de cache do Service Worker.");
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições (Network-first falling back to Cache para API ou recursos)
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Se for uma chamada de diagnóstico da API, preferimos sempre rede instantânea
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Fallback offline express para chamadas de API
        if (url.pathname === "/api/diagnostico") {
          return new Response(
            JSON.stringify({
              text: "⚠️ [MODO OFFLINE ATIVO - DIAGNÓSTICO LOCAL]\n\n" +
                "Atualmente, seu terminal está operando offline sem conexão com o servidor de IA. \n\n" +
                "Instrução Provisória:\n" +
                "1. Realize LOTO (Lockout/Tagout) mecânico do motor antes de remover proteções;\n" +
                "2. Inspeccione se existe folga em acoplamentos e rolamentos térmicos;\n" +
                "3. Use óculos contra voo de cavacos e avental reforçado."
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
        if (url.pathname === "/api/sync") {
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              message: "Armazenado na fila LocalStorage para sincronização futura."
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify({ error: "Conexão de rede indisponível." }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Comportamento normal para páginas / assets estáticos do Vite
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Atualiza dinamicamente o cache com a última versão servida
        if (res.status === 200 && e.request.method === "GET") {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(() => {
        // Se falhar, busca no cache local offline
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback para index estático em caso de navegações SPA
          if (e.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
