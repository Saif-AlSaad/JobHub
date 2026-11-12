import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

TEAL = RGBColor(15, 118, 110)      # #0F766E
CHARCOAL = RGBColor(28, 25, 23)    # #1C1917
MUTED = RGBColor(87, 83, 78)       # #57534E
WHITE = RGBColor(255, 255, 255)
AMBER = RGBColor(234, 88, 12)      # #EA580C


def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
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


def add_heading(doc, text, size=14, color=TEAL, space_before=14, space_after=6):
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
    p.paragraph_format.space_after = Pt(3)
    rt = p.add_run(title)
    rt.font.name = "Calibri"
    rt.font.size = Pt(10.5)
    rt.font.bold = True
    rt.font.color.rgb = CHARCOAL

    rd = p.add_run(description)
    rd.font.name = "Calibri"
    rd.font.size = Pt(10.5)
    rd.font.color.rgb = MUTED
    return p


def add_styled_table(doc, headers, rows, col_widths, highlight_first_row=False):
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    hdr_row = table.rows[0]
    for j, h in enumerate(headers):
        cell = hdr_row.cells[j]
        cell.width = Inches(col_widths[j])
        set_cell_background(cell, "0F766E")
        set_cell_margins(cell, top=110, bottom=110, left=130, right=130)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Calibri"
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = WHITE

    for i, row_vals in enumerate(rows, start=1):
        row = table.rows[i]
        bg = "F0FDFA" if (highlight_first_row and i == 1) else ("FAF8F5" if i % 2 == 0 else "FFFFFF")
        for j, val in enumerate(row_vals):
            cell = row.cells[j]
            cell.width = Inches(col_widths[j])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=130, right=130)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.2)
            if j == 0:
                r.font.bold = True
                r.font.color.rgb = CHARCOAL
            else:
                r.font.color.rgb = MUTED

    return table


def build_updates_docx(output_path, img_dir):
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Header Badge
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_after = Pt(3)
    rb = p_badge.add_run("JOB HUB  •  FEATURE & ARCHITECTURE CHANGELOG")
    rb.font.name = "Calibri"
    rb.font.size = Pt(9.5)
    rb.font.bold = True
    rb.font.color.rgb = TEAL

    # Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(3)
    rt = p_title.add_run("Profile Module Upgrades & New Features Report")
    rt.font.name = "Calibri"
    rt.font.size = Pt(22)
    rt.font.bold = True
    rt.font.color.rgb = CHARCOAL

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(14)
    rs = p_sub.add_run(
        "Detailed summary of all new profile features, bug fixes, API integrations, and launcher improvements "
        "committed to Nadim and main without altering the backend architecture."
    )
    rs.font.name = "Calibri"
    rs.font.size = Pt(11)
    rs.font.italic = True
    rs.font.color.rgb = MUTED

    # Section 1: Summary & Git Info
    add_heading(doc, "1. Overview & Repository Summary", space_before=6)

    p_ov = doc.add_paragraph(
        "The Profile module (/profile) was expanded to expose and connect all existing backend capabilities in "
        "JobSeekerProfile, RecruiterProfile, NotificationPreference, and the hybrid AI matching engine "
        "(matching_service.py). Zero database schema migrations or breaking API changes were required—every "
        "new UI feature binds cleanly to existing FastAPI endpoints."
    )
    p_ov.paragraph_format.space_after = Pt(8)
    for run in p_ov.runs:
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.color.rgb = CHARCOAL

    add_styled_table(
        doc,
        headers=["Attribute", "Details"],
        rows=[
            ("Commit Hash & Message", "61ddd3b — feat(profile): add experience, projects, certifications, preferences, and alert channels"),
            ("Branches Updated", "Nadim (https://github.com/Saif-AlSaad/JobHub/tree/Nadim) and main (fast-forward merge)"),
            ("Files Changed", "7 files committed (2 new React components, 2 updated frontend files, 3 Windows batch launchers)"),
            ("Architecture Impact", "100% backward compatible — reuses existing FastAPI routes, SQLAlchemy models, and Pydantic schemas"),
        ],
        col_widths=[2.1, 4.8],
    )

    # Section 2: File-by-File Inventory
    add_heading(doc, "2. File-by-File Change Inventory")

    add_styled_table(
        doc,
        headers=["File Path", "Type", "Purpose & Summary of Changes"],
        rows=[
            ("frontend/src/components/ProfileCareerRecords.jsx", "Created (306 lines)",
             "Reusable schema-driven CRUD component for Work/Internship Experience, Portfolio Projects, and Certifications."),
            ("frontend/src/components/ProfilePreferencesCard.jsx", "Created (252 lines)",
             "Career & AI match preferences (employment types, target roles, min match score) plus Email & In-App notification toggles."),
            ("frontend/src/pages/ProfilePage.jsx", "Modified",
             "Added section tabs, Phone & Graduation Year, 255-char Headline, Resume download link, Unsaved Changes badge, live readiness score, user-scoped avatar caching, and Recruiter hub sync."),
            ("frontend/src/services/api.js", "Modified",
             "Added offline/GitHub Pages mock fallback support for /notifications/preferences (GET/PUT) and profile PUT persistence."),
            ("start-all.bat, run-backend.bat, run-frontend.bat", "Modified",
             "Added directory-safe cd /d \"%~dp0...\", conditional venv activation, and auto-launch of http://localhost:5173."),
        ],
        col_widths=[2.5, 1.2, 3.2],
    )

    # Section 3: Detailed Breakdown of New Features
    add_heading(doc, "3. Detailed Breakdown of New Features")

    # 3.1
    add_heading(doc, "3.1 Work Experience, Portfolio Projects & Certifications (ProfileCareerRecords.jsx)", size=12, color=CHARCOAL, space_before=8, space_after=4)
    p_31 = doc.add_paragraph(
        "Previously, the backend stored experience, projects, and certifications JSON arrays in JobSeekerProfile "
        "and scored them inside compute_hybrid_match(), but ProfilePage.jsx offered no UI to view or edit them. "
        "A single parameterized component (SECTION_CONFIGS) now manages all three uniformly:"
    )
    p_31.paragraph_format.space_after = Pt(6)
    for run in p_31.runs:
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.color.rgb = MUTED

    add_bullet(doc, "Work & Internship Experience: ",
               "Inline Add / Edit / Delete forms for Role Title, Company / Organization, Duration, and Key Responsibilities. Directly boosts the AI Education & Experience score.")
    add_bullet(doc, "Portfolio & Capstone Projects: ",
               "Supports Project Title, Repository / Live URL (rendered as a clickable external link), comma-separated Tech Stack (converted cleanly into badge chips), and Project Summary. Having 2+ projects unlocks the backend AI portfolio bonus.")
    add_bullet(doc, "Certifications & Credentials: ",
               "Supports Certification Name, Issuing Organization (e.g., Coursera, AWS), and Year Earned.")
    add_bullet(doc, "Uniform Entry Actions: ",
               "Each card displays an entry count pill, inline editing via Pencil icon, deletion via Trash icon, and clean empty-state prompts.")

    # 3.2
    add_heading(doc, "3.2 Career & AI Match Preferences + Notification Channels (ProfilePreferencesCard.jsx)", size=12, color=CHARCOAL, space_before=10, space_after=4)
    add_bullet(doc, "Preferred Employment Types (Seekers): ",
               "Multi-select toggle pills for Internship, Full-time, Part-time, and Remote. Synced with preferred_job_types, which controls the job-type alignment bonus in matching_service.py.")
    add_bullet(doc, "Target Job Roles (Seekers): ",
               "Interactive role tag input with Enter-key support, removal buttons, and one-click suggestions (Software Engineer, Backend Developer, Frontend Developer, Full-Stack Developer, AI / ML Engineer, DevOps Engineer).")
    add_bullet(doc, "Minimum Match Alert Threshold (Seekers): ",
               "Quick preset selector (50%, 60%, 70%, 80%, 90%) synced across both JobSeekerProfile.min_match_score and NotificationPreference.min_match_score.")
    add_bullet(doc, "Notification Delivery Channels (Seekers & Recruiters): ",
               "Checkboxes for Email Digest & Match Alerts (email_alerts) and In-App Real-Time Alerts (in_app_alerts), loaded from and saved to /api/v1/notifications/preferences.")

    # 3.3
    add_heading(doc, "3.3 Profile Page Enhancements & Bug Fixes (ProfilePage.jsx)", size=12, color=CHARCOAL, space_before=10, space_after=4)
    add_bullet(doc, "New Candidate Credential Fields: ",
               "Added Phone / WhatsApp input and editable Graduation Year input (replacing the previously hardcoded 2026). Separated Headline from bio with a 255-character counter matching the SQLAlchemy String(255) column.")
    add_bullet(doc, "Resume Download / View Action: ",
               "When resume_url exists on the profile, a Download button appears next to the Active Document badge pointing to the FastAPI static /uploads mount.")
    add_bullet(doc, "Section Navigation Pill Tabs: ",
               "Added a responsive tab bar below the hero banner (All Sections, Credentials & Skills, Experience & Projects, Matching & Alerts for Seekers; All Sections, Company & Stack, Radar & Alerts for Recruiters) with live item counts.")
    add_bullet(doc, "Unsaved Changes Indicator & Parallel Save: ",
               "Tracks form dirtiness (isDirty) and displays an 'Unsaved changes' pill near the Save CTA. Clicking Save persists both /seekers/profile (or /recruiter/profile) and /notifications/preferences concurrently via Promise.all.")
    add_bullet(doc, "Synced Placement Readiness Score: ",
               "Updated computeReadinessScore() to mirror the backend /seekers/dashboard-summary formula (base 30% + 20% for 4+ skills + 15% for education + 15% for 1+ project + 10% for 1+ experience + 10% for resume/avatar).")
    add_bullet(doc, "User-Scoped Avatar Cache Fix: ",
               "Replaced the global jobhub_user_avatar key with a user-scoped key (jobhub_user_avatar_${user?.id || user?.role}) and prioritized server avatar_url first, preventing one account's photo from bleeding into another when switching roles.")
    add_bullet(doc, "Recruiter Hub & Founded Year Fix: ",
               "Wired the Recruiter Company Office / Hiring Anchor Hub selector to read company.location_name and persist company_location via PUT /recruiter/profile, and displayed company_founded_year (e.g., Est. 2018) in the hero card.")

    # 3.4
    add_heading(doc, "3.4 Offline Fallback & Windows Launchers (api.js & .bat files)", size=12, color=CHARCOAL, space_before=10, space_after=4)
    add_bullet(doc, "Mock Fallback Route Ordering & Persistence (api.js): ",
               "Added dedicated /notifications/preferences GET/PUT handling before the generic /notifications check, and enabled localStorage persistence for PUT /seekers/profile and PUT /recruiter/profile in static/offline preview mode.")
    add_bullet(doc, "Windows Launcher Reliability (.bat files): ",
               "Updated start-all.bat, run-backend.bat, and run-frontend.bat to use cd /d \"%~dp0...\", check if venv\\Scripts\\activate.bat exists before calling it, and open http://localhost:5173 automatically.")

    # Section 4: Backend Integration Mapping
    add_heading(doc, "4. Backend-to-Frontend Integration Matrix")

    add_styled_table(
        doc,
        headers=["New UI Feature", "Backend Endpoint", "Model / Column", "AI Matching / System Effect"],
        rows=[
            ("Experience & Projects", "GET/PUT /seekers/profile", "JobSeekerProfile.experience, projects", "Feeds TF-IDF semantic doc & exp_edu_score (+5% for 2+ projects)"),
            ("Certifications", "GET/PUT /seekers/profile", "JobSeekerProfile.certifications", "Stored as structured JSON credential cards"),
            ("Phone & Graduation Year", "GET/PUT /seekers/profile", "JobSeekerProfile.phone, education[0].graduation_year", "Replaces hardcoded 2026; populates contact info"),
            ("Job Types & Target Roles", "GET/PUT /seekers/profile", "preferred_job_types, preferred_roles", "Controls job-type match bonus (+5 / -10 pts) in matching_service.py"),
            ("Min Match Score & Alert Toggles", "GET/PUT /notifications/preferences", "NotificationPreference.min_match_score, email_alerts, in_app_alerts", "Filters smart placement alerts & delivery channels"),
            ("Resume Download Button", "GET /uploads/{filename}", "JobSeekerProfile.resume_url", "Serves uploaded PDF/DOCX via FastAPI StaticFiles"),
            ("Recruiter Hub & Founded Year", "GET/PUT /recruiter/profile", "Company.location_name, founded_year", "Syncs office hub selection and displays founding year"),
        ],
        col_widths=[1.6, 1.7, 1.8, 1.8],
    )

    # Section 5: Verification
    add_heading(doc, "5. Build, Lint & Live Browser Verification")

    add_bullet(doc, "Production Vite Build: ",
               "Executed npm run build in frontend/ — succeeded with exit code 0 (1984 modules transformed in 12.22s).")
    add_bullet(doc, "Oxlint Static Analysis: ",
               "Executed npx oxlint across ProfilePage.jsx, ProfileCareerRecords.jsx, ProfilePreferencesCard.jsx, and api.js — 0 errors reported (0 warnings on both new components).")
    add_bullet(doc, "Playwright End-to-End Check: ",
               "Verified live against http://localhost:5173 and http://localhost:8000: Seeker profile (Sarah Rahman) loaded all seeded records, toggled '+ Remote', saved via PUT /seekers/profile and PUT /notifications/preferences ('Profile Updated Successfully'), and Recruiter profile (Tanvir Ahmed / TechNova Labs) loaded cleanly with zero new console errors.")

    # Section 6: Screenshot
    img_path = os.path.join(img_dir, "09_updated_seeker_profile_full.png")
    if os.path.exists(img_path):
        add_heading(doc, "6. Updated Profile Page Visual Preview")
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(4)
        p_img.add_run().add_picture(img_path, width=Inches(6.2))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        rc = p_cap.add_run("Figure 1: Upgraded Job Seeker Profile (/profile) showing Section Tabs, Resume Download, Phone & Graduation Year, Experience, Projects, Certifications, Career Preferences, and Notification Channels.")
        rc.font.name = "Calibri"
        rc.font.size = Pt(9)
        rc.font.italic = True
        rc.font.color.rgb = MUTED

    doc.save(output_path)
    print(f"Created {output_path}")


if __name__ == "__main__":
    build_updates_docx(
        r"D:\Capstone job hub\docs\JobHub_Profile_Updates_Details.docx",
        r"D:\Capstone job hub\docs\assessment1_screenshots",
    )

