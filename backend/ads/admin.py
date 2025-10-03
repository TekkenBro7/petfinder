from django.contrib import admin

from ads.models import AnimalType, Comment, FavoriteAd, PetAd, PetPhoto

admin.site.register(AnimalType)
admin.site.register(PetAd)
admin.site.register(PetPhoto)
admin.site.register(Comment)
admin.site.register(FavoriteAd)
