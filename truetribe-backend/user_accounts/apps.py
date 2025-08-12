from django.apps import AppConfig

class UserAccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_accounts'
    verbose_name = 'User Registration Management'
    
    def ready(self):
        import user_accounts.signals