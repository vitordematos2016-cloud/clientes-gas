1. Sempre me entregue as respostas em português do Brasil.
2. Sempre que você gerar um app, ou fizer uma modificação em algum, me entregue um link clicável, para eu conseguir visualizar esse app com 1 clique.

---

# Constituição do Projeto (Protocolo V.L.A.E.G.)

## 1. Esquemas de Dados (Data Schemas)
- **Formato de Entrada Bruta (Input - Formulário):**
  ```json
  {
    "nome": "string (Obrigatório)",
    "telefone": "string (Opcional)",
    "endereco": "string (Obrigatório)",
    "numero": "string (Obrigatório)",
    "bairro": "string (Obrigatório)",
    "cidade": "string (Obrigatório)",
    "estado": "string (Obrigatório)",
    "referencia": "string (Opcional)",
    "locationLink": "string (Opcional, Google Maps URL)",
    "itens": [
      { "tipo": "gas" | "agua", "quantidade": "number" }
    ],
    "pagamento": {
      "metodo": "pix" | "dinheiro" | "cartao",
      "precisaTroco": "boolean",
      "trocoPara": "string (Opcional)"
    },
    "observacao": "string (Opcional)"
  }
  ```
- **Formato de Saída (Payload de Entrega):**
  URL do WhatsApp (`https://wa.me/5545999571858?text=...`) com a mensagem devidamente formatada em texto.

## 2. Regras Comportamentais
- O sistema não deve adivinhar a lógica de negócios; se houver erro, analisar o trace e corrigir a ferramenta.
- Nenhuma Ferramenta (`tools/`) pode ser desenvolvida antes que a estrutura de Dados e o Payload sejam confirmados.
- [Novas regras a partir da Fase 1]

## 3. Invariantes Arquiteturais
- **Camada 1 (Arquitetura):** POPs em `.md` dentro de `architecture/` orientam o "Como Fazer".
- **Camada 2 (Navegação):** Uso do modelo probabilístico para tomar decisões e acionar Ferramentas.
- **Camada 3 (Ferramentas):** Scripts Python atômicos, determinísticos, salvos em `tools/`. Variáveis globais/segredos em `.env`.
- Todos os arquivos intermediários vão para `.tmp/`.
- Mudanças lógicas exigem a atualização do POP em `architecture/` primeiro.