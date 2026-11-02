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

Agent làm theo [docs/AGENT-SETUP.md](docs/AGENT-SETUP.md): chạy `node apply.mjs --self --dry-run`, chờ bạn xác nhận, chạy thật, rồi báo `Result` (PASS / PARTIAL / BLOCKED). Bước nào bị từ chối quyền (token agent) được ghi vào `denied` trong report, kèm hướng xử lý.

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
