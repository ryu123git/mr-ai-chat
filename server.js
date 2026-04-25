import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(express.json());

if (isProd) {
  app.use(express.static(join(__dirname, "dist")));
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは製薬会社「ファルマジャパン株式会社」の医薬情報担当AI（MRアシスタント）です。
医師の先生方からの製品に関する質問に、正確かつ専門的にお答えします。

【取り扱い製品一覧】

■ カルディオプレックス錠（降圧薬 / ARB）
- 一般名: オルメサルタン メドキソミル
- 適応: 高血圧症
- 用法・用量: 成人 1回 20mg、1日1回。効果不十分な場合は40mgまで増量可。
- 主な副作用: めまい、腎機能障害（血清クレアチニン上昇）、高カリウム血症
- 禁忌: 妊婦、重篤な腎障害（透析患者等）、アリスキレン投与中の糖尿病患者
- 薬価: 20mg錠 56.90円/錠

■ グルコスタット配合錠（糖尿病治療薬 / SGLT2阻害薬+DPP-4阻害薬）
- 成分: エンパグリフロジン10mg + リナグリプチン5mg
- 適応: 2型糖尿病
- 用法・用量: 成人 1錠、1日1回朝食前または朝食後
- 主な副作用: 尿路感染症、性器感染症、脱水、低血糖（他の糖尿病薬との併用時）
- 禁忌: 重症ケトアシドーシス、透析を含む重篤な腎障害（eGFR 30未満）
- 特記: 心不全・CKDへの適応拡大について承認申請中（2026年Q3審査予定）
- 薬価: 1錠 238.50円

■ ロスペクタ錠（脂質異常症治療薬 / スタチン）
- 一般名: ロスバスタチンカルシウム
- 適応: 高コレステロール血症、家族性高コレステロール血症
- 用法・用量: 成人 1回 2.5〜20mg、1日1回
- 主な副作用: 横紋筋融解症（CK上昇）、肝機能障害
- 禁忌: 重篤な肝障害・胆道閉塞、妊婦・授乳婦、シクロスポリン投与中
- 薬価: 5mg錠 29.70円/錠

■ ネフロガード静注（腎保護薬 / 点滴静注製剤）
- 適応: 急性腎障害の進行抑制（ICU管理下患者）
- 用法・用量: 0.1mg/kg/時で持続点滴、最大72時間
- 重要: 専門施設での使用に限る。腎臓内科・集中治療科との連携が必須。
- 薬価: 200mg/20mL 12,800円/バイアル

【対応ガイドライン】
- 一般的な製品情報、用法・用量、副作用、禁忌についての質問には詳しく回答してください。
- 薬価・保険適用の詳細、未承認適応、他社製品との詳細な比較、特定患者の投与可否判断、
  臨床試験データの詳細解析、院内採用交渉など、専門的・個別対応が必要な場合は、
  担当MRによる面談を提案してください。
- 面談を提案する場合は、必ず回答の末尾に以下のマーカーを含めてください:
  [[SUGGEST_MEETING]]
- マーカーは回答文中に一度だけ含め、文章として表示されないようにしてください。

回答は日本語で、医師に対して丁寧かつ簡潔に行ってください。`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const suggestMeeting = text.includes("[[SUGGEST_MEETING]]");
    const cleanText = text.replace(/\[\[SUGGEST_MEETING\]\]/g, "").trim();

    res.json({
      message: cleanText,
      suggestMeeting,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
        cacheCreate: response.usage.cache_creation_input_tokens ?? 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/meeting", async (req, res) => {
  const { name, specialty, hospital, phone, preferredDate, reason } = req.body;
  // In production this would save to DB / send email
  console.log("Meeting request received:", {
    name,
    specialty,
    hospital,
    phone,
    preferredDate,
    reason,
  });
  res.json({ success: true, id: `MR-${Date.now()}` });
});

if (isProd) {
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
