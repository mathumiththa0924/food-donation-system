from pathlib import Path
replacements = {
    Path('frontend/src/components/DashboardLayout.jsx'):[
        ('      <div style={{ display: "flex", minHeight: "100vh", position: "relative", background: isLight ? "#f4f7fb" : "transparent" }}>',
         '      <div style={{ display: "flex", minHeight: "100vh", position: "relative", background: isLight ? "#f4f7fb" : "transparent", fontFamily: "Times, \'Times New Roman\', serif" }}>')
    ],
    Path('frontend/src/pages/DonorDashboard.jsx'):[
        ("fontFamily: 'Georgia', serif", "fontFamily: \"Times, 'Times New Roman', serif\"")
    ],
    Path('frontend/src/pages/NgoDashboard.jsx'):[
        ("fontFamily: 'Georgia', serif", "fontFamily: \"Times, 'Times New Roman', serif\"")
    ],
    Path('frontend/src/pages/AdminDashboard.jsx'):[
        ("fontFamily: 'Georgia', serif", "fontFamily: \"Times, 'Times New Roman', serif\"")
    ],
    Path('frontend/src/components/AdminSettings.jsx'):[
        ("fontFamily: \"Georgia, serif\"", "fontFamily: \"Times, 'Times New Roman', serif\"")
    ],
}
for path, reps in replacements.items():
    text = path.read_text(encoding='utf-8')
    for old, new in reps:
        if old not in text:
            raise SystemExit(f'Pattern not found in {path}: {old}')
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('done')
