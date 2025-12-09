# jobs/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Job CRUD operations
    path('', views.JobListView.as_view(), name='job-list'),
    path('create/', views.JobCreateView.as_view(), name='job-create'),
    path('<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('<int:pk>/update/', views.JobUpdateView.as_view(), name='job-update'),
    path('<int:pk>/delete/', views.JobDeleteView.as_view(), name='job-delete'),
    
    # Job search
    path('search/', views.JobSearchView.as_view(), name='job-search'),
    
    # Recruiter-specific endpoints
    path('recruiter/jobs/', views.RecruiterJobListView.as_view(), name='recruiter-job-list'),
    path('recruiter/applications/', views.JobApplicationsListView.as_view(), name='recruiter-applications'),
    path('recruiter/applications/<int:job_id>/', views.JobApplicationsListView.as_view(), name='job-applications'),
    
    # Candidate-specific endpoints
    path('candidate/applications/', views.CandidateApplicationsListView.as_view(), name='candidate-applications'),
    path('candidate/saved-jobs/', views.SavedJobsListView.as_view(), name='saved-jobs'),
    path('<int:job_id>/save/', views.SaveJobView.as_view(), name='save-job'),
    path('<int:job_id>/apply/', views.JobApplicationCreateView.as_view(), name='apply-job'),
    
    # New recruiter endpoints
    path('recruiter/stats/', views.RecruiterDashboardStatsView.as_view(), name='recruiter-stats'),
    path('recruiter/jobs/<int:pk>/toggle/', views.JobToggleActiveView.as_view(), name='job-toggle-active'),
]