#!/usr/bin/env python3
"""
User Session Simulator for Voyager Gear
Simulates realistic user behavior with conversion funnel patterns.
"""

import requests
import random
import time
import json
from datetime import datetime
from typing import Optional, List, Dict
import string

API_BASE_URL = "http://localhost:5001"
CHECKOUT_SERVICE_URL = "http://localhost:5002"

class UserSessionSimulator:
    def __init__(self, session_id: int):
        self.session_id = session_id
        self.session = requests.Session()
        self.token: Optional[str] = None
        self.user_id: Optional[int] = None
        self.username: Optional[str] = None
        self.cart_items: List[Dict] = []

    def log(self, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] Session {self.session_id}: {message}")

    def browse_products(self, num_pages: int = None):
        """Simulate browsing the products page"""
        if num_pages is None:
            num_pages = random.randint(1, 4)

        self.log(f"Browsing {num_pages} page(s) of products")

        for _ in range(num_pages):
            try:
                response = self.session.get(
                    f"{API_BASE_URL}/api/products",
                    params={"skip": random.randint(0, 50), "limit": 20}
                )
                if response.status_code == 200:
                    products = response.json()
                    self.log(f"Viewed {len(products)} products")
                time.sleep(random.uniform(2, 5))
            except Exception as e:
                self.log(f"Error browsing products: {e}")
                return False
        return True

    def view_product_detail(self, product_id: int):
        """View a specific product detail"""
        try:
            response = self.session.get(f"{API_BASE_URL}/api/products/{product_id}")
            if response.status_code == 200:
                product = response.json()
                self.log(f"Viewed product: {product.get('name', 'Unknown')}")
                time.sleep(random.uniform(3, 8))
                return True
        except Exception as e:
            self.log(f"Error viewing product: {e}")
        return False

    def search_products(self, query: str):
        """Search for products"""
        try:
            response = self.session.get(
                f"{API_BASE_URL}/api/products/search",
                params={"q": query}
            )
            if response.status_code == 200:
                results = response.json()
                self.log(f"Searched for '{query}', found {len(results)} results")
                time.sleep(random.uniform(1, 3))
                return results
        except Exception as e:
            self.log(f"Error searching: {e}")
        return []

    def register(self) -> bool:
        """Register a new user account"""
        username = f"user_{self.session_id}_{random.randint(1000, 9999)}"
        email = f"{username}@example.com"
        password = "Password123!"

        try:
            response = self.session.post(
                f"{API_BASE_URL}/api/auth/register",
                json={
                    "username": username,
                    "email": email,
                    "password": password
                }
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.username = username
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log(f"Registered as {username}")
                time.sleep(random.uniform(1, 2))
                return True
            else:
                self.log(f"Registration failed: {response.status_code}")
        except Exception as e:
            self.log(f"Error registering: {e}")
        return False

    def add_to_cart(self, product_id: int, quantity: int = 1) -> bool:
        """Add a product to cart"""
        try:
            response = self.session.post(
                f"{API_BASE_URL}/api/cart/items",
                json={"product_id": product_id, "quantity": quantity},
                headers={"Authorization": f"Bearer {self.token}"} if self.token else {}
            )

            if response.status_code == 200:
                self.log(f"Added product {product_id} to cart (qty: {quantity})")
                time.sleep(random.uniform(0.5, 2))
                return True
            else:
                self.log(f"Failed to add to cart: {response.status_code}")
        except Exception as e:
            self.log(f"Error adding to cart: {e}")
        return False

    def view_cart(self) -> Optional[Dict]:
        """View cart contents"""
        try:
            response = self.session.get(
                f"{API_BASE_URL}/api/cart",
                headers={"Authorization": f"Bearer {self.token}"} if self.token else {}
            )

            if response.status_code == 200:
                cart = response.json()
                self.cart_items = cart.get("items", [])
                self.log(f"Viewed cart: {len(self.cart_items)} items")
                time.sleep(random.uniform(2, 4))
                return cart
        except Exception as e:
            self.log(f"Error viewing cart: {e}")
        return None

    def proceed_to_checkout(self) -> bool:
        """Simulate proceeding to checkout page"""
        self.log("Proceeding to checkout")
        time.sleep(random.uniform(1, 3))
        return True

    def complete_checkout(self) -> bool:
        """Complete the full checkout process"""
        if not self.token:
            self.log("Cannot checkout without authentication")
            return False

        if not self.cart_items:
            cart = self.view_cart()
            if not cart or not cart.get("items"):
                self.log("Cart is empty, cannot checkout")
                return False

        self.log("Starting checkout process")
        time.sleep(random.uniform(3, 6))

        # Prepare checkout data
        checkout_data = {
            "user_id": self.user_id,
            "items": [
                {
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "price": item.get("price", 0)
                }
                for item in self.cart_items
            ],
            "shipping_address": {
                "street": f"{random.randint(100, 9999)} Main St",
                "city": random.choice(["San Francisco", "New York", "Austin", "Seattle", "Boston"]),
                "state": random.choice(["CA", "NY", "TX", "WA", "MA"]),
                "zip_code": f"{random.randint(10000, 99999)}",
                "country": "USA"
            },
            "billing_address": {
                "street": f"{random.randint(100, 9999)} Main St",
                "city": random.choice(["San Francisco", "New York", "Austin", "Seattle", "Boston"]),
                "state": random.choice(["CA", "NY", "TX", "WA", "MA"]),
                "zip_code": f"{random.randint(10000, 99999)}",
                "country": "USA"
            },
            "is_gift": random.random() < 0.15,
            "gift_message": "Enjoy!" if random.random() < 0.15 else "",
            "gift_wrap": random.random() < 0.10
        }

        # Fill out shipping info
        self.log("Entering shipping information")
        time.sleep(random.uniform(5, 10))

        # Fill out billing info
        self.log("Entering billing information")
        time.sleep(random.uniform(4, 8))

        # Fill out payment info
        self.log("Entering payment information")
        time.sleep(random.uniform(4, 7))

        # Submit checkout
        try:
            response = self.session.post(
                f"{CHECKOUT_SERVICE_URL}/checkout",
                json=checkout_data,
                headers={"Authorization": f"Bearer {self.token}"}
            )

            if response.status_code == 200:
                order_data = response.json()
                order_id = order_data.get("order_id")
                self.log(f"✓ Order completed successfully! Order ID: {order_id}")
                time.sleep(random.uniform(2, 4))
                return True
            else:
                self.log(f"Checkout failed: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            self.log(f"Error during checkout: {e}")

        return False

    def abandon_at_step(self, step: str):
        """Simulate abandoning the process at a specific step"""
        self.log(f"Abandoned at: {step}")


def run_simulation(num_sessions: int = 100,
                   register_rate: float = 0.30,
                   add_to_cart_rate: float = 0.40,
                   checkout_rate: float = 0.50,
                   complete_rate: float = 0.60):
    """
    Run user session simulation with realistic conversion funnel.

    Args:
        num_sessions: Total number of user sessions to simulate
        register_rate: % of browsers who register (default 30%)
        add_to_cart_rate: % of registered users who add to cart (default 40%)
        checkout_rate: % of cart users who start checkout (default 50%)
        complete_rate: % of checkout users who complete purchase (default 60%)
    """

    print("=" * 80)
    print("VOYAGER GEAR - USER SESSION SIMULATOR")
    print("=" * 80)
    print(f"Total Sessions: {num_sessions}")
    print(f"Conversion Funnel:")
    print(f"  Browse → Register: {register_rate * 100:.0f}%")
    print(f"  Register → Add to Cart: {add_to_cart_rate * 100:.0f}%")
    print(f"  Cart → Start Checkout: {checkout_rate * 100:.0f}%")
    print(f"  Checkout → Complete: {complete_rate * 100:.0f}%")
    print("=" * 80)
    print()

    stats = {
        "total_sessions": num_sessions,
        "browsed": 0,
        "registered": 0,
        "added_to_cart": 0,
        "started_checkout": 0,
        "completed_purchase": 0
    }

    # Get available products
    try:
        response = requests.get(f"{API_BASE_URL}/api/products", params={"limit": 100})
        available_products = response.json()
        product_ids = [p["id"] for p in available_products if p.get("stock", 0) > 0]
        print(f"Found {len(product_ids)} products available for simulation\n")
    except Exception as e:
        print(f"Error fetching products: {e}")
        return

    for i in range(1, num_sessions + 1):
        simulator = UserSessionSimulator(i)

        # Everyone browses
        if simulator.browse_products():
            stats["browsed"] += 1

            # Some search
            if random.random() < 0.20:
                search_terms = ["tent", "jacket", "backpack", "sleeping", "boot"]
                simulator.search_products(random.choice(search_terms))

            # Some view product details
            if random.random() < 0.60:
                for _ in range(random.randint(1, 4)):
                    simulator.view_product_detail(random.choice(product_ids))
        else:
            continue

        # Conversion funnel: Registration
        if random.random() < register_rate:
            if not simulator.register():
                simulator.abandon_at_step("registration")
                continue
            stats["registered"] += 1

            # Browse a bit more after registering
            if random.random() < 0.40:
                simulator.browse_products(random.randint(1, 2))
        else:
            simulator.abandon_at_step("browsing (no registration)")
            continue

        # Conversion funnel: Add to Cart
        if random.random() < add_to_cart_rate:
            num_items = random.choices([1, 2, 3, 4, 5], weights=[40, 30, 15, 10, 5])[0]

            for _ in range(num_items):
                product_id = random.choice(product_ids)
                quantity = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
                simulator.add_to_cart(product_id, quantity)
                time.sleep(random.uniform(1, 3))

            stats["added_to_cart"] += 1
            simulator.view_cart()
        else:
            simulator.abandon_at_step("browsing (no cart addition)")
            continue

        # Conversion funnel: Start Checkout
        if random.random() < checkout_rate:
            if simulator.proceed_to_checkout():
                stats["started_checkout"] += 1
            else:
                simulator.abandon_at_step("cart view")
                continue
        else:
            simulator.abandon_at_step("cart")
            continue

        # Conversion funnel: Complete Purchase
        if random.random() < complete_rate:
            if simulator.complete_checkout():
                stats["completed_purchase"] += 1
            else:
                simulator.abandon_at_step("checkout (failed)")
        else:
            simulator.abandon_at_step("checkout (abandoned)")

        # Slight delay between sessions
        time.sleep(random.uniform(0.5, 2))

        # Progress update every 10 sessions
        if i % 10 == 0:
            print(f"\n--- Progress: {i}/{num_sessions} sessions completed ---\n")

    # Print final statistics
    print("\n" + "=" * 80)
    print("SIMULATION COMPLETE - FINAL STATISTICS")
    print("=" * 80)
    print(f"Total Sessions:       {stats['total_sessions']}")
    print(f"Browsed Products:     {stats['browsed']} ({stats['browsed']/stats['total_sessions']*100:.1f}%)")
    print(f"Registered:           {stats['registered']} ({stats['registered']/stats['browsed']*100:.1f}% of browsers)")
    print(f"Added to Cart:        {stats['added_to_cart']} ({stats['added_to_cart']/stats['registered']*100:.1f}% of registered)")
    print(f"Started Checkout:     {stats['started_checkout']} ({stats['started_checkout']/stats['added_to_cart']*100:.1f}% of cart users)")
    print(f"Completed Purchase:   {stats['completed_purchase']} ({stats['completed_purchase']/stats['started_checkout']*100:.1f}% of checkouts)")
    print(f"\nOverall Conversion:   {stats['completed_purchase']}/{stats['total_sessions']} = {stats['completed_purchase']/stats['total_sessions']*100:.2f}%")
    print("=" * 80)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Simulate user sessions for Voyager Gear")
    parser.add_argument("-n", "--num-sessions", type=int, default=50,
                       help="Number of user sessions to simulate (default: 50)")
    parser.add_argument("--register-rate", type=float, default=0.30,
                       help="Registration rate (default: 0.30 = 30%%)")
    parser.add_argument("--cart-rate", type=float, default=0.40,
                       help="Add to cart rate (default: 0.40 = 40%%)")
    parser.add_argument("--checkout-rate", type=float, default=0.50,
                       help="Start checkout rate (default: 0.50 = 50%%)")
    parser.add_argument("--complete-rate", type=float, default=0.60,
                       help="Complete purchase rate (default: 0.60 = 60%%)")

    args = parser.parse_args()

    run_simulation(
        num_sessions=args.num_sessions,
        register_rate=args.register_rate,
        add_to_cart_rate=args.cart_rate,
        checkout_rate=args.checkout_rate,
        complete_rate=args.complete_rate
    )
