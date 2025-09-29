from django_filters import rest_framework as filters

from ads.models import AnimalType, PetAd


class PetAdFilter(filters.FilterSet):
    location = filters.CharFilter(field_name="location", lookup_expr="icontains")
    date_lost_from = filters.DateFilter(field_name="date_lost", lookup_expr="gte")
    date_lost_to = filters.DateFilter(field_name="date_lost", lookup_expr="lte")
    animal_type = filters.ModelMultipleChoiceFilter(
        field_name="animal_type__name", to_field_name="name", queryset=AnimalType.objects.all()
    )
    is_active = filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = PetAd
        fields = ["location", "date_lost_from", "date_lost_to", "animal_type_id"]
