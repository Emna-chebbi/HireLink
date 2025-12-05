from rest_framework.permissions import AllowAny
from django.db.models import Q
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, JobApplication, SavedJob
from .serializers import (
    JobSerializer, JobCreateUpdateSerializer,
    JobApplicationSerializer, JobApplicationCreateSerializer,
    SavedJobSerializer, JobSearchSerializer
)
from users.models import CustomUser

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JobListView(generics.ListAPIView):
    """View for listing all active jobs (temporarily public)"""
    serializer_class = JobSerializer
    permission_classes = [AllowAny]  # Temporary: Allow anyone to view
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'experience_level', 'company', 'location']
    search_fields = ['title', 'description', 'company', 'required_skills', 'preferred_skills']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).select_related('posted_by')
       
        
        # If user is a recruiter, also show their own inactive jobs
        #if self.request.user.role == 'recruiter':
        #    queryset = queryset.filter(
         #       Q(is_active=True) | Q(posted_by=self.request.user)
          #  )
        
        return queryset

class JobSearchView(APIView):
    """Advanced job search with multiple filters"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = JobSearchSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Start with all active jobs
            queryset = Job.objects.filter(is_active=True).select_related('posted_by')
            
            # Keyword search (search in multiple fields)
            if data.get('keyword'):
                keyword = data['keyword']
                queryset = queryset.filter(
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword) |
                    Q(company__icontains=keyword) |
                    Q(required_skills__icontains=keyword) |
                    Q(preferred_skills__icontains=keyword)
                )
            
            # Location filter
            if data.get('location'):
                queryset = queryset.filter(location__icontains=data['location'])
            
            # Job type filter
            if data.get('job_type'):
                queryset = queryset.filter(job_type__in=data['job_type'])
            
            # Experience level filter
            if data.get('experience_level'):
                queryset = queryset.filter(experience_level__in=data['experience_level'])
            
            # Salary range filter
            if data.get('salary_min'):
                queryset = queryset.filter(salary_min__gte=data['salary_min'])
            if data.get('salary_max'):
                queryset = queryset.filter(salary_max__lte=data['salary_max'])
            
            # Company filter
            if data.get('company'):
                queryset = queryset.filter(company__icontains=data['company'])
            
            # Sorting
            sort_by = data.get('sort_by', '-created_at')
            queryset = queryset.order_by(sort_by)
            
            # Pagination
            page = data.get('page', 1)
            page_size = data.get('page_size', 10)
            paginator = PageNumberPagination()
            paginator.page_size = page_size
            
            result_page = paginator.paginate_queryset(queryset, request)
            serializer = JobSerializer(result_page, many=True, context={'request': request})
            
            return paginator.get_paginated_response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobDetailView(generics.RetrieveAPIView):
    """View for retrieving a single job"""
    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

class JobCreateView(generics.CreateAPIView):
    """View for recruiters to create new jobs"""
    serializer_class = JobCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Automatically set the posted_by field to the current user
        serializer.save(posted_by=self.request.user)

class JobUpdateView(generics.UpdateAPIView):
    """View for recruiters to update their jobs"""
    serializer_class = JobCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow recruiters to update their own jobs
        return Job.objects.filter(posted_by=self.request.user)

class JobDeleteView(generics.DestroyAPIView):
    """View for recruiters to delete their jobs"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow recruiters to delete their own jobs
        return Job.objects.filter(posted_by=self.request.user)
    
    def perform_destroy(self, instance):
        # Instead of actually deleting, mark as inactive
        instance.is_active = False
        instance.save()

class RecruiterJobListView(generics.ListAPIView):
    """View for recruiters to see all jobs they've posted"""
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Return all jobs posted by the current recruiter
        return Job.objects.filter(
            posted_by=self.request.user
        ).order_by('-created_at')

class JobApplicationCreateView(generics.CreateAPIView):
    """View for candidates to apply for jobs"""
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Automatically set the applicant to the current user
        serializer.save(applicant=self.request.user)

class JobApplicationsListView(generics.ListAPIView):
    """View for recruiters to see applications for their jobs"""
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Get job ID from URL parameters
        job_id = self.kwargs.get('job_id')
        
        if job_id:
            # Return applications for a specific job
            return JobApplication.objects.filter(
                job__id=job_id,
                job__posted_by=self.request.user
            ).select_related('job', 'applicant').order_by('-applied_at')
        else:
            # Return all applications for recruiter's jobs
            return JobApplication.objects.filter(
                job__posted_by=self.request.user
            ).select_related('job', 'applicant').order_by('-applied_at')

class CandidateApplicationsListView(generics.ListAPIView):
    """View for candidates to see their own applications"""
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return JobApplication.objects.filter(
            applicant=self.request.user
        ).select_related('job').order_by('-applied_at')

class SaveJobView(APIView):
    """View for candidates to save/unsave jobs"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if job is already saved
        saved_job = SavedJob.objects.filter(job=job, user=request.user).first()
        
        if saved_job:
            # Unsave the job
            saved_job.delete()
            return Response({"detail": "Job unsaved."}, status=status.HTTP_200_OK)
        else:
            # Save the job
            SavedJob.objects.create(job=job, user=request.user)
            return Response({"detail": "Job saved."}, status=status.HTTP_201_CREATED)

class SavedJobsListView(generics.ListAPIView):
    """View for candidates to see their saved jobs"""
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return SavedJob.objects.filter(
            user=self.request.user
        ).select_related('job').order_by('-saved_at')