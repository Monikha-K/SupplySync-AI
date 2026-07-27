# Configuration settings for the backend application

# We use this file to centralize configuration and environment variables.
# Currently, it acts as a placeholder for upcoming integrations.
class Settings:
    # Application name
    PROJECT_NAME: str = "Document Verification Agent"
    
    # We will add MongoDB URI, Groq API Key, etc., here later

# Instantiate settings to be used across the app
settings = Settings()
