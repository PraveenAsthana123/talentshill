#!/usr/bin/env python3
"""
TalentsHill Portal — Full Server Setup Script
Supports: Ubuntu 22.04 / 24.04 LTS (fresh VPS, e.g. GoDaddy VPS)

Usage:
  sudo python3 scripts/install.py                         # full install (Docker mode)
  sudo python3 scripts/install.py --mode pm2              # PM2 instead of Docker
  sudo python3 scripts/install.py --check                 # check what's installed
  sudo python3 scripts/install.py --skip-ollama           # skip Ollama
  sudo python3 scripts/install.py --domain talentshill.com --email admin@talentshill.com

What this installs:
  1.  Base packages (curl, wget, git, build-essential, ufw, fail2ban)
  2.  Node.js 20 LTS + npm + PM2
  3.  Docker Engine + Docker Compose plugin
  4.  nginx + Certbot (Let's Encrypt HTTPS)
  5.  Ollama (local AI) + nomic-embed-text + llama3.2 models
  6.  Firewall (UFW): 22/80/443 only
  7.  Fail2ban: SSH brute-force protection
  8.  Persistent data dirs (/opt/talentshill/data, /opt/talentshill/uploads)
  9.  Local dep bundle (@sohamyoga/shared-social-platforms → packed tarball)
  10. npm ci
  11. .env from .env.example
  12. DB migrations (drizzle-kit push)
  13. nginx site + optional HTTPS via certbot
  14. App start via Docker Compose or PM2 (systemd-enabled)
  15. Health check
"""

import argparse, os, subprocess, sys, shutil, time
from pathlib import Path

REPO_ROOT   = Path(__file__).resolve().parent.parent
NGINX_CONF  = REPO_ROOT / "nginx" / "talentshill.conf"
ENV_EXAMPLE = REPO_ROOT / ".env.example"
ENV_FILE    = REPO_ROOT / ".env"
DATA_DIR    = Path("/opt/talentshill/data")
UPLOADS_DIR = Path("/opt/talentshill/uploads")
LOG_FILE    = Path("/var/log/talentshill-install.log")
LOCAL_DEP   = Path("/mnt/deepa/sohamyoga/packages/shared-social-platforms")
PACKED_DEP  = REPO_ROOT / "vendor" / "shared-social-platforms.tgz"

G="\033[92m"; Y="\033[93m"; R="\033[91m"; C="\033[96m"; B="\033[1m"; X="\033[0m"
def info(m):  _log("✔", G, m)
def warn(m):  _log("!", Y, m)
def error(m): _log("✘", R, m)
def step(m):  print(f"\n{C}{B}{'─'*54}\n  {m}\n{'─'*54}{X}")
def _log(s, c, m):
    print(f"{c}[{s}] {m}{X}")
    try:
        open(LOG_FILE,"a").write(f"[{s}] {m}\n")
    except: pass

def run(cmd, check=True, capture=False, quiet=False):
    kw = dict(shell=True, text=True)
    if capture or quiet: kw["capture_output"] = True
    r = subprocess.run(cmd, **kw)
    if check and r.returncode != 0:
        error(f"FAILED: {cmd}")
        if capture or quiet: print((r.stderr or r.stdout or "")[-500:])
        raise SystemExit(r.returncode)
    return r

def which(b): return shutil.which(b) is not None
def root():
    if os.geteuid() != 0: error("Run as root: sudo python3 scripts/install.py"); sys.exit(1)

def install_base():
    step("1/14  Base Packages")
    run("apt-get update -qq")
    run("DEBIAN_FRONTEND=noninteractive apt-get install -y curl wget git unzip gnupg "
        "lsb-release ca-certificates apt-transport-https software-properties-common "
        "build-essential ufw fail2ban htop nano", quiet=True)
    info("Base packages OK")

def install_nodejs():
    step("2/14  Node.js 20 LTS + PM2")
    ver = run("node -v 2>/dev/null", capture=True, check=False).stdout.strip()
    if not ver.startswith("v20"):
        run("curl -fsSL https://deb.nodesource.com/setup_20.x | bash -", quiet=True)
        run("apt-get install -y nodejs", quiet=True)
    run("npm install -g npm@latest pm2", quiet=True)
    info(f"Node {run('node -v',capture=True).stdout.strip()}  PM2 {run('pm2 -v',capture=True).stdout.strip()}")

def install_docker():
    step("3/14  Docker Engine + Compose")
    if not which("docker"):
        run("curl -fsSL https://get.docker.com | sh", quiet=True)
        run("systemctl enable --now docker")
    if run("docker compose version", capture=True, check=False).returncode != 0:
        run("apt-get install -y docker-compose-plugin", quiet=True)
    info(run("docker compose version", capture=True).stdout.strip())

def install_nginx():
    step("4/14  nginx + Certbot")
    if not which("nginx"):
        run("apt-get install -y nginx certbot python3-certbot-nginx", quiet=True)
        run("systemctl enable nginx")
    info(run("nginx -v 2>&1", capture=True).stderr.strip())

def install_ollama():
    step("5/14  Ollama (local AI)")
    if not which("ollama"):
        run("curl -fsSL https://ollama.com/install.sh | sh", quiet=True)
    run("systemctl enable --now ollama 2>/dev/null || true", check=False)
    time.sleep(3)
    for model in ["nomic-embed-text", "llama3.2"]:
        r = run(f"ollama pull {model}", check=False)
        (info if r.returncode == 0 else warn)(f"{'Pulled' if r.returncode==0 else 'SKIP'}: {model}")

def configure_firewall():
    step("6/14  Firewall (UFW)")
    run("ufw --force reset", quiet=True)
    for rule in ["default deny incoming","default allow outgoing",
                 "allow 22/tcp","allow 80/tcp","allow 443/tcp"]:
        run(f"ufw {rule}", quiet=True)
    run("ufw --force enable", quiet=True)
    info("UFW: 22/80/443 open, everything else blocked")

def configure_fail2ban():
    step("7/14  Fail2ban")
    jail = Path("/etc/fail2ban/jail.local")
    if not jail.exists():
        jail.write_text("[DEFAULT]\nbantime=3600\nfindtime=600\nmaxretry=5\n\n"
                        "[sshd]\nenabled=true\nport=ssh\n")
    run("systemctl enable --now fail2ban", quiet=True)
    info("Fail2ban: SSH protection enabled (5 attempts → 1h ban)")

def create_directories():
    step("8/14  Persistent Directories")
    for d in [DATA_DIR, UPLOADS_DIR, REPO_ROOT/"logs"]:
        d.mkdir(parents=True, exist_ok=True)
        info(f"  {d}")
    # Symlinks so the app finds data/ and public/uploads/ at expected paths
    db_link = REPO_ROOT / "data"
    up_link = REPO_ROOT / "public" / "uploads"
    for link, target in [(db_link, DATA_DIR), (up_link, UPLOADS_DIR)]:
        if not link.exists() and not link.is_symlink():
            link.symlink_to(target)
            info(f"  Symlink {link} → {target}")

def bundle_local_dep():
    step("9/14  Bundle Local Dependency")
    vendor = REPO_ROOT / "vendor"
    vendor.mkdir(exist_ok=True)
    if PACKED_DEP.exists():
        info(f"Already packed: {PACKED_DEP.name}"); return
    if LOCAL_DEP.exists():
        r = run(f"npm pack {LOCAL_DEP} --pack-destination {vendor}", capture=True)
        tgz = vendor / r.stdout.strip().split("\n")[-1]
        tgz.rename(PACKED_DEP)
        info(f"Packed → {PACKED_DEP}")
    else:
        warn("shared-social-platforms source not found — assuming tarball is pre-committed")
        warn(f"Expected: {PACKED_DEP}")
        warn("Desktop prep: npm pack ../sohamyoga/packages/shared-social-platforms --pack-destination ./vendor")
        return
    # Patch package.json
    pkg = REPO_ROOT / "package.json"
    txt = pkg.read_text()
    old = '"@sohamyoga/shared-social-platforms": "file:../sohamyoga/packages/shared-social-platforms"'
    new = '"@sohamyoga/shared-social-platforms": "file:./vendor/shared-social-platforms.tgz"'
    if old in txt:
        pkg.write_text(txt.replace(old, new))
        info("package.json patched — dep now points to tarball")
    else:
        info("package.json already patched")

def npm_install():
    step("10/14  npm ci")
    run(f"cd {REPO_ROOT} && npm ci --omit=dev", quiet=True)
    info("node_modules ready")

def setup_env():
    step("11/14  .env File")
    if not ENV_FILE.exists():
        shutil.copy(ENV_EXAMPLE, ENV_FILE)
        warn(f"Created {ENV_FILE} from .env.example")
        warn("⚠  Edit before first start:")
        for k in ["SESSION_SECRET (64 random chars)", "ADMIN_EMAIL", "ADMIN_PASSWORD",
                  "SMTP_HOST / SMTP_USER / SMTP_PASS", "NEXT_PUBLIC_SITE_URL=https://talentshill.com"]:
            warn(f"   {k}")
    else:
        info(".env already exists — not overwritten")

def run_migrations():
    step("12/14  Database Migrations")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    r = run(f"cd {REPO_ROOT} && npx drizzle-kit push --force 2>&1", capture=True, check=False)
    (info if r.returncode == 0 else warn)("Migrations " + ("applied" if r.returncode == 0 else "FAILED — run manually: npx drizzle-kit push"))
    if r.returncode != 0: print(r.stdout[-400:])

def configure_nginx(domain, email):
    step("13/14  nginx Config + HTTPS")
    avail = Path("/etc/nginx/sites-available/talentshill.conf")
    enabl = Path("/etc/nginx/sites-enabled/talentshill.conf")

    if NGINX_CONF.exists():
        shutil.copy(NGINX_CONF, avail)
        info(f"Copied {NGINX_CONF.name} → {avail}")
    else:
        avail.write_text(f"""server {{
    listen 80;
    server_name {domain} www.{domain};
    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
    location /_next/static/ {{ alias {REPO_ROOT}/.next/static/; expires 365d; }}
    location /uploads/       {{ alias {UPLOADS_DIR}/; expires 30d; }}
}}\n""")

    if not enabl.exists(): enabl.symlink_to(avail)
    default = Path("/etc/nginx/sites-enabled/default")
    if default.exists(): default.unlink(); info("Removed default nginx site")
    run("nginx -t && systemctl reload nginx")
    info("nginx config loaded")

    if domain and "localhost" not in domain and email:
        warn(f"Requesting Let's Encrypt cert for {domain}...")
        r = run(f"certbot --nginx -d {domain} -d www.{domain} "
                f"--non-interactive --agree-tos -m {email} --redirect", check=False)
        if r.returncode == 0:
            info(f"HTTPS live: https://{domain}")
            run("systemctl enable --now certbot.timer 2>/dev/null || "
                "(crontab -l 2>/dev/null; echo '0 3 * * * certbot renew --quiet') | crontab -", check=False)
        else:
            warn("certbot failed — DNS may not be pointing here yet")
            warn(f"Run manually once DNS is live: certbot --nginx -d {domain} -m {email} --agree-tos")
    else:
        warn("No domain/email provided — skipping HTTPS. Run certbot manually.")

def start_app(mode):
    step("14/14  Start App")
    if mode == "docker":
        run(f"cd {REPO_ROOT} && docker compose build --no-cache", quiet=True)
        run(f"cd {REPO_ROOT} && docker compose up -d")
        run("systemctl enable docker")
        info("Docker Compose started — auto-restarts on reboot")
    else:
        run(f"cd {REPO_ROOT} && NODE_ENV=production npm run build", quiet=True)
        if "talentshill" in run("pm2 list", capture=True, check=False).stdout:
            run("pm2 reload talentshill")
        else:
            run(f"pm2 start {REPO_ROOT}/pm2.config.js --env production")
        run("pm2 save")
        r = run("pm2 startup systemd -u root --hp /root 2>&1", capture=True, check=False)
        for line in r.stdout.splitlines():
            if line.strip().startswith("sudo"):
                run(line.strip(), check=False); break
        info("PM2 started — auto-restarts on reboot via systemd")

def health_check():
    step("Health Check")
    warn("Waiting 20 s for app to start...")
    time.sleep(20)
    for i in range(12):
        r = run("curl -sf http://127.0.0.1:3000/api/health", capture=True, check=False)
        if r.returncode == 0:
            info(f"PASSED: {r.stdout.strip()}"); return True
        time.sleep(5)
    error("FAILED after 80 s — check logs:")
    run("pm2 logs talentshill --lines 20 2>/dev/null || docker compose logs --tail 30", check=False)
    return False

def check_only():
    step("Installation Check")
    checks = [
        ("node",      "node -v",                   "v20"),
        ("npm",       "npm -v",                    "."),
        ("pm2",       "pm2 -v",                    "."),
        ("docker",    "docker --version",           "Docker"),
        ("compose",   "docker compose version",     "Compose"),
        ("nginx",     "nginx -v 2>&1",              "nginx"),
        ("certbot",   "certbot --version 2>&1",     "certbot"),
        ("ollama",    "ollama --version 2>&1",      "ollama"),
        ("fail2ban",  "fail2ban-client -V 2>&1",    "Fail2Ban"),
        ("ufw",       "ufw status",                 "."),
        ("git",       "git --version",              "git"),
    ]
    ok = True
    for name, cmd, expect in checks:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        out = (r.stdout+r.stderr).strip().split("\n")[0]
        if r.returncode == 0: info(f"  {name:<14} {out}")
        else: warn(f"  {name:<14} NOT INSTALLED"); ok = False
    print()
    info("  .env            exists") if ENV_FILE.exists() else warn("  .env            MISSING")
    info(f"  data dir        {DATA_DIR}") if DATA_DIR.exists() else warn(f"  data dir        MISSING ({DATA_DIR})")
    info(f"  vendor tgz      exists") if PACKED_DEP.exists() else warn("  vendor tgz      MISSING (shared-social-platforms.tgz)")
    return ok

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--check",       action="store_true")
    p.add_argument("--mode",        default="docker", choices=["docker","pm2"])
    p.add_argument("--skip-ollama", action="store_true")
    p.add_argument("--skip-ssl",    action="store_true")
    p.add_argument("--domain",      default="talentshill.com")
    p.add_argument("--email",       default="")
    a = p.parse_args()

    print(f"\n{C}{B}╔══════════════════════════════════════════════╗")
    print(f"║  TalentsHill — VPS Setup Script            ║")
    print(f"║  Ubuntu 22.04/24.04  |  Mode: {a.mode:<14}║")
    print(f"╚══════════════════════════════════════════════╝{X}\n")

    if a.check: sys.exit(0 if check_only() else 1)
    root()
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    install_base()
    install_nodejs()
    install_docker()
    install_nginx()
    if not a.skip_ollama: install_ollama()
    configure_firewall()
    configure_fail2ban()
    create_directories()
    bundle_local_dep()
    npm_install()
    setup_env()
    run_migrations()
    configure_nginx(a.domain, "" if a.skip_ssl else a.email)
    start_app(a.mode)
    ok = health_check()

    print(f"\n{C}{B}{'═'*48}{X}")
    if ok:
        print(f"{G}{B}  ✔  TalentsHill is RUNNING{X}")
        print(f"     https://{a.domain}")
        print(f"     https://{a.domain}/admin")
    else:
        print(f"{Y}{B}  !  Started but health check failed — check logs{X}")
    print(f"\n{Y}Next steps:{X}")
    print(f"  1. Edit .env:    nano {ENV_FILE}")
    print(f"     SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, SMTP_*")
    print(f"  2. Point DNS:    talentshill.com  A  →  $(curl -s ifconfig.me)")
    print(f"  3. HTTPS:        certbot --nginx -d {a.domain} -m {a.email or 'you@email.com'} --agree-tos")
    print(f"  4. Deploy later: bash scripts/deploy-forward.sh")
    print(f"  5. Monitor:      bash scripts/health-monitor.sh")
    print(f"{'═'*48}\n")

if __name__ == "__main__":
    main()
