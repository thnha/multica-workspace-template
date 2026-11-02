## Multica workspace template

Hướng dẫn từng bước (tiếng Việt): [docs/HUONG-DAN.md](docs/HUONG-DAN.md).

Template cấu hình workspace Multica (context, skills, agents, squad, properties, labels, projects, autopilot), export từ workspace `lingo-bites`. Dùng để tạo workspace mới có sẵn toàn bộ setup.

Yêu cầu: Node ≥ 18 và `multica` CLI đã `multica login` bằng tài khoản của bạn. Không cần cài thêm package nào.

## Tạo workspace mới từ template

```bash
# 1. Xem trước, không thay đổi gì
node apply.mjs --name "My Project" --slug my-project --prefix MYP --dry-run

# 2. Tạo thật
node apply.mjs --name "My Project" --slug my-project --prefix MYP
```

Workspace mới chưa có runtime nào, nên lần chạy đầu sẽ **dừng trước bước tạo agent** và in ra `workspace-id`. Khi đó:

1. Cho daemon trên máy bạn join workspace mới (`multica setup` hoặc `multica login`, sau đó restart daemon).
2. Kiểm tra: `multica runtime list --workspace-id <id>`
3. Chạy tiếp: `node apply.mjs --workspace-id <id>`

Chạy lại bao nhiêu lần cũng được: thứ gì đã tồn tại (so theo tên) sẽ được dùng lại, không bị tạo trùng.

### Tuỳ chọn

| Flag | Ý nghĩa |
|---|---|
| `--secrets secrets.json` | Điền env/MCP thật cho agent. Copy từ `secrets.example.json`. File này đã nằm trong `.gitignore` |
| `--runtime claude=<runtime-id>` | Chỉ định runtime cho từng provider (dùng được nhiều lần) |
| `--fallback-runtime <runtime-id>` | Runtime cho agent mà workspace mới không có runtime cùng loại |
| `--machine NhaTran-PC` | Ưu tiên runtime của máy có tên chứa chuỗi này |
| `--with-repos` | Thêm repo vào workspace và gắn repo vào project |
| `--activate-autopilots` | Để autopilot chạy luôn (mặc định là paused) |
| `--self` | Chạy bên trong agent Multica: áp dụng vào chính workspace của agent (`$MULTICA_WORKSPACE_ID`) |
| `--dry-run` | Chỉ in lệnh, không thay đổi gì |

Sau khi chạy xong, script in danh sách **việc cần làm tay** và ghi file `apply-report-<workspace-id>.json` (bảng tên → ID mới).

Agent được gán runtime theo provider (`claude`, `opencode`, `codex`, `muse`…). Nếu có nhiều runtime cùng provider, script ưu tiên runtime trùng tên máy gốc, sau đó đến runtime đang online.

Nếu workspace mới **không có runtime cùng provider**, agent vẫn được tạo trên runtime fallback (mặc định là runtime thuộc provider được dùng nhiều nhất trong template, ví dụ Claude) và dùng model mặc định của runtime đó. Script liệt kê các agent này trong phần việc cần làm tay để bạn đổi runtime/model lại. Script chỉ dừng khi workspace chưa có runtime nào.

## Nhờ agent setup (trong chính workspace mới)

1. Tự tạo workspace trên UI, cho daemon join (`multica daemon restart`).
2. Tạo 1 agent Claude tên **`Setup Agent`** (tên không trùng agent nào trong template).
3. Chat với agent: `setup workspace theo template https://github.com/thnha/multica-workspace-template`

Agent làm theo mục [Agent runbook](#agent-runbook-set-up-this-workspace-from-the-template) bên dưới: chạy `node apply.mjs --self --dry-run`, chờ bạn xác nhận, chạy thật, rồi báo `Result` (PASS / PARTIAL / BLOCKED). Bước nào bị từ chối quyền (token agent) được ghi vào `denied` trong report, kèm hướng xử lý.

### Agent runbook: set up this workspace from the template

Audience: a Multica agent running **inside the target workspace** whose requester asked something like
"setup workspace theo template https://github.com/thnha/multica-workspace-template".
The requester has already created the workspace, connected a daemon, and created you as its first agent.

Write every message to the requester in Vietnamese. Keep commands, IDs and file names as they are.

#### Known limits (check them, report them)

- **L1 Guard scope.** `apply.mjs` refuses real runs inside an agent task unless the target is the task's own
  workspace (`--self`, which uses `$MULTICA_WORKSPACE_ID`). The `probe` check (reads must return objects of the
  target workspace) still runs as a second guard. If either guard stops the run (exit code 3), do not work
  around it: report it.
- **L2 Token permissions are unverified.** An agent token may lack the scope to create skills, agents, squads,
  autopilots, properties or to update the workspace context. Reading agent env (`multica agent env get`) is known
  to be denied. `apply.mjs` records each denied call in `denied` of `apply-report-<workspace-id>.json`, skips
  it, continues, and exits with code 4.

#### Steps

1. Check prerequisites: `node -v` (≥ 18), `git --version`, `echo $MULTICA_WORKSPACE_ID` is set,
   `multica runtime list --output json` returns at least one runtime.
2. Fetch the template into your working directory:
   `git clone https://github.com/thnha/multica-workspace-template.git tpl && cd tpl`
3. Dry run: `node apply.mjs --self --dry-run`. Summarise for the requester what would be created
   (counts of skills, agents, squads, projects, autopilots) and which existing items are reused by name.
4. Ask the requester to confirm. Do not run for real without an explicit confirmation in the chat.
5. Real run: `node apply.mjs --self` (add `--with-repos` / `--activate-autopilots` only if the requester asked).
6. Read `apply-report-<workspace-id>.json` (`todo`, `warnings`, `denied`).
7. Agents are matched by name. If your own name matches a template agent (see `template/agents/*/agent.json`),
   you were reused and your instructions and skills were not overwritten: tell the requester. Fix: the requester
   renames you in the UI to a name not in the template (for example `Setup Agent`), then re-run `--self`.
8. Re-running is safe: anything that already exists by name is reused.

#### Report to the requester

Always send one report with these fields:

- `Result`: PASS (exit 0), PARTIAL (exit 4, some calls denied) or BLOCKED (exit 2/3 or another error).
- `Key points`: what was created; what was reused.
- `Not verified` / failures, mapped to L1 / L2:
  - **L1 hit (exit 3)** → propose: the requester runs `node apply.mjs --workspace-id <id>` from their own
    terminal (logged in with `multica login` as a workspace member). Give the exact command.
  - **L2 hit (exit 4)** → list the denied command types and counts from `denied`. Propose, in order:
    A. the requester re-runs `node apply.mjs --workspace-id <id>` from their own terminal; it only creates what is
       still missing; B. ask a workspace owner/admin to grant the needed permission, then re-run `--self`;
       C. create the few missing items by hand in the UI (only if the list is short).
  - **exit 2 (no runtime)** → ask the requester to connect a daemon (`multica daemon restart`, then
    `multica runtime list`) and re-run.
- `Needed from you`: the report's `todo` list (env/MCP secrets, avatars, paused autopilots, repos, invites).
- `Next`: the exact command for the next step, if any.

Never paste secret values into a comment, and never try another account's token or credentials to get past L1/L2.

## Cập nhật template khi config thật thay đổi

```bash
node export.mjs                      # export từ workspace mặc định của CLI
node export.mjs --workspace-id <id>  # hoặc chỉ định workspace
git diff && git add -A && git commit -m "Update template" && git push
```

ID nằm trong text (instructions, prompt, context) được đổi thành placeholder khi export và resolve lại khi apply:
`{{@agent:Tên}}`, `{{@squad:Tên}}`, `{{@project:Tên}}`, `{{@skill:tên}}`, `{{@member:email}}`, `{{@workspace}}`. Khi sửa tay trong `template/`, dùng đúng các placeholder này, đừng dán ID thật vào.

## Cấu trúc

```
template/
  workspace.json          # name, description, issue prefix, repos, member email→user id
  context.md              # workspace context
  labels.json, properties.json, projects.json
  skills/<tên>/           # skill.json, SKILL.md, files/…
  agents/<tên>/           # agent.json, instructions.md
  squads/<tên>/           # squad.json (leader, members, role), instructions.md
  autopilots/<tên>/       # autopilot.json (triggers), prompt.md
  export-warnings.json
secrets.example.json      # khung env/MCP, không chứa giá trị thật
```

## Không nằm trong template (cần làm tay)

- **Secret**: `custom_env` và `mcp_config` của agent, MCP server của workspace, secret của webhook trigger. Điền qua `--secrets` hoặc trên UI.
- **Runtime**: runtime gắn với từng máy, nên daemon phải join workspace mới.
- **Avatar agent**: CLI không set được avatar emoji. Script in danh sách để bạn đặt lại trên UI.
- **Disabled runtime skills**: đây là tuỳ chọn bật/tắt skill theo từng máy.
- **Member, issue, comment**: không chép. Nếu text có nhắc đến ai chưa là member, script sẽ nhắc bạn mời người đó.

## Lưu ý

- Bên trong agent Multica, `apply.mjs` chỉ chạy thật với `--self` (workspace đích = workspace của agent). Token của agent chỉ có quyền trong workspace của task đó, nên với workspace khác nó sẽ bỏ qua `--workspace-id` và ghi nhầm. Script tự chặn trường hợp này; lớp kiểm tra `probe` vẫn chạy thêm.
- Chưa kiểm chứng token agent có đủ quyền tạo skill, agent, squad, autopilot, property và sửa context. Lệnh bị từ chối quyền được bỏ qua, ghi vào `denied` trong report, script thoát mã 4. Khi đó chạy lại `node apply.mjs --workspace-id <id>` từ terminal của bạn để tạo nốt phần thiếu.
- Trên Windows, một dòng lệnh dài tối đa khoảng 32K ký tự. Instructions dài nhất hiện khoảng 20K, và script sẽ cảnh báo nếu vượt 30K.
