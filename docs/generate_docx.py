import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
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

def build_docx(output_path, img_dir):
    doc = Document()
    
    # Page Setup
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    # Styles
    TEAL = RGBColor(15, 118, 110)      # #0F766E
    CHARCOAL = RGBColor(28, 25, 23)     # #1C1917
    MUTED = RGBColor(87, 83, 78)        # #57534E
    WHITE = RGBColor(255, 255, 255)
    AMBER = RGBColor(234, 88, 12)       # #EA580C

    # Title Banner / Pill
    p_badge = doc.add_paragraph()
    r_badge = p_badge.add_run("SE331 CONTINUOUS ASSESSMENT 1 (CA1)")
    r_badge.font.name = "Calibri"
    r_badge.font.size = Pt(9.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = TEAL
    p_badge.paragraph_format.space_after = Pt(4)

    # Document Title
    p_title = doc.add_paragraph()
    r_title = p_title.add_run("Individual Prototype & UI/UX Design Submission")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = CHARCOAL
    p_title.paragraph_format.space_after = Pt(2)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Assigned Module: User Registration, Profile Management & Onboarding Hub")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = MUTED
    p_sub.paragraph_format.space_after = Pt(16)

    # Section 1: Metadata Table
    p_h1 = doc.add_paragraph()
    r_h1 = p_h1.add_run("1. Student & Project Metadata")
    r_h1.font.name = "Calibri"
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = TEAL
    p_h1.paragraph_format.space_after = Pt(6)

    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table)

    meta_data = [
        ("Student Name", "Nadim"),
        ("Student ID", "[Insert Your Student ID — e.g. 211-35-XXXX]"),
        ("Course Code & Title", "SE331 – Software Engineering"),
        ("Project Name", "JOB HUB — AI-Powered Smart Placement & Semantic Matching Platform"),
        ("Assigned Git Branch", "https://github.com/Saif-AlSaad/JobHub/tree/Nadim"),
        ("Live Interactive Demo", "https://saif-alsaad.github.io/JobHub/ (GitHub Pages)")
    ]

    for i, (label, val) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.6)
        set_cell_background(c0, "F5F5F4")
        set_cell_margins(c0, top=100, bottom=100, left=140, right=140)
        set_cell_margins(c1, top=100, bottom=100, left=140, right=140)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = CHARCOAL
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.size = Pt(10)
        if "Insert Your" in val:
            r1.font.color.rgb = AMBER
            r1.font.bold = True
        else:
            r1.font.color.rgb = CHARCOAL

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Section 2: Group Discussion & Page Division
    p_h2 = doc.add_paragraph()
    r_h2 = p_h2.add_run("2. Group Discussion & Page Division Summary")
    r_h2.font.name = "Calibri"
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True
    r_h2.font.color.rgb = TEAL
    p_h2.paragraph_format.space_after = Pt(6)

    p_div_desc = doc.add_paragraph(
        "During the group discussion phase, our team (Saif, Nadim, Rizvi) inventoried all required platform modules "
        "and partitioned the screens equally to ensure individual accountability and clean separation of concerns:"
    )
    p_div_desc.paragraph_format.space_after = Pt(8)

    div_table = doc.add_table(rows=4, cols=3)
    div_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(div_table)

    headers = ["Team Member", "Assigned Module & Screens", "Core Design Responsibilities"]
    hdr_row = div_table.rows[0]
    for j, h in enumerate(headers):
        cell = hdr_row.cells[j]
        set_cell_background(cell, "0F766E")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = WHITE

    div_data = [
        ("Nadim (Me)",
         "User Onboarding & Profile Ecosystem\n• User Registration Page (/register)\n• Profile & Resume Studio (/profile)\n• Role Gateway & Sign In (/login)",
         "Dual-role sign up (Seeker/Recruiter), dynamic password strength entropy meter, interactive avatar manager modal, AI resume parser studio, interactive skill taxonomy tags, academic metrics, and geospatial placement radar."),
        ("Saif",
         "Analytics & System Governance\n• Candidate Dashboard (/)\n• Recruiter Pipeline Hub (/recruiter)\n• System Admin Governance (/admin)",
         "Placement metrics scorecards, candidate Kanban pipelines, activity feeds, and platform administration."),
        ("Rizvi",
         "Job Discovery & Application Tracking\n• Jobs Search & Filters (/jobs)\n• Job Details & Match (/jobs/:id)\n• Applications Tracker (/applications)",
         "Search filtering, match score breakdown card, application timeline tracking, and recruiter applicant review.")
    ]

    for i, row_data in enumerate(div_data, start=1):
        row = div_table.rows[i]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(1.3)
        c1.width = Inches(2.5)
        c2.width = Inches(3.0)

        bg_color = "F0FDFA" if i == 1 else "FFFFFF"
        for c in (c0, c1, c2):
            set_cell_background(c, bg_color)
            set_cell_margins(c, top=100, bottom=100, left=120, right=120)

        r0 = c0.paragraphs[0].add_run(row_data[0])
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        if i == 1:
            r0.font.color.rgb = TEAL

        r1 = c1.paragraphs[0].add_run(row_data[1])
        r1.font.size = Pt(9)
        r1.font.color.rgb = CHARCOAL

        r2 = c2.paragraphs[0].add_run(row_data[2])
        r2.font.size = Pt(9)
        r2.font.color.rgb = CHARCOAL

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 3: Detailed Screen-by-Screen Breakdown
    p_h3 = doc.add_paragraph()
    r_h3 = p_h3.add_run("3. Detailed Screen Architecture & Feature Breakdown")
    r_h3.font.name = "Calibri"
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = TEAL
    p_h3.paragraph_format.space_after = Pt(6)

    # 3.1
    p_sub1 = doc.add_paragraph()
    r_sub1 = p_sub1.add_run("3.1 Screen 1: User Registration Page (/register)")
    r_sub1.font.bold = True
    r_sub1.font.size = Pt(11.5)
    r_sub1.font.color.rgb = CHARCOAL
    p_sub1.paragraph_format.space_after = Pt(4)

    bullets_reg = [
        ("Dual-Role Onboarding Switcher: ", "Enables instant role toggling between 'Job Seeker / Student' and 'Recruiter / Employer' directly inside the form. Automatically modifies labels and input fields (e.g. 'Full Name' transitions dynamically to 'Company Name')."),
        ("Dynamic Password Strength Meter: ", "Evaluates password entropy in real-time across four discrete tiers (Weak, Fair, Good, Strong). Visual progress bar changes colors dynamically from Red to Amber, Teal, and Emerald."),
        ("Form Integrity & Accessibility: ", "Interactive Show/Hide password toggles, confirm password equality validation, and integrated Terms of Service consent checkbox."),
        ("Demo Evaluation Helper: ", "Built-in 'Fill sample info' button to immediately populate test data for rapid instructor verification.")
    ]
    for b_title, b_desc in bullets_reg:
        bp = doc.add_paragraph(style='List Bullet')
        r_bt = bp.add_run(b_title)
        r_bt.font.bold = True
        r_bt.font.color.rgb = CHARCOAL
        r_bd = bp.add_run(b_desc)
        r_bd.font.color.rgb = MUTED
        bp.paragraph_format.space_after = Pt(3)

    # 3.2
    p_sub2 = doc.add_paragraph()
    r_sub2 = p_sub2.add_run("3.2 Screen 2: Candidate Profile & Credentials Management (/profile)")
    r_sub2.font.bold = True
    r_sub2.font.size = Pt(11.5)
    r_sub2.font.color.rgb = CHARCOAL
    p_sub2.paragraph_format.space_before = Pt(8)
    p_sub2.paragraph_format.space_after = Pt(4)

    bullets_prof = [
        ("Interactive Avatar Studio: ", "Features custom photo uploads with client-side HTML5 Canvas compression (< 100 KB payload) and an interactive 'Choose Sample Avatar' modal offering curated professional headshot presets."),
        ("AI Resume Parser Studio: ", "Drag-and-drop or file upload supporting PDF/DOCX (up to 5 MB) with automated extraction into academic degree, CGPA, graduation data, and skills."),
        ("Interactive Skills Taxonomy Manager: ", "Removable skill chips with instant deletion (×), custom skill entry with keyboard Enter support, and one-click suggested presets (+ TypeScript, + AWS) with live taxonomy counters."),
        ("Academic Background & CGPA Metrics: ", "Direct inputs for University, Major, Degree, Cumulative CGPA spinbutton, and candidate bio."),
        ("Geospatial Placement Radar: ", "Campus/urban anchor selection (Banani, Savar / DIU Smart City, Mohakhali, Dhanmondi, etc.) and proximity radius selector (2 km, 5 km, 10 km, 20 km) using privacy-preserving Haversine equations."),
        ("Dual Recruiter Mode: ", "When logged in as a corporate recruiter, the profile dynamically adapts into an employer management hub (company size, industry, corporate website, office location anchor).")
    ]
    for b_title, b_desc in bullets_prof:
        bp = doc.add_paragraph(style='List Bullet')
        r_bt = bp.add_run(b_title)
        r_bt.font.bold = True
        r_bt.font.color.rgb = CHARCOAL
        r_bd = bp.add_run(b_desc)
        r_bd.font.color.rgb = MUTED
        bp.paragraph_format.space_after = Pt(3)

    # Section 4: UI/UX Design System Specification
    p_h4 = doc.add_paragraph()
    r_h4 = p_h4.add_run("4. UI/UX Design System Specification")
    r_h4.font.name = "Calibri"
    r_h4.font.size = Pt(14)
    r_h4.font.bold = True
    r_h4.font.color.rgb = TEAL
    p_h4.paragraph_format.space_before = Pt(8)
    p_h4.paragraph_format.space_after = Pt(6)

    spec_table = doc.add_table(rows=5, cols=2)
    spec_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(spec_table)

    specs = [
        ("Design Language", "Nordic Clean & Human-Centric Minimalism"),
        ("Color Palette", "Warm Canvas (#FAF8F5), Deep Charcoal Text (#1C1917), Muted Slate (#57534E / #E7E5E4), Candidate Teal (#0F766E), Recruiter Amber (#EA580C), Success Emerald (#059669)."),
        ("Typography", "Modern System Sans-Serif (Inter / Calibri hierarchy: 24-26px H1, 18-20px H2, 13-14px Body, 11-12px Microcopy)."),
        ("Micro-Interactions", "Active scale compression (active:scale-95), smooth 200ms transitions, focus ring outlines for accessible keyboard navigation."),
        ("Accessibility (a11y)", "Strict adherence to WCAG 2.1 AA color contrast and visible outline rings on keyboard focus.")
    ]

    for i, (k, v) in enumerate(specs):
        row = spec_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.0)
        c1.width = Inches(4.8)
        set_cell_background(c0, "F5F5F4")
        set_cell_margins(c0, top=100, bottom=100, left=140, right=140)
        set_cell_margins(c1, top=100, bottom=100, left=140, right=140)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    # Section 5: High-Resolution Screenshot Evidence
    p_h5 = doc.add_paragraph()
    r_h5 = p_h5.add_run("5. Visual Prototype Gallery & Screen Evidence")
    r_h5.font.name = "Calibri"
    r_h5.font.size = Pt(14)
    r_h5.font.bold = True
    r_h5.font.color.rgb = TEAL
    p_h5.paragraph_format.space_after = Pt(10)

    images_info = [
        ("01_register_seeker.png", "Figure 1: User Registration Page — Job Seeker / Student View",
         "Displays the student registration form, dual-role selector tabs, and clean Nordic input styling."),
        ("02_register_seeker_filled_strength.png", "Figure 2: User Registration Page — Dynamic Password Strength Meter",
         "Demonstrates real-time password entropy scoring (Good/Strong tier), visual progress indicator, and terms consent."),
        ("03_register_recruiter.png", "Figure 3: User Registration Page — Recruiter / Employer View",
         "Shows dynamic input adaptation: 'Full Name' switches to 'Company Name' and corporate work email format."),
        ("04_login_page.png", "Figure 4: Sign In Authentication Gateway",
         "Role-based candidate and employer login portal with quick prefill assistance for evaluation."),
        ("05_seeker_profile_full.png", "Figure 5: Candidate Profile Management Screen (/profile)",
         "Complete view of the Job Seeker profile featuring AI Resume Studio, Academic Credentials (DIU, BSc SWE, CGPA 3.82), Skills Taxonomy, and Geospatial Placement Radar."),
        ("06_avatar_modal.png", "Figure 6: Interactive Avatar Chooser Modal",
         "Modal dialog offering curated professional avatar presets with client-side image compression and photo preview."),
        ("07_recruiter_profile_full.png", "Figure 7: Recruiter Corporate Profile Screen (/profile)",
         "Recruiter organization view featuring company size, industry classification, corporate website, Banani office anchor, and hiring tech stack."),
        ("08_interactive_skills_chips.png", "Figure 8: Interactive Skills Taxonomy Management",
         "Demonstrates dynamic chip additions (+ TypeScript, + AWS), tag removal buttons, and live taxonomy count indicator.")
    ]

    for img_name, caption, desc in images_info:
        img_path = os.path.join(img_dir, img_name)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=Inches(6.2))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_cap = p_cap.add_run(caption)
            r_cap.font.bold = True
            r_cap.font.size = Pt(9.5)
            r_cap.font.color.rgb = CHARCOAL
            p_cap.paragraph_format.space_after = Pt(2)

            p_desc = doc.add_paragraph()
            p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_desc = p_desc.add_run(desc)
            r_desc.font.size = Pt(8.5)
            r_desc.font.italic = True
            r_desc.font.color.rgb = MUTED
            p_desc.paragraph_format.space_after = Pt(14)

    # Section 6: Verification & Access
    p_h6 = doc.add_paragraph()
    r_h6 = p_h6.add_run("6. Verification & Prototype Access Links")
    r_h6.font.name = "Calibri"
    r_h6.font.size = Pt(14)
    r_h6.font.bold = True
    r_h6.font.color.rgb = TEAL
    p_h6.paragraph_format.space_before = Pt(10)
    p_h6.paragraph_format.space_after = Pt(6)

    p_access = doc.add_paragraph()
    r_acc1 = p_access.add_run("The interactive prototype is fully operational and can be reviewed via the following channels:\n")
    r_acc1.font.size = Pt(10)
    
    bp1 = doc.add_paragraph(style='List Bullet')
    r_bp1 = bp1.add_run("Live Cloud Prototype (GitHub Pages): ")
    r_bp1.font.bold = True
    bp1.add_run("https://saif-alsaad.github.io/JobHub/ (Instant web browser access, zero installation required).")
    
    bp2 = doc.add_paragraph(style='List Bullet')
    r_bp2 = bp2.add_run("Official Repository Branch: ")
    r_bp2.font.bold = True
    bp2.add_run("https://github.com/Saif-AlSaad/JobHub/tree/Nadim")

    bp3 = doc.add_paragraph(style='List Bullet')
    r_bp3 = bp3.add_run("Demo Evaluation Credentials:\n")
    r_bp3.font.bold = True
    bp3.add_run("• Job Seeker: sarah.rahman@jobhub.io / password123\n")
    bp3.add_run("• Recruiter: recruiter@technova.io / password123\n")
    bp3.add_run("• Admin: admin@jobhub.io / password123")

    # Save
    doc.save(output_path)
    print(f"Document successfully created at {output_path}")

if __name__ == "__main__":
    out = r"D:\Capstone job hub\docs\SE331_CA1_Submission_Nadim.docx"
    imgs = r"D:\Capstone job hub\docs\assessment1_screenshots"
    build_docx(out, imgs)
