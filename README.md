![TimeBridge icon](public/icons/timebridge-192.png)

# TimeBridge

[![Read in Brazilian Portuguese (pt-BR)](https://img.shields.io/badge/Idioma-Portugu%C3%AAs%20do%20Brasil-0B5FFF?style=for-the-badge)](README.pt-BR.md)

TimeBridge is a time zone comparison and meeting planner for distributed teams. See what time it is in different cities, convert a date and time, and find when everyone is available.

Planning a call with people in São Paulo, New York, and London? Choose São Paulo as the reference city, set the working hours for each city, and find an overlap on the availability timeline. Enter the meeting's start time in the converter, then share the link so everyone can see it in their local time.

## Features

- **World clocks and time conversion.** Compare 2 to 5 cities in real time or choose a date and time. The converter uses each city's UTC offset for that date and handles skipped or repeated local times during daylight saving transitions.
- **Meeting planner.** Set working hours for each city, see where they overlap on a timeline, and find slots for 30- or 60-minute meetings.
- **Sharing.** Copy the local times as text or share a link that restores the cities, reference city, selected time, working hours, and meeting duration.
- **Preferences and languages.** Save favorite cities, comparison settings, and the 12- or 24-hour clock format in your browser. The interface is available in English, Brazilian Portuguese, and Simplified Chinese.
- **Installable web app.** In supported browsers, install TimeBridge as a progressive web app (PWA) and use it offline once the production app has finished caching during an online visit.

## Run locally

You'll need **Node.js 20.9 or later** and **Yarn Classic 1.22.22**.

```bash
git clone https://github.com/LessaApolinario/timebridge.git
cd timebridge
yarn install --frozen-lockfile
yarn dev
```

Open [TimeBridge in English](http://localhost:3000/en-US).

You can set `SITE_URL=http://localhost:3000` in `.env.local` for local development. For deployment, set `SITE_URL` to the public origin before building so that metadata and the sitemap use the correct address. See [`.env.example`](.env.example).

| Command | What it does |
| --- | --- |
| `yarn lint` | Runs ESLint. |
| `yarn test` | Runs the Jest test suite. |
| `yarn build` | Creates a production build. |
| `yarn start` | Starts the production server after the build. |

To try the offline experience locally, run `yarn build` followed by `yarn start` and open the app on localhost while online to let the service worker cache its resources.

## Technology

Next.js (App Router), React, TypeScript, and Tailwind CSS. The interface uses next-intl for localization, and time zone calculations use `Intl.DateTimeFormat`. Tests use Jest and Testing Library.
