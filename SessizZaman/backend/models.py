from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid


# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_focus_time: int = 0  # in seconds
    level: int = 1
    coins: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    trees_planted: int = 0

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    total_focus_time: int
    level: int
    coins: int
    current_streak: int
    longest_streak: int
    trees_planted: int


# Focus Session Models
class FocusSessionCreate(BaseModel):
    user_id: str
    duration: int  # in seconds
    session_type: str  # "pomodoro", "stopwatch", "custom"
    tags: Optional[List[str]] = []
    completed: bool = True

class FocusSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    duration: int
    session_type: str
    tags: List[str] = []
    completed: bool
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


# Tree Models
class Tree(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: str
    cost: int  # coins needed to unlock
    image_url: str
    rarity: str  # "common", "rare", "epic", "legendary"

class UserTree(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tree_id: str
    unlocked: bool = False
    planted_count: int = 0


# Achievement Models
class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: str
    requirement: int  # depends on type
    type: str  # "focus_time", "streak", "sessions", "trees"
    icon: str
    reward_coins: int

class UserAchievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    achievement_id: str
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    progress: int = 0


# Statistics Models
class DailyStats(BaseModel):
    date: str  # YYYY-MM-DD
    total_focus_time: int
    sessions_count: int
    trees_planted: int

class WeeklyStats(BaseModel):
    week_start: str
    week_end: str
    total_focus_time: int
    sessions_count: int
    trees_planted: int
    daily_breakdown: List[DailyStats]

class UserStats(BaseModel):
    today: DailyStats
    this_week: WeeklyStats
    all_time: dict


# Goal Models
class GoalCreate(BaseModel):
    user_id: str
    target_duration: int  # in seconds
    goal_type: str  # "daily", "weekly", "monthly"

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    target_duration: int
    goal_type: str
    current_progress: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed: bool = False


# Settings Models
class UserSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    pomodoro_duration: int = 25  # minutes
    short_break: int = 5  # minutes
    long_break: int = 15  # minutes
    auto_start_breaks: bool = True
    auto_start_pomodoros: bool = False
    daily_goal: int = 120  # minutes
    notification_enabled: bool = True
    sound_enabled: bool = True
    selected_sound: str = "forest"  # "forest", "rain", "ocean", "whitenoise"
    selected_tree: str = "oak"  # default tree
