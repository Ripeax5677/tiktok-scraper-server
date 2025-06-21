import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());

app.get('/api/tiktok/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`https://www.tiktok.com/@${username}`, {
      waitUntil: 'networkidle2',
    });

    const data = await page.evaluate(() => {
      const f = document.querySelector('[data-e2e="followers-count"]')?.textContent;
      const l = document.querySelector('[data-e2e="likes-count"]')?.textContent;
      const d = document.querySelector('meta[name="description"]')?.content;
      return {
        followers: f || 'N/A',
        likes: l || 'N/A',
        description: d || 'Keine Beschreibung vorhanden',
      };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    console.error('Scraping-Fehler:', err);
    res.status(500).json({ error: 'Fehler beim Scraping' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
