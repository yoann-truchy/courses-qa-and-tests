# Exercice 6 — API Gemini (Google Gen AI SDK) + CI/CD GitLab

Cette API expose :
- `GET /health` → statut
- `POST /generate` → génération de texte via **gemini-2.5-flash-lite**

## Configuration de la clé API
Le SDK Google Gen AI récupère la clé depuis une variable d'environnement.
Recommandé : `GEMINI_API_KEY` (tu peux aussi utiliser `GOOGLE_API_KEY`).

Local (Linux/macOS) :
```bash
export GEMINI_API_KEY="YOUR_KEY"
npm ci
npm start
```

Local (Windows PowerShell) :
```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
npm ci
npm start
```

## Appels
```bash
curl -s http://localhost:3000/health

curl -s -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Donne-moi une phrase courte sur GitLab CI." }'
```

## GitLab CI/CD — Secret CI "Google APIs"
Dans GitLab :
Settings → CI/CD → Variables → Add variable

- Key: `GEMINI_API_KEY`
- Value: ta clé Google AI Studio
- Coche: Masked (et Protected si besoin)
- Description (optionnel): `Google APIs`

La pipeline lance : install → lint → tests → build-image (push registry).

## Docker
```bash
docker build -t courses-qa-and-tests .
docker run --rm -p 3000:3000 -e GEMINI_API_KEY="YOUR_KEY" courses-qa-and-tests
```
