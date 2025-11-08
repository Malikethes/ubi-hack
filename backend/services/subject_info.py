import os, re
from typing import Dict

YN_MAP = {"YES": True, "NO": False}

QUESTIONS_MAP = {
    "did you drink coffee today": "coffee_today",
    "did you drink coffee within the last hour": "coffee_last_hour",
    "did you do any sports today": "sports_today",
    "are you a smoker": "smoker",
    "did you smoke within the last hour": "smoke_last_hour",
    "do you feel ill today": "ill",
}

def _parse_bool(token: str):
    return YN_MAP.get(token.strip().upper(), None)

def load_subject_info(subject: str) -> Dict[str, object]:
    path = f"data/WESAD/{subject}/{subject}_readme.txt"
    if not os.path.exists(path):
        raise FileNotFoundError(path)

    with open(path, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    data: Dict[str, object] = {}
    notes: list[str] = []
    in_notes = False

    for line in lines:
        if line.startswith("###"):
            in_notes = "Additional notes" in line
            continue
        if in_notes:
            notes.append(line)
            continue

        # Personal info lines with colon
        if ":" in line and not re.search(r"\?\s*(YES|NO)$", line, re.IGNORECASE):
            key, val = line.split(":", 1)
            k = key.strip().lower()
            v = val.strip()
            if k == "age":
                data["age"] = int(v)
            elif k == "height (cm)":
                data["height"] = int(v)
            elif k == "weight (kg)":
                data["weight"] = int(v)
            elif k == "gender":
                data["gender"] = v.lower()
            elif k == "dominant hand":
                data["dominant_hand"] = v.lower()
            continue

        # Question lines: "Question? YES/NO"
        m = re.match(r"(.+?)\?\s*(YES|NO)$", line, re.IGNORECASE)
        if m:
            q_raw = m.group(1).strip().lower()
            val_raw = m.group(2).upper()
            # usuwamy ewentualne dwukropki w pytaniu
            q_clean = q_raw.rstrip(":")
            # dopasowanie do mapy (bez znaków interpunkcyjnych)
            q_norm = re.sub(r"[^a-z0-9 ]", "", q_clean)
            # próbuj znaleźć klucz
            for q_key, field in QUESTIONS_MAP.items():
                if q_norm == q_key:
                    data[field] = _parse_bool(val_raw)
                    break

    result = {
        "age": data.get("age"),
        "height": data.get("height"),
        "weight": data.get("weight"),
        "gender": data.get("gender"),
        "dominant_hand": data.get("dominant_hand"),
        "coffee_today": data.get("coffee_today"),
        "coffee_last_hour": data.get("coffee_last_hour"),
        "sports_today": data.get("sports_today"),
        "smoker": data.get("smoker"),
        "smoke_last_hour": data.get("smoke_last_hour"),
        "ill": data.get("ill"),
        "additional_notes": "\n".join(notes),
    }
    return result