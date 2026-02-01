#!/usr/bin/env python3
"""
Test all services: Supabase, OpenAI, Redis
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

print("=" * 80)
print("TESTING ALL SERVICES")
print("=" * 80)
print()

# Test results
results = {
    "supabase": False,
    "openai": False,
    "redis": False
}

# 1. Test Supabase
print("[1/3] Testing Supabase...")
try:
    from supabase import create_client

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    supabase = create_client(supabase_url, supabase_key)

    # Try to query user_profiles table
    result = supabase.table('user_profiles').select("*").limit(1).execute()

    print("[SUCCESS] Supabase connected!")
    print(f"[INFO] user_profiles table accessible")
    results["supabase"] = True
except Exception as e:
    print(f"[ERROR] Supabase test failed: {str(e)}")

print()

# 2. Test OpenAI
print("[2/3] Testing OpenAI...")
try:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    # Simple test
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'API works!'"}],
        max_tokens=10
    )

    print("[SUCCESS] OpenAI API connected!")
    print(f"[INFO] Response: {response.choices[0].message.content}")
    results["openai"] = True
except Exception as e:
    print(f"[ERROR] OpenAI test failed: {str(e)}")

print()

# 3. Test Redis
print("[3/3] Testing Redis...")
try:
    import redis
    from urllib.parse import urlparse

    redis_url = os.getenv("REDIS_URL")

    # Parse Redis URL
    parsed = urlparse(redis_url)

    # Connect with SSL
    r = redis.Redis(
        host=parsed.hostname,
        port=parsed.port,
        password=parsed.password,
        ssl=True,
        ssl_cert_reqs=None
    )

    # Test ping
    r.ping()

    # Test set/get
    r.set("test_key", "Hello from Bible Sermon Assistant!")
    value = r.get("test_key")

    print("[SUCCESS] Redis connected!")
    print(f"[INFO] Test value: {value.decode('utf-8')}")

    # Clean up
    r.delete("test_key")
    results["redis"] = True
except ImportError:
    print("[INFO] Installing redis package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "redis"])
    print("[INFO] Installed! Please run this script again.")
except Exception as e:
    print(f"[ERROR] Redis test failed: {str(e)}")

print()
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print()

all_passed = all(results.values())

for service, passed in results.items():
    status = "[OK]" if passed else "[FAIL]"
    print(f"{status} {service.upper()}")

print()

if all_passed:
    print("[SUCCESS] ALL SERVICES WORKING!")
    print()
    print("Next steps:")
    print("1. Download Telugu Bible data")
    print("2. Start backend server")
    print("3. Test API endpoints")
else:
    print("[WARNING] Some services failed. Check errors above.")
    sys.exit(1)
