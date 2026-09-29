import os
import json
import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split
import logging
from PIL import Image
import io
import requests

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def setup_directories():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        logging.info(f"Created directory: {data_dir}")
    return data_dir

def import_expert_advice(data_dir):
    logging.info("Importing Expert Advice dataset (Hugging Face: BGLab/AgThoughts)...")
    try:
        # Using Hugging Face as it doesn't require credentials for most datasets
        dataset = load_dataset("BGLab/AgThoughts", split="train")
        df = dataset.to_pandas()
        
        # Split data
        train, test_val = train_test_split(df, test_size=0.2, random_state=42)
        test, val = train_test_split(test_val, test_size=0.5, random_state=42)
        
        train.to_csv(os.path.join(data_dir, "expert_advice_train.csv"), index=False)
        test.to_csv(os.path.join(data_dir, "expert_advice_test.csv"), index=False)
        val.to_csv(os.path.join(data_dir, "expert_advice_val.csv"), index=False)
        
        logging.info(f"Expert advice datasets saved to {data_dir}")
    except Exception as e:
        logging.error(f"Failed to import expert advice: {e}")

def import_government_schemes(data_dir):
    logging.info("Importing Government Schemes (Sample Data)...")
    # Since Kaggle requires API keys, I'll provide a high-quality sample that matches the project features
    # This ensures the project is runnable immediately.
    
    schemes = [
        {
            "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "description": "A yield-based insurance scheme which aims to provide financial support to farmers suffering from crop loss/damage arising out of unforeseen events.",
            "benefits": "Financial support for crop loss, subsidized premiums for farmers.",
            "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
            "howToApply": "Apply online through the PMFBY portal or via designated banks and insurance agents.",
            "category": "insurance",
            "link": "https://pmfby.gov.in/"
        },
        {
            "title": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "description": "Income support of Rs. 6,000 per year in three equal installments to all landholding farmer families.",
            "benefits": "Direct income support of Rs. 6,000 per annum.",
            "eligibility": "Small and marginal farmer families with combined landholding up to 2 hectares.",
            "howToApply": "Register on the PM-Kisan portal or through Common Service Centres (CSCs).",
            "category": "other",
            "link": "https://pmkisan.gov.in/"
        },
        {
            "title": "Kisan Credit Card (KCC)",
            "description": "Provides farmers with timely access to credit for their cultivation and other needs including purchase of inputs.",
            "benefits": "Low interest rates, flexible repayment, coverage for crop insurance.",
            "eligibility": "All farmers – individuals/joint borrowers who are owner cultivators.",
            "howToApply": "Approach any commercial bank, RRB, or cooperative bank to apply.",
            "category": "loan",
            "link": "https://pib.gov.in/PressReleasePage.aspx?PRID=1602758"
        },
        {
            "title": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
            "description": "Focuses on 'Har Khet Ko Pani' (Water for every field) and improving water use efficiency 'Per Drop More Crop'.",
            "benefits": "Subsidies for micro-irrigation systems like drip and sprinkler irrigation.",
            "eligibility": "All farmers having own land or leased land.",
            "howToApply": "Apply through the State Agriculture Department or PMKSY official portal.",
            "category": "equipment",
            "link": "https://pmksy.gov.in/"
        }
    ]
    
    with open(os.path.join(data_dir, "government_schemes.json"), "w") as f:
        json.dump(schemes, f, indent=4)
    
    logging.info(f"Government schemes saved to {data_dir}")

def import_marketplace_products(data_dir):
    logging.info("Importing Marketplace Products (Seeds, Fertilizers, Tools)...")
    products = [
        {
            "name": "High-Yield Hybrid Wheat Seeds",
            "description": "Premium quality hybrid wheat seeds optimized for northern Indian climates. Disease resistant and high germination rate.",
            "price": 450,
            "originalPrice": 500,
            "category": "seeds",
            "stock": 500,
            "unit": "kg",
            "images": ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400"],
            "tags": ["wheat", "hybrid", "seeds", "high-yield"],
            "discount": 10
        },
        {
            "name": "Organic NPK Fertilizer (10-10-10)",
            "description": "All-purpose organic fertilizer with balanced Nitrogen, Phosphorus, and Potassium for healthy plant growth.",
            "price": 850,
            "originalPrice": 1000,
            "category": "fertilizers",
            "stock": 200,
            "unit": "bag (5kg)",
            "images": ["https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400"],
            "tags": ["organic", "fertilizer", "NPK", "plant-growth"],
            "discount": 15
        },
        {
            "name": "Precision Hand Trowel",
            "description": "Durable stainless steel hand trowel with ergonomic wooden handle for transplanting and weeding.",
            "price": 299,
            "originalPrice": 350,
            "category": "tools",
            "stock": 100,
            "unit": "unit",
            "images": ["https://images.unsplash.com/photo-1617576621334-08f395648f82?auto=format&fit=crop&q=80&w=400"],
            "tags": ["tools", "gardening", "trowel", "hand-tool"],
            "discount": 14
        },
        {
            "name": "Neem Oil Bio-Pesticide",
            "description": "Natural and eco-friendly pest control solution derived from neem seeds. Effective against various pests.",
            "price": 150,
            "originalPrice": 180,
            "category": "pesticides",
            "stock": 300,
            "unit": "bottle (500ml)",
            "images": ["https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&q=80&w=400"],
            "tags": ["pesticide", "neem", "organic", "pest-control"],
            "discount": 16
        },
        {
            "name": "Smart Drip Irrigation Kit",
            "description": "Complete drip irrigation system for up to 50 plants. Saves water and ensures precise watering.",
            "price": 1200,
            "originalPrice": 1500,
            "category": "irrigation",
            "stock": 50,
            "unit": "kit",
            "images": ["https://images.unsplash.com/photo-1592150621344-22d761666cb9?auto=format&fit=crop&q=80&w=400"],
            "tags": ["irrigation", "water-saving", "drip-system", "automation"],
            "discount": 20
        },
        {
            "name": "Heavy Duty Garden Rake",
            "description": "12-tine steel rake for leveling soil and removing debris from garden beds.",
            "price": 450,
            "originalPrice": 550,
            "category": "tools",
            "stock": 80,
            "unit": "unit",
            "images": ["https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400"],
            "tags": ["tools", "rake", "soil-leveling"],
            "discount": 18
        }
    ]
    
    with open(os.path.join(data_dir, "marketplace_products.json"), "w") as f:
        json.dump(products, f, indent=4)
    
    logging.info(f"Marketplace products saved to {data_dir}")

def import_crop_disease_images(data_dir):
    logging.info("Importing Crop Disease Images (Subset of PlantVillage from HF)...")
    disease_dir = os.path.join(data_dir, "crop_diseases")
    
    # Categories we want to download (subset for speed)
    # Mapping HF label indices to our desired folder names
    # Based on BrandonFors/Plant-Diseases-PlantVillage-Dataset
    categories = {
        "healthy": [1, 7, 9, 13, 15, 20, 22, 25, 28, 33, 37], # Various healthy leaves
        "leaf_rust": [3, 4] # Apple_Rust, Cedar_Apple_Rust
    }
    
    try:
        ds = load_dataset("BrandonFors/Plant-Diseases-PlantVillage-Dataset", split="train", streaming=True)
        
        counts = {"healthy": 0, "leaf_rust": 0}
        limit = 50 # Limit per category for fast demo
        
        for item in ds:
            label_idx = item['label']
            target_cat = None
            
            if label_idx in categories["healthy"]:
                target_cat = "healthy"
            elif label_idx in categories["leaf_rust"]:
                target_cat = "leaf_rust"
            
            if target_cat and counts[target_cat] < limit:
                # Create directories
                for split in ["train", "val"]:
                    path = os.path.join(disease_dir, split, target_cat)
                    if not os.path.exists(path):
                        os.makedirs(path)
                
                # Determine split (80/20)
                split = "train" if counts[target_cat] < (limit * 0.8) else "val"
                
                # Save image
                img = item['image']
                img_path = os.path.join(disease_dir, split, target_cat, f"{target_cat}_{counts[target_cat]}.jpg")
                img.save(img_path)
                
                counts[target_cat] += 1
                if all(c >= limit for c in counts.values()):
                    break
        
        logging.info(f"Downloaded {sum(counts.values())} images to {disease_dir}")
    except Exception as e:
        logging.error(f"Failed to import crop disease images: {e}")

def main():
    data_dir = setup_directories()
    import_expert_advice(data_dir)
    import_government_schemes(data_dir)
    import_marketplace_products(data_dir)
    import_crop_disease_images(data_dir)
    logging.info("Data ingestion complete!")

if __name__ == "__main__":
    main()
