const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GABARITO_DIR = path.join(__dirname, '..', 'public', 'gabarito');
const TEMP_DIR = path.join(__dirname, '..', 'temp-gabarito');

// Limpa e cria diretório temporário
if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true });
}
fs.mkdirSync(TEMP_DIR, { recursive: true });

// Cria preview.png (imagem de exemplo 100x100 branca com texto)
const previewPath = path.join(TEMP_DIR, 'preview.png');
fs.writeFileSync(previewPath, Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
));

// Cria pasta do arquivo.rar
const arquivoDir = path.join(TEMP_DIR, 'arquivo-rar');
fs.mkdirSync(arquivoDir);

// Arquivo de fonte exemplo (.ttf placeholder)
fs.writeFileSync(path.join(arquivoDir, 'fonte-exemplo.ttf'), '');

// Arquivo .cdr exemplo (placeholder)
fs.writeFileSync(path.join(arquivoDir, 'arte.cdr'), '');

// Arquivo PDF exemplo (placeholder)
fs.writeFileSync(path.join(arquivoDir, 'arte.pdf'), '');

console.log('Arquivos de exemplo criados em:', TEMP_DIR);
console.log('Agora você deve substituir os arquivos de exemplo pelos reais e compactar em um .rar');
console.log('');
console.log('Estrutura esperada do .rar enviado:');
console.log('  seu-mascote.rar');
console.log('  ├── preview.png');
console.log('  └── arquivo.rar');
console.log('      ├── fonte-original.ttf (ou .otf, .woff)');
console.log('      ├── arte.cdr (CorelDRAW)');
console.log('      └── arte.pdf (PDF/X1A vetorizado)');
console.log('');
console.log('Para gerar o .rar do gabarito, use:');
console.log('  cd public/gabarito');
console.log('  rar a gabarito-siax-studio.rar preview.png arquivo.rar');
