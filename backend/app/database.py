from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import Base
from datetime import datetime
import os

# Database URL - default to SQLite for local development if PostgreSQL not available
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"connect_timeout": 5},
            echo=False,
            pool_size=5,
            max_overflow=10
        )
    print("✅ Database engine created (connection will be tested on first use)", flush=True)
except Exception as e:
    print(f"⚠️ Warning: Could not create database engine: {e}", flush=True)
    engine = None

# Create session factory (only if engine exists)
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

def get_db():
    """Dependency to get database session"""
    if engine is None:
        error_msg = "Database not configured. Please set DATABASE_URL environment variable."
        print(f"❌ {error_msg}", flush=True)
        raise Exception(error_msg)
    
    try:
        db = SessionLocal()
        # Test the connection
        db.execute(text("SELECT 1"))
    except Exception as e:
        error_msg = f"Database connection failed: {str(e)}"
        print(f"❌ {error_msg}", flush=True)
        import traceback
        traceback.print_exc()
        raise Exception(error_msg)
    
    try:
        yield db
    except Exception as e:
        print(f"❌ Database session error: {str(e)}", flush=True)
        db.rollback()
        raise
    finally:
        db.close()

def create_tables():
    """Create all tables"""
    if engine is None:
        print("⚠️ Warning: Database engine not available, skipping table creation", flush=True)
        return
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully", flush=True)
    except Exception as e:
        print(f"⚠️ Warning: Could not create tables: {e}", flush=True)
        # Don't raise - allow app to start without database

def init_db():
    """Initialize database with sample data - non-blocking"""
    if engine is None or SessionLocal is None:
        print("⚠️ Warning: Database not configured, skipping initialization", flush=True)
        return
    
    try:
        create_tables()
    except Exception as e:
        print(f"⚠️ Warning: Table creation failed: {e}", flush=True)
        return  # Don't block startup
    
    try:
        # Import here to avoid circular imports
        from app.routers.products import mock_products
        from passlib.context import CryptContext
        
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        db = SessionLocal()
        
        try:
            # Check if data already exists
            from app.models import Product, User
            
            if db.query(Product).count() == 0:
                # Add sample products
                for product_data in mock_products:
                    product = Product(
                        id=product_data["id"],
                        name=product_data["name"],
                        description=product_data["description"],
                        price=product_data["price"],
                        category=product_data["category"],
                        image_url=product_data["image_url"],
                        stock=product_data["stock"],
                        rating=product_data["rating"]
                    )
                    db.add(product)
            
            initial_admin_email = os.getenv("INITIAL_ADMIN_EMAIL")
            initial_admin_pass = os.getenv("INITIAL_ADMIN_PASSWORD")
            
            if initial_admin_email and initial_admin_pass:
                existing_admin = db.query(User).filter(User.email == initial_admin_email).first()
                if not existing_admin:
                    password_hash = pwd_context.hash(initial_admin_pass[:72])
                    admin_user = User(
                        id=f"admin_{int(datetime.utcnow().timestamp())}",
                        email=initial_admin_email,
                        name=os.getenv("INITIAL_ADMIN_NAME", "Store Administrator"),
                        password_hash=password_hash,
                        role="admin"
                    )
                    db.add(admin_user)
                    print(f"✅ Initial admin user '{initial_admin_email}' created from environment config.", flush=True)
            
            db.commit()
            print("✅ Database initialized with sample data", flush=True)
            
        except Exception as e:
            print(f"❌ Error initializing database: {e}", flush=True)
            import traceback
            traceback.print_exc()
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Warning: Database initialization failed: {e}", flush=True)
        import traceback
        traceback.print_exc()
        # Don't raise - allow app to start
