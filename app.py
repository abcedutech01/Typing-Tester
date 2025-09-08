from flask import Flask, send_file, request
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
import io
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/generate_certificate', methods=['POST'])
def generate_certificate():
    data = request.get_json()
    name = data.get('name', 'Anonymous')
    wpm = data.get('wpm', 0)
    accuracy = data.get('accuracy', 0)
    date_str = datetime.now().strftime('%B %d, %Y')

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Background
    c.setFillColorRGB(0.1, 0.1, 0.3)
    c.rect(0, 0, width, height, fill=1)

    # Title
    c.setFont("Helvetica-Bold", 36)
    c.setFillColorRGB(1, 1, 1)
    c.drawCentredString(width/2, height-100, "Certificate of Typing Achievement")

    # Name
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height-180, name)

    # Details
    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, height-240,
                        f"Achieved {wpm:.1f} WPM with {accuracy:.1f}% accuracy")
    c.drawCentredString(width/2, height-270, f"Date: {date_str}")

    c.showPage()
    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"certificate_{name.replace(' ', '_')}.pdf"
    )

if __name__ == '__main__':
    app.run(debug=True)
