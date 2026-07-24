import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/food-readiness', authenticateToken, async (req, res, next) => {
  try {
    const base = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
    if (base !== 'https://openrouter.ai/api/v1') return res.status(503).json({ error: 'OpenRouter base URL is not canonical' });
    if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_MODEL) return res.status(503).json({ error: 'OpenRouter credentials are missing' });
    const prompt = String(req.body?.prompt || 'Assess the most important food safety readiness check for this workflow.');
    const provider = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'content-type': 'application/json', 'x-title': 'Food Workflow Runtime' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        max_tokens: 220,
        messages: [
          { role: 'system', content: 'You are a food workflow safety reviewer. Give a concise finding and a concrete next action.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data: any = await provider.json();
    if (!provider.ok || data.error) return res.status(502).json({ error: data.error?.message || `Provider status ${provider.status}` });
    const content = data.choices?.[0]?.message?.content;
    if (!data.id || !content) return res.status(502).json({ error: 'Provider response lacked content or receipt' });
    const providerReceipt = { id: data.id, model: data.model || process.env.OPENROUTER_MODEL, usage: data.usage || null };
    const saved = await prisma.runtimeAiResult.create({
      data: {
        userId: req.user.userId,
        feature: 'food-readiness',
        prompt: { prompt },
        response: { content, providerReceipt },
        providerId: data.id,
        model: providerReceipt.model
      }
    });
    return res.json({ content, providerReceipt, recordId: saved.id });
  } catch (error) {
    return next(error);
  }
});

export const runtimeAiRoutes = router;
