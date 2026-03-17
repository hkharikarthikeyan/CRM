from passlib.context import CryptContext
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Hash the password
hashed_password = pwd_context.hash('hari19')
print(f"Hashed password: {hashed_password}")

# Insert admin user
try:
    result = supabase.table('users').insert({
        'username': 'hari001',
        'password': hashed_password,
        'role': 'admin',
        'name': 'Admin User',
        'email': 'admin@company.com'
    }).execute()
    print("Admin user created successfully!")
    print(result.data)
except Exception as e:
    print(f"Error: {e}")

# Test login
try:
    result = supabase.table('users').select('*').eq('username', 'hari001').execute()
    if result.data:
        user = result.data[0]
        if pwd_context.verify('hari19', user['password']):
            print("\n✓ Login test successful!")
            print(f"Username: {user['username']}")
            print(f"Role: {user['role']}")
        else:
            print("\n✗ Password verification failed")
    else:
        print("\n✗ User not found")
except Exception as e:
    print(f"Login test error: {e}")
