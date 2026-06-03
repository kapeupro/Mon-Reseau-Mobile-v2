from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_safe


@require_safe
@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"success": True})
