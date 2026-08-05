#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
payload = json.loads((ROOT / "data" / "nitrosamine_limits.json").read_text(encoding="utf-8"))
records = payload.get("records", [])

assert payload.get("schema_version", 0) >= 2, "Expected schema_version >= 2"
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

    for item in record.get("special_limits", []):
        assert item.get("agency"), f"Special limit without agency: {record['name']}"
        assert item.get("limit_type"), f"Special limit without type: {record['name']}"
        ai = item.get("ai_ng_day")
        if ai is not None:
            assert float(ai) > 0, f"Non-positive special AI: {record['name']}"
        control = item.get("official_control_ppm")
        if control is not None:
            assert float(control) > 0, f"Non-positive official control ppm: {record['name']}"

# Core compounds must remain cross-regulator records, but exact values are not
# asserted: a legitimate regulatory update must be committed and notified rather
# than being blocked by validation.
core = {
    "62-75-9": ("FDA", "EMA", "Health Canada", "TGA"),
    "55-18-5": ("FDA", "EMA", "Health Canada", "TGA"),
    "924-16-3": ("FDA", "EMA", "Health Canada", "TGA"),
}
by_cas = {record.get("cas"): record for record in records if record.get("cas")}
for cas, agencies in core.items():
    assert cas in by_cas, f"Missing core compound {cas}"
    regulators = by_cas[cas].get("regulators", {})
    for agency in agencies:
        assert agency in regulators, f"{cas}: missing {agency} after refresh"
        assert regulators[agency].get("ai_ng_day") is not None, f"{cas} {agency}: AI is not numeric"

ema_other = [
    record
    for record in records
    if "Other N-nitroso-structures" in record.get("regulators", {}).get("EMA", {}).get("source_table", "")
]
assert len(ema_other) >= 10, (
    "EMA second worksheet was not imported: expected records from "
    "'Other N-nitroso-structures'"
)

fda_interim = [
    item
    for record in records
    for item in record.get("special_limits", [])
    if item.get("agency") == "FDA" and item.get("limit_type") == "interim"
]
assert len(fda_interim) >= 1, "FDA Table 3 interim AI rows were not imported"
for item in fda_interim:
    assert item.get("applicable_product"), "FDA interim row missing applicable product"
    assert item.get("estimated_duration"), "FDA interim row missing estimated duration"

print(
    f"Validated {len(records)} records; "
    f"EMA second-table records: {len(ema_other)}; "
    f"FDA interim rows: {len(fda_interim)}."
)
