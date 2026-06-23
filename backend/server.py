"""
Captain Culinary Kids — Backend API
"""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import sqlite3
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

DB_PATH = Path(__file__).parent / "culinary_chef.db"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Stripe — imported lazily so the server starts even without a key configured
try:
    import stripe
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_ENABLED = bool(stripe.api_key)
except ImportError:
    stripe = None
    STRIPE_WEBHOOK_SECRET = ""
    STRIPE_ENABLED = False

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://robot-chef-app.onrender.com")
PRODUCT_PRICE_CENTS = 1499  # $14.99


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            sessionId TEXT PRIMARY KEY,
            ageGroup TEXT,
            completedLessons TEXT,
            earnedBadges TEXT,
            completedChallenges TEXT,
            settings TEXT,
            updatedAt TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS food_trucks (
            id TEXT PRIMARY KEY,
            sessionId TEXT,
            truckName TEXT,
            foodIdea TEXT,
            menu1 TEXT,
            menu2 TEXT,
            menu3 TEXT,
            targetCustomer TEXT,
            brandStyle TEXT,
            safetyNote TEXT,
            costThought TEXT,
            serviceMission TEXT,
            createdAt TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS restaurants (
            id TEXT PRIMARY KEY,
            sessionId TEXT,
            restaurantName TEXT,
            concept TEXT,
            hospitalityPromise TEXT,
            menuIdea1 TEXT,
            menuIdea2 TEXT,
            menuIdea3 TEXT,
            teamRoles TEXT,
            cleanlinessPlan TEXT,
            guestExperience TEXT,
            communityPurpose TEXT,
            createdAt TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchases (
            id TEXT PRIMARY KEY,
            stripe_session_id TEXT UNIQUE,
            cck_session_id TEXT,
            amount_cents INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()

app = FastAPI(title="Captain Culinary Kids API")
api_router = APIRouter(prefix="/api")

LESSONS: List[Dict[str, Any]] = [
    {
        "id": "kitchen-safety-basics",
        "title": "Kitchen Safety Basics",
        "ageGroup": "7-12",
        "path": "Kitchen Safety",
        "time": "8 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Adult Supervision",
        "badge": "safety-starter",
        "summary": "Hand washing, clear counters, safe tools, and the no-touch zones every young chef must know.",
        "plateKey": "kitchen-safety",
    },
    {
        "id": "mirepoix",
        "title": "Mirepoix: From Vegetable to Small Dice",
        "ageGroup": "13-16",
        "path": "Knife Skills & Prep",
        "time": "15 minutes",
        "difficulty": "Intermediate",
        "safetyLevel": "Supervised Skill",
        "badge": "prep-pro",
        "summary": "The classic aromatic foundation — onion, celery, carrot — from whole vegetable to small dice.",
        "plateKey": "mirepoix",
    },
    {
        "id": "knife-cuts",
        "title": "Knife Cuts & Prep",
        "ageGroup": "13-16",
        "path": "Knife Skills & Prep",
        "time": "12 minutes",
        "difficulty": "Intermediate",
        "safetyLevel": "Supervised Skill",
        "badge": "prep-pro",
        "summary": "Slice, plank, baton, dice — a calm, controlled progression of cuts every prep cook learns.",
        "plateKey": "knife-cuts",
    },
    {
        "id": "snack-plate",
        "title": "Build a Better Snack Plate",
        "ageGroup": "7-12",
        "path": "Healthy Meals",
        "time": "10 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Adult Supervision",
        "badge": "family-meal-helper",
        "summary": "Color, balance, allergy awareness — a snack plate that nourishes and looks beautiful.",
        "plateKey": "snack-plate",
    },
    {
        "id": "rice-around-world",
        "title": "Global Food Mission: Rice Around the World",
        "ageGroup": "13-16",
        "path": "Global Cuisines",
        "time": "12 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Discussion + Supervised Cooking",
        "badge": "global-food-explorer",
        "summary": "How a single grain feeds families on every continent — and what each tradition can teach us.",
        "plateKey": "rice-world",
    },
    {
        "id": "food-truck-builder",
        "title": "Food Truck Concept Builder",
        "ageGroup": "17-19",
        "path": "Food Truck Builder",
        "time": "20 minutes",
        "difficulty": "Advanced",
        "safetyLevel": "Business Learning",
        "badge": "food-truck-rookie",
        "summary": "Name, idea, three menu items, target customer, and a service mission for your community.",
        "plateKey": "food-truck",
    },
    {
        "id": "restaurant-hospitality",
        "title": "Restaurant Hospitality Basics",
        "ageGroup": "17-19",
        "path": "Restaurant Builder",
        "time": "18 minutes",
        "difficulty": "Advanced",
        "safetyLevel": "Business Learning",
        "badge": "restaurant-builder",
        "summary": "Hospitality, team roles, cleanliness, and a one-page concept that serves a real community need.",
        "plateKey": "restaurant",
    },
]

BADGES = [
    {"id": "safety-starter",       "name": "Safety Starter",       "icon": "shield-check"},
    {"id": "clean-hands-champion",  "name": "Clean Hands Champion",  "icon": "droplets"},
    {"id": "prep-pro",              "name": "Prep Pro",              "icon": "knife"},
    {"id": "family-meal-helper",   "name": "Family Meal Helper",    "icon": "utensils"},
    {"id": "global-food-explorer",  "name": "Global Food Explorer",  "icon": "globe"},
    {"id": "service-chef",          "name": "Service Chef",          "icon": "heart-handshake"},
    {"id": "food-truck-rookie",     "name": "Food Truck Rookie",     "icon": "truck"},
    {"id": "restaurant-builder",    "name": "Restaurant Builder",    "icon": "store"},
    {"id": "quiz-champion",         "name": "Quiz Champion",         "icon": "trophy"},
    {"id": "family-cook",           "name": "Family Cook",           "icon": "users"},
]

GLOBAL_MISSIONS = [
    {"id": "rice",  "title": "Rice Around the World",     "region": "Global",     "description": "Discover how rice nourishes families on every continent."},
    {"id": "bread", "title": "Bread Across Cultures",     "region": "Global",     "description": "From naan to tortillas — how bread connects communities."},
    {"id": "soup",  "title": "Soup: The Universal Meal",  "region": "Global",     "description": "One pot, countless traditions. Explore the world through soup."},
    {"id": "spice", "title": "Spice Routes",              "region": "Asia/Africa","description": "Follow the spices that shaped world trade and cooking."},
    {"id": "fruit", "title": "Tropical Fruits & Uses",    "region": "Americas",   "description": "Mangoes, plantains, and papayas — cooking beyond the grocery aisle."},
    {"id": "fish",  "title": "Fish & Coastal Cooking",    "region": "Coastal",    "description": "Fishing traditions and coastal cuisines from around the globe."},
]

FAMILY_CHALLENGES = [
    {"id": "fc-1", "title": "Three Safety Zones",         "prompt": "Walk through the kitchen together and identify the three safety zones: knife zone, heat zone, and clean zone."},
    {"id": "fc-2", "title": "Snack Plate Night",          "prompt": "Build a balanced snack plate together — each person adds one item from each food group."},
    {"id": "fc-3", "title": "Cook a Grain Together",      "prompt": "Pick a grain from the Rice Around the World lesson and cook it as a family side dish."},
    {"id": "fc-4", "title": "Family Recipe Interview",    "prompt": "Ask a grandparent or elder family member to share a childhood recipe — write it down or video it."},
    {"id": "fc-5", "title": "Mise en Place Challenge",    "prompt": "Prep all ingredients before cooking anything. Wash, chop, measure, and organize before you turn on the heat."},
    {"id": "fc-6", "title": "Serve Someone Outside Home", "prompt": "Prepare and deliver a meal, snack, or baked good to a neighbor, teacher, or community member."},
]


# ── Pydantic models ──────────────────────────────────────────────────────────

class ProgressDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sessionId: str
    ageGroup: Optional[str] = None
    completedLessons: List[str] = Field(default_factory=list)
    earnedBadges: List[str] = Field(default_factory=list)
    completedChallenges: List[str] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FoodTruckConcept(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    truckName: str
    foodIdea: str
    menu1: str
    menu2: str
    menu3: str
    targetCustomer: str
    brandStyle: str
    safetyNote: str
    costThought: str
    serviceMission: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RestaurantConcept(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    restaurantName: str
    concept: str
    hospitalityPromise: str
    menuIdea1: str
    menuIdea2: str
    menuIdea3: str
    teamRoles: str
    cleanlinessPlan: str
    guestExperience: str
    communityPurpose: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CheckoutRequest(BaseModel):
    cck_session_id: str


# ── Core routes ──────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"app": "Captain Culinary Kids", "status": "ok"}


@api_router.get("/lessons")
async def list_lessons(ageGroup: Optional[str] = Query(None)):
    items = LESSONS
    if ageGroup:
        items = [l for l in LESSONS if l["ageGroup"] == ageGroup]
    return {"items": items, "count": len(items)}


@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@api_router.get("/badges")
async def list_badges():
    return {"items": BADGES}


@api_router.get("/missions/global")
async def list_global_missions():
    return {"items": GLOBAL_MISSIONS}


@api_router.get("/missions/family")
async def list_family_challenges():
    return {"items": FAMILY_CHALLENGES}


# ── Progress routes ──────────────────────────────────────────────────────────

@api_router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress WHERE sessionId = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return ProgressDoc(sessionId=session_id).model_dump()
    doc = dict(row)
    doc["completedLessons"] = json.loads(doc["completedLessons"])
    doc["earnedBadges"] = json.loads(doc["earnedBadges"])
    doc["completedChallenges"] = json.loads(doc["completedChallenges"])
    doc["settings"] = json.loads(doc["settings"])
    return doc


@api_router.post("/progress/{session_id}")
async def save_progress(session_id: str, payload: ProgressDoc):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO progress
            (sessionId, ageGroup, completedLessons, earnedBadges, completedChallenges, settings, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(sessionId) DO UPDATE SET
            ageGroup=excluded.ageGroup,
            completedLessons=excluded.completedLessons,
            earnedBadges=excluded.earnedBadges,
            completedChallenges=excluded.completedChallenges,
            settings=excluded.settings,
            updatedAt=excluded.updatedAt
    """, (
        session_id,
        payload.ageGroup,
        json.dumps(payload.completedLessons),
        json.dumps(payload.earnedBadges),
        json.dumps(payload.completedChallenges),
        json.dumps(payload.settings),
        datetime.now(timezone.utc).isoformat(),
    ))
    conn.commit()
    conn.close()
    return {"ok": True}


# ── Builder routes ───────────────────────────────────────────────────────────

@api_router.post("/builders/food-truck")
async def save_food_truck(payload: FoodTruckConcept):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO food_trucks
            (id, sessionId, truckName, foodIdea, menu1, menu2, menu3,
             targetCustomer, brandStyle, safetyNote, costThought, serviceMission, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.id, payload.sessionId, payload.truckName, payload.foodIdea,
        payload.menu1, payload.menu2, payload.menu3, payload.targetCustomer,
        payload.brandStyle, payload.safetyNote, payload.costThought,
        payload.serviceMission, datetime.now(timezone.utc).isoformat(),
    ))
    conn.commit()
    conn.close()
    return payload.model_dump()


@api_router.get("/builders/food-truck/{session_id}")
async def list_food_trucks(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM food_trucks WHERE sessionId = ? ORDER BY createdAt DESC",
        (session_id,)
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"items": rows}


@api_router.post("/builders/restaurant")
async def save_restaurant(payload: RestaurantConcept):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO restaurants
            (id, sessionId, restaurantName, concept, hospitalityPromise,
             menuIdea1, menuIdea2, menuIdea3, teamRoles, cleanlinessPlan,
             guestExperience, communityPurpose, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.id, payload.sessionId, payload.restaurantName, payload.concept,
        payload.hospitalityPromise, payload.menuIdea1, payload.menuIdea2,
        payload.menuIdea3, payload.teamRoles, payload.cleanlinessPlan,
        payload.guestExperience, payload.communityPurpose,
        datetime.now(timezone.utc).isoformat(),
    ))
    conn.commit()
    conn.close()
    return payload.model_dump()


@api_router.get("/builders/restaurant/{session_id}")
async def list_restaurants(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM restaurants WHERE sessionId = ? ORDER BY createdAt DESC",
        (session_id,)
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"items": rows}


# ── Stripe payment routes ────────────────────────────────────────────────────

@api_router.post("/stripe/checkout")
async def create_checkout(payload: CheckoutRequest):
    if not STRIPE_ENABLED or stripe is None:
        raise HTTPException(status_code=503, detail="Payment processing not configured")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Captain Culinary Kids — Full Unlock",
                        "description": "All 7 lessons · 3 age paths · Family challenges · Global missions · Builders. One-time purchase, no subscription.",
                    },
                    "unit_amount": PRODUCT_PRICE_CENTS,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{FRONTEND_URL}/purchase?stripe_session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/purchase?cancelled=true",
            metadata={"cck_session_id": payload.cck_session_id},
        )
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO purchases (id, stripe_session_id, cck_session_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), session.id, payload.cck_session_id, PRODUCT_PRICE_CENTS, "pending", datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        conn.close()
        return {"checkout_url": session.url, "stripe_session_id": session.id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Checkout session creation failed")


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    if not STRIPE_ENABLED or stripe is None:
        raise HTTPException(status_code=503, detail="Payment processing not configured")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook error")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        stripe_session_id = session["id"]
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE purchases SET status = 'completed' WHERE stripe_session_id = ?",
            (stripe_session_id,),
        )
        if cursor.rowcount == 0:
            cck_session_id = session.get("metadata", {}).get("cck_session_id", "")
            cursor.execute(
                "INSERT OR IGNORE INTO purchases (id, stripe_session_id, cck_session_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), stripe_session_id, cck_session_id, PRODUCT_PRICE_CENTS, "completed", datetime.now(timezone.utc).isoformat()),
            )
        conn.commit()
        conn.close()
        logger.info(f"Purchase completed: {stripe_session_id}")

    return {"received": True}


@api_router.get("/stripe/verify/{stripe_session_id}")
async def verify_purchase(stripe_session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM purchases WHERE stripe_session_id = ?", (stripe_session_id,))
    row = cursor.fetchone()
    conn.close()

    if row and row["status"] == "completed":
        return {"unlocked": True}

    # Fallback: ask Stripe directly in case webhook was delayed
    if STRIPE_ENABLED and stripe:
        try:
            session = stripe.checkout.Session.retrieve(stripe_session_id)
            if session.payment_status == "paid":
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cck_session_id = (session.metadata or {}).get("cck_session_id", "")
                cursor.execute(
                    "INSERT OR REPLACE INTO purchases (id, stripe_session_id, cck_session_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (str(uuid.uuid4()), stripe_session_id, cck_session_id, PRODUCT_PRICE_CENTS, "completed", datetime.now(timezone.utc).isoformat()),
                )
                conn.commit()
                conn.close()
                return {"unlocked": True}
        except Exception as e:
            logger.error(f"Stripe verify error: {e}")

    return {"unlocked": False}


# ── App assembly ─────────────────────────────────────────────────────────────

app.include_router(api_router)

_raw_origins = os.environ.get("CORS_ORIGINS", "*")
_allowed_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
