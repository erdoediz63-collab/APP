from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from models import (
    UserCreate, UserLogin, User, UserResponse,
    FocusSessionCreate, FocusSession,
    Tree, UserTree, Achievement, UserAchievement,
    DailyStats, WeeklyStats, UserStats,
    GoalCreate, Goal, UserSettings
)
from auth import hash_password, verify_password, create_access_token, get_current_user


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Sessiz Zaman API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create default settings
    settings = UserSettings(user_id=user.id)
    await db.user_settings.insert_one(settings.model_dump())
    
    # Generate token
    token = create_access_token({"sub": user.id})
    
    return {
        "token": token,
        "user": UserResponse(**user_dict)
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user['id']})
    
    # Remove password from response
    user.pop('password', None)
    
    return {
        "token": token,
        "user": UserResponse(**user)
    }


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)


# ==================== FOCUS SESSION ROUTES ====================

@api_router.post("/sessions")
async def create_session(session: FocusSessionCreate, user_id: str = Depends(get_current_user)):
    """Create a focus session"""
    session_obj = FocusSession(**session.model_dump())
    session_obj.completed_at = datetime.now(timezone.utc)
    
    session_dict = session_obj.model_dump()
    session_dict['started_at'] = session_dict['started_at'].isoformat()
    session_dict['completed_at'] = session_dict['completed_at'].isoformat()
    
    await db.focus_sessions.insert_one(session_dict)
    
    # Update user stats
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user:
        new_total = user.get('total_focus_time', 0) + session.duration
        new_coins = user.get('coins', 0) + (session.duration // 60)  # 1 coin per minute
        new_trees = user.get('trees_planted', 0) + (1 if session.completed else 0)
        
        # Calculate level (every 3600 seconds = 1 level)
        new_level = (new_total // 3600) + 1
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "total_focus_time": new_total,
                "coins": new_coins,
                "trees_planted": new_trees,
                "level": new_level
            }}
        )
    
    return session_obj


@api_router.get("/sessions", response_model=List[FocusSession])
async def get_sessions(user_id: str = Depends(get_current_user), limit: int = 50):
    """Get user's focus sessions"""
    sessions = await db.focus_sessions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("started_at", -1).limit(limit).to_list(limit)
    
    # Convert ISO strings back to datetime
    for session in sessions:
        if isinstance(session.get('started_at'), str):
            session['started_at'] = datetime.fromisoformat(session['started_at'])
        if isinstance(session.get('completed_at'), str):
            session['completed_at'] = datetime.fromisoformat(session['completed_at'])
    
    return sessions


# ==================== STATISTICS ROUTES ====================

@api_router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    """Get user statistics"""
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    
    # Today's stats
    today_sessions = await db.focus_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": datetime.combine(today, datetime.min.time()).isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    today_stats = DailyStats(
        date=today.isoformat(),
        total_focus_time=sum(s['duration'] for s in today_sessions),
        sessions_count=len(today_sessions),
        trees_planted=sum(1 for s in today_sessions if s['completed'])
    )
    
    # Week stats
    week_sessions = await db.focus_sessions.find({
        "user_id": user_id,
        "started_at": {"$gte": datetime.combine(week_start, datetime.min.time()).isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    # Daily breakdown for the week
    daily_breakdown = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_sessions = [s for s in week_sessions if s['started_at'].startswith(day.isoformat())]
        daily_breakdown.append(DailyStats(
            date=day.isoformat(),
            total_focus_time=sum(s['duration'] for s in day_sessions),
            sessions_count=len(day_sessions),
            trees_planted=sum(1 for s in day_sessions if s['completed'])
        ))
    
    week_stats = WeeklyStats(
        week_start=week_start.isoformat(),
        week_end=(week_start + timedelta(days=6)).isoformat(),
        total_focus_time=sum(s['duration'] for s in week_sessions),
        sessions_count=len(week_sessions),
        trees_planted=sum(1 for s in week_sessions if s['completed']),
        daily_breakdown=daily_breakdown
    )
    
    # All time
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    return UserStats(
        today=today_stats,
        this_week=week_stats,
        all_time={
            "total_focus_time": user.get('total_focus_time', 0),
            "level": user.get('level', 1),
            "trees_planted": user.get('trees_planted', 0),
            "current_streak": user.get('current_streak', 0),
            "longest_streak": user.get('longest_streak', 0)
        }
    )


# ==================== TREES ROUTES ====================

@api_router.get("/trees", response_model=List[Tree])
async def get_trees():
    """Get all available trees"""
    trees = await db.trees.find({}, {"_id": 0}).to_list(100)
    if not trees:
        # Initialize default trees
        default_trees = [
            Tree(id="oak", name="Meşe", description="Klasik ve güçlü", cost=0, image_url="🌳", rarity="common"),
            Tree(id="pine", name="Çam", description="Dik ve zarif", cost=100, image_url="🌲", rarity="common"),
            Tree(id="palm", name="Palmiye", description="Tropikal güzellik", cost=200, image_url="🌴", rarity="rare"),
            Tree(id="sakura", name="Kiraz Çiçeği", description="Japon güzelliği", cost=500, image_url="🌸", rarity="epic"),
            Tree(id="bamboo", name="Bambu", description="Hızlı büyüyen", cost=300, image_url="🎋", rarity="rare"),
            Tree(id="cactus", name="Kaktüs", description="Çöl savaşçısı", cost=150, image_url="🌵", rarity="common"),
            Tree(id="maple", name="Akçaağaç", description="Sonbahar renkleri", cost=400, image_url="🍁", rarity="rare"),
            Tree(id="willow", name="Söğüt", description="Zarif ve hüzünlü", cost=600, image_url="🌿", rarity="epic"),
        ]
        await db.trees.insert_many([t.model_dump() for t in default_trees])
        trees = default_trees
    return trees


@api_router.get("/trees/user")
async def get_user_trees(user_id: str = Depends(get_current_user)):
    """Get user's unlocked trees"""
    user_trees = await db.user_trees.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    if not user_trees:
        # Unlock default oak tree
        default_tree = UserTree(user_id=user_id, tree_id="oak", unlocked=True, planted_count=0)
        await db.user_trees.insert_one(default_tree.model_dump())
        user_trees = [default_tree.model_dump()]
    return user_trees


@api_router.post("/trees/unlock/{tree_id}")
async def unlock_tree(tree_id: str, user_id: str = Depends(get_current_user)):
    """Unlock a tree with coins"""
    tree = await db.trees.find_one({"id": tree_id}, {"_id": 0})
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user['coins'] < tree['cost']:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # Check if already unlocked
    existing = await db.user_trees.find_one({"user_id": user_id, "tree_id": tree_id}, {"_id": 0})
    if existing and existing.get('unlocked'):
        raise HTTPException(status_code=400, detail="Tree already unlocked")
    
    # Unlock tree
    if existing:
        await db.user_trees.update_one(
            {"user_id": user_id, "tree_id": tree_id},
            {"$set": {"unlocked": True}}
        )
    else:
        new_tree = UserTree(user_id=user_id, tree_id=tree_id, unlocked=True, planted_count=0)
        await db.user_trees.insert_one(new_tree.model_dump())
    
    # Deduct coins
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"coins": user['coins'] - tree['cost']}}
    )
    
    return {"message": "Tree unlocked successfully"}


# ==================== SETTINGS ROUTES ====================

@api_router.get("/settings", response_model=UserSettings)
async def get_settings(user_id: str = Depends(get_current_user)):
    """Get user settings"""
    settings = await db.user_settings.find_one({"user_id": user_id}, {"_id": 0})
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user_id)
        await db.user_settings.insert_one(settings.model_dump())
    return UserSettings(**settings)


@api_router.put("/settings")
async def update_settings(settings: UserSettings, user_id: str = Depends(get_current_user)):
    """Update user settings"""
    settings.user_id = user_id
    await db.user_settings.update_one(
        {"user_id": user_id},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"message": "Settings updated successfully"}


# ==================== LEADERBOARD ROUTES ====================

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 100):
    """Get global leaderboard"""
    users = await db.users.find(
        {},
        {"_id": 0, "password": 0, "email": 0}
    ).sort("total_focus_time", -1).limit(limit).to_list(limit)
    
    return users


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()