import http from "k6/http";
import { sleep, check } from "k6";

// Configuracao do teste
// vus = usuarios virtuais simultaneos
// duration = quanto tempo o teste roda
export const options = {
  stages: [
    { duration: "30s", target: 10 },  // sobe para 10 usuarios em 30 segundos
    { duration: "1m", target: 10 },   // mantem 10 usuarios por 1 minuto
    { duration: "30s", target: 50 },  // sobe para 50 usuarios em 30 segundos
    { duration: "1m", target: 50 },   // mantem 50 usuarios por 1 minuto
    { duration: "30s", target: 0 },   // desce para 0
  ],
  thresholds: {
    // 95% das requisicoes precisam responder em menos de 2 segundos
    http_req_duration: ["p(95)<2000"],
    // menos de 1% das requisicoes podem falhar
    http_req_failed: ["rate<0.01"],
  },
};

// URL base — usa o site na Vercel, nao o localhost
const BASE_URL = "https://use-dlua.vercel.app";

export default function () {
  // Simula um usuario navegando pelo site

  // 1. Abre a home
  const home = http.get(BASE_URL);
  check(home, {
    "home carregou": (r) => r.status === 200,
  });
  sleep(1);

  // 2. Abre a pagina de blusas
const pijamas = http.get(`${BASE_URL}/categoria/pijamas`);
check(pijamas, {
  "pijamas carregou": (r) => r.status === 200,
});
sleep(1);

const calcinhas = http.get(`${BASE_URL}/categoria/calcinhas`);
check(calcinhas, {
  "calcinhas carregou": (r) => r.status === 200,
});
  sleep(1);

  // 3. Abre a pagina de rastreamento
  const tracking = http.get(`${BASE_URL}/rastreamento`);
  check(tracking, {
    "rastreamento carregou": (r) => r.status === 200,
  });
  sleep(2);
}