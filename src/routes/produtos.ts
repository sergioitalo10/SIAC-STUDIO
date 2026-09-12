import { Hono } from 'hono';
import { db } from '../prisma/db';

const app = new Hono();

app.get('/', async (c) => {
  try {
    const produtos = await db.produtos.findMany();
    return c.json(produtos);
  } catch (error) {
    return c.json({ error: 'Failed to fetch produtos' }, 500);
  }
});

app.post('/', async (c) => {
  try {
    const { nome, preco, imagem, arquivo } = await c.req.json();
    const produto = await db.produtos.create({
      data: { nome, preco, imagem, arquivo }
    });
    return c.json(produto, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create produto' }, 500);
  }
});

app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const produto = await db.produtos.findUnique({ where: { id } });
    if (!produto) return c.notFound();
    return c.json(produto);
  } catch (error) {
    return c.json({ error: 'Failed to fetch produto' }, 500);
  }
});

app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { nome, preco, imagem, arquivo } = await c.req.json();
    const produto = await db.produtos.update({
      where: { id },
      data: { nome, preco, imagem, arquivo }
    });
    return c.json(produto);
  } catch (error) {
    return c.json({ error: 'Failed to update produto' }, 500);
  }
});

app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await db.produtos.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete produto' }, 500);
  }
});

export default app;