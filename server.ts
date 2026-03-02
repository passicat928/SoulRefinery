import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("soul_refinery.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS thoughts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    style_id TEXT NOT NULL,
    avatar_config TEXT,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add columns if they don't exist
const migrations = [
  { name: 'avatar_config', type: 'TEXT' },
  { name: 'level', type: 'INTEGER DEFAULT 1' }
];

migrations.forEach(m => {
  try {
    db.prepare(`ALTER TABLE thoughts ADD COLUMN ${m.name} ${m.type}`).run();
  } catch (e) {
    // Column already exists or other error
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get Gemini AI instance
  const getGeminiAI = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("MISSING_API_KEY");
    }
    return new GoogleGenAI({ apiKey });
  };

  const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      if (retries > 0 && (err.message?.includes('500') || err.message?.includes('429') || err.message?.includes('fetch failed'))) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  // Gemini API Routes
  app.post("/api/alchemy", async (req, res) => {
    const { input, style, history } = req.body;
    try {
      const ai = getGeminiAI();
      const response = await withRetry(async () => {
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `System Instruction: 你是一位精通「韌性煉金術」的導師。你的核心任務是將使用者的負面情緒（原礦）轉化為具備成長能量的韌性（黃金）。
            
            # Core Philosophy
            1. 99°C 準沸點原則：當使用者想放棄時，提醒他們現在正是能量轉化的臨界點。
            2. 負向排除法：失敗不是失去，而是成功證實了某條路徑不可行。
            
            # Guiding Logic
            - 去標籤化：不使用「失敗、軟弱」等詞彙，改用「實驗數據、系統擾動」。
            - 結構化輸出：[共感]、[轉化]、[賦能]。
            
            風格設定：${style.name} - ${style.description}` }] },
            ...history.map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }]
            })),
            { role: "user", parts: [{ text: input }] }
          ],
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Alchemy failed" });
    }
  });

  app.post("/api/oracle", async (req, res) => {
    const { lastMessage } = req.body;
    try {
      const ai = getGeminiAI();
      const response = await withRetry(async () => {
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `基於使用者的煩惱和煉金後的建議：「${lastMessage}」，請提供一個「幸運啟示」。
          這個啟示必須是一個「極具體且可執行」的行動建議，特別強調「實體商品」、「感官體驗」或「消費行為」。
          
          請以 JSON 格式回傳，包含以下欄位：
          - title: 啟示標題
          - description: 詳細建議內容 (100字以內)
          - searchKeyword: 搜尋關鍵字
          - type: 類別 (food, exercise, shopping, leisure)
          - isSponsored: 是否為贊助建議 (boolean)
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                searchKeyword: { type: Type.STRING },
                type: { type: Type.STRING },
                isSponsored: { type: Type.BOOLEAN }
              },
              required: ["title", "description", "searchKeyword", "type", "isSponsored"]
            }
          }
        });
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Oracle failed" });
    }
  });

  // API Routes
  app.post("/api/thoughts", (req, res) => {
    const { content, style_id, avatar_config, level } = req.body;
    if (!content || !style_id) {
      return res.status(400).json({ error: "Missing content or style_id" });
    }
    
    try {
      const stmt = db.prepare("INSERT INTO thoughts (content, style_id, avatar_config, level) VALUES (?, ?, ?, ?)");
      stmt.run(content, style_id, avatar_config ? JSON.stringify(avatar_config) : null, level || 1);
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/thoughts", (req, res) => {
    try {
      const thoughts = db.prepare("SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 100").all();
      const parsedThoughts = thoughts.map((t: any) => ({
        ...t,
        avatar_config: t.avatar_config ? JSON.parse(t.avatar_config) : null
      }));
      res.json(parsedThoughts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
