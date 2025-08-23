# GitHub Project Setup — Forzani Tickets — Roadmap & Backlog

Este documento describe la configuración propuesta del Project (Projects Beta) para gestionar roadmap y backlog.

## Columns (Estados)

- Backlog
- Prioridad: CRITICAL
- Prioridad: HIGH
- En progreso
- En review
- QA
- Blocked
- Done

## Views

- Kanban (groupBy: status)
- Roadmap (timeline por milestone/labels `milestone:X`)
- By Assignee (agrupado por responsable)
- By Priority (agrupado por labels de prioridad)

## Automatizaciones

- Issue con label `CRITICAL` → mover a `Prioridad: CRITICAL`
- Issue con label `HIGH` → mover a `Prioridad: HIGH`
- PR que referencia un issue → mover el issue a `En review`
- Issue cerrado → `Done`

## Milestones

- Milestone 1: MVP autenticación, tickets básicos
- Milestone 2: Dashboard y métricas
- Milestone 3: Adjuntos, comentarios y permisos avanzados
- Milestone 4: Hardening, QA y release

## Labels

`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `type:bug`, `type:feature`, `type:chore`, `area:api`, `area:web`, `area:infra`, `a11y`, `tests`, `security`, `blocked`.

## Seeds de issues

Ver `infra/github-projects-setup.json` → `issuesSeed`.

## Cómo crear el Project (gh CLI)

Prerequisitos: `gh` autenticado, `jq` instalado.

Variables requeridas:

- `GITHUB_REPO=owner/repo`

Comandos:

```bash
chmod +x infra/create-project.sh
GITHUB_REPO=owner/repo ./infra/create-project.sh
```

Si no tienes permisos para crear Projects Beta:

- Usa `infra/github-projects-setup.json` para recrear columnas, labels y issues manualmente.
- Alternativa: crear el Project en la UI (repo scope), luego correr solo la sección de labels/milestones/issues del script.

## Mapeo issues → columnas → milestones

- Auth: login/refresh → Prioridad: HIGH, milestone:1
- Tickets CRUD → Prioridad: HIGH, milestone:1
- Dashboard métricas → Backlog, milestone:2
- CI: lint/build/test → En progreso, milestone:1

## Notas

- Las vistas avanzadas y automatizaciones de Projects Beta pueden requerir ajustes en la UI.
- Para mover tarjetas automáticamente por PRs vinculados, asegúrate de referenciar issues con `Closes #N` en el cuerpo del PR.
