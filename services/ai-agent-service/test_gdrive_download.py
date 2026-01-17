import requests
import re
import fitz # PyMuPDF

def test_download_and_parse(url, output_path="test_resume.pdf"):
    print(f"Testing URL: {url}")
    
    # Simple download
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded to {output_path}")
    except Exception as e:
        print(f"Download failed: {e}")
        return

    # Try parsing
    try:
        doc = fitz.open(output_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        print(f"Successfully parsed PDF. Text length: {len(text)}")
        print("First 100 chars:", text[:100])
    except Exception as e:
        print(f"Parsing failed: {e}")
        # Check if it was HTML
        with open(output_path, 'r', errors='ignore') as f:
            content = f.read(100)
            if "<html" in content.lower() or "<!doctype html" in content.lower():
                print("Confirmed: The downloaded file is HTML, not PDF.")

def convert_gdrive_url(url):
    # Regex to extract ID
    # https://drive.google.com/file/d/17SsX_4k20JH12lBalstW5B7xQa9m6LDr/view?usp=drive_link
    match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?id={file_id}&export=download"
    return url

original_url = "https://drive.google.com/file/d/17SsX_4k20JH12lBalstW5B7xQa9m6LDr/view?usp=drive_link"

print("--- TEST 1: Original URL ---")
test_download_and_parse(original_url, "test_original.pdf")

print("\n--- TEST 2: Converted URL ---")
converted = convert_gdrive_url(original_url)
test_download_and_parse(converted, "test_converted.pdf")
