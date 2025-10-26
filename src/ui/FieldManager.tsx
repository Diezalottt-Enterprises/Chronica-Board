// Field Manager UI for custom fields (Chronica v0.1.0-alpha)
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useConfigStore } from "../stores/configStore";
import { useUIStore } from "../stores/uiStore";
import type { FieldDefinition, FieldType } from "../io/fieldSchema";
import { FIELD_LIMITS } from "../io/fieldSchema";

export function FieldManager() {
  const { getAllFields, addField, updateField, removeField } = useConfigStore();
  const { showAlert, showConfirm } = useUIStore();
  const fields = getAllFields();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState("");
  const [formType, setFormType] = useState<FieldType>("text");
  const [formRequired, setFormRequired] = useState(false);
  const [formMaxLength, setFormMaxLength] = useState("");
  const [formMin, setFormMin] = useState("");
  const [formMax, setFormMax] = useState("");
  const [formOptions, setFormOptions] = useState("");

  const fieldCount = Object.keys(fields).length;

  const handleNew = () => {
    if (fieldCount >= FIELD_LIMITS.MAX_FIELDS_PER_BOARD) {
      showAlert("Too Many Fields", `Maximum ${FIELD_LIMITS.MAX_FIELDS_PER_BOARD} fields allowed`);
      return;
    }
    resetForm();
    setEditingId("new");
  };

  const handleEdit = (fieldId: string, field: FieldDefinition) => {
    setFormLabel(field.label);
    setFormType(field.type);
    setFormRequired(field.required || false);
    setFormMaxLength(field.validation?.maxLength?.toString() || "");
    setFormMin(field.validation?.min?.toString() || "");
    setFormMax(field.validation?.max?.toString() || "");
    setFormOptions(field.validation?.options?.join("\n") || "");
    setEditingId(fieldId);
  };

  const handleDelete = (fieldId: string, label: string) => {
    showConfirm("Delete Field", `Delete field "${label}"?`, () => {
      removeField(fieldId);
    });
  };

  const handleSave = () => {
    if (!formLabel.trim()) {
      showAlert("Validation Error", "Label is required");
      return;
    }

    if (formLabel.length > FIELD_LIMITS.MAX_LABEL_LENGTH) {
      showAlert("Validation Error", `Label max ${FIELD_LIMITS.MAX_LABEL_LENGTH} characters`);
      return;
    }

    // Build validation object
    const validation: FieldDefinition["validation"] = {};

    if (formType === "text" && formMaxLength) {
      const maxLength = parseInt(formMaxLength);
      if (maxLength > 0 && maxLength <= FIELD_LIMITS.MAX_TEXT_LENGTH) {
        validation.maxLength = maxLength;
      }
    }

    if (formType === "number") {
      if (formMin) validation.min = parseFloat(formMin);
      if (formMax) validation.max = parseFloat(formMax);

      if (validation.min !== undefined && validation.max !== undefined && validation.min >= validation.max) {
        showAlert("Validation Error", "Min must be less than max");
        return;
      }
    }

    if (formType === "select") {
      const options = formOptions
        .split("\n")
        .map(o => o.trim())
        .filter(o => o.length > 0);

      if (options.length === 0) {
        showAlert("Validation Error", "Select field requires at least one option");
        return;
      }

      if (options.length > FIELD_LIMITS.MAX_SELECT_OPTIONS) {
        showAlert("Validation Error", `Max ${FIELD_LIMITS.MAX_SELECT_OPTIONS} options`);
        return;
      }

      validation.options = options;
    }

    const field: FieldDefinition = {
      id: editingId === "new" ? uuidv4() : editingId!,
      label: formLabel.trim(),
      type: formType,
      required: formRequired,
      validation: Object.keys(validation).length > 0 ? validation : undefined,
    };

    if (editingId === "new") {
      addField(field.id, field);
    } else {
      updateField(editingId!, field);
    }

    resetForm();
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
  };

  const resetForm = () => {
    setFormLabel("");
    setFormType("text");
    setFormRequired(false);
    setFormMaxLength("");
    setFormMin("");
    setFormMax("");
    setFormOptions("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {fieldCount}/{FIELD_LIMITS.MAX_FIELDS_PER_BOARD} custom fields
          </p>
        </div>
        <button onClick={handleNew} disabled={fieldCount >= FIELD_LIMITS.MAX_FIELDS_PER_BOARD || editingId !== null}>
          + New Field
        </button>
      </div>

      {/* Field List */}
      {fieldCount > 0 && editingId === null && (
        <div style={{ marginBottom: "16px" }}>
          {Object.entries(fields).map(([id, field]) => (
            <div
              key={id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "8px",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {field.label}
                  {field.required && <span style={{ color: "var(--color-salmon)", marginLeft: "4px" }}>*</span>}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {field.type}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(id, field)} className="icon">
                  ✏️
                </button>
                <button onClick={() => handleDelete(id, field.label)} className="icon">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {fieldCount === 0 && editingId === null && (
        <div style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
          <p>No custom fields yet</p>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>
            Add fields to capture extra info on cards
          </p>
        </div>
      )}

      {/* Edit Form */}
      {editingId !== null && (
        <div style={{ background: "var(--bg-secondary)", padding: "16px", borderRadius: "var(--radius-md)" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>
            {editingId === "new" ? "New Field" : "Edit Field"}
          </h3>

          <div className="form-group">
            <label className="form-label">Label</label>
            <input
              type="text"
              className="form-input"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="Priority, Assignee, etc."
              maxLength={FIELD_LIMITS.MAX_LABEL_LENGTH}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={formType} onChange={(e) => setFormType(e.target.value as FieldType)}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select (dropdown)</option>
              <option value="url">URL</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          <div className="form-group">
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="required"
                checked={formRequired}
                onChange={(e) => setFormRequired(e.target.checked)}
              />
              <label htmlFor="required" style={{ textTransform: "none" }}>
                Required field
              </label>
            </div>
          </div>

          {/* Type-specific validation */}
          {formType === "text" && (
            <div className="form-group">
              <label className="form-label">Max Length (optional)</label>
              <input
                type="number"
                className="form-input"
                value={formMaxLength}
                onChange={(e) => setFormMaxLength(e.target.value)}
                placeholder={`Max ${FIELD_LIMITS.MAX_TEXT_LENGTH}`}
                min="1"
                max={FIELD_LIMITS.MAX_TEXT_LENGTH}
              />
            </div>
          )}

          {formType === "number" && (
            <>
              <div className="form-group">
                <label className="form-label">Min Value (optional)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formMin}
                  onChange={(e) => setFormMin(e.target.value)}
                  placeholder="Minimum value"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Value (optional)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formMax}
                  onChange={(e) => setFormMax(e.target.value)}
                  placeholder="Maximum value"
                />
              </div>
            </>
          )}

          {formType === "select" && (
            <div className="form-group">
              <label className="form-label">Options (one per line)</label>
              <textarea
                className="form-textarea"
                value={formOptions}
                onChange={(e) => setFormOptions(e.target.value)}
                placeholder="High&#10;Medium&#10;Low"
                rows={5}
              />
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Max {FIELD_LIMITS.MAX_SELECT_OPTIONS} options
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleSave} className="primary">
              {editingId === "new" ? "Create" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
