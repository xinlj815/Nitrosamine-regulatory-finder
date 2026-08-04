#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
payload = json.loads((ROOT / "data" / "nitrosamine_limits.json").read_text(encoding="utf-8"))
records = payload.get("records", [])

assert len(records) >= 250, f"Unexpectedly small data set: {len(records)}"

seen = set()
for record in records:
    cas = record.get("cas")
    if cas:
        assert cas not in seen, f"Duplicate CAS: {cas}"
        seen.add(cas)
    assert record.get("name"), "Record without name"
    for agency, item in record.get("regulators", {}).items():
        ai = item.get("ai_ng_day")
        if ai is not None:
            assert float(ai) > 0, f"Non-positive AI: {record['name']} / {agency}"

expected = {
    "62-75-9": {"FDA": 96, "EMA": 96, "Health Canada": 96, "TGA": 96},
    "55-18-5": {"FDA": 26.5, "EMA": 26.5, "Health Canada": 26.5, "TGA": 26.5},
    "924-16-3": {"FDA": 26.5, "EMA": 26.5, "Health Canada": 26.5, "TGA": 26.5},
}
by_cas = {r.get("cas"): r for r in records if r.get("cas")}
for cas, agencies in expected.items():
    assert cas in by_cas, f"Missing core compound {cas}"
    for agency, ai in agencies.items():
        regulators = by_cas[cas].get("regulators", {})
        assert agency in regulators, (
            f"{cas}: missing {agency} after refresh. "
            "This usually means the regulator name did not merge with the CAS-based record."
        )
        actual = regulators[agency].get("ai_ng_day")
        assert actual is not None, f"{cas} {agency}: AI is not numeric"
        assert abs(float(actual) - float(ai)) < 1e-9, (
            f"{cas} {agency}: expected {ai}, got {actual}"
        )

print(f"Validated {len(records)} records.")
