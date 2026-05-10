from database import engine

try:
    with engine.connect() as connection:
        print("✅ Success! Your Python app is talking to the Aiven cloud.")
except Exception as e:
    print(f"❌ Connection failed. Error: {e}")