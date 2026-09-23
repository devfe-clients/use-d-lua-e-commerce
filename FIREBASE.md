# Firebase — Use D'lua

O backend já está estruturado. Basta preencher as chaves e criar as coleções.

## 1. Chaves

Copie `.env.example` para `.env` e preencha com os dados do seu projeto
(Console Firebase → Configurações do projeto → Seus apps → Web):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Enquanto estiverem vazias, a loja funciona com o catálogo de demonstração
(`src/lib/sample-data.ts`) e o login fica desativado.

## 2. Serviços a ativar no Console

- **Authentication** → método "E-mail/senha".
- **Firestore Database** → modo de produção.
- **Storage** (opcional) → para hospedar as fotos dos produtos.

## 3. Coleções do Firestore

### `products`
```json
{
  "name": "Blusa de Seda Lua",
  "slug": "blusa-de-seda-lua",
  "category": "blusas | calcas | corset",
  "description": "Texto descritivo da peça",
  "price": 289.9,
  "salePrice": 239.9,
  "images": ["https://.../foto1.jpg", "https://.../foto2.jpg"],
  "sizes": ["PP", "P", "M", "G"],
  "colors": ["Off White", "Dourado"],
  "variants": [{ "size": "P", "color": "Off White", "stock": 3 }],
  "stock": 12,
  "featured": true,
  "bestSeller": true,
  "createdAt": "2026-09-10T12:00:00.000Z"
}
```
O aviso "Últimas unidades!" aparece quando `stock` for menor que 5
(`LOW_STOCK_THRESHOLD` em `src/lib/types.ts`).

### `coupons` (id do documento = código em MAIÚSCULAS, ex. `DLUA10`)
```json
{ "code": "DLUA10", "type": "percent | fixed", "value": 10, "minSubtotal": 300 }
```

### `orders`
```json
{
  "userId": "uid ou null",
  "items": [{ "productId": "", "name": "", "price": 0, "size": "", "color": "", "quantity": 1 }],
  "subtotal": 0, "discount": 0, "total": 0,
  "couponCode": null,
  "status": "pending | paid | shipped | cancelled",
  "createdAt": "ISO date"
}
```

### `users` (id do documento = uid do Authentication)
```json
{ "name": "", "email": "", "createdAt": "ISO date" }
```

## 4. Regras de segurança sugeridas

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} { allow read: if true; allow write: if false; }
    match /coupons/{id}  { allow read: if true; allow write: if false; }
    match /users/{uid}   { allow read, write: if request.auth.uid == uid; }
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read:   if request.auth != null && resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

## 5. Onde está cada coisa no código

| Arquivo | Função |
| --- | --- |
| `src/lib/firebase.ts` | Inicialização e nomes das coleções |
| `src/lib/catalog.ts` | Produtos, filtros, ordenação e cupons |
| `src/lib/orders.ts` | Criação de pedidos e baixa de estoque |
| `src/lib/auth.tsx` | Login, cadastro e sessão |
| `src/lib/cart.tsx` | Carrinho (salvo no navegador) |

## 6. Imagens

Todos os espaços de foto estão vazios de propósito. Para preencher:
- **produtos**: campo `images` de cada documento;
- **banner e categorias da home**: `src/routes/index.tsx` (trocar `src={undefined}`
  pela URL da imagem).
