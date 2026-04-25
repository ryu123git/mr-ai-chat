import { useState } from "react";

const SPECIALTIES = [
  "内科", "循環器内科", "糖尿病・内分泌内科", "腎臓内科",
  "消化器内科", "呼吸器内科", "外科", "その他",
];

export default function MeetingForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    hospital: "",
    phone: "",
    preferredDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  }

  const isValid = form.name && form.specialty && form.hospital && form.phone;

  return (
    <div className="meeting-form-card">
      <div className="meeting-form-header">
        <span className="meeting-form-icon">📋</span>
        <h3>面談リクエスト</h3>
      </div>
      <p className="meeting-form-desc">
        担当MRがご連絡の上、ご都合に合わせて訪問させていただきます。
      </p>
      <form onSubmit={handleSubmit} className="meeting-form">
        <div className="form-row">
          <label>
            お名前 <span className="required">*</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="山田 太郎"
              required
            />
          </label>
          <label>
            専門科 <span className="required">*</span>
            <select
              value={form.specialty}
              onChange={(e) => update("specialty", e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            病院・クリニック名 <span className="required">*</span>
            <input
              type="text"
              value={form.hospital}
              onChange={(e) => update("hospital", e.target.value)}
              placeholder="○○大学病院"
              required
            />
          </label>
          <label>
            電話番号 <span className="required">*</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="03-0000-0000"
              required
            />
          </label>
        </div>
        <label>
          ご希望日時（任意）
          <input
            type="datetime-local"
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </label>
        <label>
          ご相談内容・ご要望（任意）
          <textarea
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            placeholder="例：グルコスタットの採用について詳しく伺いたい"
            rows={3}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="btn-primary" disabled={!isValid || submitting}>
            {submitting ? "送信中…" : "面談を申し込む"}
          </button>
        </div>
      </form>
    </div>
  );
}
