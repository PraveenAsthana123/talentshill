#!/usr/bin/env python3
"""
TalentsHill Portal — Automated Installation Script
Supports: Ubuntu 22.04/24.04 LTS

Usage:
  sudo python3 scripts/install.py          # full install
  python3 scripts/install.py --check       # dry-run check only
  python3 scripts/install.py --skip-docker
"""
import argparse
import os
import subprocess
import sys
import shutil
import platform
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PM2_CONFIG = REPO_ROOT / "pm2.config.js"
NGINX_CONF_SRC = REPO_ROOT / "nginx" / "talentshill.conf"
LOG_FILE = Path("/var/log/talentshill-install.log")

GREEN  = "\033[92m"; YELLOW = "\033[93m"; RED = "\033[91m"; CYAN = "\033[96m"; RESET = "\033[0m"
def info(m):  print(f"{GREEN}[✔] {m}{RESET}")
def warn(m):  print(f"{YELLOW}[!] {m}{RESET}")
def error(m): print(f"{RED}[✘] {m}{RESET}")
def step(m):  print(f"\n{CYAN}══ {m} ══{RESET}")

def run(cmd, check=True, capture=False):
    kwargs = dict(shell=True, text=True)
    if capture: kwargs["capture_output"] = True
    result = subprocess.run(cmd, **kwargs)
    if check and result.returncode != 0:
        error(f"Failed: {cmd}")
        raise SystemExit(result.returncode)
    return result

def which(b): return shutil.which(b) is not None
def check_root():
    if os.geteuid() != 0:
        error("Run as root: sudo python3 scripts/install.py"); sys.exit(1)

def install_base():
    step("Base Packages")
    run("apt-get update -qq")
    run("apt-get install -y curl wget git unzip gnupg lsb-release ca-certificates "
        "apt-transport-https software-properties-common build-essential ufw fail2ban htop")
    info("Base packages installed")

def install_nodejs():
    step("Node.js 20 LTS")
    if which("node"):
        ver = run("node -v", capture=True).stdout.strip()
        info(f"Node.js: {ver}")
        if not ver.startswith("v20"):
            warn("Not v20 — upgrading")
        else:
            return
    run("curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
    run("apt-get install -y nodejs")
    run("npm install -g npm@latest pm2")
    info("Node.js 20 + PM2 installed")

def install_docker():
    step("Docker Engine")
    if which("docker"):
        info(f"Docker: {run('docker --version', capture=True).stdout.strip()}")
        return
    run("curl -fsSL https://get.docker.com | sh")
    run("systemctl enable --now docker")
    info("Docker installed")

def install_nginx():
    step("nginx + Certbot")
    if not which("nginx"):
        run("apt-get install -y nginx certbot python3-certbot-nginx")
        run("systemctl enable nginx")
    info("nginx ready")

def install_ollama():
    step("Ollama (AI inference)")
    if not which("ollama"):
        run("curl -fsSL https://ollama.ai/install.sh | sh")
    run("systemctl enable --now ollama 2>/dev/null || ollama serve &>/var/log/ollama.log &", check=False)
    run("ollama pull nomic-embed-text", check=False)
    run("ollama pull llama3.2", check=False)
    info("Ollama + models ready")

def install_trivy():
    step("Trivy")
    if which("trivy"): return
    run("wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -")
    run('echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/trivy.list')
    run("apt-get update -qq && apt-get install -y trivy")
    info("Trivy installed")

def install_terraform():
    step("Terraform")
    if which("terraform"): return
    run("wget -O /tmp/tf.zip https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip")
    run("unzip -o /tmp/tf.zip -d /usr/local/bin/ && chmod +x /usr/local/bin/terraform")
    info("Terraform installed")

def install_aws_cli():
    step("AWS CLI v2")
    if which("aws"):
        info(f"AWS CLI: {run('aws --version', capture=True).stdout.strip()}")
        return
    run("curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip")
    run("unzip -q /tmp/awscliv2.zip -d /tmp && /tmp/aws/install")
    info("AWS CLI installed")

def npm_install():
    step("npm ci")
    run(f"npm ci --prefix {REPO_ROOT} --omit=dev 2>&1 | tail -3")
    info("Dependencies installed")

def copy_env():
    step(".env setup")
    env_ex = REPO_ROOT / ".env.example"
    env = REPO_ROOT / ".env"
    if env_ex.exists() and not env.exists():
        run(f"cp {env_ex} {env}")
        warn("Created .env — EDIT with real secrets before starting!")
    elif env.exists():
        info(".env already exists")

def configure_pm2():
    step("PM2")
    run("pm2 startup systemd -u root --hp /root 2>&1 | tail -2", check=False)
    if PM2_CONFIG.exists():
        run(f"pm2 start {PM2_CONFIG} --env production 2>&1 | tail -3", check=False)
        run("pm2 save", check=False)
        info("PM2 configured")

def check_only():
    step("Dependency Check")
    checks = {
        "node": ("node -v", "v20"),
        "npm":  ("npm -v", "."),
        "docker": ("docker --version", "Docker"),
        "nginx": ("nginx -v 2>&1", "nginx"),
        "ollama": ("ollama --version", "0."),
        "terraform": ("terraform version 2>/dev/null | head -1", "Terraform"),
        "trivy": ("trivy --version 2>/dev/null | head -1", "Trivy"),
        "aws": ("aws --version", "aws-cli"),
        "pm2": ("pm2 --version", "."),
    }
    ok = True
    for name, (cmd, expect) in checks.items():
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if r.returncode == 0 and expect in r.stdout + r.stderr:
            info(f"{name:18} {(r.stdout+r.stderr).strip().split(chr(10))[0]}")
        else:
            warn(f"{name:18} NOT FOUND")
            ok = False
    return ok

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--skip-docker", action="store_true")
    parser.add_argument("--skip-ollama", action="store_true")
    args = parser.parse_args()

    print(f"\n{CYAN}{'='*55}\n  TalentsHill Portal — Installation\n  Root: {REPO_ROOT}\n{'='*55}{RESET}\n")

    if args.check:
        sys.exit(0 if check_only() else 1)

    check_root()
    install_base()
    install_nodejs()
    if not args.skip_docker:
        install_docker()
    install_nginx()
    if not args.skip_ollama:
        install_ollama()
    install_trivy()
    install_terraform()
    install_aws_cli()
    copy_env()
    npm_install()
    configure_pm2()

    print(f"\n{GREEN}{'='*55}\n  TalentsHill installation complete!\n{'='*55}{RESET}")
    print("""
Next steps:
  1. Edit .env with real secrets (SESSION_SECRET, ADMIN_*)
  2. Run migrations:   npx drizzle-kit migrate
  3. Start (Docker):  docker compose up -d
     Start (PM2):     pm2 start pm2.config.js --env production
  4. Health check:    bash scripts/health-check.sh
""")

if __name__ == "__main__":
    main()
