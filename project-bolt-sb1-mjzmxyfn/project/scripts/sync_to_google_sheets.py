import os
import sys
import json
import subprocess
import importlib.util
from datetime import datetime, date, time, timedelta

# ============================================================
# CONFIGURATION
# ============================================================

# Target Google Account for Suryansh
EXPECTED_EMAIL = "suryanshh.dp@gmail.com"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
CONFIG_FILE = os.path.join(BASE_DIR, "google_sync_config.json")
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
TOKEN_FILE = os.path.join(BASE_DIR, "token.json")

# Default master Excel file in the project
DEFAULT_EXCEL_FILE = os.path.join(
    PROJECT_DIR, "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx"
)

# Load or initialize saved spreadsheet ID
saved_spreadsheet_id = ""
if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            cfg = json.load(f)
            saved_spreadsheet_id = cfg.get("spreadsheet_id", "")
    except Exception:
        pass

SPREADSHEET_ID = saved_spreadsheet_id or "1aLBYrKasZcRTTA4N8v1V4LNWyXX_Uk0Y7tAy-Gdh1uU"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]


# ============================================================
# DEPENDENCY CHECK
# ============================================================

def install_dependencies():
    packages = {
        "openpyxl": "openpyxl",
        "gspread": "gspread",
        "google.auth": "google-auth",
        "google_auth_oauthlib": "google-auth-oauthlib",
        "requests": "requests",
    }
    for module, package in packages.items():
        if importlib.util.find_spec(module) is None:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])


install_dependencies()

import openpyxl
import gspread
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request


# ============================================================
# DISPLAY UTILITIES
# ============================================================

def heading(text):
    print("\n" + "=" * 65)
    print(text.center(65))
    print("=" * 65)


def error_exit(message):
    print("\n[ERROR]:", message, flush=True)
    if "--gui" in sys.argv:
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            root.attributes("-topmost", True)
            messagebox.showerror("Sync Failed", message)
            root.destroy()
        except Exception:
            pass
    sys.exit(1)


# ============================================================
# GOOGLE ACCOUNT AUTHENTICATION
# ============================================================

def authenticate_google():
    heading("GOOGLE ACCOUNT AUTHENTICATION")

    if not os.path.exists(CREDENTIALS_FILE):
        error_exit(
            f"credentials.json is missing!\n\n"
            f"To connect to Google Drive ({EXPECTED_EMAIL}):\n"
            f"1. Go to Google Cloud Console (https://console.cloud.google.com)\n"
            f"2. Enable Google Sheets API & Google Drive API\n"
            f"3. Create OAuth 2.0 Client ID (Application Type: Desktop app)\n"
            f"4. Download JSON and save it as:\n   {CREDENTIALS_FILE}\n\n"
            f"Once placed, re-run this script to log in."
        )

    creds = None

    # Load previous login token if valid
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        except Exception:
            creds = None

    # Refresh expired credentials
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception:
            creds = None

    # First login or invalid token: open browser
    if not creds or not creds.valid:
        print("\nOpening browser for Google login...")
        print(f"Please log in using: {EXPECTED_EMAIL}")
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        creds = flow.run_local_server(port=0, prompt="select_account")

        with open(TOKEN_FILE, "w", encoding="utf-8") as token:
            token.write(creds.to_json())

    # Verify actual Google identity
    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {creds.token}"},
        timeout=30,
    )
    response.raise_for_status()
    account = response.json()

    actual_email = account.get("email", "")
    verified = account.get("verified_email", False)

    print("\nExpected account :", EXPECTED_EMAIL)
    print("Authenticated as:", actual_email)
    print("Email verified  :", verified)

    # Strict account verification to ensure it's Suryansh's account
    if not verified:
        error_exit("Google email verification failed.")

    if actual_email.lower() != EXPECTED_EMAIL.lower():
        error_exit(
            "WRONG GOOGLE ACCOUNT LOGGED IN!\n\n"
            f"Expected: {EXPECTED_EMAIL}\n"
            f"Logged in: {actual_email}\n\n"
            "Please log in with the correct account shown above."
        )

    print("\nSUCCESS: Verified Google Account (Suryansh Gupta).")
    return gspread.authorize(creds)


# ============================================================
# SELECT LOCAL EXCEL FILE
# ============================================================

def select_excel():
    heading("LOCATING MASTER EXCEL DATABASE")

    if os.path.exists(DEFAULT_EXCEL_FILE):
        print(f"Found master database:\n-> {DEFAULT_EXCEL_FILE}")
        return DEFAULT_EXCEL_FILE

    # Fallback to dialog if default not found
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        file_path = filedialog.askopenfilename(
            title="Select your Excel workbook",
            filetypes=[("Excel Workbook", "*.xlsx"), ("Excel Macro Workbook", "*.xlsm")],
        )
        root.destroy()
        if file_path:
            return file_path
    except Exception:
        pass

    error_exit(f"Excel file not found at: {DEFAULT_EXCEL_FILE}")


# ============================================================
# CLEAN EXCEL VALUES
# ============================================================

def clean_value(value):
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, timedelta):
        return str(value)
    if value is None:
        return ""
    return value


def extract_sheet_data(sheet):
    data = []
    for row in sheet.iter_rows(values_only=True):
        cleaned = [clean_value(v) for v in row]
        data.append(cleaned)

    # Remove trailing empty rows
    while data and all(v == "" for v in data[-1]):
        data.pop()

    # Remove trailing empty columns
    if data:
        while all(row and row[-1] == "" for row in data):
            for row in data:
                row.pop()

    return data


# ============================================================
# VERIFY OR CREATE DESTINATION SPREADSHEET
# ============================================================

def get_or_create_destination(gc):
    heading("VERIFYING GOOGLE SHEETS DESTINATION")

    spreadsheet = None
    if SPREADSHEET_ID:
        try:
            spreadsheet = gc.open_by_key(SPREADSHEET_ID)
            print("Connected to existing spreadsheet:")
            print("Title:", spreadsheet.title)
            print("ID   :", spreadsheet.id)
            return spreadsheet
        except Exception as e:
            print(f"Notice: Cannot open spreadsheet ID '{SPREADSHEET_ID}' ({e})")
            print("Will search or create 'DOP Master Industry Database'...")

    # Search if already created in user's Drive
    try:
        matched = gc.open("DOP Master Industry Database")
        if matched:
            print(f"Found existing spreadsheet: {matched.title} ({matched.id})")
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump({"spreadsheet_id": matched.id}, f, indent=2)
            return matched
    except Exception:
        pass

    # Create new Google Spreadsheet in Suryansh's Google Drive
    print(f"Creating new Google Spreadsheet for {EXPECTED_EMAIL}...")
    spreadsheet = gc.create("DOP Master Industry Database")
    print("Created new spreadsheet!")
    print("Title:", spreadsheet.title)
    print("ID   :", spreadsheet.id)

    # Save ID so future syncs update this exact spreadsheet
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump({"spreadsheet_id": spreadsheet.id}, f, indent=2)

    return spreadsheet


# ============================================================
# UPLOAD WORKBOOK
# ============================================================

def upload_workbook(spreadsheet, file_path):
    heading("READING LOCAL EXCEL WORKBOOK")

    try:
        workbook = openpyxl.load_workbook(file_path, data_only=True)
    except Exception as e:
        error_exit(f"Unable to read Excel workbook: {e}")

    print("Worksheets detected:", len(workbook.sheetnames))
    for name in workbook.sheetnames:
        print(" -", name)

    existing_sheets = {sheet.title: sheet for sheet in spreadsheet.worksheets()}
    successful = []
    failed = []

    heading("SYNCING WORKSHEETS TO GOOGLE DRIVE")

    for excel_sheet in workbook.worksheets:
        sheet_name = excel_sheet.title
        print(f"\nProcessing: {sheet_name}...")

        try:
            data = extract_sheet_data(excel_sheet)
            rows = max(1, len(data))
            columns = max(1, max((len(row) for row in data), default=1))

            if sheet_name in existing_sheets:
                google_sheet = existing_sheets[sheet_name]
                print(f"Updating existing worksheet '{sheet_name}'...")
            else:
                print(f"Creating worksheet '{sheet_name}'...")
                google_sheet = spreadsheet.add_worksheet(title=sheet_name, rows=rows, cols=columns)

            google_sheet.resize(rows=rows, cols=columns)
            google_sheet.clear()

            if data:
                google_sheet.update(
                    values=data,
                    range_name="A1",
                    value_input_option="USER_ENTERED",
                )

            successful.append(sheet_name)
            print(f"  -> SUCCESS: {sheet_name} ({rows} rows, {columns} cols)")

        except Exception as e:
            failed.append((sheet_name, str(e)))
            print(f"  -> FAILED: {sheet_name}")
            print("     Reason:", e)

    # Remove default 'Sheet1' if it was left empty
    try:
        if "Sheet1" in existing_sheets and "Sheet1" not in workbook.sheetnames and len(spreadsheet.worksheets()) > 1:
            spreadsheet.del_worksheet(existing_sheets["Sheet1"])
    except Exception:
        pass

    # Final report
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet.id}/edit"

    heading("SYNC COMPLETE")
    print("Spreadsheet Title :", spreadsheet.title)
    print("Google Account    :", EXPECTED_EMAIL)
    print("Successful Sheets :", len(successful))
    print("Failed Sheets     :", len(failed))
    print(f"\nLive Google Sheet URL:\n{url}\n")

    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        if failed:
            messagebox.showwarning(
                "Sync Partially Completed",
                f"Synced {len(successful)} of {len(workbook.sheetnames)} sheets.\nCheck terminal for details.",
            )
        else:
            messagebox.showinfo(
                "Sync Successful!",
                f"Database successfully synced to Google Drive!\n\nAccount: {EXPECTED_EMAIL}\nSheets: {len(successful)}\n\nURL: {url}",
            )
        root.destroy()
    except Exception:
        pass


# ============================================================
# MAIN APPLICATION
# ============================================================

def main():
    heading("SURYANSH.DP - EXCEL TO GOOGLE DRIVE SYNC")
    print(f"Configured for: Suryansh Gupta ({EXPECTED_EMAIL})")

    gc = authenticate_google()
    file_path = select_excel()
    spreadsheet = get_or_create_destination(gc)
    upload_workbook(spreadsheet, file_path)
    heading("PROCESS FINISHED SUCCESSFULLY")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
    except Exception as e:
        error_exit(str(e))
