import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },  // sobe agressivo para 100 usuarios
    { duration: "5m", target: 100 },  // mantem 100 por 5 minutos
    { duration: "2m", target: 200 },  // tenta 200 — ponto de ruptura
    { duration: "5m", target: 200 },
    { duration: "2m", target: 0 },
  ],
};

const BASE_URL = "https://use-dlua.vercel.app";

export default function () {
  const res = http.get(BASE_URL);
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}