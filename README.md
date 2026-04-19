# GENII RAG — M&A Knowledge Assistant

Ein internes RAG (Retrieval-Augmented Generation) System für GENII, das Fragen zum M&A Framework, Akquisitionskriterien und internen Wissensdokumenten beantwortet.

## Was ist das?

Dieses Tool erlaubt es GENII Mitarbeitern, Fragen in natürlicher Sprache an das interne Wissenssystem zu stellen. Claude (Anthropic) beantwortet die Fragen ausschließlich basierend auf den hochgeladenen Dokumenten – keine Halluzinationen, keine erfundenen Antworten.

**Live URL:** https://genii-rag-ui.vercel.app

---

## Architektur
User stellt Frage
↓
OpenAI text-embedding-3-small → Frage wird zu Vektor
↓
Supabase pgvector → findet die 8 ähnlichsten Chunks
↓
Claude Sonnet → liest Chunks, formuliert Antwort
↓
Antwort + Quellen werden angezeigt

**Tech Stack:**
- **Frontend:** Next.js + Tailwind CSS → deployed auf Vercel
- **Backend:** Next.js API Routes (serverless)
- **Datenbank:** Supabase (PostgreSQL + pgvector)
- **Embeddings:** OpenAI text-embedding-3-small
- **Chat Modell:** Anthropic Claude Sonnet

---

## Projektstruktur
genii-rag-ui/          ← Next.js Web App (dieses Repo)
app/
page.tsx           ← Chat Interface
api/chat/
route.ts         ← API Route (RAG Logik)
.env.local           ← API Keys (nie in Git!)
genii-rag/             ← Python Scripts (lokal, nicht deployed)
ingest.py            ← Dokumente einlesen + in Supabase speichern
query.py             ← Fragen stellen via Terminal
.env                 ← API Keys (nie in Git!)

---

## Neue Dokumente hinzufügen

1. Dokument als `.docx` vorbereiten
2. In den `genii-rag` Ordner legen
3. In `ingest.py` den Dateipfad anpassen
4. Ausführen:

```bash
cd ~/genii-rag
source venv/bin/activate
python ingest.py
```

Das Dokument wird automatisch in Chunks aufgeteilt, vektorisiert und in Supabase gespeichert. Die Web App nutzt es sofort ohne Neustart.

---

## Environment Variables

Werden in Vercel unter Project Settings → Environment Variables gesetzt:

| Variable | Beschreibung |
|---|---|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase anon public Key |
| `OPENAI_API_KEY` | OpenAI API Key (für Embeddings) |
| `ANTHROPIC_API_KEY` | Anthropic API Key (für Claude) |
| `ADMIN_PASSWORD` | Passwort für den Login Screen |

---

## Lokale Entwicklung

```bash
cd ~/genii-rag-ui
npm install
npm run dev
```

Dann `http://localhost:3000` im Browser öffnen.

---

## Deployment

Push auf `main` → Vercel deployed automatisch.

```bash
git add .
git commit -m "deine änderung"
git push
```

---

## Wissensbasis erweitern

Aktuell enthält die Datenbank:
- `GENII_Target_Framework_v4.1.docx` — Akquisitionsframework, Scoring, Disqualifikatoren

Geplant:
- Software Verticals Dokument
- Portfolio Übersicht
- Weitere interne Research Dokumente