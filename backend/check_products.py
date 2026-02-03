from app.database import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    count = db.query(Product).count()
    print(f'Total products in database: {count}')

    if count > 0:
        products = db.query(Product).limit(5).all()
        print('\nFirst 5 products:')
        for p in products:
            print(f'  - {p.name} (${p.price}) - Category: {p.category}')
    else:
        print('No products found in database!')
finally:
    db.close()
