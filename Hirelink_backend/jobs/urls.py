from django.urls import path
from . import views

urlpatterns = [
    # Job CRUD operations
    path('jobs/', views.JobListView.as_view(), name='job-list'),
    path('jobs/create/', views.JobCreateView.as_view(), name='job-create'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:pk>/update/', views.JobUpdateView.as_view(), name='job-update'),
    path('jobs/<int:pk>/delete/', views.JobDeleteView.as_view(), name='job-delete'),
    
    # Job search
    path('jobs/search/', views.JobSearchView.as_view(), name='job-search'),

    
    # Recruiter-specific endpoints
    path('recruiter/jobs/', views.RecruiterJobListView.as_view(), name='recruiter-job-list'),
    path('recruiter/applications/', views.JobApplicationsListView.as_view(), name='recruiter-applications'),
    path('recruiter/applications/<int:job_id>/', views.JobApplicationsListView.as_view(), name='job-applications'),
    
    # Candidate-specific endpoints
    path('candidate/applications/', views.CandidateApplicationsListView.as_view(), name='candidate-applications'),
    path('candidate/saved-jobs/', views.SavedJobsListView.as_view(), name='saved-jobs'),
    path('jobs/<int:job_id>/save/', views.SaveJobView.as_view(), name='save-job'),
    path('jobs/<int:job_id>/apply/', views.JobApplicationCreateView.as_view(), name='apply-job'),
    
    # AI endpoints
 #   path('ai/recommendations/', views.JobRecommendationView.as_view(), name='job-recommendations'),
 #   path('ai/skill-analysis/', views.CandidateSkillAnalysisView.as_view(), name='skill-analysis'),
]