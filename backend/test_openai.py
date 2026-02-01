#!/usr/bin/env python3
"""
Quick test script to verify OpenAI API key works
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 80)
print("TESTING OPENAI API KEY")
print("=" * 80)

# Check if API key is loaded
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ ERROR: OPENAI_API_KEY not found in .env file")
    sys.exit(1)

print(f"[OK] API Key loaded: {api_key[:20]}...{api_key[-10:]}")
print()

# Test OpenAI API
print("Testing OpenAI API connection...")
print("-" * 80)

try:
    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    # Simple test: Generate a short sermon outline
    print("[INFO] Generating sample Telugu sermon from John 3:16...")
    print()

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a Telugu Christian sermon writer. Generate sermons in Telugu."
            },
            {
                "role": "user",
                "content": """Generate a simple sermon outline in Telugu for:

Verse: John 3:16 - "దేవుడు లోకమును ఎంతో ప్రేమించాడు కాబట్టి తన అద్వితీయ కుమారుణ్ణి అనుగ్రహించాడు"

Create a brief sermon outline with:
1. Title in Telugu
2. Introduction (2 sentences)
3. Three main points
4. Conclusion (2 sentences)

Keep it short and simple."""
            }
        ],
        max_tokens=500,
        temperature=0.7
    )

    sermon_content = response.choices[0].message.content

    print("[SUCCESS] OpenAI API is working!")
    print("=" * 80)
    print("GENERATED SERMON OUTLINE:")
    print("=" * 80)

    # Save to file instead of printing (Telugu Unicode issue on Windows console)
    output_file = "test_sermon_output.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(sermon_content)

    print(f"[INFO] Telugu sermon generated successfully!")
    print(f"[INFO] Output saved to: {output_file}")
    print(f"[INFO] Length: {len(sermon_content)} characters")
    print("      (Open the file in a text editor to see Telugu text)")
    print("=" * 80)
    print()

    # Show usage stats
    usage = response.usage
    print("[STATS] API USAGE STATS:")
    print(f"   Prompt tokens: {usage.prompt_tokens}")
    print(f"   Completion tokens: {usage.completion_tokens}")
    print(f"   Total tokens: {usage.total_tokens}")
    print(f"   Estimated cost: ${usage.total_tokens * 0.002 / 1000:.4f}")
    print()

    print("[SUCCESS] TEST PASSED!")
    print()
    print("[OK] Your OpenAI API key is working perfectly!")
    print("     You can now generate AI-powered Telugu sermons.")
    print()

except ImportError:
    print("[ERROR] openai package not installed")
    print("   Run: pip install openai")
    sys.exit(1)

except Exception as e:
    print(f"[ERROR] {str(e)}")
    print()
    print("Possible issues:")
    print("1. Invalid API key")
    print("2. No billing set up on OpenAI account")
    print("3. API quota exceeded")
    print("4. Network connection issue")
    print()
    print("Check your OpenAI account at: https://platform.openai.com")
    sys.exit(1)

print("=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print()
print("[OK] OpenAI is working! Now you need:")
print()
print("1. Supabase account (database & auth)")
print("   → Go to: https://supabase.com")
print()
print("2. Upstash Redis (caching)")
print("   → Go to: https://upstash.com")
print()
print("3. Then I'll:")
print("   → Set up database")
print("   → Deploy backend")
print("   → Build your app")
print()
print("Want to continue? Create those accounts and send me the credentials!")
print("=" * 80)
