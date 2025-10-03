import logging
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from ads.models import AnimalType

logger = logging.getLogger(__name__)

def create_animal_types():
    animal_types = [
        "Cat",
        "Dog", 
        "Rabbit",
        "Hamster",      
        "Other"
    ]
    
    created_count = 0
    for animal_type in animal_types:
        obj, created = AnimalType.objects.get_or_create(name=animal_type)
        if created:
            created_count += 1
            logger.info(f"Animal type '{animal_type}' created successfully.")
        else:
            logger.info(f"Animal type '{animal_type}' already exists.")
    
    logger.info(f"Created {created_count} new animal types out of {len(animal_types)} total.")
    
    all_types = AnimalType.objects.all().order_by('name')
    logger.info(f"📊 Total animal types in database: {all_types.count()}")
    
    return created_count

if __name__ == "__main__":
    create_animal_types()
