// Card editor modal (Chronica v0.1.0-alpha)
import { useState, useEffect, useCallback } from "react";
import { useBoardStore } from "../stores/boardStore";
import { useUIStore } from "../stores/uiStore";
import { useConfigStore } from "../stores/configStore";
import { PREDEFINED_COLORS } from "../state/types";
import type { Card, ColumnKey } from "../state/types";
import { sanitizeTitle, sanitizeDescription, sanitizeColor } from "../utils/sanitize";
import { createFieldRegistry } from "../io/fieldRegistry";
import type { FieldValue } from "../io/fieldSchema";

interface CardEditorProps {
  card?: Card;
  initialColumn?: ColumnKey;
  onClose: () => void;
}

export function CardEditor({ card, initialColumn, onClose }: CardEditorProps) {
  const { activeBoard, addCard, updateCard, deleteCard } = useBoardStore();
  const { showAlert, showConfirm } = useUIStore();
  const { getAllFields } = useConfigStore();
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [color, setColor] = useState(card?.color || "slate");
  const [column, setColumn] = useState(card?.column || initialColumn || "todo");

  // Custom fields state
  const fields = getAllFields();
  const fieldRegistry = createFieldRegistry(fields);
  const [customFields, setCustomFields] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};
    Object.keys(fields).forEach((fieldId) => {
      const existingValue = card?.customFields?.[fieldId];
      initial[fieldId] =
        existingValue !== undefined
          ? (existingValue as FieldValue)
          : fieldRegistry.getDefaultValue(fieldId);
    });
    return initial;
  });

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = useCallback(() => {
    // Sanitize all inputs before saving
    const sanitizedTitle = sanitizeTitle(title);
    if (!sanitizedTitle) {
      showAlert("Title Required", "Title is required");
      return;
    }

    const sanitizedDescription = sanitizeDescription(description);
    const sanitizedColor = sanitizeColor(color);

    // Validate and sanitize custom fields
    const fieldValidation = fieldRegistry.validateCardFields(customFields);
    if (!fieldValidation.valid) {
      const firstError = Object.values(fieldValidation.errors)[0] ?? "Validation failed";
      showAlert("Validation Error", firstError);
      return;
    }

    const cardData = {
      title: sanitizedTitle,
      description: sanitizedDescription,
      color: sanitizedColor || color, // Fallback to original if sanitization fails
      column,
      customFields:
        Object.keys(fieldValidation.sanitized).length > 0 ? fieldValidation.sanitized : undefined,
    };

    if (card) {
      // Update existing card
      updateCard(card.id, cardData);
    } else {
      // Add new card
      addCard(cardData);
    }

    onClose();
  }, [
    title,
    description,
    color,
    column,
    customFields,
    card,
    fieldRegistry,
    showAlert,
    updateCard,
    addCard,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (card) {
      showConfirm("Delete Card", "Delete this card?", () => {
        deleteCard(card.id);
        onClose();
      });
    }
  }, [card, showConfirm, deleteCard, onClose]);

  const handleCustomFieldChange = useCallback((fieldId: string, value: FieldValue) => {
    setCustomFields((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{card ? "Edit Card" : "New Card"}</h2>
          <button className="icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              placeholder="Enter card title..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder="Add a description..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Column</label>
            <select
              className="form-select"
              value={column}
              onChange={(e) => {
                setColumn(e.target.value);
              }}
            >
              {activeBoard?.columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {Object.entries(PREDEFINED_COLORS).map(([name, hex]) => (
                <div
                  key={name}
                  className={`color-chip ${color === name ? "selected" : ""}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => {
                    setColor(name);
                  }}
                  title={name}
                />
              ))}
              <input
                type="color"
                value={
                  color && color.startsWith("#")
                    ? color
                    : PREDEFINED_COLORS[color as keyof typeof PREDEFINED_COLORS] || "#8D99AE"
                }
                onChange={(e) => {
                  setColor(e.target.value);
                }}
                className="color-chip"
                title="Custom color"
              />
            </div>
          </div>

          {/* Custom Fields */}
          {Object.entries(fields).map(([fieldId, field]) => (
            <div className="form-group" key={fieldId}>
              <label className="form-label">
                {field.label}
                {field.required && <span style={{ color: "var(--color-salmon)" }}> *</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  className="form-input"
                  value={(customFields[fieldId] as string) || ""}
                  onChange={(e) => {
                    handleCustomFieldChange(fieldId, e.target.value);
                  }}
                  maxLength={field.validation?.maxLength}
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  className="form-input"
                  value={(customFields[fieldId] as number) || ""}
                  onChange={(e) => {
                    handleCustomFieldChange(fieldId, parseFloat(e.target.value));
                  }}
                  min={field.validation?.min}
                  max={field.validation?.max}
                />
              )}

              {field.type === "date" && (
                <input
                  type="date"
                  className="form-input"
                  value={(customFields[fieldId] as string) || ""}
                  onChange={(e) => {
                    handleCustomFieldChange(fieldId, e.target.value);
                  }}
                />
              )}

              {field.type === "select" && (
                <select
                  className="form-select"
                  value={(customFields[fieldId] as string) || ""}
                  onChange={(e) => {
                    handleCustomFieldChange(fieldId, e.target.value);
                  }}
                >
                  <option value="">-- Select --</option>
                  {field.validation?.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "url" && (
                <input
                  type="url"
                  className="form-input"
                  value={(customFields[fieldId] as string) || ""}
                  onChange={(e) => {
                    handleCustomFieldChange(fieldId, e.target.value);
                  }}
                  placeholder="https://"
                />
              )}

              {field.type === "checkbox" && (
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id={`field-${fieldId}`}
                    checked={(customFields[fieldId] as boolean) || false}
                    onChange={(e) => {
                      handleCustomFieldChange(fieldId, e.target.checked);
                    }}
                  />
                  <label htmlFor={`field-${fieldId}`} style={{ textTransform: "none" }}>
                    {field.label}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          {card && (
            <button onClick={handleDelete} style={{ marginRight: "auto", color: "#d32f2f" }}>
              Delete
            </button>
          )}
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} className="primary">
            {card ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
