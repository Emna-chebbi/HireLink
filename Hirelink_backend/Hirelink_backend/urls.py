#Hirelink_backend/Hirelink_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

from api.views.resume_ats_views import ResumeATSAnalyzeView

def home(request):
    return HttpResponse("""""")

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include('applications.urls')),  # Your application workflow app
    path('api/', include('jobs.urls')),
    path('api/ats-analyze/', ResumeATSAnalyzeView.as_view(), name='ats-analyze'),

]

# IMPORTANT: This must be at the end
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)