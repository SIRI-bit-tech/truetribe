import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import messaging.routing
import live_streaming.routing
import notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truetribe_backend.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                *messaging.routing.websocket_urlpatterns,
                *live_streaming.routing.websocket_urlpatterns,
                *notifications.routing.websocket_urlpatterns,
            ])
        )
    ),
})