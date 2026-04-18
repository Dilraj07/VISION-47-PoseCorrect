import re
import os

with open('../client/src/pages/VideoAnalysis.jsx', 'r', encoding='utf-8') as f:
    va_data = f.read()

result_block = re.search(r'(\{result && \(\s*<>\s*<style>.*?)\s*</>\s*\)\}\s*<\/div>\s*<\/div\s*>\s*\);', va_data, re.DOTALL)
if result_block:
    result_ui = result_block.group(1)
    
    # Adapt to RealTimeCoach
    result_ui = result_ui.replace(
        "onClick={() => {\n                                                setFile(null);\n                                                setResult(null);\n                                            }}",
        "onClick={handleRetry}"
    )
    result_ui = result_ui.replace("New Scan", "Evaluate Again")
    result_ui = result_ui.replace("ANALYSIS COMPLETE", "SESSION REPORT")
    
    rtc_path = '../client/src/pages/RealTimeCoach.jsx'
    with open(rtc_path, 'r', encoding='utf-8') as f:
        rtc_data = f.read()
    
    if "const [notesExpanded" not in rtc_data:
        rtc_data = rtc_data.replace(
            "const [streamError, setStreamError] = useState(null);",
            "const [streamError, setStreamError] = useState(null);\n    const [notesExpanded, setNotesExpanded] = useState(true);"
        )
        
    helper = """
    const getFeedbackStatus = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('good') || lowerText.includes('stable') || lowerText.includes('great') || lowerText.includes('upright')) {
            return { color: 'var(--color-neon-green)', icon: CheckCircle };
        }
        if (lowerText.includes('warning') || lowerText.includes('check') || lowerText.includes('improve')) {
            return { color: '#FFBF00', icon: AlertTriangle };
        }
        return { color: 'var(--color-neon-blue)', icon: Info };
    };
"""
    if "getFeedbackStatus" not in rtc_data:
        rtc_data = rtc_data.replace(
            "const handleCancel = () => {",
            helper + "\n    const handleCancel = () => {"
        )
        
    # Find the result block in RealTimeCoach and replace it
    pattern = r"\{step === 'result' \? \(\s*<div className=\"report-container\" .*?\) : \(\s*/\* Webcam Area \*/"
    
    replacement = """{step === 'result' ? (
                    <div className="report-container page-container" style={{ flex: 1, overflowY: 'auto' }}>
                        {error && (
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red', border: '1px solid red', marginBottom: '2rem' }}>
                                {error}
                            </div>
                        )}
                        """ + result_ui + """
                    </div>
                ) : (
                    /* Webcam Area */"""

    rtc_data = re.sub(pattern, replacement, rtc_data, flags=re.DOTALL)

    glass_css = """
                /* Glassmorphism Utilities */
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                }
                
                .glass-card {
                     background: rgba(20, 20, 23, 0.6);
                     backdrop-filter: blur(12px);
                     border: 1px solid rgba(255, 255, 255, 0.08);
                     box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
                     transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
"""
    if ".glass-panel" not in rtc_data:
        rtc_data = rtc_data.replace("</style>", glass_css + "</style>")

    with open(rtc_path, 'w', encoding='utf-8') as f:
        f.write(rtc_data)
        
    print("Successfully patched RealTimeCoach.jsx")
else:
    print("Error: Could not find block.")
