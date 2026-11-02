---
name: deep-clarify-protocol
description: Protocol for issues whose Mode is "Deep Clarify" - surface every open point to the requester, discuss in chat until nothing is left, then post one Clarification Record that becomes the scope baseline.
---

# Deep Clarify Protocol

Use this skill when the issue's `Mode` property is "Deep Clarify", or when the
requester opens a chat with you about such an issue. Goal: the requester sees
every decision, assumption and cost driver BEFORE any spec, design or code
exists, so scope never grows without their knowledge.

Phases:
1. Brief (issue run): post one Clarify Brief on the issue, stop with
   `Decision needed: YES`.
2. Discussion (chat): the requester opens a chat with Feature Analyst and
   discusses the Brief for as many rounds as needed.
3. Record (chat run): when the requester confirms nothing is left to clarify,
   post one Clarification Record on the issue. That comment hands the issue
   back to the Feature Orchestrator and the flow continues without a further
   requester comment.

Read-only throughout: no spec revision, design, code, branches or sub-issues.

## Rules that override the default clarification format

- No 3-question cap. List every open point, grouped by impact
  (Cao / Trung bình / Thấp). Nothing that affects scope, cost, data or another
  team may stay implicit.
- Ask context facts first; they usually decide most of the size. At minimum:
  released app / real users?, data that must be preserved?, affected parties
  (App, Server, DB, Web Admin, other), hard non-goals, priority speed vs
  safety, cost or time constraints. Skip a fact only if the issue already
  answers it, and cite where.
- Default ★ = the SMALLEST option that still meets the stated goal. Larger or
  safer options are listed with their cost, never chosen silently.
- Every option shows its cost: added requirements (approximate FR count),
  affected repos/surfaces, added workstreams, and risk.
- Tag every scope item by origin:
  - `[REQ]` the requester asked for it (quote or link the source);
  - `[DER]` strictly required for a `[REQ]` item to work (say why);
  - `[PROP]` your proposal. `[PROP]` items are OUT of scope by default and
    become in scope only if the requester accepts them explicitly.
- Never turn an assumption into a requirement. Each assumption is listed and
  needs confirmation.
- Evidence (file:line, SHAs) goes in an attachment or a collapsed appendix,
  not in the main body.
- Human-facing text is Vietnamese; IDs, tokens and labels stay English.
- Discussion rounds do not count toward `Max rounds`.

## Clarify Brief (issue comment, attach the full file if long)

```
**[DEEP CLARIFY] Brief — Decision needed: YES**
- Tóm tắt (≤10 dòng): hiểu yêu cầu thế nào; làm gì; không làm gì; độ lớn ★.
- Dữ kiện nền cần bạn xác nhận: F1, F2, … (câu hỏi + vì sao ảnh hưởng độ lớn)
- Bản đồ ảnh hưởng: bên/repo/module bị đụng, kèm bằng chứng (link phụ lục)
- Quyết định cần chốt (nhóm theo Cao / Trung bình / Thấp):
  - DQ-001 <câu hỏi> — ★A. <nhỏ nhất đủ mục tiêu> (chi phí) · B. … (chi phí)
- Giả định cần xác nhận: A-001, …
- Đề xuất của agent [PROP] (mặc định KHÔNG làm): P-001, …
- Độ lớn: ★ = S/M/L/XL, ~N FR, N repo, N workstream · Tối đa = …
- Rủi ro: R-001, …
- Next: mở chat với **Feature Analyst** (https://multica.heroafksummoneridle.io.vn/lingo-bites/agents/{{@agent:Feature Analyst}})
  và chọn gợi ý "Deep Clarify: làm rõ issue đang chờ tôi".
  Khi bạn nói "chốt" trong chat, tôi đăng Clarification Record và flow chạy tiếp.
```

## Leader check of the Brief (Feature Orchestrator)

The Brief's `Next` line already tells the requester what to do. Check the
Brief against the template above without commenting: when it passes, post
nothing and record no_action ("Brief OK, requester chat pending"). When it has
gaps, reply once to Feature Analyst under the Brief, listing only the gaps. Never
restate the Brief or repeat its `Next` step to the requester.

## Discussion in chat

- First action in a chat about an issue: read the issue, its comments
  (`multica issue comment list <id> --output json`) and the Brief. Never rely
  on memory of earlier chats.
- Keep a running list of open points; after each answer, show what is now
  decided and what is still open.
- New facts may create new questions; ask them. Never repeat answered ones.
- Decisions made in chat are NOT effective until they are in the Record.
- Before posting the Record, show the requester the full Record draft in chat
  and get an explicit confirmation ("chốt", "ok", or equivalent). Do not post
  on an implied or partial confirmation.
- The requester must also choose the next mode: Plan + Implement · Plan only ·
  Stop here.

## Clarification Record (one comment on the issue, posted from chat)

Post with `--content-file` as a top-level comment and mention the leader
`[@Feature Orchestrator](mention://agent/{{@agent:Feature Orchestrator}})`
so the flow continues.

```
**[CLARIFICATION RECORD] Decision needed: NO**
Confirmed by: <requester name> in chat on <YYYY-MM-DD>.
- Mục tiêu: …
- Dữ kiện: F1 …, F2 …
- Quyết định: DQ-001 = B (requester) · DQ-002 = ★A (default accepted) · …
- Phạm vi làm: … [REQ]/[DER] (each item linked to a decision)
- Không làm: … (including every rejected [PROP])
- Đề xuất được chấp nhận: P-00x …
- Độ lớn chốt (baseline): S/M/L/XL, ~N FR, repos …, ~N workstream
- Follow-up tách riêng: …
- Open items: none
- Next mode: Plan + Implement | Plan only | Stop here
```

The Record is the scope baseline for every later stage:
- every later requirement must trace to a Record decision or be `[DER]`;
- anything else is a new `[PROP]`; and a size above the baseline (new repo or
  surface, or ~30% more FR) means: stop with `Decision needed: YES` and ask
  the requester before writing it into a spec.
