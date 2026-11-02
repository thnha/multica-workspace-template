## Hướng dẫn: clone workspace và cập nhật template Multica

Repo `thnha/multica-workspace-template` chứa bản chụp cấu hình của workspace `lingo-bites`: context, skills, agents, squad, properties, labels, projects và autopilot. Tài liệu này hướng dẫn hai việc:

- **Phần A:** tạo một workspace mới giống `lingo-bites`.
- **Phần B:** cập nhật template sau khi bạn sửa `lingo-bites`.
- **Phần C:** nhờ agent trong workspace mới setup theo template.

> Chạy mọi lệnh trong tài liệu này từ **terminal của bạn** (PowerShell, Git Bash hoặc Terminal trên Mac), **không chạy bên trong một agent Multica**. Token của agent chỉ có quyền trong workspace của task đó, nên nó không ghi được vào workspace khác. Script sẽ tự dừng nếu phát hiện trường hợp này.

---

## Chuẩn bị (làm một lần)

1. **Node.js ≥ 18.** Kiểm tra bằng `node -v`.
2. **Multica CLI đã đăng nhập:**
   ```bash
   multica auth status        # xem đang đăng nhập bằng tài khoản nào
   multica login              # nếu chưa đăng nhập
   ```
3. **Clone repo template:**
   ```bash
   git clone git@github.com:thnha/multica-workspace-template.git
   cd multica-workspace-template
   ```
   Nếu đã clone từ trước, chỉ cần `git pull` để lấy bản mới nhất.

---

## Phần A: Tạo workspace mới từ template

### A1. Chọn tên, slug và prefix

| | Ví dụ | Ghi chú |
|---|---|---|
| Tên | `LingoBites 2` | Đổi được sau này |
| Slug | `lingo-bites-2` | **Không đổi được** sau khi tạo. Chỉ gồm chữ thường, số và dấu `-` |
| Issue prefix | `LB2` | Tiền tố của mã issue, ví dụ `LB2-12` |

### A2. Xem trước (không thay đổi gì)

```bash
node apply.mjs --name "LingoBites 2" --slug lingo-bites-2 --prefix LB2 --dry-run
```

Script in ra các lệnh sẽ chạy. Kiểm tra lại rồi sang bước A3.

### A3. Tạo workspace

```bash
node apply.mjs --name "LingoBites 2" --slug lingo-bites-2 --prefix LB2
```

Script tạo workspace rồi chép lần lượt context, labels, properties và 61 skills. **Ghi lại `workspace-id`** mà script in ra.

Workspace mới chưa có runtime nào, nên script sẽ **dừng trước bước tạo agent** với thông báo:

```
Stopped before agents: workspace <id> has no runtime at all
```

Đây là hành vi bình thường. Làm tiếp bước A4.

### A4. Cho máy của bạn phục vụ workspace mới

Trên máy chạy agent (ví dụ NhaTran-PC):

```bash
multica daemon restart
multica runtime list --workspace-id <workspace-id>
```

Khi danh sách hiện ít nhất một runtime (Claude, Codex, Opencode…) là được. Nếu vẫn trống, chạy `multica setup` rồi restart daemon lần nữa.

### A5. Chạy tiếp để tạo agents, squad, projects và autopilot

```bash
node apply.mjs --workspace-id <workspace-id> --machine NhaTran-PC
```

- `--machine NhaTran-PC`: ưu tiên runtime của máy này. Có thể bỏ.
- Những gì đã tạo ở A3 được giữ nguyên, không bị tạo trùng.
- Nếu workspace mới **không có runtime cùng loại** với template (ví dụ template dùng Muse nhưng máy chỉ có Claude), agent vẫn được tạo trên runtime Claude với model mặc định. Bạn đặt lại runtime/model sau (xem A6).

Tuỳ chọn hay dùng:

| Flag | Khi nào dùng |
|---|---|
| `--with-repos` | Muốn thêm luôn repo GitHub vào workspace và project |
| `--activate-autopilots` | Muốn autopilot chạy ngay (mặc định là tạm dừng) |
| `--fallback-runtime <runtime-id>` | Chọn runtime cho các agent không tìm được runtime cùng loại |
| `--runtime muse=<runtime-id>` | Ép một loại runtime vào một runtime cụ thể |
| `--secrets secrets.json` | Điền sẵn env/MCP (xem A7) |

### A6. Làm các việc còn lại bằng tay

Cuối lần chạy, script in mục **"Manual follow-ups"** và ghi file `apply-report-<workspace-id>.json`. Các việc thường gặp:

- [ ] **Env var của agent** (ví dụ `GITHUB_TOKEN` của Feature Orchestrator): vào *Agent → Settings → Environment*, hoặc dùng `--secrets` (A7).
- [ ] **Runtime/model** của những agent bị đặt vào runtime fallback: vào *Agent → Settings* để chọn lại.
- [ ] **Avatar** của agent: CLI không đặt được, script có in lại emoji gốc để bạn chọn trên UI.
- [ ] **Repo:** nếu không chạy với `--with-repos`, thêm bằng `multica repo add <url> --workspace-id <id>`.
- [ ] **Bật autopilot** khi đã sẵn sàng:
  `multica autopilot update <autopilot-id> --status active --workspace-id <id>`
- [ ] **Mời thành viên:** `multica workspace member invite <email> --workspace-id <id>`
- [ ] Chuyển CLI sang workspace mới: `multica workspace switch <slug>`

### A7. (Tuỳ chọn) Điền secrets khi apply

```bash
cp secrets.example.json secrets.json   # secrets.json đã nằm trong .gitignore, không bị commit
```

Mở `secrets.json` và điền giá trị. Đổi `FILL_IN_KEY_NAME_1` thành tên biến thật, ví dụ `GITHUB_TOKEN`:

```json
{ "agents": { "Feature Orchestrator": { "custom_env": { "GITHUB_TOKEN": "ghp_..." } } } }
```

Sau đó thêm `--secrets secrets.json` vào lệnh ở A5. Secrets chỉ được áp dụng cho agent **được tạo mới** trong lần chạy đó.

---

## Phần B: Cập nhật template sau khi sửa `lingo-bites`

### Cách 1: nhờ agent (nhanh nhất)

Nhắn cho **Multica Support Agent** trong `lingo-bites`: *"update template"*. Agent sẽ export, xem thay đổi, commit rồi push lên repo và báo lại bạn những gì đã đổi.

### Cách 2: tự làm từ terminal

```bash
cd multica-workspace-template
git pull
node export.mjs --workspace-id 8035423b-9598-4bfd-a08e-aae2c64004a9   # id của lingo-bites
git status                     # xem file nào thay đổi
git diff                       # xem chi tiết
git add -A
git commit -m "Update template: <mô tả ngắn>"
git push
```

Lưu ý:
- Dùng `git add -A` (không dùng `commit -am`) để lấy cả agent hoặc skill **mới thêm**.
- Agent hoặc skill đã xoá trong `lingo-bites` cũng biến mất khỏi template sau khi export, vì export luôn ghi lại toàn bộ.
- Export chỉ cần **quyền đọc**, không thay đổi gì trong `lingo-bites`.

### Sửa template trực tiếp (không qua workspace)

Có thể sửa file trong `template/` rồi commit, ví dụ `template/agents/<tên>/instructions.md` hoặc `template/skills/<tên>/SKILL.md`. Khi cần nhắc tới agent, squad… **dùng placeholder, không dán ID thật**:

| Placeholder | Được thay bằng |
|---|---|
| `{{@agent:Feature Orchestrator}}` | ID của agent đó trong workspace mới |
| `{{@squad:Engineering Squad}}` | ID của squad |
| `{{@project:mobile}}`, `{{@skill:handoff-policy}}` | ID của project hoặc skill |
| `{{@member:email@example.com}}` | User ID của người đó |
| `{{@workspace}}` | ID của workspace mới |

Nếu sau đó bạn chạy `export.mjs`, bản sửa tay sẽ bị ghi đè bằng nội dung đang có trong `lingo-bites`. Vì vậy nên sửa trong workspace rồi export, thay vì sửa tay trong template.

---

## Phần C: Nhờ agent setup theo template

Token của agent chỉ có quyền trong workspace của chính nó, nên bạn làm 3 bước đầu, agent làm phần còn lại.

1. Tạo workspace trên UI (chọn tên, slug, prefix như A1).
2. Cho daemon join workspace: `multica daemon restart`, kiểm tra `multica runtime list --workspace-id <id>`.
3. Tạo 1 agent Claude tên **`Setup Agent`**. Đừng dùng tên trùng agent trong template (ví dụ `Multica Support Agent`), vì agent trùng tên sẽ được giữ nguyên, không nhận cấu hình template.
4. Chat với agent:
   ```
   setup workspace theo template https://github.com/thnha/multica-workspace-template
   ```
5. Agent làm theo mục **Agent runbook** trong [README](../README.md#agent-runbook-set-up-this-workspace-from-the-template): chạy `node apply.mjs --self --dry-run`, báo trước sẽ tạo gì, **chờ bạn xác nhận**, chạy thật, rồi gửi báo cáo `Result` / `Key points` / `Not verified` / `Needed from you` / `Next`.

### Hai giới hạn agent sẽ kiểm tra và báo lại

- **L1 – Guard:** bên trong agent, script chỉ chạy thật khi workspace đích là workspace của agent (`--self`). Lớp `probe` vẫn kiểm tra thêm. Nếu bị chặn (mã thoát 3), agent báo `BLOCKED` và đưa lệnh để bạn chạy từ terminal: `node apply.mjs --workspace-id <id>`.
- **L2 – Quyền của token agent:** chưa kiểm chứng token agent có tạo được skill, agent, squad, autopilot, property và sửa context không (đọc env agent đã biết là bị từ chối). Lệnh bị từ chối được bỏ qua, ghi vào `denied` trong `apply-report-<id>.json`, mã thoát 4, agent báo `PARTIAL` kèm hướng xử lý:
  - A. Bạn chạy lại `node apply.mjs --workspace-id <id>` từ terminal; script chỉ tạo phần còn thiếu.
  - B. Nhờ owner/admin cấp quyền rồi bảo agent chạy lại `--self`.
  - C. Nếu chỉ thiếu vài mục, tạo tay trên UI.

Sau khi xong, có thể đổi tên hoặc archive `Setup Agent`.

---

## Câu hỏi thường gặp và xử lý lỗi

**"Refusing to run inside a Multica agent task" hoặc "cannot act on workspace …"**
Bạn đang chạy trong một agent nhắm vào workspace khác (trong agent chỉ dùng được `--self`), hoặc tài khoản CLI hiện tại không phải thành viên của workspace đích. Hãy chạy từ terminal của bạn, rồi kiểm tra `multica auth status` và `multica workspace list`.

**Apply bị dừng hoặc lỗi giữa chừng thì sao?**
Chạy lại với `--workspace-id <id>`. Thứ gì đã tồn tại (so theo **tên**) sẽ được bỏ qua, script chỉ tạo phần còn thiếu.

**Apply lại có cập nhật agent hoặc skill đã có không?**
**Không.** Script chỉ tạo mới những thứ còn thiếu. Để một workspace đã có sẵn nhận bản template mới, sửa tay trong workspace đó hoặc nhờ agent bổ sung tuỳ chọn ghi đè.

**Thứ gì không nằm trong template?**
Secret (env, MCP config, webhook secret), runtime (gắn với từng máy), avatar agent, các tuỳ chọn tắt skill theo từng máy, member, issue và comment.

**Windows báo lỗi dòng lệnh quá dài?**
Windows giới hạn một dòng lệnh khoảng 32K ký tự. Instructions dài nhất hiện khoảng 20K. Nếu một instructions vượt 30K, script sẽ cảnh báo; khi đó nên tách bớt nội dung sang skill.

**Xoá workspace test như thế nào?**
CLI không có lệnh xoá workspace. Nếu giao diện web có tuỳ chọn xoá, bạn xoá ở đó.
