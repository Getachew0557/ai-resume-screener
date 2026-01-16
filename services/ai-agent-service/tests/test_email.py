import os
from dotenv import load_dotenv
import yagmail

load_dotenv()

def test_email_credentials():
    user = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")
    hr_email = os.getenv("HR_EMAIL")
    
    print("=" * 50)
    print("TESTING EMAIL CREDENTIALS")
    print("=" * 50)
    print(f"GMAIL_USER: '{user}'")
    print(f"GMAIL_PASSWORD: '{password}'")
    print(f"Password length: {len(password) if password else 0}")
    print(f"HR_EMAIL: '{hr_email}'")
    print("=" * 50)
    
    if not user:
        print("❌ ERROR: GMAIL_USER not set")
        return False
    
    if not password:
        print("❌ ERROR: GMAIL_PASSWORD not set")
        return False
    
    if password and len(password) != 16:
        print(f"⚠️ WARNING: App password should be 16 characters. Got {len(password)} characters")
    
    # Test connection
    try:
        print("\nTesting connection to Gmail...")
        yag = yagmail.SMTP(user, password)
        print("✅ Connection successful!")
        
        # Send a test email to yourself
        test_subject = "Test Email from Resume System"
        test_body = "This is a test email to verify the email service is working."
        
        print(f"\nSending test email to {user}...")
        yag.send(to=user, subject=test_subject, contents=test_body)
        print("✅ Test email sent successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
        if "534" in str(e) or "Application-specific password required" in str(e):
            print("\n⚠️ AUTHENTICATION ISSUE DETECTED:")
            print("1. Make sure you've generated an App Password correctly:")
            print("   - Go to https://myaccount.google.com/apppasswords")
            print("   - Select 'Mail' as the app")
            print("   - Select your device")
            print("   - Copy the 16-character password (e.g., 'abcd efgh ijkl mnop')")
            print("2. In your .env file, use it WITHOUT spaces: 'abcdefghijklmnop'")
            print("3. Make sure 2FA is enabled on your Google account")
        
        elif "535" in str(e):
            print("\n⚠️ INVALID CREDENTIALS:")
            print("1. Check if your GMAIL_USER is correct")
            print("2. Check if the app password is correct")
            print("3. Try generating a new app password")
        
        return False

if __name__ == "__main__":
    test_email_credentials()