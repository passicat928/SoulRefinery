import * as admin from "firebase-admin";
import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

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

const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

// Alchemy API
app.post("/api/alchemy", async (req, res) => {
  const { input, style, history, ahaMoments } = req.body;
  try {
    const ai = getGeminiAI() as any;
    
    let ahaContext = "";
    if (ahaMoments && ahaMoments.length > 0) {
      const momentsText = ahaMoments.map((m: any) => `- ${m.text}`).join('\n');
      ahaContext = `\n\n# User's Aha Moments (阿哈時刻)\n使用者過去收藏了以下最能觸動他們的話語：\n${momentsText}\n請參考這些話語的風格和切入點，用更貼近使用者的口吻來回覆，讓他們感受到你的理解。`;
    }

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...(history || []).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: "user", parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `你是一位精通「韌性煉金術」的導師。你的核心任務是將使用者的負面情緒（原礦）轉化為具備成長能量的韌性（黃金）。
          
          # Core Philosophy
          1. 轉化視角：引導使用者從不同角度看待困境，將挑戰視為成長的契機。
          2. 負向排除法：失敗不是失去，而是成功證實了某條路徑不可行。
          
          # Guiding Logic
          - 去標籤化：避免使用負面標籤，用中性或成長導向的詞彙描述現狀。
          - 自然融合：將共感、轉化、賦能自然融入對話中，**絕對不要**印出 [共感]、[轉化]、[賦能] 等標題或標籤。
          - 簡潔真誠：語氣像朋友般溫暖自然，不要說教。總字數嚴格控制在 200 字以內。
          
          風格設定：${style.name} - ${style.prompt}${ahaContext}`,
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

// Oracle API
app.post("/api/oracle", async (req, res) => {
  const { lastMessage, ahaMoments } = req.body;
  try {
    const ai = getGeminiAI() as any;
    
    let ahaContext = "";
    if (ahaMoments && ahaMoments.length > 0) {
      const momentsText = ahaMoments.map((m: any) => `- ${m.text}`).join('\n');
      ahaContext = `\n\n使用者過去收藏了以下「阿哈時刻」（最能觸動他們的話語）：\n${momentsText}\n請參考這些話語的風格，給予一個最能打動他們的啟示。`;
    }

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `基於使用者的煩惱和煉金後的建議：「${lastMessage}」，請提供一個「幸運啟示」。
        這個啟示必須是一個「極具體且可執行」的行動建議，特別強調「實體商品」、「感官體驗」或「消費行為」。${ahaContext}
        
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

// Thoughts API (Firestore)
app.post("/api/thoughts", async (req, res) => {
  const { content, style_id, avatar_config, level } = req.body;
  if (!content || !style_id) {
    return res.status(400).json({ error: "Missing content or style_id" });
  }
  
  try {
    await db.collection("thoughts").add({
      content,
      style_id,
      avatar_config: avatar_config || null,
      level: level || 1,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Firestore error" });
  }
});

app.get("/api/thoughts", async (req, res) => {
  try {
    const snapshot = await db.collection("thoughts")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();
    
    const thoughts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(thoughts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Firestore error" });
  }
});

// Weekly Report API
app.post("/api/weekly-report", async (req, res) => {
  const { history, ahaMoments } = req.body;
  
  if (!history || history.length === 0) {
    return res.status(400).json({ error: "No history provided for the report." });
  }

  try {
    const ai = getGeminiAI() as any;
    
    let ahaContext = "";
    if (ahaMoments && ahaMoments.length > 0) {
      const momentsText = ahaMoments.map((m: any) => `- ${m.text}`).join('\n');
      ahaContext = `\n\n使用者過去收藏了以下「阿哈時刻」（最能觸動他們的話語）：\n${momentsText}\n請在分析與給予建議時，參考這些話語的風格，讓週報的語氣更貼近使用者的偏好。`;
    }

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `以下是我過去一週的轉念紀錄（JSON格式）：\n${JSON.stringify(history)}` }]
          }
        ],
        config: {
          systemInstruction: `角色設定：你是一位精通「敘事心理學」與「行為數據分析」的資深心靈煉金導師。你的任務是分析使用者過去一週的轉念紀錄，生成一份溫暖、具備洞察力且能引發自我療癒的週報。

分析維度：
情緒氣候圖：分析本週使用者輸入的情緒頻率（例如：焦慮、憤怒、失落、疲憊）。
核心課題識別：從對話中找出重複出現的主題（例如：職場人際、高爾夫球技瓶頸、廢水處理壓力等）。
煉金成果（轉念金句）：挑選出本週最成功、最具啟發性的 1-2 個轉念回答。
成長洞察：以觀察者的角度，指出使用者這週在面對壓力時的行為模式變化。

輸出格式要求（請保持深色調煉金風格，使用 Markdown 格式）：

### 【本週心靈氣候】
用一段具備意象的文字總結（如：清晨的微霧、沸騰後的冷卻）。

### 【煉金實驗室數據】
列出本週最常出現的 3 個情緒關鍵字。

### 【大師級轉念回顧】
摘錄本週最棒的轉念邏輯。

### 【自我療癒建議】
根據本週壓力源，給予一個非強迫性的行動建議（例如：適合進行一次揮桿練習，或靜心 5 分鐘）。

### 【角色成長進度】
根據轉念次數，恭喜使用者獲得了哪種屬性的紙娃娃道具（如：冷靜之靴、洞察之鏡）。

語氣規範：專業、溫暖、不帶評判感，像是一位與使用者並肩作戰的智慧老友。${ahaContext}`
        }
      });
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Weekly report generation failed" });
  }
});

export const api = onRequest(
  { 
    secrets: ["GEMINI_API_KEY"],
    cors: true,
    region: "us-central1"
  }, 
  app
);
