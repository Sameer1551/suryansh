import os
import sys
import json
import subprocess
import importlib.util
from datetime import datetime, date, time, timedelta

# ============================================================
# CONFIGURATION
# ============================================================

EXPECTED_EMAIL = "suryanshh.dp@gmail.com"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
CONFIG_FILE = os.path.join(BASE_DIR, "google_sync_config.json")
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
TOKEN_FILE = os.path.join(BASE_DIR, "token.json")

DEFAULT_EXCEL_FILE = os.path.join(
    PROJECT_DIR, "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx"
)

DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbytZO_SaqcvsqgWmrb8xBvxd_99lp8R5b7LklsTXAoe2RY3k6DuLY6JFPuN6yHf25KGYw/exec"


# ============================================================
# DEPENDENCY CHECK
# ============================================================

def install_dependencies():
    packages = {
        "openpyxl": "openpyxl",
        "requests": "requests",
    }
    for module, package in packages.items():
        if importlib.util.find_spec(module) is None:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])


install_dependencies()

import openpyxl
import requests


# ============================================================
# DISPLAY UTILITIES
# ============================================================

def heading(text):
    print("\n" + "=" * 65)
    print(text.center(65))
    print("=" * 65)


def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        print("Warning: Could not save config:", e)


# ============================================================
# EXTRACT DATA FROM EXCEL
# ============================================================

def clean_value(val):
    if isinstance(val, (datetime, date, time)):
        return val.isoformat()
    if isinstance(val, timedelta):
        return str(val)
    if val is None:
        return ""
    return str(val) if not isinstance(val, (int, float, bool, str)) else val


def extract_all_sheets(excel_path):
    heading("READING MASTER EXCEL WORKBOOK")
    print(f"File: {os.path.basename(excel_path)}")

    workbook = openpyxl.load_workbook(excel_path, data_only=True)
    sheets_payload = []

    print(f"Detected {len(workbook.sheetnames)} worksheets:")

    for name in workbook.sheetnames:
        sheet = workbook[name]
        data = []
        for row in sheet.iter_rows(values_only=True):
            cleaned = [clean_value(c) for c in row]
            data.append(cleaned)

        # Remove trailing empty rows
        while data and all(v == "" for v in data[-1]):
            data.pop()

        # Remove trailing empty columns
        if data:
            while all(row and row[-1] == "" for row in data):
                for row in data:
                    row.pop()

        row_count = len(data)
        col_count = max((len(r) for r in data), default=0) if data else 0
        print(f" - {name.ljust(25)} : {row_count} rows, {col_count} columns")

        sheets_payload.append({
            "name": name,
            "data": data
        })

    return sheets_payload


# ============================================================
# SYNC VIA APPS SCRIPT WEB APP (RECOMMENDED - NO GOOGLE CLOUD)
# ============================================================

def sync_via_web_app(web_app_url, sheets_payload):
    heading("SYNCING TO GOOGLE DRIVE VIA WEBHOOK")
    print("Connecting to your Google Sheet Web App...")

    try:
        response = requests.post(
            web_app_url,
            json={"sheets": sheets_payload},
            headers={"Content-Type": "application/json"},
            timeout=180,
            allow_redirects=True,
        )

        try:
            result = response.json()
        except Exception:
            result = {"status": "raw", "text": response.text}

        if response.status_code == 200 and result.get("status") == "success":
            heading("SUCCESSFULLY SYNCED TO GOOGLE DRIVE!")
            print("Message        :", result.get("message"))
            print("Spreadsheet    :", result.get("spreadsheetTitle", "DOP Master Industry Database"))
            if result.get("spreadsheetUrl"):
                print("\nView Live Google Sheet:")
                print(result.get("spreadsheetUrl"))
            print(f"\nAccount        : {EXPECTED_EMAIL}")
            print(f"Timestamp      : {result.get('updatedAt', datetime.now().isoformat())}")
            return True
        else:
            print("\nError from Google Sheets Web App:")
            print("HTTP Status :", response.status_code)
            print("Response    :", result)
            return False

    except requests.exceptions.Timeout:
        print("\nRequest timed out. Google Sheets might still be processing large sheets.")
        return False
    except Exception as e:
        print("\nFailed to connect to Web App:", e)
        return False


# ============================================================
# MAIN APPLICATION
# ============================================================

def main():
    heading("SURYANSH.DP - GOOGLE DRIVE DATABASE SYNC")
    print(f"Target Account: Suryansh Gupta ({EXPECTED_EMAIL})")

    if not os.path.exists(DEFAULT_EXCEL_FILE):
        print("\n[ERROR] Master Excel file not found at:", DEFAULT_EXCEL_FILE)
        sys.exit(1)

    cfg = load_config()
    web_app_url = cfg.get("web_app_url", "").strip() or DEFAULT_WEB_APP_URL

    # If argument provided on CLI
    if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
        web_app_url = sys.argv[1].strip()

    if not web_app_url:
        heading("GOOGLE APPS SCRIPT SETUP NEEDED (1 TIME ONLY)")
        print("To sync with zero Google Cloud setup, follow these quick steps:\n")
        print("1. In your browser (logged in as suryanshh.dp@gmail.com):")
        print("   Open https://sheets.new")
        print("2. Name it: DOP Master Industry Database")
        print("3. Click Extensions > Apps Script")
        print("4. Copy & paste the code from: scripts/google_apps_script.js")
        print("5. Click Deploy > New deployment > Web app:")
        print("   - Execute as: Me (suryanshh.dp@gmail.com)")
        print("   - Who has access: Anyone")
        print("6. Click Deploy and copy the Web App URL.")
        print("-" * 65)

        try:
            user_input = input("\nPaste your Web App URL here (or press Enter to exit): ").strip()
            if user_input.startswith("http"):
                web_app_url = user_input
                cfg["web_app_url"] = web_app_url
                save_config(cfg)
                print("Saved Web App URL to scripts/google_sync_config.json!")
            else:
                print("No URL provided. Exiting.")
                return
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            return

    # Extract all 9 worksheets
    sheets_payload = extract_all_sheets(DEFAULT_EXCEL_FILE)

    # Sync
    success = sync_via_web_app(web_app_url, sheets_payload)
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled by user.")
    except Exception as e:
        print("\nUnexpected error:", e)
        sys.exit(1)
