import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

# Palette
TEAL = RGBColor(15, 118, 110)       # #0F766E
DARK_TEAL = RGBColor(17, 94, 89)    # #115E59
ORANGE = RGBColor(249, 115, 22)     # #F97316
AMBER = RGBColor(234, 88, 12)       # #EA580C
CHARCOAL = RGBColor(28, 25, 23)     # #1C1917
MUTED = RGBColor(87, 83, 78)        # #57534E
LIGHT_BG = "FAF8F5"
WHITE = RGBColor(255, 255, 255)
BORDER_GRAY = "E7E5E4"


def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)


def set_table_borders(table, color="D6D3D1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)


def add_heading(doc, text, size=14, color=TEAL, space_before=16, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = color
    return p


def add_bullet(doc, title, description):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(4)
    rt = p.add_run(title + ": ")
    rt.font.name = "Calibri"
    rt.font.size = Pt(10.5)
    rt.font.bold = True
    rt.font.color.rgb = CHARCOAL

    rd = p.add_run(description)
    rd.font.name = "Calibri"
    rd.font.size = Pt(10.5)
    rd.font.color.rgb = MUTED
    return p


def add_styled_table(doc, headers, rows, col_widths):
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    hdr_row = table.rows[0]
    for j, h in enumerate(headers):
        cell = hdr_row.cells[j]
        cell.width = Inches(col_widths[j])
        set_cell_background(cell, "0F766E")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Calibri"
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = WHITE

    for i, row_vals in enumerate(rows, start=1):
        row = table.rows[i]
        bg = "FAF8F5" if i % 2 == 0 else "FFFFFF"
        for j, val in enumerate(row_vals):
            cell = row.cells[j]
            cell.width = Inches(col_widths[j])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(str(val))
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = CHARCOAL


def generate_recent_changes_report(output_path):
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    # Document Header Box / Title Card
    header_table = doc.add_table(rows=1, cols=1)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = header_table.rows[0].cells[0]
    cell.width = Inches(6.8)
    set_cell_background(cell, "0F766E")
    set_cell_margins(cell, top=200, bottom=200, left=220, right=220)

    p_badge = cell.paragraphs[0]
    r_badge = p_badge.add_run("JOBHUB PLATFORM • ENGINEERING REPORT")
    r_badge.font.name = "Calibri"
    r_badge.font.size = Pt(9.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = RGBColor(204, 251, 241)

    p_title = cell.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("Recent Project Changes, Bug Fixes & Architecture Report")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(19)
    r_title.font.bold = True
    r_title.font.color.rgb = WHITE

    p_sub = cell.add_paragraph()
    r_sub = p_sub.add_run("Detailed breakdown of recent platform enhancements, recruiter onboarding pipeline, CORS resolution, database schema migrations, and frontend stabilization.")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10.5)
    r_sub.font.color.rgb = RGBColor(240, 253, 250)

    p_meta = cell.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(8)
    r_meta = p_meta.add_run("Date: November 2026   |   Environment: Windows 11, FastAPI, Vite React 19, SQLite   |   Status: Fully Operational")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(9)
    r_meta.font.color.rgb = RGBColor(153, 246, 228)

    # 1. Executive Summary
    add_heading(doc, "1. Executive Summary", size=14, color=TEAL, space_before=18)
    p_exec = doc.add_paragraph()
    p_exec.paragraph_format.space_after = Pt(8)
    r_exec = p_exec.add_run(
        "This report provides an exhaustive, line-by-line summary of all recent architectural and functional "
        "modifications made to the JobHub platform. These modifications successfully resolved startup dependency crashes, "
        "implemented the complete Job Recruiter Registration and Onboarding lifecycle with empty initial state enforcement, "
        "fixed critical database schema inconsistencies from recent pull requests, resolved strict browser CORS rejections, "
        "and established reliable route protection guards. All updates were completed while strictly preserving the main "
        "system architecture (FastAPI backend + Vite React 19 frontend with dual live and offline-resilient operational modes)."
    )
    r_exec.font.name = "Calibri"
    r_exec.font.size = Pt(10.5)
    r_exec.font.color.rgb = CHARCOAL

    # 2. Master Table of Modified Files
    add_heading(doc, "2. Summary of Modified Files & Components", size=13, color=TEAL)
    file_headers = ["Component / File", "Scope", "Primary Role & Change Overview"]
    file_rows = [
        ["frontend/package.json", "Frontend Config", "Added @supabase/supabase-js dependency; resolved npm install sync."],
        ["frontend/src/pages/RegisterPage.jsx", "Frontend Page", "Redirects recruiters to #/profile; added form field validation."],
        ["frontend/src/pages/ProfilePage.jsx", "Frontend Page", "Clean empty initial state for recruiters; setup banner; readiness score; save handler."],
        ["frontend/src/pages/RecruiterDashboard.jsx", "Frontend Page", "Safe metric binding for active jobs, applications, under review, and pipeline."],
        ["frontend/src/App.jsx", "Routing & Guards", "Enforced recruiter onboarding guard in ProtectedLayout blocking premature dashboard access."],
        ["frontend/src/components/Navbar.jsx", "Navigation", "Added dynamic recruiter setup warning badge; hides recruiter links until profile complete."],
        ["frontend/src/context/AuthContext.jsx", "Auth State", "Extended isProfileComplete to recruiters; synchronized session persistence."],
        ["frontend/src/services/api.js", "API Client", "Updated offline mock fallbacks to respect recruiter profile_completed: false."],
        ["backend/app/main.py", "FastAPI Core", "Fixed CORS allow_origins=* conflict with allow_credentials=True via regex origin matching."],
        ["backend/app/database.py", "Database Engine", "Added safe column migration for supabase_uid, profile_completed, skills; enabled SQLite foreign keys."],
        ["backend/app/models/models.py", "SQLAlchemy Models", "Added profile_completed and skills columns to RecruiterProfile."],
        ["backend/app/schemas/schemas.py", "Pydantic Schemas", "Added skills, profile_completed, company_founded_year to Recruiter schemas."],
        ["backend/app/api/auth.py", "Backend Auth API", "Recruiter validation; clean empty initial profile on signup; accurate profile_completed reporting."],
        ["backend/app/api/recruiters.py", "Recruiter API", "Removed hardcoded Sabrina Rahman/TechNova defaults; updated profile PUT & stats endpoints."],
        ["backend/app/auth/supabase_auth.py", "Supabase Provision", "Ensured auto-provisioning creates empty profile with profile_completed: false."]
    ]
    add_styled_table(doc, file_headers, file_rows, [2.1, 1.2, 3.5])

    # 3. Detailed Breakdown by Architectural Domain
    add_heading(doc, "3. Detailed Breakdown of Recent Modifications", size=14, color=TEAL)

    add_heading(doc, "3.1. Job Recruiter Registration & Mandatory Profile Onboarding Flow", size=11.5, color=DARK_TEAL, space_before=8)
    add_bullet(doc, "Post-Registration Redirection", "Previously, successful recruiter registration redirected to the root dashboard (/). The flow was rewritten in RegisterPage.jsx line 127 to immediately route newly registered recruiters to #/profile.")
    add_bullet(doc, "Comprehensive Input Validation", "Enforced client-side and server-side validation in RegisterPage.jsx and auth.py requiring valid full name, business email format, minimum 6-character password, matching password confirmation, and company/organization name.")
    add_bullet(doc, "Clean Empty State Guarantee", "Removed hardcoded demo fallbacks (Sabrina Rahman, TechNova Labs, Lead Technical Talent Partner, +880 1819-876543, 50-200 employees, 2018). Newly registered recruiters now open a pristine profile showing only registered name, company, and email.")
    add_bullet(doc, "Dynamic Profile Completion Guard", "Added a route guard inside ProtectedLayout (App.jsx). Recruiters with incomplete profiles attempting to navigate to the Recruiter Dashboard (/), Post Job (/recruiter/post-job), or Explore are strictly redirected back to #/profile.")
    add_bullet(doc, "Visual Onboarding Banner", "Introduced a dedicated setup notice card in ProfilePage.jsx alerting recruiters that corporate profile configuration is required to unlock AI talent matching and job postings.")
    add_bullet(doc, "Readiness Score Re-calibration", "Adjusted computeReadinessScore to start from 0% and accurately increment as the recruiter completes designation, phone, industry, description, website, and technical skills.")

    add_heading(doc, "3.2. Backend API & Authentication Infrastructure", size=11.5, color=DARK_TEAL, space_before=10)
    add_bullet(doc, "Recruiter Profile Endpoints", "Refactored GET /recruiter/profile and PUT /recruiter/profile in recruiters.py to return clean database records and allow updating full_name, designation, phone, avatar_url, skills, company name, industry, website, size, founded year, and description.")
    add_bullet(doc, "Accurate Completion Tracking", "Added profile_completed column to RecruiterProfile model, schemas, /auth/me, /auth/register, and /auth/login endpoints, ensuring parity with job seeker tracking.")
    add_bullet(doc, "Recruiter Dashboard Metrics Synchronization", "Enhanced GET /recruiter/dashboard in recruiters.py to return active_jobs, total_applications, total_applicants, shortlisted, under_review, interviews_scheduled, and average_match.")
    add_bullet(doc, "Safe Notification Preferences", "Protected /auth/register from SQLite UniqueConstraint errors by verifying existing preference records before insertion.")

    add_heading(doc, "3.3. Database Schema Migrations & Integrity", size=11.5, color=DARK_TEAL, space_before=10)
    add_bullet(doc, "Missing Column Migration (users.supabase_uid)", "A recent pull request introduced supabase_uid to the User model without updating existing SQLite databases, breaking all authentication queries. Added safe idempotent migrations in database.py executing ALTER TABLE users ADD COLUMN supabase_uid VARCHAR(64).")
    add_bullet(doc, "Recruiter Schema Columns", "Added migrations in database.py adding profile_completed BOOLEAN DEFAULT 0 and skills TEXT DEFAULT '[]' to recruiter_profiles.")
    add_bullet(doc, "SQLite Foreign Key Enforcement", "Attached a SQLAlchemy engine connection listener in database.py executing PRAGMA foreign_keys=ON to enforce cascade deletions and prevent orphaned relational records.")

    add_heading(doc, "3.4. CORS & Network Security Stabilization", size=11.5, color=DARK_TEAL, space_before=10)
    add_bullet(doc, "CORS Middleware Conflict Resolution", "FastAPI in main.py had allow_origins=['*'] coupled with allow_credentials=True. W3C CORS standards cause browsers to reject responses containing credentials with wildcard origins. Fixed by specifying origins and using allow_origin_regex=r'https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?'.")

    add_heading(doc, "3.5. Frontend Dependency & Package Integrity", size=11.5, color=DARK_TEAL, space_before=10)
    add_bullet(doc, "Supabase Client Dependency", "Installed missing @supabase/supabase-js in frontend/node_modules, resolving Vite's HMR compilation failure [plugin:vite:import-analysis] Failed to resolve import @supabase/supabase-js.")
    add_bullet(doc, "Missing Icon Import Fix", "Fixed missing ArrowRight import from lucide-react in ProfilePage.jsx.")
    add_bullet(doc, "Vite Production Build Verification", "Executed npm run build, validating zero compilation errors across all 2,032 modules.")

    # 4. End-to-End Verification Matrix
    add_heading(doc, "4. Verification & Testing Evidence", size=14, color=TEAL, space_before=16)
    p_test = doc.add_paragraph()
    p_test.paragraph_format.space_after = Pt(8)
    r_test = p_test.add_run(
        "The following validation checklist was executed through both direct automated backend HTTP requests and "
        "headless browser automation using the Playwright testing engine:"
    )
    r_test.font.name = "Calibri"
    r_test.font.size = Pt(10.5)
    r_test.font.color.rgb = CHARCOAL

    test_headers = ["Step", "Scenario Description", "Expected Behavior", "Actual Observed Result", "Status"]
    test_rows = [
        ["1", "Recruiter Signup", "Enter name, company, email, pass.", "User created with profile_completed: false.", "PASS"],
        ["2", "Post-Reg Navigation", "Redirect upon submit.", "Navigated directly to #/profile.", "PASS"],
        ["3", "Initial Profile State", "Inspect profile fields.", "Full name, company, email filled; rest empty.", "PASS"],
        ["4", "Setup Warning", "Check header & profile alert.", "'Recruiter Profile Setup Required' shown.", "PASS"],
        ["5", "Guard Restriction", "Try navigating to #/ or #/recruiter/post-job.", "Both attempts blocked and redirected to #/profile.", "PASS"],
        ["6", "Profile Submission", "Fill designation, phone, industry, stack, save.", "Saved with status: success, profile_completed: true.", "PASS"],
        ["7", "Dashboard Access", "Navigate to #/ (Recruiter Dashboard).", "Dashboard loaded with company tag & 0 active jobs.", "PASS"],
        ["8", "Post Job Access", "Navigate to #/recruiter/post-job.", "Job posting studio loaded with full operational access.", "PASS"]
    ]
    add_styled_table(doc, test_headers, test_rows, [0.5, 1.4, 1.7, 2.7, 0.5])

    # 5. Architecture Preservation Confirmation
    add_heading(doc, "5. Architecture Compliance Confirmation", size=14, color=TEAL, space_before=16)
    p_arch = doc.add_paragraph()
    r_arch = p_arch.add_run(
        "Strict adherence to the core architectural principles was maintained throughout all modifications:\n"
        "• Decoupled Architecture: FastAPI REST API serves strictly JSON payloads; Vite React 19 handles all client routing and state.\n"
        "• Non-Breaking Database Compatibility: All SQLite migrations are backward-compatible and idempotent.\n"
        "• Dual Operation Mode: The frontend continues to support both live backend connectivity and offline static demo mock data fallback.\n"
        "• Messaging Module Isolation: MessagesPage.jsx and WebSocket chat services remained completely untouched as instructed."
    )
    r_arch.font.name = "Calibri"
    r_arch.font.size = Pt(10)
    r_arch.font.color.rgb = CHARCOAL

    # Save document
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")


if __name__ == "__main__":
    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "JobHub_Recent_Changes_And_Fixes_Report.docx"))
    generate_recent_changes_report(out_file)
