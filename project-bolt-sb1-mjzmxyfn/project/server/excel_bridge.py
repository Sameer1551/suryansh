import os
import sys
import json
import time
import datetime
from typing import Dict, Any, List, Optional
import openpyxl
from openpyxl.styles import PatternFill, Font
from openpyxl.formatting.rule import FormulaRule

_script_dir = os.path.dirname(os.path.abspath(__file__))
_candidates = [
    os.path.abspath(os.path.join(_script_dir, "..", "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx")),
    os.path.abspath(os.path.join(_script_dir, "..", "..", "..", "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx")),
    r"d:\suryansh\project-bolt-sb1-mjzmxyfn\project\DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx",
    r"d:\suryansh\DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx",
]
DEFAULT_EXCEL_PATH = next((p for p in _candidates if os.path.exists(p)), _candidates[0])
EXCEL_PATH = os.environ.get("EXCEL_PATH", DEFAULT_EXCEL_PATH)

SHEET_CONFIGS = {
    "organisations": {
        "sheet_name": "02 ORGANISATIONS",
        "id_prefix": "ORG",
        "fields": [
            ("id", 1),
            ("name", 2),
            ("type", 3),
            ("subcategory", 4),
            ("website", 5),
            ("city", 6),
            ("state", 7),
            ("country", 8),
            ("officeAddress", 9),
            ("generalEmail", 10),
            ("officePhone", 11),
            ("instagram", 12),
            ("linkedin", 13),
            ("youtube", 14),
            ("imdb", 15),
            ("keyWork", 16),
            ("industryFocus", 17),
            ("relevantDepartments", 18),
            ("priority", 19),
            ("status", 20),
            ("researchSourceUrl", 21),
            ("dateAdded", 22),
            ("lastVerified", 23),
            ("associatedContactIds", 24),
            ("notes", 25),
        ],
        "formulas": {},
        "booleans": [],
        "arrays": ["associatedContactIds"],
    },
    "contacts": {
        "sheet_name": "03 CONTACTS",
        "id_prefix": "CON",
        "fields": [
            ("id", 1),
            ("fullName", 2),
            ("firstName", 3),
            ("lastName", 4),
            ("designation", 5),
            ("department", 6),
            ("organisationId", 7),
            ("organisationName", 8),
            ("industryCategory", 9),
            ("city", 10),
            ("country", 11),
            ("professionalEmail", 12),
            ("alternativeEmail", 13),
            ("phone", 14),
            ("whatsapp", 15),
            ("instagram", 16),
            ("linkedin", 17),
            ("facebook", 18),
            ("imdb", 19),
            ("personalWebsite", 20),
            ("experienceLevel", 21),
            ("specialisation", 22),
            ("notableProjects", 23),
            ("currentOrganisation", 24),
            ("previousOrganisation", 25),
            ("professionalInterests", 26),
            ("portfolioUrl", 27),
            ("relevanceToDop", 28),
            ("connectionType", 29),
            ("introductionThrough", 30),
            ("contactPriority", 31),
            ("relationshipStatus", 32),
            ("contactStatus", 33),
            ("firstContactDate", 34),
            ("lastContactDate", 35),
            ("lastChannel", 36),
            ("responseStatus", 37),
            ("portfolioShared", 38),
            ("showreelShared", 39),
            ("nextFollowUpDate", 40),
            ("followUpAlert", 41),
            ("nextAction", 42),
            ("relationshipNotes", 43),
            ("doNotContact", 44),
            ("contactOwner", 45),
            ("sourceUrl", 46),
            ("dateAdded", 47),
            ("lastVerified", 48),
            ("starred", 49),
        ],
        "formulas": {
            8: '=IF(G{row}="","",IFERROR(VLOOKUP(G{row},\'02 ORGANISATIONS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
        },
        "booleans": ["portfolioShared", "showreelShared", "doNotContact", "followUpAlert", "starred"],
        "arrays": [],
    },
    "outreach": {
        "sheet_name": "04 OUTREACH",
        "id_prefix": "OUT",
        "fields": [
            ("id", 1),
            ("contactId", 2),
            ("contactName", 3),
            ("organisationId", 4),
            ("organisationName", 5),
            ("date", 6),
            ("channel", 7),
            ("type", 8),
            ("messageTemplate", 9),
            ("personalisationReason", 10),
            ("portfolioSent", 11),
            ("showreelSent", 12),
            ("messageReference", 13),
            ("deliveryStatus", 14),
            ("responseReceived", 15),
            ("responseDate", 16),
            ("responseSummary", 17),
            ("responseSentiment", 18),
            ("nextAction", 19),
            ("nextActionDate", 20),
            ("handledBy", 21),
            ("notes", 22),
        ],
        "formulas": {
            3: '=IF(B{row}="","",IFERROR(VLOOKUP(B{row},\'03 CONTACTS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
            5: '=IF(D{row}="","",IFERROR(VLOOKUP(D{row},\'02 ORGANISATIONS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
        },
        "booleans": ["portfolioSent", "showreelSent", "responseReceived"],
        "arrays": [],
    },
    "followups": {
        "sheet_name": "05 FOLLOW-UPS",
        "id_prefix": "FUP",
        "fields": [
            ("id", 1),
            ("contactId", 2),
            ("contactName", 3),
            ("organisationName", 4),
            ("previousContactDate", 5),
            ("previousCommunicationSummary", 6),
            ("followUpNumber", 7),
            ("scheduledDate", 8),
            ("channel", 9),
            ("reason", 10),
            ("status", 11),
            ("responseReceived", 12),
            ("responseSummary", 13),
            ("nextFollowUpDate", 14),
            ("assignedTo", 15),
            ("alertStatus", 16),
            ("notes", 17),
        ],
        "formulas": {
            3: '=IF(B{row}="","",IFERROR(VLOOKUP(B{row},\'03 CONTACTS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
            4: '=IF(B{row}="","",IFERROR(INDEX(\'03 CONTACTS\'!$H:$H,MATCH(B{row},\'03 CONTACTS\'!$A:$A,0)),""))',
            16: '=IF(H{row}="","",IF(K{row}="Completed","COMPLETED",IF(K{row}="Cancelled","CANCELLED",IF(H{row}<TODAY(),"OVERDUE",IF(H{row}=TODAY(),"DUE TODAY","UPCOMING")))))',
        },
        "booleans": ["responseReceived"],
        "arrays": [],
    },
    "opportunities": {
        "sheet_name": "06 OPPORTUNITIES",
        "id_prefix": "OPP",
        "fields": [
            ("id", 1),
            ("name", 2),
            ("contactId", 3),
            ("contactName", 4),
            ("organisationId", 5),
            ("organisationName", 6),
            ("projectType", 7),
            ("projectDescription", 8),
            ("director", 9),
            ("producer", 10),
            ("expectedShootDate", 11),
            ("shootLocation", 12),
            ("expectedDuration", 13),
            ("dopRequirement", 14),
            ("estimatedBudget", 15),
            ("budgetCurrency", 16),
            ("availability", 17),
            ("source", 18),
            ("stage", 19),
            ("lastUpdate", 20),
            ("nextAction", 21),
            ("nextActionDate", 22),
            ("outcome", 23),
            ("lossReason", 24),
            ("notes", 25),
        ],
        "formulas": {
            4: '=IF(C{row}="","",IFERROR(VLOOKUP(C{row},\'03 CONTACTS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
            6: '=IF(E{row}="","",IFERROR(VLOOKUP(E{row},\'02 ORGANISATIONS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
        },
        "booleans": [],
        "arrays": [],
    },
    "network": {
        "sheet_name": "07 NETWORK & REFERRALS",
        "id_prefix": "NET",
        "fields": [
            ("id", 1),
            ("contactId", 2),
            ("contactName", 3),
            ("organisationId", 4),
            ("organisationName", 5),
            ("relationshipType", 6),
            ("connectionStrength", 7),
            ("industryReach", 8),
            ("potentialIntroductions", 9),
            ("previousReferrals", 10),
            ("referralReceived", 11),
            ("lastInteraction", 12),
            ("maintenanceDate", 13),
            ("assignedTo", 14),
            ("notes", 15),
        ],
        "formulas": {
            3: '=IF(B{row}="","",IFERROR(VLOOKUP(B{row},\'03 CONTACTS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
            5: '=IF(D{row}="","",IFERROR(VLOOKUP(D{row},\'02 ORGANISATIONS\'!$A:$B,2,FALSE),"ID NOT FOUND"))',
        },
        "booleans": ["referralReceived"],
        "arrays": [],
    },
    "research": {
        "sheet_name": "08 RESEARCH QUEUE",
        "id_prefix": "RES",
        "fields": [
            ("id", 1),
            ("name", 2),
            ("category", 3),
            ("discoverySource", 4),
            ("discoveryUrl", 5),
            ("city", 6),
            ("status", 7),
            ("missingInfo", 8),
            ("assignedTo", 9),
            ("priority", 10),
            ("dateAdded", 11),
            ("deadline", 12),
            ("verified", 13),
            ("finalContactId", 14),
            ("finalOrganisationId", 15),
            ("notes", 16),
        ],
        "formulas": {},
        "booleans": ["verified"],
        "arrays": [],
    },
}

def check_file_locked(filepath: str) -> bool:
    if not os.path.exists(filepath):
        return False
    try:
        with open(filepath, "r+b"):
            pass
        return False
    except (PermissionError, OSError):
        return True

def format_cell_value(val: Any) -> Any:
    if val is None:
        return ""
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.strftime("%Y-%m-%d")
    return val

def clean_input_val(val: Any) -> Any:
    if val is None:
        return ""
    if isinstance(val, str):
        return val.strip()
    return val

PRIORITY_OPTIONS = ["Lead", "Interested lead", "Ingaging", "Cold reply", "Not interested"]

# Legacy numeric -> text mapping for backward compatibility
LEGACY_PRIORITY_MAP = {
    "1": "Lead",
    "2": "Interested lead",
    "3": "Ingaging",
    "4": "Cold reply",
    "5": "Not interested",
    "A": "Lead",
    "B": "Interested lead",
    "C": "Ingaging",
    "D": "Cold reply",
    "E": "Not interested",
    "HIGH": "Lead",
    "MEDIUM": "Interested lead",
    "LOW": "Cold reply",
}

PRIORITY_ROW_COLORS = {
    "Lead": {"fill": "FFE2E2", "text": "7A1A1A"},
    "Interested lead": {"fill": "FFF0D4", "text": "7A4B00"},
    "Ingaging": {"fill": "DCEEFB", "text": "0F4C75"},
    "Cold reply": {"fill": "DCF4E4", "text": "1B5E20"},
    "Not interested": {"fill": "F1F5F9", "text": "475569"},
}

def save_workbook_safely(wb, filepath: str, max_retries: int = 5, retry_delay: float = 0.3):
    last_err = None
    for attempt in range(max_retries):
        try:
            wb.save(filepath)
            return True, None
        except PermissionError as pe:
            last_err = pe
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                return False, "FILE_LOCKED"
        except Exception as e:
            last_err = e
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                return False, str(e)
    return False, str(last_err)

def normalize_priority_val(val: Any) -> str:
    if val is None:
        return "Interested lead"
    s = str(val).strip()
    # Exact match (case-insensitive)
    s_lower = s.lower()
    for opt in PRIORITY_OPTIONS:
        if opt.lower() == s_lower:
            return opt
    # Legacy numeric / letter mapping
    legacy = LEGACY_PRIORITY_MAP.get(s.upper())
    if legacy:
        return legacy
    # Default
    return "Interested lead"

def style_row_by_priority(ws, row_idx: int, p_val: Any, num_cols: int):
    p_key = normalize_priority_val(p_val)
    color_info = PRIORITY_ROW_COLORS.get(p_key)
    if color_info:
        fill = PatternFill(start_color=color_info["fill"], end_color=color_info["fill"], fill_type="solid")
        for c in range(1, num_cols + 1):
            ws.cell(row=row_idx, column=c).fill = fill

def generate_next_id(ws, id_prefix: str) -> str:
    max_num = 0
    for r in range(2, ws.max_row + 1):
        cell_val = ws.cell(row=r, column=1).value
        if cell_val and str(cell_val).startswith(f"{id_prefix}-"):
            try:
                num = int(str(cell_val).split("-")[1])
                if num > max_num:
                    max_num = num
            except (IndexError, ValueError):
                pass
    return f"{id_prefix}-{max_num + 1:03d}"

def read_sheet_data(ws, config: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows = []
    fields = config["fields"]
    bool_fields = set(config.get("booleans", []))
    array_fields = set(config.get("arrays", []))

    for r in range(2, ws.max_row + 1):
        id_val = ws.cell(row=r, column=1).value
        if id_val is None or str(id_val).strip() == "" or str(id_val).startswith("="):
            continue

        item = {}
        for field_name, col_idx in fields:
            cell_val = ws.cell(row=r, column=col_idx).value
            cell_val = format_cell_value(cell_val)

            if field_name in bool_fields:
                if isinstance(cell_val, bool):
                    item[field_name] = cell_val
                else:
                    item[field_name] = str(cell_val).strip().lower() in ("yes", "true", "1")
            elif field_name in array_fields:
                if isinstance(cell_val, str) and cell_val.strip():
                    item[field_name] = [x.strip() for x in cell_val.split(",") if x.strip()]
                else:
                    item[field_name] = []
            elif field_name in ("priority", "contactPriority"):
                item[field_name] = normalize_priority_val(cell_val)
            else:
                if str(cell_val).startswith("="):
                    item[field_name] = ""
                else:
                    item[field_name] = str(cell_val) if cell_val is not None else ""

        if config.get("id_prefix") == "ORG":
            item["contactStatus"] = item.get("status") or "Not Contacted"

        rows.append(item)
    return rows

def resolve_lookups(data: Dict[str, List[Dict[str, Any]]]):
    org_map = {o["id"]: o["name"] for o in data.get("organisations", []) if "id" in o}
    contact_name_map = {c["id"]: c.get("fullName", "") for c in data.get("contacts", []) if "id" in c}
    contact_org_map = {c["id"]: c.get("organisationName", "") for c in data.get("contacts", []) if "id" in c}

    for c in data.get("contacts", []):
        if not c.get("organisationName") and c.get("organisationId") in org_map:
            c["organisationName"] = org_map[c["organisationId"]]
        if not c.get("fullName"):
            first = c.get("firstName", "").strip()
            last = c.get("lastName", "").strip()
            c["fullName"] = f"{first} {last}".strip()

    for o in data.get("outreach", []):
        if not o.get("contactName") and o.get("contactId") in contact_name_map:
            o["contactName"] = contact_name_map[o["contactId"]]
        if not o.get("organisationName") and o.get("organisationId") in org_map:
            o["organisationName"] = org_map[o["organisationId"]]

    for f in data.get("followups", []):
        if not f.get("contactName") and f.get("contactId") in contact_name_map:
            f["contactName"] = contact_name_map[f["contactId"]]
        if not f.get("organisationName") and f.get("contactId") in contact_org_map:
            f["organisationName"] = contact_org_map[f["contactId"]]

    for opp in data.get("opportunities", []):
        if not opp.get("contactName") and opp.get("contactId") in contact_name_map:
            opp["contactName"] = contact_name_map[opp["contactId"]]
        if not opp.get("organisationName") and opp.get("organisationId") in org_map:
            opp["organisationName"] = org_map[opp["organisationId"]]

    for net in data.get("network", []):
        if not net.get("contactName") and net.get("contactId") in contact_name_map:
            net["contactName"] = contact_name_map[net["contactId"]]
        if not net.get("organisationName") and net.get("organisationId") in org_map:
            net["organisationName"] = org_map[net["organisationId"]]

def read_dropdown_data(ws) -> Dict[str, List[str]]:
    dropdowns = {}
    for c in range(1, ws.max_column + 1):
        header = ws.cell(row=1, column=c).value
        if header and str(header).strip():
            header_name = str(header).strip()
            vals = []
            for r in range(2, ws.max_row + 1):
                val = ws.cell(row=r, column=c).value
                if val is not None and str(val).strip():
                    vals.append(str(val).strip())
            dropdowns[header_name] = vals
    return dropdowns

def action_read_all() -> Dict[str, Any]:
    if not os.path.exists(EXCEL_PATH):
        return {"success": False, "error": "FILE_NOT_FOUND", "message": f"Workbook not found: {EXCEL_PATH}"}

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    data = {}
    for key, cfg in SHEET_CONFIGS.items():
        if cfg["sheet_name"] in wb.sheetnames:
            ws = wb[cfg["sheet_name"]]
            data[key] = read_sheet_data(ws, cfg)
        else:
            data[key] = []

    resolve_lookups(data)

    if "09 DROPDOWN DATA" in wb.sheetnames:
        data["dropdowns"] = read_dropdown_data(wb["09 DROPDOWN DATA"])
    else:
        data["dropdowns"] = {}

    return {"success": True, "data": data}

def action_add_row(entity_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if entity_key not in SHEET_CONFIGS:
        return {"success": False, "error": "INVALID_ENTITY", "message": f"Unknown entity: {entity_key}"}

    if check_file_locked(EXCEL_PATH):
        return {
            "success": False,
            "error": "FILE_LOCKED",
            "message": "The Excel file is currently open in another program. Please save and close it in Excel, then try again.",
        }

    cfg = SHEET_CONFIGS[entity_key]

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    sheet_name = cfg["sheet_name"]
    if sheet_name not in wb.sheetnames:
        return {"success": False, "error": "SHEET_NOT_FOUND", "message": f"Sheet {sheet_name} not found"}

    ws = wb[sheet_name]

    new_id = payload.get("id")
    if not new_id or str(new_id).strip() == "":
        new_id = generate_next_id(ws, cfg["id_prefix"])
        payload["id"] = new_id

    target_row = None
    for r in range(2, max(ws.max_row + 2, 1005)):
        cell_val = ws.cell(row=r, column=1).value
        if cell_val is None or str(cell_val).strip() == "":
            target_row = r
            break

    if target_row is None:
        target_row = ws.max_row + 1

    bool_fields = set(cfg.get("booleans", []))
    array_fields = set(cfg.get("arrays", []))
    formula_cols = set(cfg.get("formulas", {}).keys())

    if entity_key == "contacts" and not payload.get("fullName"):
        first = payload.get("firstName", "").strip()
        last = payload.get("lastName", "").strip()
        payload["fullName"] = f"{first} {last}".strip()

    today_str = datetime.date.today().strftime("%Y-%m-%d")
    if entity_key == "organisations":
        if "contactStatus" in payload and not payload.get("status"):
            payload["status"] = payload["contactStatus"]
        elif "status" in payload and not payload.get("contactStatus"):
            payload["contactStatus"] = payload["status"]
    if "dateAdded" in [f[0] for f in cfg["fields"]] and not payload.get("dateAdded"):
        payload["dateAdded"] = today_str
    if "lastVerified" in [f[0] for f in cfg["fields"]] and not payload.get("lastVerified"):
        payload["lastVerified"] = today_str
    if "lastUpdate" in [f[0] for f in cfg["fields"]] and not payload.get("lastUpdate"):
        payload["lastUpdate"] = today_str

    for field_name, col_idx in cfg["fields"]:
        if col_idx in formula_cols:
            formula_template = cfg["formulas"][col_idx]
            ws.cell(row=target_row, column=col_idx).value = formula_template.format(row=target_row)
            continue

        raw_val = payload.get(field_name)
        if field_name in bool_fields:
            val_to_write = "Yes" if bool(raw_val) else "No"
        elif field_name in array_fields:
            if isinstance(raw_val, list):
                val_to_write = ", ".join(str(x) for x in raw_val)
            else:
                val_to_write = str(raw_val) if raw_val is not None else ""
        elif field_name in ("priority", "contactPriority"):
            val_to_write = normalize_priority_val(raw_val)
        else:
            val_to_write = clean_input_val(raw_val)

        ws.cell(row=target_row, column=col_idx).value = val_to_write

    for col_idx, formula_template in cfg.get("formulas", {}).items():
        cell = ws.cell(row=target_row, column=col_idx)
        if not cell.value or not str(cell.value).startswith("="):
            cell.value = formula_template.format(row=target_row)

    priority_col = None
    for fname, cidx in cfg["fields"]:
        if fname in ("priority", "contactPriority"):
            priority_col = cidx
            break
    if priority_col:
        p_val = ws.cell(row=target_row, column=priority_col).value
        style_row_by_priority(ws, target_row, p_val, len(cfg["fields"]))

    saved, err = save_workbook_safely(wb, EXCEL_PATH)
    if not saved:
        if err == "FILE_LOCKED":
            return {
                "success": False,
                "error": "FILE_LOCKED",
                "message": "The Excel file is currently open in Excel. Please close it and retry.",
            }
        return {"success": False, "error": "SAVE_ERROR", "message": str(err)}

    return {"success": True, "data": payload}

def action_update_row(entity_key: str, record_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if entity_key not in SHEET_CONFIGS:
        return {"success": False, "error": "INVALID_ENTITY", "message": f"Unknown entity: {entity_key}"}

    if check_file_locked(EXCEL_PATH):
        return {
            "success": False,
            "error": "FILE_LOCKED",
            "message": "The Excel file is currently open in another program. Please save and close it in Excel, then try again.",
        }

    cfg = SHEET_CONFIGS[entity_key]

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    sheet_name = cfg["sheet_name"]
    if sheet_name not in wb.sheetnames:
        return {"success": False, "error": "SHEET_NOT_FOUND", "message": f"Sheet {sheet_name} not found"}

    ws = wb[sheet_name]

    target_row = None
    for r in range(2, ws.max_row + 1):
        cell_val = ws.cell(row=r, column=1).value
        if cell_val and str(cell_val).strip() == record_id.strip():
            target_row = r
            break

    if target_row is None:
        return {"success": False, "error": "NOT_FOUND", "message": f"Record with ID {record_id} not found"}

    bool_fields = set(cfg.get("booleans", []))
    array_fields = set(cfg.get("arrays", []))
    formula_cols = set(cfg.get("formulas", {}).keys())

    if entity_key == "contacts":
        first = payload.get("firstName")
        last = payload.get("lastName")
        if first is not None or last is not None:
            curr_first = first if first is not None else ws.cell(row=target_row, column=3).value or ""
            curr_last = last if last is not None else ws.cell(row=target_row, column=4).value or ""
            payload["fullName"] = f"{curr_first} {curr_last}".strip()

    today_str = datetime.date.today().strftime("%Y-%m-%d")
    if entity_key == "organisations":
        if "contactStatus" in payload:
            payload["status"] = payload["contactStatus"]
    if "lastVerified" in [f[0] for f in cfg["fields"]] and "lastVerified" not in payload:
        payload["lastVerified"] = today_str
    if "lastUpdate" in [f[0] for f in cfg["fields"]] and "lastUpdate" not in payload:
        payload["lastUpdate"] = today_str

    for field_name, col_idx in cfg["fields"]:
        if col_idx in formula_cols:
            continue
        if field_name == "id":
            continue

        if field_name in payload:
            raw_val = payload[field_name]
            if field_name in bool_fields:
                val_to_write = "Yes" if bool(raw_val) else "No"
            elif field_name in array_fields:
                if isinstance(raw_val, list):
                    val_to_write = ", ".join(str(x) for x in raw_val)
                else:
                    val_to_write = str(raw_val) if raw_val is not None else ""
            elif field_name in ("priority", "contactPriority"):
                val_to_write = normalize_priority_val(raw_val)
            else:
                val_to_write = clean_input_val(raw_val)

            ws.cell(row=target_row, column=col_idx).value = val_to_write

    priority_col = None
    for fname, cidx in cfg["fields"]:
        if fname in ("priority", "contactPriority"):
            priority_col = cidx
            break
    if priority_col:
        p_val = ws.cell(row=target_row, column=priority_col).value
        style_row_by_priority(ws, target_row, p_val, len(cfg["fields"]))

    saved, err = save_workbook_safely(wb, EXCEL_PATH)
    if not saved:
        if err == "FILE_LOCKED":
            return {
                "success": False,
                "error": "FILE_LOCKED",
                "message": "The Excel file is currently open in Excel. Please close it and retry.",
            }
        return {"success": False, "error": "SAVE_ERROR", "message": str(err)}

    return {"success": True, "data": payload}

def action_delete_row(entity_key: str, record_id: str) -> Dict[str, Any]:
    if entity_key not in SHEET_CONFIGS:
        return {"success": False, "error": "INVALID_ENTITY", "message": f"Unknown entity: {entity_key}"}

    if check_file_locked(EXCEL_PATH):
        return {
            "success": False,
            "error": "FILE_LOCKED",
            "message": "The Excel file is currently open in another program. Please save and close it in Excel, then try again.",
        }

    cfg = SHEET_CONFIGS[entity_key]

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    sheet_name = cfg["sheet_name"]
    if sheet_name not in wb.sheetnames:
        return {"success": False, "error": "SHEET_NOT_FOUND", "message": f"Sheet {sheet_name} not found"}

    ws = wb[sheet_name]

    target_row = None
    for r in range(2, ws.max_row + 1):
        cell_val = ws.cell(row=r, column=1).value
        if cell_val and str(cell_val).strip() == record_id.strip():
            target_row = r
            break

    if target_row is None:
        return {"success": False, "error": "NOT_FOUND", "message": f"Record with ID {record_id} not found"}

    ws.delete_rows(target_row, 1)

    saved, err = save_workbook_safely(wb, EXCEL_PATH)
    if not saved:
        if err == "FILE_LOCKED":
            return {
                "success": False,
                "error": "FILE_LOCKED",
                "message": "The Excel file is currently open in Excel. Please close it and retry.",
            }
        return {"success": False, "error": "SAVE_ERROR", "message": str(err)}

    return {"success": True, "id": record_id}

def action_clear_all() -> Dict[str, Any]:
    if check_file_locked(EXCEL_PATH):
        return {
            "success": False,
            "error": "FILE_LOCKED",
            "message": "The Excel file is currently open in another program. Please close it before clearing.",
        }

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    cleared = {}
    for entity_key, cfg in SHEET_CONFIGS.items():
        sheet_name = cfg["sheet_name"]
        if sheet_name not in wb.sheetnames:
            continue
        ws = wb[sheet_name]

        count = 0
        for r in range(2, ws.max_row + 1):
            val = ws.cell(row=r, column=1).value
            if val is not None and str(val).strip():
                count += 1

        if ws.max_row >= 2:
            ws.delete_rows(2, ws.max_row - 1)

        cleared[entity_key] = count

    saved, err = save_workbook_safely(wb, EXCEL_PATH)
    if not saved:
        if err == "FILE_LOCKED":
            return {
                "success": False,
                "error": "FILE_LOCKED",
                "message": "The Excel file is currently open in Excel. Please close it and retry.",
            }
        return {"success": False, "error": "SAVE_ERROR", "message": str(err)}

    return {"success": True, "cleared": cleared}

def action_seed_demo(seed_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    if check_file_locked(EXCEL_PATH):
        return {
            "success": False,
            "error": "FILE_LOCKED",
            "message": "The Excel file is currently open in another program. Please close it before seeding.",
        }

    try:
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    except Exception as e:
        return {"success": False, "error": "LOAD_ERROR", "message": str(e)}

    counts = {}
    for entity_key, items in seed_data.items():
        if entity_key not in SHEET_CONFIGS:
            continue
        cfg = SHEET_CONFIGS[entity_key]
        ws = wb[cfg["sheet_name"]]
        formula_cols = set(cfg.get("formulas", {}).keys())
        bool_fields = set(cfg.get("booleans", []))
        array_fields = set(cfg.get("arrays", []))

        existing_ids = set()
        for r in range(2, ws.max_row + 1):
            val = ws.cell(row=r, column=1).value
            if val and str(val).strip():
                existing_ids.add(str(val).strip())

        added = 0
        for item in items:
            item_id = item.get("id")
            if not item_id or item_id in existing_ids:
                continue

            target_row = None
            for r in range(2, max(ws.max_row + 2, 1005)):
                val = ws.cell(row=r, column=1).value
                if val is None or str(val).strip() == "":
                    target_row = r
                    break
            if target_row is None:
                target_row = ws.max_row + 1

            for field_name, col_idx in cfg["fields"]:
                if col_idx in formula_cols:
                    formula_template = cfg["formulas"][col_idx]
                    ws.cell(row=target_row, column=col_idx).value = formula_template.format(row=target_row)
                    continue

                raw_val = item.get(field_name)
                if field_name in bool_fields:
                    val_to_write = "Yes" if bool(raw_val) else "No"
                elif field_name in array_fields:
                    if isinstance(raw_val, list):
                        val_to_write = ", ".join(str(x) for x in raw_val)
                    else:
                        val_to_write = str(raw_val) if raw_val is not None else ""
                elif field_name in ("priority", "contactPriority"):
                    val_to_write = normalize_priority_val(raw_val)
                else:
                    val_to_write = clean_input_val(raw_val)

                ws.cell(row=target_row, column=col_idx).value = val_to_write

            for col_idx, formula_template in cfg.get("formulas", {}).items():
                cell = ws.cell(row=target_row, column=col_idx)
                if not cell.value or not str(cell.value).startswith("="):
                    cell.value = formula_template.format(row=target_row)

            priority_col = None
            for fname, cidx in cfg["fields"]:
                if fname in ("priority", "contactPriority"):
                    priority_col = cidx
                    break
            if priority_col:
                p_val = ws.cell(row=target_row, column=priority_col).value
                style_row_by_priority(ws, target_row, p_val, len(cfg["fields"]))

            existing_ids.add(item_id)
            added += 1

        counts[entity_key] = added

    saved, err = save_workbook_safely(wb, EXCEL_PATH)
    if not saved:
        if err == "FILE_LOCKED":
            return {
                "success": False,
                "error": "FILE_LOCKED",
                "message": "The Excel file is currently open in another program. Please close it before seeding.",
            }
        return {"success": False, "error": "SAVE_ERROR", "message": str(err)}

    return {"success": True, "counts": counts}

def get_json_payload(arg_idx: int) -> Dict[str, Any]:
    if len(sys.argv) > arg_idx and sys.argv[arg_idx] != "-":
        return json.loads(sys.argv[arg_idx])
    # Read from stdin
    input_text = sys.stdin.read().strip()
    if not input_text:
        return {}
    return json.loads(input_text)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "MISSING_ACTION", "message": "No action specified"}))
        return

    action = sys.argv[1]

    if action == "status":
        exists = os.path.exists(EXCEL_PATH)
        locked = check_file_locked(EXCEL_PATH) if exists else False
        print(json.dumps({"success": True, "exists": exists, "locked": locked, "path": EXCEL_PATH}))
        return

    if action == "read_all":
        res = action_read_all()
        print(json.dumps(res))
        return

    if action == "read_dropdowns":
        if not os.path.exists(EXCEL_PATH):
            print(json.dumps({"success": False, "error": "FILE_NOT_FOUND", "message": f"Workbook not found: {EXCEL_PATH}"}))
            return
        try:
            wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
            dropdowns = read_dropdown_data(wb["09 DROPDOWN DATA"]) if "09 DROPDOWN DATA" in wb.sheetnames else {}
            print(json.dumps({"success": True, "dropdowns": dropdowns}))
        except Exception as e:
            print(json.dumps({"success": False, "error": "LOAD_ERROR", "message": str(e)}))
        return

    if action == "add_row":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "MISSING_ARGS", "message": "Usage: add_row <entity> [payload | -]"}))
            return
        entity = sys.argv[2]
        payload = get_json_payload(3)
        res = action_add_row(entity, payload)
        print(json.dumps(res))
        return

    if action == "update_row":
        if len(sys.argv) < 4:
            print(json.dumps({"success": False, "error": "MISSING_ARGS", "message": "Usage: update_row <entity> <id> [payload | -]"}))
            return
        entity = sys.argv[2]
        record_id = sys.argv[3]
        payload = get_json_payload(4)
        res = action_update_row(entity, record_id, payload)
        print(json.dumps(res))
        return

    if action == "delete_row":
        if len(sys.argv) < 4:
            print(json.dumps({"success": False, "error": "MISSING_ARGS", "message": "Usage: delete_row <entity> <id>"}))
            return
        entity = sys.argv[2]
        record_id = sys.argv[3]
        res = action_delete_row(entity, record_id)
        print(json.dumps(res))
        return

    if action == "seed_demo":
        payload = get_json_payload(2)
        res = action_seed_demo(payload)
        print(json.dumps(res))
        return

    if action == "clear_all":
        res = action_clear_all()
        print(json.dumps(res))
        return

    print(json.dumps({"success": False, "error": "UNKNOWN_ACTION", "message": f"Action '{action}' is not recognized"}))

if __name__ == "__main__":
    main()
