![Ícone do TimeBridge](public/icons/timebridge-192.png)

# TimeBridge

[![Leia em inglês (en-US)](https://img.shields.io/badge/Language-English%20%28US%29-0B5FFF?style=for-the-badge)](README.md)

O TimeBridge é um comparador de fusos horários e planejador de reuniões para equipes distribuídas. Veja que horas são em diferentes cidades, converta uma data e um horário e encontre um momento em que todos estejam disponíveis.

Vai marcar uma reunião com pessoas em São Paulo, Nova York e Londres? Escolha São Paulo como referência, ajuste a jornada de trabalho de cada cidade e encontre um horário em comum na linha do tempo. Insira o horário de início da reunião no conversor e compartilhe o link para que cada pessoa veja a hora local.

## Recursos

- **Relógios mundiais e conversão de horários.** Compare de 2 a 5 cidades em tempo real ou escolha uma data e um horário. O conversor usa o deslocamento UTC de cada cidade naquela data e trata horários que deixam de existir ou ocorrem duas vezes nas transições de horário de verão.
- **Planejador de reuniões.** Defina a jornada de trabalho de cada cidade, veja na linha do tempo quando elas coincidem e encontre horários para reuniões de 30 ou 60 minutos.
- **Compartilhamento.** Copie os horários locais como texto ou compartilhe um link que restaura as cidades, a cidade de referência, o horário selecionado, as jornadas e a duração da reunião.
- **Preferências e idiomas.** Salve cidades favoritas, configurações da comparação e o formato de 12 ou 24 horas no navegador. A interface está disponível em inglês, português do Brasil e chinês simplificado.
- **Aplicativo web instalável.** Em navegadores compatíveis, instale o TimeBridge como aplicativo web progressivo (PWA) e use-o offline depois que a versão de produção terminar de armazenar os recursos em cache durante uma visita online.

## Como rodar localmente

Você precisa do **Node.js 20.9 ou superior** e do **Yarn Classic 1.22.22**.

```bash
git clone https://github.com/LessaApolinario/timebridge.git
cd timebridge
yarn install --frozen-lockfile
yarn dev
```

Abra o [TimeBridge em português](http://localhost:3000/pt-BR).

Você pode definir `SITE_URL=http://localhost:3000` em `.env.local` para desenvolvimento local. Ao publicar o app, defina `SITE_URL` com a origem pública antes de gerar o build para que os metadados e o sitemap usem o endereço correto. Consulte o [`.env.example`](.env.example).

| Comando | O que faz |
| --- | --- |
| `yarn lint` | Executa o ESLint. |
| `yarn test` | Executa a suíte de testes do Jest. |
| `yarn build` | Gera o build de produção. |
| `yarn start` | Inicia o servidor de produção após o build. |

Para experimentar o modo offline localmente, execute `yarn build` seguido de `yarn start` e abra o app em localhost enquanto estiver online para que o service worker armazene os recursos em cache.

## Tecnologias

Next.js (App Router), React, TypeScript e Tailwind CSS. A interface usa next-intl para internacionalização, e os cálculos de fuso horário usam `Intl.DateTimeFormat`. Os testes usam Jest e Testing Library.
