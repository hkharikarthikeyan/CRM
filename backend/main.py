from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Time Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Employee(BaseModel):
    name: str
    email: str
    employee_id: str
    department: str
    role: str
    password: str = ""

class Shift(BaseModel):
    shift_name: str
    start_time: str
    end_time: str

class Holiday(BaseModel):
    holiday_name: str
    holiday_date: str

class Geofencing(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    radius: int

class CreateAdminRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str

class ChangePasswordRequest(BaseModel):
    username: str
    old_password: str
    new_password: str

class LeaveRequest(BaseModel):
    employee_id: str
    employee_name: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str = ""

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    try:
        # Try admin login from users table
        result = supabase.table('users').select('*').eq('username', login_data.username).eq('role', 'admin').execute()
        if result.data and pwd_context.verify(login_data.password, result.data[0]['password']):
            access_token_expires = timedelta(minutes=30)
            access_token = create_access_token(
                data={"sub": login_data.username, "role": result.data[0]['role']},
                expires_delta=access_token_expires
            )
            return {"access_token": access_token, "token_type": "bearer"}
        
        # Try employee login from employees table
        emp_result = supabase.table('employees').select('*').eq('employee_id', login_data.username).execute()
        if emp_result.data and pwd_context.verify(login_data.password, emp_result.data[0]['password']):
            access_token_expires = timedelta(minutes=30)
            access_token = create_access_token(
                data={"sub": login_data.username, "role": "employee"},
                expires_delta=access_token_expires
            )
            return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Login error: {e}")
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user(username: str = Depends(verify_token)):
    # Check users table (admin)
    result = supabase.table('users').select('*').eq('username', username).execute()
    if result.data:
        user = result.data[0]
        return {"username": user['username'], "role": user['role'], "name": user['name'], "email": user.get('email', '')}
    
    # Check employees table (employee)
    emp_result = supabase.table('employees').select('*').eq('employee_id', username).execute()
    if emp_result.data:
        emp = emp_result.data[0]
        return {"username": emp['employee_id'], "role": "employee", "name": emp['name'], "email": emp.get('email', '')}
    
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/auth/create-admin")
async def create_admin(data: CreateAdminRequest):
    try:
        existing = supabase.table('users').select('*').eq('username', data.username).execute()
        print(f"Existing check: {existing.data}")
        if existing.data:
            raise HTTPException(status_code=400, detail="Username already exists")
        hashed = pwd_context.hash(data.password)
        result = supabase.table('users').insert({
            'username': data.username,
            'password': hashed,
            'role': 'admin',
            'name': data.name,
            'email': data.email
        }).execute()
        print(f"Insert result: {result.data}")
        return {"message": "Admin created successfully", "username": data.username}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/auth/change-password")
async def change_password(data: ChangePasswordRequest):
    try:
        result = supabase.table('users').select('*').eq('username', data.username).execute()
        print(f"Query result: {result.data}, count: {len(result.data) if result.data else 0}")
    except Exception as e:
        print(f"DB error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    if not result.data:
        raise HTTPException(status_code=404, detail=f"User '{data.username}' not found in users table")
    user = result.data[0]
    if not pwd_context.verify(data.old_password, user['password']):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    hashed = pwd_context.hash(data.new_password)
    supabase.table('users').update({'password': hashed}).eq('username', data.username).execute()
    return {"message": "Password changed successfully"}

@app.get("/employees")
async def get_employees():
    try:
        result = supabase.table('employees').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return []

@app.post("/employees")
async def create_employee(employee: Employee):
    try:
        hashed_password = pwd_context.hash(employee.password)
        emp_result = supabase.table('employees').insert({
            'name': employee.name,
            'email': employee.email,
            'employee_id': employee.employee_id,
            'department': employee.department,
            'role': employee.role,
            'password': hashed_password
        }).execute()
        return emp_result.data[0] if emp_result.data else {}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee: Employee):
    try:
        update_data = {
            'name': employee.name,
            'email': employee.email,
            'employee_id': employee.employee_id,
            'department': employee.department,
            'role': employee.role
        }
        if employee.password:
            update_data['password'] = pwd_context.hash(employee.password)
        
        result = supabase.table('employees').update(update_data).eq('id', employee_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leave-requests")
async def get_leave_requests():
    try:
        result = supabase.table('leave_requests').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching leave requests: {e}")
        return []

@app.post("/leave-requests")
async def create_leave_request(leave: LeaveRequest):
    try:
        result = supabase.table('leave_requests').insert(leave.dict()).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error creating leave request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/leave-requests/{leave_id}")
async def update_leave_status(leave_id: str, status: str):
    try:
        result = supabase.table('leave_requests').update({'status': status}).eq('id', leave_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error updating leave status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/shifts")
async def get_shifts():
    try:
        result = supabase.table('shifts').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching shifts: {e}")
        return []

@app.post("/shifts")
async def create_shift(shift: Shift):
    try:
        result = supabase.table('shifts').insert(shift.dict()).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error creating shift: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str):
    try:
        result = supabase.table('shifts').delete().eq('id', shift_id).execute()
        return {"message": "Shift deleted"}
    except Exception as e:
        print(f"Error deleting shift: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/holidays")
async def get_holidays():
    try:
        result = supabase.table('holidays').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching holidays: {e}")
        return []

@app.post("/holidays")
async def create_holiday(holiday: Holiday):
    try:
        result = supabase.table('holidays').insert(holiday.dict()).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error creating holiday: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/holidays/{holiday_id}")
async def delete_holiday(holiday_id: str):
    try:
        result = supabase.table('holidays').delete().eq('id', holiday_id).execute()
        return {"message": "Holiday deleted"}
    except Exception as e:
        print(f"Error deleting holiday: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/geofencing")
async def get_geofencing():
    try:
        result = supabase.table('geofencing').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching geofencing: {e}")
        return []

@app.post("/geofencing")
async def create_geofencing(geo: Geofencing):
    try:
        result = supabase.table('geofencing').insert(geo.dict()).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error creating geofencing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/geofencing/{geo_id}")
async def delete_geofencing(geo_id: str):
    try:
        result = supabase.table('geofencing').delete().eq('id', geo_id).execute()
        return {"message": "Geofencing deleted"}
    except Exception as e:
        print(f"Error deleting geofencing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attendance-corrections")
async def get_attendance_corrections():
    try:
        result = supabase.table('attendance_corrections').select('*').execute()
        return result.data
    except Exception as e:
        print(f"Error fetching corrections: {e}")
        return []

@app.patch("/attendance-corrections/{correction_id}")
async def update_correction_status(correction_id: str, status: str):
    try:
        result = supabase.table('attendance_corrections').update({'status': status}).eq('id', correction_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"Error updating correction status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Time Tracker API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)