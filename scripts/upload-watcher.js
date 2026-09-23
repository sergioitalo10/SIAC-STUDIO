#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const UPLOAD_DIR = path.join(__dirname, "..", "arquivos", "upload");
const INTERCLASSES_DIR = path.join(__dirname, "..", "public", "interclasses");
const ARQUIVOS_DIR = path.join(__dirname, "..", "arquivos", "interclasses");
const RAR_BIN = "C:/Program Files/WinRAR/rar.exe";

function log(msg) {
  console.log(`[WATCHER] ${new Date().toISOString()} — ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getNextId(mascote) {
  const mascoteDir = path.join(INTERCLASSES_DIR, mascote);
  ensureDir(mascoteDir);

  const existing = fs.readdirSync(mascoteDir)
    .filter((f) => f.match(/^\d+-/))
    .map((f) => {
      const match = f.match(/^(\d+)-/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a);

  const next = existing.length > 0 ? existing[0] + 1 : 1;
  return String(next).padStart(4, "0");
}

function extractRar(rarPath, destDir) {
  try {
    ensureDir(destDir);
    execSync(`"${RAR_BIN}" x "${rarPath}" "${destDir}" -y -inul`, { stdio: "pipe" });
    return true;
  } catch (err) {
    log(`ERRO na extração de ${rarPath}: ${err}`);
    return false;
  }
}

function listRarContents(rarPath) {
  try {
    const output = execSync(`"${RAR_BIN}" l "${rarPath}" -ba`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output
      .split("\n")
      .filter((line) => line.trim().length > 0 && !line.match(/^-+$/))
      .map((line) => line.trim());
  } catch (err) {
    log(`ERRO ao listar conteúdo de ${rarPath}: ${err}`);
    return [];
  }
}

function hasRequiredFiles(contents) {
  const hasPreview = contents.some((f) => f.toLowerCase().endsWith("preview.png"));
  const hasInnerRar = contents.some(
    (f) => f.toLowerCase().endsWith(".rar") && !f.includes("/preview")
  );

  const missing = [];
  if (!hasPreview) missing.push("preview.png");
  if (!hasInnerRar) missing.push("arquivo.rar (com fonte, .cdr e PDF/X1A)");

  return { valid: missing.length === 0, missing };
}

function processFile(fileName) {
  const rarPath = path.join(UPLOAD_DIR, fileName);
  log(`Iniciando análise de ${fileName}...`);

  const contents = listRarContents(rarPath);
  log(`Conteúdo: ${contents.join(", ")}`);

  const { valid, missing } = hasRequiredFiles(contents);
  if (!valid) {
    log(`ARQUIVO REJEITADO: ${fileName} - Faltando: ${missing.join(", ")}`);
    const rejectedDir = path.join(UPLOAD_DIR, "..", "rejected");
    ensureDir(rejectedDir);
    fs.renameSync(rarPath, path.join(rejectedDir, fileName));
    return;
  }

  const mascote = fileName.replace(".rar", "").toLowerCase().trim();
  const nextId = getNextId(mascote);
  const artId = `${nextId}-${mascote}`;
  const descId = `${nextId}-${mascote}`;

  log(`Mascote: ${mascote}, Próximo ID: ${nextId}`);

  const previewDestDir = path.join(INTERCLASSES_DIR, mascote, `preview-${artId}`);
  const arquivoDestDir = path.join(ARQUIVOS_DIR, mascote, descId);
  ensureDir(previewDestDir);
  ensureDir(arquivoDestDir);

  const tempExtractDir = path.join(__dirname, "..", "temp-extract");
  ensureDir(tempExtractDir);
  if (!extractRar(rarPath, tempExtractDir)) {
    log(`Falha na extração. Mantendo arquivo para análise manual.`);
    return;
  }

  const previewSrc = path.join(tempExtractDir, "preview.png");
  if (fs.existsSync(previewSrc)) {
    fs.renameSync(previewSrc, path.join(previewDestDir, "preview.png"));
    log(`preview.png movido para ${previewDestDir}`);
  }

  const innerRarSrc = path.join(tempExtractDir, "arquivo.rar");
  if (fs.existsSync(innerRarSrc)) {
    fs.renameSync(innerRarSrc, path.join(arquivoDestDir, "arquivo.rar"));
    log(`arquivo.rar movido para ${arquivoDestDir}`);
  }

  log(`Artwork registrada: ID=${nextId}, Mascote=${mascote}`);
  log(`Preview: ${previewDestDir}/preview.png`);
  log(`Arquivo: ${arquivoDestDir}/arquivo.rar`);

  fs.unlinkSync(rarPath);
  log(`${fileName} removido da pasta de upload.`);

  fs.rmSync(tempExtractDir, { recursive: true, force: true });
}

function startWatcher() {
  ensureDir(UPLOAD_DIR);
  if (!fs.existsSync(UPLOAD_DIR)) {
    log("Pasta de upload não existe. Criando...");
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  log(`Iniciando watcher na pasta: ${UPLOAD_DIR}`);

  const watcher = fs.watch(UPLOAD_DIR, { persistent: true, recursive: false }, (eventType, fileName) => {
    if (eventType === "rename" && fileName && fileName.toLowerCase().endsWith(".rar")) {
      setTimeout(() => {
        const filePath = path.join(UPLOAD_DIR, fileName);
        if (fs.existsSync(filePath)) {
          processFile(fileName).catch((err) => log(`ERRO processando ${fileName}: ${err}`));
        }
      }, 2000);
    }
  });

  watcher.on("error", (err) => {
    log(`Erro no watcher: ${err.message}`);
  });

  log("Watcher ativo. Aguardando uploads...");
}

startWatcher();
