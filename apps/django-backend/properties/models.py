from django.db import models
from django.conf import settings
from core.models import CommonModel


class PropertyType(CommonModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name


class AmenityCategory(CommonModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Amenity(CommonModel):
    category = models.ForeignKey(AmenityCategory, on_delete=models.CASCADE, related_name='amenities')
    name = models.CharField(max_length=100, unique=True)
    icon_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name


class Property(CommonModel):
    FURNISHING_CHOICES = [
        ('Furnished', 'Furnished'),
        ('Semi-Furnished', 'Semi-Furnished'),
        ('Unfurnished', 'Unfurnished')
    ]
    RENT_FREQUENCY_CHOICES = [
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
        ('Quarterly', 'Quarterly'),
        ('Yearly', 'Yearly')
    ]
    LISTING_STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Rented', 'Rented'),
        ('Sold', 'Sold'),
        ('Expired', 'Expired'),
        ('Suspended', 'Suspended')
    ]
    VERIFICATION_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected')
    ]
    LISTING_PURPOSE_CHOICES = [
        ('Rent', 'Rent'),
        ('Sale', 'Sale')
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    property_type = models.ForeignKey(PropertyType, on_delete=models.RESTRICT)
    title = models.CharField(max_length=300)
    description = models.TextField(null=True, blank=True)
    
    country = models.ForeignKey('geo.Country', on_delete=models.RESTRICT)
    state = models.ForeignKey('geo.State', on_delete=models.RESTRICT)
    district = models.ForeignKey('geo.District', on_delete=models.RESTRICT, null=True, blank=True)
    city = models.ForeignKey('geo.City', on_delete=models.RESTRICT)
    area = models.ForeignKey('geo.Area', on_delete=models.RESTRICT, null=True, blank=True)
    locality = models.ForeignKey('geo.Locality', on_delete=models.RESTRICT, null=True, blank=True)
    
    address_line_1 = models.CharField(max_length=300)
    address_line_2 = models.CharField(max_length=300, null=True, blank=True)
    building_name = models.CharField(max_length=200, null=True, blank=True)
    floor_number = models.CharField(max_length=20, null=True, blank=True)
    unit_number = models.CharField(max_length=50, null=True, blank=True)
    zip_code = models.CharField(max_length=20, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    furnishing_status = models.CharField(max_length=20, choices=FURNISHING_CHOICES, default='Unfurnished')
    
    listing_purpose = models.CharField(max_length=10, choices=LISTING_PURPOSE_CHOICES, default='Rent')
    price = models.DecimalField(max_digits=14, decimal_places=2)
    currency_code = models.CharField(max_length=3)
    rent_frequency = models.CharField(max_length=20, choices=RENT_FREQUENCY_CHOICES, null=True, blank=True)
    security_deposit = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    
    available_from = models.DateField()
    min_lease_duration_months = models.IntegerField(null=True, blank=True)
    max_lease_duration_months = models.IntegerField(null=True, blank=True)
    
    listing_status = models.CharField(max_length=20, choices=LISTING_STATUS_CHOICES, default='Draft')
    is_featured = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='Pending')
    view_count = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['city', 'area']),
            models.Index(fields=['listing_status', 'available_from']),
            models.Index(fields=['owner']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return self.title


class PropertyAmenity(CommonModel):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='property_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='amenity_properties')

    class Meta:
        unique_together = ('property', 'amenity')

    def __str__(self):
        return f"{self.property.title} - {self.amenity.name}"


class PropertyMedia(CommonModel):
    MEDIA_TYPE_CHOICES = [
        ('Image', 'Image'),
        ('Video', 'Video'),
        ('360Tour', '360Tour'),
        ('FloorPlan', 'FloorPlan')
    ]
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES)
    media_url = models.URLField(max_length=1000)
    thumbnail_url = models.URLField(max_length=1000, null=True, blank=True)
    caption = models.CharField(max_length=300, null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    file_size_kb = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.media_type} for {self.property.title}"


class PropertyDocument(CommonModel):
    DOC_TYPE_CHOICES = [
        ('TitleDeed', 'TitleDeed'),
        ('NOC', 'NOC'),
        ('Ejari', 'Ejari'),
        ('RERA', 'RERA'),
        ('Insurance', 'Insurance'),
        ('Other', 'Other')
    ]
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES)
    document_url = models.URLField(max_length=1000)
    document_name = models.CharField(max_length=200)
    expiry_date = models.DateField(null=True, blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Verified', 'Verified'), ('Rejected', 'Rejected')],
        default='Pending'
    )

    def __str__(self):
        return f"{self.document_type} - {self.property.title}"


class PropertyRule(CommonModel):
    RULE_TYPE_CHOICES = [
        ('PetPolicy', 'PetPolicy'),
        ('SmokingPolicy', 'SmokingPolicy'),
        ('NoisePolicy', 'NoisePolicy'),
        ('GuestPolicy', 'GuestPolicy'),
        ('ParkingPolicy', 'ParkingPolicy'),
        ('Other', 'Other')
    ]
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rules')
    rule_type = models.CharField(max_length=50, choices=RULE_TYPE_CHOICES)
    rule_value = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.rule_type} - {self.property.title}"
