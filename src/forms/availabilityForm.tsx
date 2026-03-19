"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DayKey = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

interface RecurringSlot {
  id: string;
  days: DayKey[];
  startTime: string;
  endTime: string;
}

interface VisitDuration {
  minutes: number;
}

interface ExceptionPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface FormData {
  // Page 1 – Disponibilités
  recurringSlots: RecurringSlot[];
  visitDuration: VisitDuration | null;
  exceptions: ExceptionPeriod[];

  // Page 2 – (à définir : ex. Informations complémentaires)
  page2Data: Record<string, unknown>;

  // Page 3 – (à définir : ex. Confirmation / récapitulatif)
  page3Data: Record<string, unknown>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: { key: DayKey; label: string }[] = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mer", label: "Mer" },
  { key: "jeu", label: "Jeu" },
  { key: "ven", label: "Ven" },
  { key: "sam", label: "Sam" },
  { key: "dim", label: "Dim" },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const TOTAL_STEPS = 3;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="step-indicator">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className={`step-dot ${i + 1 === current ? "active" : i + 1 < current ? "done" : ""}`}>
          <span className="step-number">{i + 1 < current ? "✓" : i + 1}</span>
        </div>
      ))}
      <style jsx>{`
        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.25s;
          position: relative;
        }
        .step-dot:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 2px;
          background: #e2e8f0;
        }
        .step-dot.active {
          background: #1e293b;
          color: #fff;
        }
        .step-dot.done {
          background: #22c55e;
          color: #fff;
        }
        .step-number {
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

// ─── Page 1 – Gérer mes disponibilités ───────────────────────────────────────

function Page1Disponibilites({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (updated: Partial<FormData>) => void;
}) {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showDurationForm, setShowDurationForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  // Recurring slot form state
  const [slotDays, setSlotDays] = useState<DayKey[]>([]);
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("12:00");

  // Duration form state
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  // Exception form state
  const [excLabel, setExcLabel] = useState("");
  const [excStart, setExcStart] = useState("");
  const [excEnd, setExcEnd] = useState("");

  const toggleDay = (day: DayKey) =>
    setSlotDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const addSlot = () => {
    if (!slotDays.length) return;
    const newSlot: RecurringSlot = {
      id: Date.now().toString(),
      days: slotDays,
      startTime: slotStart,
      endTime: slotEnd,
    };
    onChange({ recurringSlots: [...data.recurringSlots, newSlot] });
    setSlotDays([]);
    setSlotStart("09:00");
    setSlotEnd("12:00");
    setShowSlotForm(false);
  };

  const removeSlot = (id: string) =>
    onChange({ recurringSlots: data.recurringSlots.filter((s) => s.id !== id) });

  const saveDuration = () => {
    onChange({ visitDuration: { minutes: selectedDuration } });
    setShowDurationForm(false);
  };

  const addException = () => {
    if (!excStart) return;
    const exc: ExceptionPeriod = {
      id: Date.now().toString(),
      label: excLabel || "Exception",
      startDate: excStart,
      endDate: excEnd || excStart,
    };
    onChange({ exceptions: [...data.exceptions, exc] });
    setExcLabel("");
    setExcStart("");
    setExcEnd("");
    setShowExceptionForm(false);
  };

  const removeException = (id: string) =>
    onChange({ exceptions: data.exceptions.filter((e) => e.id !== id) });

  return (
    <div className="page">
      {/* ── Section 1 : Créneaux récurrents ── */}
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon">🔄</span>
          <div>
            <h3 className="section-title">Gérer mes disponibilités</h3>
            <p className="section-sub">
              Ces disponibilités se répéteront chaque semaine automatiquement
            </p>
          </div>
        </div>

        {data.recurringSlots.map((slot) => (
          <div key={slot.id} className="slot-chip">
            <span className="slot-days">
              {slot.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
            </span>
            <span className="slot-time">
              {slot.startTime} – {slot.endTime}
            </span>
            <button className="remove-btn" onClick={() => removeSlot(slot.id)}>✕</button>
          </div>
        ))}

        {showSlotForm ? (
          <div className="inline-form">
            <div className="day-picker">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  className={`day-btn ${slotDays.includes(d.key) ? "selected" : ""}`}
                  onClick={() => toggleDay(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="time-row">
              <div className="field-group">
                <label className="field-label">De</label>
                <input
                  type="time"
                  className="time-input"
                  value={slotStart}
                  onChange={(e) => setSlotStart(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">À</label>
                <input
                  type="time"
                  className="time-input"
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="inline-actions">
              <button className="btn-secondary" onClick={() => setShowSlotForm(false)}>
                Annuler
              </button>
              <button className="btn-primary-sm" onClick={addSlot}>
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button className="add-btn" onClick={() => setShowSlotForm(true)}>
            <span className="add-icon">+</span> Ajouter un créneau récurrent
          </button>
        )}
      </section>

      {/* ── Section 2 : Durée d'une visite ── */}
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon">🕐</span>
          <div>
            <h3 className="section-title">Durée d&apos;une visite</h3>
            <p className="section-sub">Définissez ici la durée prévue pour chaque visite</p>
          </div>
        </div>

        {data.visitDuration && (
          <div className="slot-chip">
            <span className="slot-days">Durée sélectionnée</span>
            <span className="slot-time">{data.visitDuration.minutes} minutes</span>
            <button
              className="remove-btn"
              onClick={() => onChange({ visitDuration: null })}
            >
              ✕
            </button>
          </div>
        )}

        {showDurationForm ? (
          <div className="inline-form">
            <div className="duration-grid">
              {DURATION_OPTIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  className={`duration-btn ${selectedDuration === min ? "selected" : ""}`}
                  onClick={() => setSelectedDuration(min)}
                >
                  {min < 60 ? `${min} min` : `${min / 60}h${min % 60 ? min % 60 : ""}`}
                </button>
              ))}
            </div>
            <div className="inline-actions">
              <button className="btn-secondary" onClick={() => setShowDurationForm(false)}>
                Annuler
              </button>
              <button className="btn-primary-sm" onClick={saveDuration}>
                Confirmer
              </button>
            </div>
          </div>
        ) : (
          !data.visitDuration && (
            <button className="add-btn" onClick={() => setShowDurationForm(true)}>
              <span className="add-icon">+</span> Ajouter une durée
            </button>
          )
        )}
      </section>

      {/* ── Section 3 : Exceptions ── */}
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon">🚫</span>
          <div>
            <h3 className="section-title">Exceptions (Congés, jours fériés)</h3>
            <p className="section-sub">Bloquer une date ou une période spécifique</p>
          </div>
        </div>

        {data.exceptions.map((exc) => (
          <div key={exc.id} className="slot-chip exception">
            <span className="slot-days">{exc.label}</span>
            <span className="slot-time">
              {exc.startDate}{exc.endDate !== exc.startDate ? ` → ${exc.endDate}` : ""}
            </span>
            <button className="remove-btn" onClick={() => removeException(exc.id)}>✕</button>
          </div>
        ))}

        {showExceptionForm ? (
          <div className="inline-form">
            <div className="field-group full">
              <label className="field-label">Libellé (optionnel)</label>
              <input
                type="text"
                className="text-input"
                placeholder="ex : Vacances d'été"
                value={excLabel}
                onChange={(e) => setExcLabel(e.target.value)}
              />
            </div>
            <div className="time-row">
              <div className="field-group">
                <label className="field-label">Du</label>
                <input
                  type="date"
                  className="time-input"
                  value={excStart}
                  onChange={(e) => setExcStart(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Au</label>
                <input
                  type="date"
                  className="time-input"
                  value={excEnd}
                  onChange={(e) => setExcEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="inline-actions">
              <button className="btn-secondary" onClick={() => setShowExceptionForm(false)}>
                Annuler
              </button>
              <button className="btn-primary-sm" onClick={addException}>
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button className="add-btn" onClick={() => setShowExceptionForm(true)}>
            <span className="add-icon">+</span> Ajouter une exception
          </button>
        )}
      </section>

      <style jsx>{`
        .page { display: flex; flex-direction: column; gap: 24px; }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .section-icon { font-size: 18px; margin-top: 2px; }
        .section-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
        .section-sub { font-size: 12.5px; color: #64748b; margin: 0; }

        .add-btn {
          width: 100%;
          padding: 14px;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          background: transparent;
          color: #475569;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }
        .add-btn:hover { border-color: #1e293b; color: #1e293b; background: #f8fafc; }
        .add-icon { font-size: 16px; font-weight: 700; }

        /* Chips */
        .slot-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
        }
        .slot-chip.exception { background: #fef2f2; }
        .slot-days { font-weight: 600; color: #1e293b; flex: 1; }
        .slot-time { color: #64748b; font-size: 12.5px; }
        .remove-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 11px;
          line-height: 1;
        }
        .remove-btn:hover { color: #ef4444; background: #fee2e2; }

        /* Inline forms */
        .inline-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Day picker */
        .day-picker { display: flex; gap: 6px; flex-wrap: wrap; }
        .day-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .day-btn.selected { background: #1e293b; color: #fff; border-color: #1e293b; }
        .day-btn:hover:not(.selected) { border-color: #94a3b8; }

        /* Duration grid */
        .duration-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .duration-btn {
          padding: 10px 0;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .duration-btn.selected { background: #1e293b; color: #fff; border-color: #1e293b; }
        .duration-btn:hover:not(.selected) { border-color: #94a3b8; }

        /* Time row */
        .time-row { display: flex; gap: 12px; }
        .field-group { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .field-group.full { flex: 1; }
        .field-label { font-size: 11.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
        .time-input, .text-input {
          padding: 8px 10px;
          border-radius: 7px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
        }
        .time-input:focus, .text-input:focus { border-color: #1e293b; }

        /* Inline actions */
        .inline-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .btn-secondary {
          padding: 8px 16px;
          border-radius: 7px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover { border-color: #94a3b8; }
        .btn-primary-sm {
          padding: 8px 16px;
          border-radius: 7px;
          border: none;
          background: #1e293b;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary-sm:hover { background: #0f172a; }
      `}</style>
    </div>
  );
}

// ─── Page 2 placeholder ───────────────────────────────────────────────────────
// TODO: remplacer le contenu de cette section par la page 2 du formulaire

function Page2Placeholder({ data, onChange }: { data: FormData; onChange: (u: Partial<FormData>) => void }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">📋</div>
      <h3>Page 2 – Informations complémentaires</h3>
      <p>Insérez ici les champs de la deuxième étape du formulaire.</p>
      {/* ── Ajoutez vos champs ici ── */}

      <style jsx>{`
        .placeholder-page {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          color: #94a3b8;
          text-align: center;
          padding: 32px;
        }
        .placeholder-icon { font-size: 36px; }
        h3 { margin: 0; font-size: 15px; font-weight: 600; color: #64748b; }
        p { margin: 0; font-size: 13px; }
      `}</style>
    </section>
  );
}

// ─── Page 3 placeholder ───────────────────────────────────────────────────────
// TODO: remplacer le contenu de cette section par la page 3 du formulaire (ex. récapitulatif / confirmation)

function Page3Placeholder({ data, onChange }: { data: FormData; onChange: (u: Partial<FormData>) => void }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">✅</div>
      <h3>Page 3 – Récapitulatif & Confirmation</h3>
      <p>Insérez ici le récapitulatif et les actions de confirmation.</p>
      {/* ── Ajoutez vos champs ici ── */}

      <style jsx>{`
        .placeholder-page {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          color: #94a3b8;
          text-align: center;
          padding: 32px;
        }
        .placeholder-icon { font-size: 36px; }
        h3 { margin: 0; font-size: 15px; font-weight: 600; color: #64748b; }
        p { margin: 0; font-size: 13px; }
      `}</style>
    </section>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Mes disponibilités",
  "Informations",
  "Confirmation",
];

export default function AvailabilityFormModal({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    recurringSlots: [],
    visitDuration: null,
    exceptions: [],
    page2Data: {},
    page3Data: {},
  });

  const updateData = (updated: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updated }));

  const handleNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = () => {
    // TODO: envoyer formData à votre API
    console.log("Données sauvegardées :", formData);
    onClose?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="modal" role="dialog" aria-modal="true" aria-label="Gérer mes disponibilités">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Gérer mes disponibilités</h2>
            <p className="modal-sub">Définissez vos créneaux horaires réguliers</p>
          </div>
          <div className="header-right">
            <StepIndicator current={step} />
            <span className="step-label">{STEP_LABELS[step - 1]}</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {step === 1 && <Page1Disponibilites data={formData} onChange={updateData} />}
          {step === 2 && <Page2Placeholder data={formData} onChange={updateData} />}
          {step === 3 && <Page3Placeholder data={formData} onChange={updateData} />}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? "Annuler" : "← Retour"}
          </button>
          <div className="footer-right">
            {step < TOTAL_STEPS ? (
              <button className="btn-save" onClick={handleNext}>
                Suivant →
              </button>
            ) : (
              <button className="btn-save" onClick={handleSave}>
                Enregistrer les modifications
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Backdrop */
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(2px);
          z-index: 40;
        }

        /* Modal */
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 50;
          width: min(620px, calc(100vw - 32px));
          max-height: calc(100vh - 48px);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: "Geist", "Geist Sans", ui-sans-serif, system-ui, sans-serif;
        }

        /* Header */
        .modal-header {
          padding: 22px 24px 18px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 3px;
          letter-spacing: -0.02em;
        }
        .modal-sub { font-size: 12.5px; color: #94a3b8; margin: 0; }
        .header-right {
          margin-left: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          padding-right: 32px;
        }
        .step-label { font-size: 11px; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; }
        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: rgba(255,255,255,0.12);
          border: none;
          color: #e2e8f0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.22); }

        /* Body */
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        /* Footer */
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
        }
        .footer-right { display: flex; gap: 10px; }
        .btn-cancel {
          padding: 10px 20px;
          border-radius: 9px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-cancel:hover { border-color: #94a3b8; color: #1e293b; }
        .btn-save {
          padding: 10px 22px;
          border-radius: 9px;
          border: none;
          background: #1e293b;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-save:hover { background: #0f172a; transform: translateY(-1px); }
        .btn-save:active { transform: translateY(0); }
      `}</style>
    </>
  );
}
