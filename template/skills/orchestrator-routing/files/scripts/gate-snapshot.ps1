<#
gate-snapshot.ps1 — deterministic PR facts for the Feature Orchestrator.
Read-only: calls `gh` only, never writes. Prints KEY=value lines.

Usage:
  pwsh -NoProfile -File <skill-dir>/scripts/gate-snapshot.ps1 -Repo thnha/LingoBites-App -Pr 140 [-ReportedSha <sha>] [-SinceSha <sha>]

-ReportedSha  head SHA from the developer card; checked against the PR head.
-SinceSha     last reviewed/tested SHA; prints the delta file list to HEAD.

Exit code 0 when every fact was read; 2 when a required read failed
(the leader then falls back to the manual commands).
#>
param(
  [Parameter(Mandatory = $true)][string]$Repo,
  [Parameter(Mandatory = $true)][int]$Pr,
  [string]$ReportedSha = '',
  [string]$SinceSha = ''
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8

function Out-Kv([string]$k, $v) { Write-Output ("{0}={1}" -f $k, $v) }

# Test, fixture, snapshot and docs files are excluded from production lines.
function Test-IsTest([string]$p) {
  return ($p -match '(^|/)(__tests__|__snapshots__|__mocks__|test|tests|e2e|fixtures|test-utils)/' -or
          $p -match '\.(test|spec|adversarial\.test)\.[cm]?[jt]sx?$' -or
          $p -match '\.snap$')
}
function Test-IsDocs([string]$p) {
  return ($p -match '\.(md|mdx)$' -or $p -match '(^|/)docs/' -or
          $p -match '(^|/)(README|AGENTS|CLAUDE)(\.[a-z]+)?$')
}
# R1 floor: production paths that always need Adversarial Review.
# A hit makes adversarial REQUIRED; no hit does NOT skip it (the leader still
# applies the R1 rule for declared invariants and persisted/shared state).
$r1Patterns = @(
  '(^|/)prisma/', '(^|/)migrations?/', 'migration', '(^|/)database/',
  '(^|/)repository/', 'Repository\.[cm]?[jt]s$', '(^|/)jobs/',
  '(^|/)auth/', '(^|/)security/', '(^|/)identity/', '(^|/)sync/',
  '(^|/)db/', '(^|/)localData/', 'outbox', 'sqlite', 'storage'
)
function Test-IsR1([string]$p) {
  foreach ($pat in $r1Patterns) { if ($p -match $pat) { return $true } }
  return $false
}

$failed = @()

# 1. PR state
try {
  $prJson = gh pr view $Pr --repo $Repo --json headRefOid,baseRefName,isDraft,state,mergeable,mergedAt,mergeCommit,url 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $prJson) { throw "gh pr view failed" }
  $p = $prJson | ConvertFrom-Json
  Out-Kv 'PR_URL' $p.url
  Out-Kv 'PR_STATE' $p.state
  Out-Kv 'IS_DRAFT' $p.isDraft
  Out-Kv 'BASE' $p.baseRefName
  Out-Kv 'HEAD_SHA' $p.headRefOid
  Out-Kv 'MERGEABLE' $p.mergeable
  if ($p.state -eq 'MERGED') {
    Out-Kv 'MERGED' 'yes'
    Out-Kv 'MERGE_SHA' $p.mergeCommit.oid
  } else { Out-Kv 'MERGED' 'no' }
  if ($ReportedSha) {
    $match = $p.headRefOid.StartsWith($ReportedSha.Trim(), [StringComparison]::OrdinalIgnoreCase) -and $ReportedSha.Trim().Length -ge 7
    Out-Kv 'SHA_MATCH' ($(if ($match) { 'yes' } else { 'no' }))
  }
} catch { $failed += 'pr_view'; Out-Kv 'ERROR_PR_VIEW' $_.Exception.Message }

# 2. GitHub checks on the head (gh exits non-zero on failing/pending checks: expected)
try {
  $chkJson = gh pr checks $Pr --repo $Repo --json name,state,bucket 2>$null
  if (-not $chkJson) {
    # Empty output means either "no checks reported" or a failed call; tell them apart.
    $chkErr = (gh pr checks $Pr --repo $Repo 2>&1 | Out-String)
    if ($chkErr -match 'no checks reported') { Out-Kv 'CHECKS' 'none' }
    else { throw ("gh pr checks failed: " + $chkErr.Trim()) }
  } else {
    $c = @($chkJson | ConvertFrom-Json)
    $pass = @($c | Where-Object { $_.bucket -eq 'pass' }).Count
    $fail = @($c | Where-Object { $_.bucket -eq 'fail' -or $_.bucket -eq 'cancel' })
    $pend = @($c | Where-Object { $_.bucket -eq 'pending' }).Count
    $skip = @($c | Where-Object { $_.bucket -eq 'skipping' }).Count
    Out-Kv 'CHECKS' ("total {0}, pass {1}, fail {2}, pending {3}, skipped {4}" -f $c.Count, $pass, $fail.Count, $pend, $skip)
    if ($fail.Count) { Out-Kv 'CHECKS_FAILED' (($fail | ForEach-Object { $_.name }) -join '; ') }
  }
} catch { $failed += 'pr_checks'; Out-Kv 'ERROR_PR_CHECKS' $_.Exception.Message }

# 3. Diff classification (paginated, no 100-file cap)
try {
  $filesJson = gh api "repos/$Repo/pulls/$Pr/files?per_page=100" --paginate 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $filesJson) { throw "gh api pulls/files failed" }
  # --paginate concatenates JSON arrays: "][" joins pages
  $files = @(($filesJson -join "`n") -replace '\]\s*\[', ',' | ConvertFrom-Json)
  $prod = @($files | Where-Object { -not (Test-IsTest $_.filename) -and -not (Test-IsDocs $_.filename) })
  $tests = @($files | Where-Object { Test-IsTest $_.filename })
  $docs = @($files | Where-Object { (Test-IsDocs $_.filename) -and -not (Test-IsTest $_.filename) })
  $prodLines = ($prod | Measure-Object -Property changes -Sum).Sum; if (-not $prodLines) { $prodLines = 0 }
  $testLines = ($tests | Measure-Object -Property changes -Sum).Sum; if (-not $testLines) { $testLines = 0 }
  $r1 = @($prod | Where-Object { Test-IsR1 $_.filename } | ForEach-Object { $_.filename })
  Out-Kv 'FILES' ("total {0}, production {1}, test {2}, docs {3}" -f $files.Count, $prod.Count, $tests.Count, $docs.Count)
  Out-Kv 'PROD_LINES' $prodLines
  Out-Kv 'TEST_LINES' $testLines
  Out-Kv 'DOCS_ONLY' ($(if ($files.Count -gt 0 -and $docs.Count -eq $files.Count) { 'yes' } else { 'no' }))
  Out-Kv 'TEST_ONLY' ($(if ($prod.Count -eq 0 -and $tests.Count -gt 0) { 'yes' } else { 'no' }))
  Out-Kv 'SMALL_PACKAGE' ($(if ($prodLines -le 50) { 'yes' } else { 'no' }))
  if ($r1.Count) {
    Out-Kv 'R1_FLOOR' 'REQUIRED'
    Out-Kv 'R1_PATH_HITS' (($r1 | Select-Object -First 15) -join '; ')
  } else {
    Out-Kv 'R1_FLOOR' 'NO_PATH_HIT (apply the R1 rule for declared invariants and persisted/shared state)'
  }
} catch { $failed += 'pr_files'; Out-Kv 'ERROR_PR_FILES' $_.Exception.Message }

# 4. Delta since the last reviewed/tested SHA
if ($SinceSha) {
  try {
    $head = if ($p) { $p.headRefOid } else { 'HEAD' }
    $cmpJson = gh api "repos/$Repo/compare/$SinceSha...$head" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $cmpJson) { throw "gh api compare failed" }
    $cmp = $cmpJson | ConvertFrom-Json
    $df = @($cmp.files)
    $dprod = @($df | Where-Object { -not (Test-IsTest $_.filename) -and -not (Test-IsDocs $_.filename) })
    Out-Kv 'DELTA_STATUS' ("{0}, ahead {1}, behind {2}" -f $cmp.status, $cmp.ahead_by, $cmp.behind_by)
    Out-Kv 'DELTA_FILES' $df.Count
    Out-Kv 'DELTA_PROD_FILES' (($dprod | ForEach-Object { $_.filename } | Select-Object -First 20) -join '; ')
    Out-Kv 'DELTA_R1' ($(if (@($dprod | Where-Object { Test-IsR1 $_.filename }).Count) { 'yes' } else { 'no' }))
  } catch { $failed += 'compare'; Out-Kv 'ERROR_COMPARE' $_.Exception.Message }
}

# 5. Verdict for accepting IMPLEMENTATION_COMPLETE (GitHub facts only;
#    the card's local check evidence is still read by the leader)
if ($failed.Count) {
  Out-Kv 'SNAPSHOT' ("INCOMPLETE ({0}) - use the manual commands" -f ($failed -join ', '))
  exit 2
}
$reasons = @()
if ($ReportedSha -and $match -ne $true) { $reasons += 'reported SHA is not the PR head' }
if ($fail -and $fail.Count) { $reasons += 'failed check on head' }
if ($p.state -eq 'CLOSED') { $reasons += 'PR closed' }
Out-Kv 'SNAPSHOT' 'OK'
if ($reasons.Count) { Out-Kv 'GITHUB_GATE' ("HANDOFF_CORRECTION: " + ($reasons -join '; ')) } else { Out-Kv 'GITHUB_GATE' 'OK' }
exit 0
