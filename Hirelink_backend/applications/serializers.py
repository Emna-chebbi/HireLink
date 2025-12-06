# serializers.py
from rest_framework import serializers
from .models import Job, Application, Interview, ApplicationStatusLog, Notification
from django.utils import timezone

# Temporary Job Serializer
class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.full_name', read_only=True)
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = '__all__'
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            return obj.application_set.filter(candidate=request.user).exists()
        return False

# YOUR Application Serializers
class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.recruiter.full_name', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('candidate', 'applied_at', 'updated_at')
    
    def validate(self, attrs):
        if self.instance is None:  # Creation only
            job = attrs.get('job')
            candidate = self.context['request'].user
            
            # Check if already applied
            if job.application_set.filter(candidate=candidate).exists():
                raise serializers.ValidationError("You have already applied for this job")
            
            # Check application deadline
            if job.application_deadline and job.application_deadline < timezone.now():
                raise serializers.ValidationError("Application deadline has passed")
        
        return attrs

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('job', 'cover_letter', 'resume')
    
    def create(self, validated_data):
        validated_data['candidate'] = self.context['request'].user
        return super().create(validated_data)

class InterviewSerializer(serializers.ModelSerializer):
    application_details = ApplicationSerializer(source='application', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.full_name', read_only=True)
    candidate_name = serializers.CharField(source='application.candidate.full_name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    
    class Meta:
        model = Interview
        fields = '__all__'
    
    def validate_scheduled_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Interview must be scheduled for a future date")
        return value

class ApplicationStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    
    class Meta:
        model = ApplicationStatusLog
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')