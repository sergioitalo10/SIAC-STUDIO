# Criar pastas
New-Item -ItemType Directory -Path "src/routes" -Force
New-Item -ItemType Directory -Path "src/prisma" -Force

# Criar index.ts
@"
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import produtosRoutes from './routes/produtos';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'API SIAC Studio' });
});

app.route('/produtos', produtosRoutes);

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`🚀 Server running on http://localhost:`${info.port}`);
});
"@ | Out-File -Encoding UTF8 "src/index.ts"

Write-Host "✅ Arquivos criados com sucesso!"