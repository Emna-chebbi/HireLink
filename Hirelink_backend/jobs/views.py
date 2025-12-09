# jobs/views.py
from rest_framework.permissions import AllowAny
from django.db.models import Q
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import Job, JobApplication, SavedJob
from .serializers import (
    JobSerializer, JobCreateUpdateSerializer,
    JobApplicationSerializer, JobApplicationCreateSerializer,
    SavedJobSerializer, JobSearchSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JobListView(generics.ListAPIView):
    """View for listing all active jobs"""
    serializer_class = JobSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'experience_level', 'company', 'location']
    search_fields = ['title', 'description', 'company', 'required_skills', 'preferred_skills']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Job.objects.filter(is_active=True).select_related('posted_by')

class JobSearchView(APIView):
    """Advanced job search with multiple filters"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = JobSearchSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            queryset = Job.objects.filter(is_active=True).select_related('posted_by')
            
            if data.get('keyword'):
                keyword = data['keyword']
                queryset = queryset.filter(
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword) |
                    Q(company__icontains=keyword) |
                    Q(required_skills__icontains=keyword) |
                    Q(preferred_skills__icontains=keyword)
                )
            
            if data.get('location'):
                queryset = queryset.filter(location__icontains=data['location'])
            
            if data.get('job_type'):
                queryset = queryset.filter(job_type__in=data['job_type'])
            
            if data.get('experience_level'):
                queryset = queryset.filter(experience_level__in=data['experience_level'])
            
            if data.get('salary_min'):
                queryset = queryset.filter(salary_min__gte=data['salary_min'])
            if data.get('salary_max'):
                queryset = queryset.filter(salary_max__lte=data['salary_max'])
            
            if data.get('company'):
                queryset = queryset.filter(company__icontains=data['company'])
            
            sort_by = data.get('sort_by', '-created_at')
            queryset = queryset.order_by(sort_by)
            
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
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Allow users to see their own inactive jobs
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'recruiter':
            return Job.objects.filter(
                Q(is_active=True) | Q(posted_by=user)
            ).select_related('posted_by')
        return Job.objects.filter(is_active=True).select_related('posted_by')


class JobCreateView(generics.CreateAPIView):
    """View for recruiters to create new jobs"""
    serializer_class = JobCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class JobUpdateView(generics.UpdateAPIView):
    """View for recruiters to update their jobs"""
    serializer_class = JobCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class JobDeleteView(generics.DestroyAPIView):
    """View for recruiters to delete their jobs"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)
    
    def perform_destroy(self, instance):
        # Actually delete the job from database
        instance.delete()
    
    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            job_title = instance.title
            self.perform_destroy(instance)
            return Response(
                {"detail": f"Job '{job_title}' deleted successfully."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RecruiterJobListView(generics.ListAPIView):
    """View for recruiters to see all jobs they've posted"""
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Job.objects.filter(
            posted_by=self.request.user
        ).order_by('-created_at')

class JobApplicationCreateView(generics.CreateAPIView):
    """View for candidates to apply for jobs"""
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class JobApplicationsListView(generics.ListAPIView):
    """View for recruiters to see applications for their jobs"""
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        
        if job_id:
            return JobApplication.objects.filter(
                job__id=job_id,
                job__posted_by=self.request.user
            ).select_related('job', 'applicant').order_by('-applied_at')
        else:
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
        
        saved_job = SavedJob.objects.filter(job=job, user=request.user).first()
        
        if saved_job:
            saved_job.delete()
            return Response({"detail": "Job unsaved."}, status=status.HTTP_200_OK)
        else:
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

class RecruiterDashboardStatsView(APIView):
    """View for recruiter dashboard statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Check if user is recruiter
        if not hasattr(request.user, 'role') or request.user.role != 'recruiter':
            return Response(
                {"detail": "Only recruiters can access this endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        jobs = Job.objects.filter(posted_by=request.user)
        
        total_jobs = jobs.count()
        active_jobs = jobs.filter(is_active=True).count()
        total_applications = JobApplication.objects.filter(
            job__posted_by=request.user
        ).count()
        
        recent_jobs = jobs.order_by('-created_at')[:5]
        recent_jobs_data = JobSerializer(recent_jobs, many=True, context={'request': request}).data
        
        applications_by_status = JobApplication.objects.filter(
            job__posted_by=request.user
        ).values('status').annotate(count=Count('id'))
        
        return Response({
            'stats': {
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'total_applications': total_applications,
            },
            'applications_by_status': list(applications_by_status),
            'recent_jobs': recent_jobs_data
        })

class JobToggleActiveView(APIView):
    """View to toggle job active status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, posted_by=request.user)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found or you don't have permission."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        job.is_active = not job.is_active
        job.save()
        
        return Response({
            'detail': f"Job {'activated' if job.is_active else 'deactivated'} successfully.",
            'is_active': job.is_active
        })